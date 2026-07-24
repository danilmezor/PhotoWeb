"""
3D asset generation for every served photo in public/photos/<category>/.

For each file:
  1. Run Apple SHARP (monocular image -> 3D gaussian splats) on the served
     full-size JPEG. SHARP resizes internally to 1536px, so the served file
     is an information-lossless input — originals are not needed.
  2. From the intermediate .ply (1,179,648 gaussians = 2 layers of 768x768):
       - extract the capture FOV from the camera intrinsics trailer
         (fov_y = 2*atan(h / (2*fy))) — the lightbox 3D viewer needs it so
         the splat lines up 1:1 with the photo,
       - rasterize a 768x768 grayscale depth map (per-pixel nearest-layer z
         -> disparity -> percentile-normalized) for the grid hover parallax.
  3. Convert the .ply to a web-deliverable .sog (PlayCanvas SOG container,
     50% pairwise-merge decimation, ~6 MB) via @playcanvas/splat-transform.
  4. Delete the .ply (66 MB intermediate; lives in a TemporaryDirectory).

Outputs:
  public/splats/<category>/<name>.sog        (~6 MB each, committed)
  public/depth/<category>/<name>.png         (60-110 KB each, committed)
  src/utils/splatManifest.generated.json     frontend manifest, schema:
      { "/photos/cat/f.jpg": { "fov": 93.3,
                               "sog": "/splats/cat/f.sog",
                               "depth": "/depth/cat/f.png",
                               "bytes": 6029312 } }

Run from project root:
  python3 scripts/generate_3d_assets.py                  # incremental: only photos missing 3D assets
  python3 scripts/generate_3d_assets.py _DSC3649-HDR.jpg # single file (skipped if up to date)
  python3 scripts/generate_3d_assets.py --force NAME.jpg # force-redo named file(s)
  python3 scripts/generate_3d_assets.py --overhaul       # regenerate everything
  python3 scripts/generate_3d_assets.py --overhaul --log scripts/3d-pipeline.log

The manifest is always merge-written (a mid-run failure never drops existing
entries); entries whose source photo no longer exists are pruned. The run is
resumable: re-running without flags picks up only what's missing.

Requires: conda env `sharp-env` with Apple SHARP installed (~2.6 GB model
auto-cached in ~/.cache/torch on first run), node/npx on PATH (fetches
@playcanvas/splat-transform on demand), numpy + Pillow in this python.
SHARP inference is ~13 s/photo on Apple Silicon (MPS); splat-transform adds
~8 s. A full overhaul of ~150 photos takes roughly an hour.
"""

from __future__ import annotations

import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SHARP_BIN = Path('/opt/anaconda3/envs/sharp-env/bin/sharp')
# Pinned: v3.0.0 renamed -F/--decimate to -d and forbids decimating straight
# to .sog, breaking this pipeline. 2.5.2 matches the CLI syntax below and the
# SOG format of the already-committed assets (frontend runs playcanvas 2.x).
SPLAT_TRANSFORM_PKG = '@playcanvas/splat-transform@2.5.2'

SPLATS_DIR = PROJECT_ROOT / 'public/splats'
DEPTH_DIR = PROJECT_ROOT / 'public/depth'
SPLAT_MANIFEST_PATH = PROJECT_ROOT / 'src/utils/splatManifest.generated.json'

# SHARP's output layout is architectural: always 2 pixel-aligned gaussian
# layers of 768x768 (the model resizes every input to 1536px internally).
GAUSSIAN_LAYERS = 2
LAYER_SIZE = 768
GAUSSIAN_COUNT = GAUSSIAN_LAYERS * LAYER_SIZE * LAYER_SIZE  # 1,179,648
VERTEX_FLOATS = 14            # x y z f_dc_0..2 opacity scale_0..2 rot_0..3
VERTEX_STRIDE = VERTEX_FLOATS * 4

SOG_DECIMATE = '50%'          # ~6 MB per photo; 25% would be ~3.2 MB
DEPTH_PCT_LO, DEPTH_PCT_HI = 0.5, 99.5
FOV_FALLBACK = 60.0           # used when intrinsics parse out of range

RESPONSIVE_SUFFIX_RE = re.compile(r'-(\d+)w$')


def list_served_photos() -> list[Path]:
    """Same discovery as compress_with_metadata.py: every served JPEG under
    public/photos/<category>/, skipping root-level oddballs and -<N>w variants."""
    photos_root = PROJECT_ROOT / 'public/photos'
    exts = {'.jpg', '.jpeg'}
    out: list[Path] = []
    for path in sorted(photos_root.rglob('*')):
        if not path.is_file():
            continue
        if path.suffix.lower() not in exts:
            continue
        if path.parent == photos_root:
            continue
        if RESPONSIVE_SUFFIX_RE.search(path.stem):
            continue
        out.append(path)
    return out


def src_key(served: Path) -> str:
    return '/' + str(served.relative_to(PROJECT_ROOT / 'public')).replace(os.sep, '/')


def outputs_for(served: Path) -> tuple[Path, Path]:
    category = served.parent.name
    stem = served.stem
    return (SPLATS_DIR / category / f'{stem}.sog',
            DEPTH_DIR / category / f'{stem}.png')


def public_path(p: Path) -> str:
    return '/' + str(p.relative_to(PROJECT_ROOT / 'public')).replace(os.sep, '/')


def run_sharp(served: Path, tmp_dir: Path) -> Path:
    """Run SHARP inference; returns the produced .ply path."""
    cmd = [str(SHARP_BIN), 'predict', '-i', str(served), '-o', str(tmp_dir),
           '--device', 'mps']
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f'sharp predict failed: {result.stderr.strip()[-300:]}')
    plys = list(tmp_dir.glob('*.ply'))
    if not plys:
        raise RuntimeError('sharp predict produced no .ply')
    return plys[0]


def read_ply(ply_path: Path) -> tuple[np.ndarray, bytes]:
    """Return (vertex array [N,14] float32, trailer bytes after vertex data)."""
    with open(ply_path, 'rb') as f:
        header = b''
        while not header.endswith(b'end_header\n'):
            line = f.readline()
            if not line:
                raise RuntimeError('unexpected EOF in PLY header')
            header += line
        if f'element vertex {GAUSSIAN_COUNT}'.encode() not in header:
            raise RuntimeError('unexpected gaussian count in PLY header')
        vertex_bytes = f.read(GAUSSIAN_COUNT * VERTEX_STRIDE)
        trailer = f.read()
    data = np.frombuffer(vertex_bytes, dtype='<f4').reshape(-1, VERTEX_FLOATS)
    return data, trailer


def extract_fov(trailer: bytes) -> float:
    """Vertical FOV in degrees from the PLY camera trailer.

    Trailer layout (after vertex data): extrinsic 16xf4, intrinsic 9xf4
    (row-major [fx 0 cx; 0 fy cy; 0 0 1]), image_size 2xu4 [w, h], ...
    """
    try:
        intrinsic = struct.unpack_from('<9f', trailer, 16 * 4)
        w, h = struct.unpack_from('<2I', trailer, 16 * 4 + 9 * 4)
        fy = intrinsic[4]
        if fy <= 0:
            raise ValueError('fy <= 0')
        fov = math.degrees(2 * math.atan(h / (2 * fy)))
    except (struct.error, ValueError) as e:
        print(f'  ! intrinsics parse failed ({e}); fov fallback {FOV_FALLBACK}')
        return FOV_FALLBACK
    # Admit the full photographic range: ~1° (super-telephoto, 500mm+) up to
    # ultrawide. A narrower window wrongly clamps legit telephoto captures to
    # the 60° fallback, which shrinks the splat to a dot in the viewer.
    if not 1 < fov < 150:
        print(f'  ! fov {fov:.1f} out of sane range; fallback {FOV_FALLBACK}')
        return FOV_FALLBACK
    return round(fov, 1)


def write_depth_png(data: np.ndarray, depth_path: Path) -> None:
    """Front-surface disparity map: nearest of the 2 layers per pixel,
    1/z, percentile-normalized so foreground is white / background black."""
    z = data[:, 2].reshape(GAUSSIAN_LAYERS, LAYER_SIZE, LAYER_SIZE)
    zmin = np.minimum(z[0], z[1])
    disp = 1.0 / np.clip(zmin, 0.1, None)
    lo, hi = np.percentile(disp, DEPTH_PCT_LO), np.percentile(disp, DEPTH_PCT_HI)
    if hi - lo < 1e-9:
        hi = lo + 1e-9
    d = np.clip((disp - lo) / (hi - lo), 0, 1)
    depth_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray((d * 255).astype(np.uint8)).save(depth_path, optimize=True)


def run_splat_transform(ply_path: Path, sog_path: Path) -> None:
    npx = shutil.which('npx')
    if not npx:
        raise RuntimeError('npx not found on PATH')
    sog_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [npx, '-y', SPLAT_TRANSFORM_PKG, str(ply_path),
           '-F', SOG_DECIMATE, str(sog_path), '-w', '-q']
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0 or not sog_path.exists():
        raise RuntimeError(f'splat-transform failed: {result.stderr.strip()[-300:]}')


def process_one(served: Path) -> dict:
    """Full per-photo pipeline. Raises on failure. The .ply intermediate
    lives in a TemporaryDirectory and is deleted on exit."""
    sog_path, depth_path = outputs_for(served)
    with tempfile.TemporaryDirectory(prefix='sharp3d-') as tmp:
        ply_path = run_sharp(served, Path(tmp))
        data, trailer = read_ply(ply_path)
        fov = extract_fov(trailer)
        write_depth_png(data, depth_path)
        run_splat_transform(ply_path, sog_path)
    return {
        'fov': fov,
        'sog': public_path(sog_path),
        'depth': public_path(depth_path),
        'bytes': sog_path.stat().st_size,
    }


def load_manifest() -> dict:
    if SPLAT_MANIFEST_PATH.exists():
        try:
            return json.loads(SPLAT_MANIFEST_PATH.read_text())
        except Exception:
            pass
    return {}


def write_manifest(manifest: dict) -> None:
    SPLAT_MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    SPLAT_MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + '\n')


def needs_processing(served: Path, manifest: dict) -> bool:
    sog_path, depth_path = outputs_for(served)
    return not (sog_path.exists() and depth_path.exists()
                and src_key(served) in manifest)


def main(args: list[str]) -> None:
    overhaul = False
    force = False
    log_path: Path | None = None
    names: list[str] = []

    it = iter(args[1:])
    for a in it:
        if a == '--overhaul':
            overhaul = True
        elif a == '--force':
            force = True
        elif a == '--log':
            value = next(it, None)
            if value is None:
                print('--log requires a path argument')
                sys.exit(1)
            log_path = Path(value)
        else:
            names.append(a)

    force = force or overhaul
    only = set(names) or None

    log_file = open(log_path, 'a') if log_path else None

    def emit(line: str) -> None:
        print(line, flush=True)
        if log_file:
            log_file.write(line + '\n')
            log_file.flush()

    photos = list_served_photos()
    if only is not None:
        photos = [p for p in photos if p.name in only]
        missing = only - {p.name for p in photos}
        for name in sorted(missing):
            emit(f'  ! {name}: not found among served photos')

    manifest = load_manifest()

    # Prune entries whose source photo no longer exists.
    valid_keys = {src_key(p) for p in list_served_photos()}
    stale = [k for k in manifest if k not in valid_keys]
    for k in stale:
        emit(f'  - pruning stale manifest entry {k}')
        manifest.pop(k)

    todo = [p for p in photos if force or needs_processing(p, manifest)]
    skipped = len(photos) - len(todo)
    emit(f'[3d] {len(todo)} photos to process, {skipped} up to date'
         + (' (overhaul)' if overhaul else ''))

    done = 0
    failed: list[str] = []
    for i, served in enumerate(todo, 1):
        rel = f'{served.parent.name}/{served.name}'
        try:
            entry = process_one(served)
            manifest[src_key(served)] = entry
            write_manifest(manifest)  # flush after every photo: resumable
            done += 1
            emit(f'[3d] ({i}/{len(todo)}) {rel} -> fov {entry["fov"]}°, '
                 f'sog {entry["bytes"] / 1e6:.1f} MB')
        except Exception as e:
            failed.append(rel)
            emit(f'[3d] ({i}/{len(todo)}) ✗ {rel}: {e}')

    if stale and not todo:
        write_manifest(manifest)

    emit('')
    emit(f'[3d] processed: {done}   skipped: {skipped}   failed: {len(failed)}')
    if failed:
        emit('[3d] failed photos (rerun without flags to retry):')
        for rel in failed:
            emit(f'[3d]   ✗ {rel}')
    emit(f'[3d] manifest: {SPLAT_MANIFEST_PATH.relative_to(PROJECT_ROOT)} '
         f'({len(manifest)} entries)')

    if log_file:
        log_file.close()


if __name__ == '__main__':
    os.chdir(PROJECT_ROOT)
    main(sys.argv)
