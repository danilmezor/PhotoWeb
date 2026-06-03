"""
One-shot in-place compressor for the death-valley and grand-canyon galleries.
Reuses compress_image() from ../image_compressor.py.

Each image is compressed to TARGET_MB (default 2.0) using the binary-search
quality finder. Output is written to a sibling .tmp file then atomically
swapped over the original.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from image_compressor import compress_image, get_file_size_mb  # noqa: E402

TARGET_MB = 2.0
SKIP_IF_UNDER_MB = 2.5
FOLDERS = [
    ROOT / "public" / "photos" / "death-valley",
    ROOT / "public" / "photos" / "grand-canyon",
]


def compress_in_place(path: Path, target_mb: float) -> tuple[float, float, int | None]:
    """Returns (original_mb, final_mb, quality_or_None_if_skipped)."""
    original_mb = get_file_size_mb(path)
    if original_mb <= SKIP_IF_UNDER_MB:
        return original_mb, original_mb, None

    tmp = path.with_suffix(path.suffix + ".tmp")
    try:
        quality, final_mb = compress_image(path, tmp, target_mb)
        tmp.replace(path)
        return original_mb, final_mb, quality
    except Exception:
        if tmp.exists():
            tmp.unlink()
        raise


def main() -> None:
    grand_total_before = 0.0
    grand_total_after = 0.0

    for folder in FOLDERS:
        if not folder.exists():
            print(f"!! {folder} does not exist, skipping")
            continue

        print(f"\n=== {folder.relative_to(ROOT)} ===")
        files = sorted(p for p in folder.iterdir() if p.suffix.lower() in {".jpg", ".jpeg"})
        folder_before = 0.0
        folder_after = 0.0

        for f in files:
            original, final, quality = compress_in_place(f, TARGET_MB)
            folder_before += original
            folder_after += final
            if quality is None:
                print(f"  - {f.name}: {original:.2f} MB (skipped, already under {SKIP_IF_UNDER_MB} MB)")
            else:
                print(f"  ✓ {f.name}: {original:.2f} MB -> {final:.2f} MB (q={quality})")

        print(f"  folder total: {folder_before:.1f} MB -> {folder_after:.1f} MB")
        grand_total_before += folder_before
        grand_total_after += folder_after

    print(f"\n=== GRAND TOTAL: {grand_total_before:.1f} MB -> {grand_total_after:.1f} MB "
          f"(saved {grand_total_before - grand_total_after:.1f} MB) ===")


if __name__ == "__main__":
    main()
