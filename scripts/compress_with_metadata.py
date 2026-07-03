"""
One-shot pass over every served photo in public/photos/<category>/.

For each file:
  1. Locate the original (rich-EXIF version) in one of the known source
     directories — the in-tree pictures/ archive first, then a handful of
     scattered locations under ~/Pictures.
  2. Copy the original's EXIF block in place over the served JPEG using
     piexif.insert (no pixel re-encode — fast and lossless).
  3. Override / inject:
       Artist     = "Danil Zanozin"
       Copyright  = "© <year of DateTimeOriginal or this year> Danil Zanozin. All rights reserved."
     so the photographer credit is embedded in every file Google Images
     downloads.
  4. Emit a sibling WebP variant at quality 80 (~30% smaller than the JPEG).
     The WebP also carries the same EXIF block.

Files whose originals can't be located still get the Artist + Copyright
patch over their existing EXIF tail (or a fresh tail if there was none) —
better than nothing, just no camera/lens/date.

Also writes src/utils/photoManifest.generated.json mapping each served
photo's src path to its native dimensions and the responsive variant
widths that actually exist on disk — the frontend builds srcsets from
this so it never references a variant that was skipped (targets >= the
source width are never generated).

Run from project root:  python3 scripts/compress_with_metadata.py

Pass --manifest-only to regenerate just the manifest from whatever is
currently on disk (header reads only — no EXIF injection, no variant
re-encoding, no image bytes touched). Rerun this whenever photos are
added, removed, or resized.
"""

from __future__ import annotations

import datetime
import json
import os
import re
import sys
from fractions import Fraction
from pathlib import Path

import piexif
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Search order: in-tree archive first, then scattered Pictures folders.
# Per-category override comes first; falls back to a flat sweep.
SOURCE_DIRS_BY_CATEGORY: dict[str, list[Path]] = {
    'landscapes':   [PROJECT_ROOT / 'pictures/landscapes',
                     Path.home() / 'Pictures/Zion',
                     Path.home() / 'Pictures/2025_reworked',
                     PROJECT_ROOT / 'pictures/hero'],
    'cities':       [PROJECT_ROOT / 'pictures/cities'],
    'people':       [PROJECT_ROOT / 'pictures/people'],
    'events':       [PROJECT_ROOT / 'pictures/events'],
    'JMT':          [PROJECT_ROOT / 'pictures/JMT'],
    'death-valley': [Path.home() / 'Pictures/DeathValley'],
    'grand-canyon': [Path.home() / 'Pictures/GrandCanyon'],
    'lassen-volcanic': [Path.home() / 'Pictures/LassenVolcanic'],
}

# Final fallback sweep — looked at last if the per-category dirs miss.
GLOBAL_FALLBACK_DIRS: list[Path] = [
    PROJECT_ROOT / 'pictures',
    Path.home() / 'Pictures',
]

ARTIST = 'Danil Zanozin'
WEBSTATEMENT_URL = 'https://danilzanozin.com/about'
WEBP_QUALITY = 80
EXIF_JSON_PATH = PROJECT_ROOT / 'src/utils/exifData.generated.json'
MANIFEST_JSON_PATH = PROJECT_ROOT / 'src/utils/photoManifest.generated.json'

# Responsive image widths (pixels). For each photo, we emit a -<width>w.jpg
# and -<width>w.webp sibling at each target width that is smaller than the
# source. Browsers pick the right one via <img srcset> / <source srcset>.
RESPONSIVE_WIDTHS = [480, 1080, 1920]


def find_original(category: str, filename: str) -> Path | None:
    """Return the path to the matching original, or None if unfound."""
    for d in SOURCE_DIRS_BY_CATEGORY.get(category, []):
        candidate = d / filename
        if candidate.exists():
            return candidate
    for root in GLOBAL_FALLBACK_DIRS:
        if not root.exists():
            continue
        for hit in root.rglob(filename):
            return hit
    return None


def get_capture_year(exif_dict: dict) -> int:
    """Pull the year from DateTimeOriginal, else current year."""
    try:
        raw = exif_dict.get('Exif', {}).get(piexif.ExifIFD.DateTimeOriginal)
        if raw:
            text = raw.decode('ascii', errors='ignore')
            return int(text[:4])
    except (ValueError, AttributeError):
        pass
    return datetime.datetime.now().year


def build_copyright(year: int) -> str:
    return f'© {year} {ARTIST}. All rights reserved.'


def patch_exif(exif_dict: dict) -> dict:
    """Inject Artist + Copyright + WebStatement, drop bloat we don't need."""
    zeroth = exif_dict.setdefault('0th', {})
    year = get_capture_year(exif_dict)

    # EXIF text fields are conventionally latin-1; "©" encodes as one byte
    # there but two bytes in UTF-8 (which renders as "Â©" in most readers).
    zeroth[piexif.ImageIFD.Artist] = ARTIST.encode('latin-1', errors='replace')
    zeroth[piexif.ImageIFD.Copyright] = build_copyright(year).encode('latin-1', errors='replace')
    zeroth[piexif.ImageIFD.HostComputer] = WEBSTATEMENT_URL.encode('latin-1', errors='replace')

    # Strip the embedded thumbnail (50–200 KB, useless on web) and the IFD1
    # block that points at it.
    exif_dict['thumbnail'] = None
    exif_dict['1st'] = {}

    # Strip MakerNote — proprietary, can be hundreds of KB on Nikon, never
    # surfaced to image search.
    exif_dict.get('Exif', {}).pop(piexif.ExifIFD.MakerNote, None)

    return exif_dict


def empty_exif_template() -> dict:
    """Minimal valid EXIF dict for files where no original was found."""
    return {
        '0th': {},
        'Exif': {},
        'GPS': {},
        '1st': {},
        'thumbnail': None,
        'Interop': {},
    }


def load_exif_or_empty(path: Path) -> dict:
    try:
        return piexif.load(str(path))
    except Exception:
        return empty_exif_template()


def write_webp_variant(jpg_path: Path, exif_bytes: bytes) -> None:
    """Emit <name>.webp next to the JPEG at quality 80, carrying EXIF."""
    out = jpg_path.with_suffix('.webp')
    img = Image.open(jpg_path)
    # WebP encoder accepts EXIF as bytes via the exif kwarg.
    img.save(out, 'WEBP', quality=WEBP_QUALITY, method=6, exif=exif_bytes)


def resize_to_width(img: Image.Image, target_width: int) -> Image.Image:
    """Lanczos-resize to target_width preserving aspect ratio."""
    w, h = img.size
    if target_width >= w:
        return img
    new_h = round(h * target_width / w)
    return img.resize((target_width, new_h), Image.LANCZOS)


def write_responsive_variants(jpg_path: Path, exif_bytes: bytes) -> int:
    """Emit -<width>w.jpg and -<width>w.webp variants for each target width
    that is smaller than the source. Returns the number of files written."""
    img = Image.open(jpg_path)
    src_w = img.size[0]
    written = 0
    base = jpg_path.with_suffix('')  # strip .jpg / .JPG / .jpeg
    src_ext = jpg_path.suffix  # preserve original case for the JPEG variant
    for target in RESPONSIVE_WIDTHS:
        if target >= src_w:
            continue
        resized = resize_to_width(img, target)
        jpg_out = base.with_name(f'{base.name}-{target}w{src_ext}')
        webp_out = base.with_name(f'{base.name}-{target}w.webp')
        # Convert to RGB if needed (rare; our sources are already RGB JPEGs)
        if resized.mode != 'RGB':
            resized = resized.convert('RGB')
        resized.save(jpg_out, 'JPEG', quality=85, optimize=True, exif=exif_bytes)
        resized.save(webp_out, 'WEBP', quality=WEBP_QUALITY, method=6, exif=exif_bytes)
        written += 2
    return written


def _decode(value):
    if isinstance(value, bytes):
        return value.decode('utf-8', errors='replace').strip('\x00').strip()
    return value


def _rational(value) -> float | None:
    """piexif rationals come back as (num, den) tuples."""
    if value is None:
        return None
    if isinstance(value, tuple) and len(value) == 2 and value[1]:
        return value[0] / value[1]
    if isinstance(value, (int, float)):
        return float(value)
    return None


def humanize_shutter(seconds: float | None) -> str | None:
    if seconds is None or seconds <= 0:
        return None
    if seconds >= 1:
        return f'{seconds:.1f}s' if seconds < 10 else f'{seconds:.0f}s'
    # render as 1/X — pick the nearest sensible denominator
    frac = Fraction(seconds).limit_denominator(8000)
    if frac.numerator == 1:
        return f'1/{frac.denominator}'
    return f'{frac.numerator}/{frac.denominator}'


def extract_display_exif(exif_dict: dict) -> dict:
    """Pull out the bits we want to show on the photo page, as plain strings."""
    zeroth = exif_dict.get('0th', {})
    exif = exif_dict.get('Exif', {})

    make = _decode(zeroth.get(piexif.ImageIFD.Make))
    model = _decode(zeroth.get(piexif.ImageIFD.Model))
    lens = _decode(exif.get(piexif.ExifIFD.LensModel))
    focal = _rational(exif.get(piexif.ExifIFD.FocalLength))
    aperture = _rational(exif.get(piexif.ExifIFD.FNumber))
    shutter = _rational(exif.get(piexif.ExifIFD.ExposureTime))
    iso = exif.get(piexif.ExifIFD.ISOSpeedRatings)
    captured_raw = exif.get(piexif.ExifIFD.DateTimeOriginal)
    captured_iso = None
    if captured_raw:
        text = _decode(captured_raw)
        try:
            captured_iso = datetime.datetime.strptime(text, '%Y:%m:%d %H:%M:%S').date().isoformat()
        except ValueError:
            captured_iso = None

    camera = None
    if make and model:
        make_norm = make.replace('CORPORATION', '').replace('CO., LTD.', '').strip().title()
        model_norm = model.strip()
        # Models often re-include the make (e.g. "NIKON Z 7_2") — strip it.
        if model_norm.upper().startswith(make_norm.upper()):
            model_norm = model_norm[len(make_norm):].strip()
        camera = f'{make_norm} {model_norm}'.strip()
    elif model:
        camera = model.strip()

    out = {}
    if camera: out['camera'] = camera
    if lens: out['lens'] = lens.strip()
    if focal: out['focalLength'] = f'{focal:.0f}mm'
    if aperture: out['aperture'] = f'f/{aperture:g}'
    sh = humanize_shutter(shutter)
    if sh: out['shutter'] = sh
    if iso: out['iso'] = int(iso) if not isinstance(iso, (list, tuple)) else int(iso[0])
    if captured_iso: out['capturedAt'] = captured_iso
    return out


def existing_variant_widths(served: Path) -> list[int]:
    """Responsive widths whose -<N>w.webp AND -<N>w<ext> siblings exist on
    disk. Checked against the filesystem (not recomputed from the source
    width) so the manifest reflects reality even after a partial run."""
    base = served.with_suffix('')
    ext = served.suffix
    widths = []
    for w in RESPONSIVE_WIDTHS:
        jpg = base.with_name(f'{base.name}-{w}w{ext}')
        webp = base.with_name(f'{base.name}-{w}w.webp')
        if jpg.exists() and webp.exists():
            widths.append(w)
    return sorted(widths)


def manifest_entry(served: Path) -> dict:
    """Native dimensions + available variant widths for one served photo.
    Image.open only reads the header — no pixel decode."""
    with Image.open(served) as img:
        w, h = img.size
    return {'w': w, 'h': h, 'variants': existing_variant_widths(served)}


def merge_write_json(path: Path, index: dict, merge: bool) -> dict:
    """Write index as pretty JSON; if merge, update into the existing file
    first so partial runs don't drop other entries. Returns what was written."""
    final = index
    if merge and path.exists():
        try:
            existing = json.loads(path.read_text())
            existing.update(index)
            final = existing
        except Exception:
            pass
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(final, indent=2, sort_keys=True) + '\n')
    return final


RESPONSIVE_SUFFIX_RE = re.compile(r'-(\d+)w$')


def list_served_photos() -> list[Path]:
    # Gallery photos live under public/photos/<category>/; blog-local images
    # (phone shots, documentary frames) live under public/blog/<post-slug>/.
    roots = [PROJECT_ROOT / 'public/photos', PROJECT_ROOT / 'public/blog']
    exts = {'.jpg', '.jpeg'}
    out: list[Path] = []
    for root in roots:
        if not root.exists():
            continue
        for path in sorted(root.rglob('*')):
            if not path.is_file():
                continue
            if path.suffix.lower() not in exts:
                continue
            if path.parent == root:
                # Root-level oddballs (e.g. public/photos/000245650034.jpg)
                continue
            # Skip our own responsive variants — they match *-480w.jpg etc.
            if RESPONSIVE_SUFFIX_RE.search(path.stem):
                continue
            out.append(path)
    return out


def main(args: list[str]) -> None:
    flags = set(args[1:])
    manifest_only = '--manifest-only' in flags
    names = flags - {'--manifest-only'}
    only = names or None  # optional file-name filter for dry-runs

    photos = list_served_photos()
    if only is not None:
        photos = [p for p in photos if p.name in only]

    if manifest_only:
        # Fast path: regenerate the manifest from whatever is on disk.
        # Header reads only — no EXIF injection, no variant encoding.
        manifest_index = {}
        for served in photos:
            src = '/' + str(served.relative_to(PROJECT_ROOT / 'public')).replace(os.sep, '/')
            manifest_index[src] = manifest_entry(served)
        final = merge_write_json(MANIFEST_JSON_PATH, manifest_index, merge=only is not None)
        print(f'[manifest] {len(manifest_index)} photos scanned')
        print(f'[manifest] written: {MANIFEST_JSON_PATH.relative_to(PROJECT_ROOT)} ({len(final)} entries)')
        return

    print(f'[metadata] {len(photos)} files to process')

    matched_count = 0
    unmatched_count = 0
    webp_count = 0
    responsive_count = 0
    exif_index: dict[str, dict] = {}
    manifest_index: dict[str, dict] = {}

    for served in photos:
        section = served.relative_to(PROJECT_ROOT / 'public').parts[0]
        category = served.parent.name
        # Blog-local images ARE their own originals (no public/photos-style
        # served-vs-original split), so don't search ~/Pictures for them —
        # that could wrongly match a same-named file. Use their own EXIF.
        original = None if section == 'blog' else find_original(category, served.name)

        if original is not None:
            exif_dict = load_exif_or_empty(original)
            matched_count += 1
            origin = original.relative_to(PROJECT_ROOT) if original.is_relative_to(PROJECT_ROOT) else original
            status = f'orig <- {origin}'
        else:
            exif_dict = load_exif_or_empty(served)  # may be empty
            unmatched_count += 1
            status = '(no original; Artist+Copyright only)'

        exif_dict = patch_exif(exif_dict)

        try:
            exif_bytes = piexif.dump(exif_dict)
        except Exception as e:
            print(f'  ✗ {served.name}: dump failed ({e}); skipped')
            continue

        # In-place EXIF injection into the served JPEG (no pixel re-encode).
        try:
            piexif.insert(exif_bytes, str(served))
        except Exception as e:
            print(f'  ✗ {served.name}: insert failed ({e}); skipped')
            continue

        # Sibling WebP.
        try:
            write_webp_variant(served, exif_bytes)
            webp_count += 1
        except Exception as e:
            print(f'  ! {served.name}: WebP failed ({e})')

        # Responsive size variants (-480w.jpg, -480w.webp, -1080w.*, -1920w.*).
        try:
            responsive_count += write_responsive_variants(served, exif_bytes)
        except Exception as e:
            print(f'  ! {served.name}: responsive variants failed ({e})')

        # Capture human-display EXIF for the photo registry.
        src = '/' + str(served.relative_to(PROJECT_ROOT / 'public')).replace(os.sep, '/')
        display = extract_display_exif(exif_dict)
        if display:
            exif_index[src] = display

        # Record native dimensions + variants now on disk for the frontend.
        manifest_index[src] = manifest_entry(served)

        print(f'  ✓ {category}/{served.name}: {status}')

    # Always write both indexes even if we only ran on a subset — but in
    # that case, merge into any existing file so we don't lose other entries.
    final_index = merge_write_json(EXIF_JSON_PATH, exif_index, merge=only is not None)
    final_manifest = merge_write_json(MANIFEST_JSON_PATH, manifest_index, merge=only is not None)

    print()
    print(f'[metadata] EXIF injected:        {matched_count + unmatched_count} files')
    print(f'[metadata]   with original EXIF: {matched_count}')
    print(f'[metadata]   credit-only:        {unmatched_count}')
    print(f'[metadata] WebP variants:        {webp_count}')
    print(f'[metadata] Responsive variants:  {responsive_count} (jpg + webp at 480w/1080w/1920w)')
    print(f'[metadata] EXIF index written:   {EXIF_JSON_PATH.relative_to(PROJECT_ROOT)} ({len(final_index)} entries)')
    print(f'[metadata] Manifest written:     {MANIFEST_JSON_PATH.relative_to(PROJECT_ROOT)} ({len(final_manifest)} entries)')


if __name__ == '__main__':
    os.chdir(PROJECT_ROOT)
    main(sys.argv)
