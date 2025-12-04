import os
from PIL import Image
from pathlib import Path
import math

def get_image_files(folder_path):
    """Get all image files from the folder."""
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tiff'}
    image_files = []
    
    for file in Path(folder_path).iterdir():
        if file.suffix.lower() in image_extensions:
            image_files.append(file)
    
    return image_files

def get_file_size_mb(file_path):
    """Get file size in megabytes."""
    return os.path.getsize(file_path) / (1024 * 1024)

def compress_image(input_path, output_path, target_size_mb, max_quality=95, min_quality=20):
    """
    Compress a single image to target size with minimal quality loss.
    Uses binary search to find optimal quality setting.
    """
    img = Image.open(input_path)
    
    # Convert RGBA to RGB if necessary (for JPEG)
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background
    
    # Binary search for optimal quality
    low, high = min_quality, max_quality
    best_quality = max_quality
    
    while low <= high:
        mid = (low + high) // 2
        
        # Save with current quality
        img.save(output_path, 'JPEG', quality=mid, optimize=True)
        current_size = get_file_size_mb(output_path)
        
        if current_size <= target_size_mb:
            best_quality = mid
            low = mid + 1  # Try higher quality
        else:
            high = mid - 1  # Need lower quality
    
    # Save final version with best quality found
    img.save(output_path, 'JPEG', quality=best_quality, optimize=True)
    return best_quality, get_file_size_mb(output_path)

def compress_folder_individual(input_folder, output_folder, target_size_mb_per_image=9.5):
    """
    Compress each image to a specific size target.
    """
    os.makedirs(output_folder, exist_ok=True)
    image_files = get_image_files(input_folder)
    
    if not image_files:
        print(f"No images found in {input_folder}")
        return
    
    print(f"Found {len(image_files)} images")
    print(f"Target size per image: {target_size_mb_per_image} MB\n")
    
    total_original = 0
    total_compressed = 0
    
    for img_file in image_files:
        original_size = get_file_size_mb(img_file)
        total_original += original_size
        
        if original_size <= target_size_mb_per_image:
            # Image already under target, skip it
            print(f"⊘ {img_file.name}: {original_size:.2f} MB (already under {target_size_mb_per_image} MB - skipped)")
            total_compressed += original_size
        else:
            # Compress to target size
            output_path = Path(output_folder) / f"{img_file.stem}_compressed.jpg"
            quality, final_size = compress_image(img_file, output_path, target_size_mb_per_image)
            total_compressed += final_size
            print(f"✓ {img_file.name}: {original_size:.2f} MB → {final_size:.2f} MB (quality: {quality})")
    
    print(f"\n{'='*60}")
    print(f"Total original size: {total_original:.2f} MB")
    print(f"Total compressed size: {total_compressed:.2f} MB")
    print(f"Space saved: {total_original - total_compressed:.2f} MB ({((total_original - total_compressed) / total_original * 100):.1f}%)")

def compress_folder_total(input_folder, output_folder, total_target_mb=9.5):
    """
    Compress all images so the total size is the target.
    Distributes the target size proportionally based on original sizes.
    """
    os.makedirs(output_folder, exist_ok=True)
    image_files = get_image_files(input_folder)
    
    if not image_files:
        print(f"No images found in {input_folder}")
        return
    
    # Calculate original sizes
    original_sizes = {img: get_file_size_mb(img) for img in image_files}
    total_original = sum(original_sizes.values())
    
    print(f"Found {len(image_files)} images")
    print(f"Total original size: {total_original:.2f} MB")
    print(f"Total target size: {total_target_mb} MB\n")
    
    if total_original <= total_target_mb:
        print("Images already under target size. Copying with light optimization...")
        for img_file in image_files:
            output_path = Path(output_folder) / f"{img_file.stem}_compressed.jpg"
            img = Image.open(img_file)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            img.save(output_path, 'JPEG', quality=95, optimize=True)
        return
    
    # Distribute target size proportionally
    total_compressed = 0
    for img_file in image_files:
        original_size = original_sizes[img_file]
        # Allocate target size proportionally
        target_size = (original_size / total_original) * total_target_mb
        
        output_path = Path(output_folder) / f"{img_file.stem}_compressed.jpg"
        quality, final_size = compress_image(img_file, output_path, target_size)
        total_compressed += final_size
        
        print(f"✓ {img_file.name}: {original_size:.2f} MB → {final_size:.2f} MB (target: {target_size:.2f} MB, quality: {quality})")
    
    print(f"\n{'='*60}")
    print(f"Total original size: {total_original:.2f} MB")
    print(f"Total compressed size: {total_compressed:.2f} MB")
    print(f"Target was: {total_target_mb} MB")

if __name__ == "__main__":
    # Configuration
    INPUT_FOLDER = "/Users/danil/Pictures/to_compress"  # Change this to your folder path
    OUTPUT_FOLDER = "compressed_imagesss"
    
    # Choose compression mode:
    # Mode 1: Each image compressed to X MB
    # Mode 2: All images combined total X MB
    
    MODE = 1  # Change to 1 or 2
    
    if MODE == 1:
        # Compress each image to 9.5 MB
        compress_folder_individual(INPUT_FOLDER, OUTPUT_FOLDER, target_size_mb_per_image=9.5)
    else:
        # Compress all images to total 9.5 MB
        compress_folder_total(INPUT_FOLDER, OUTPUT_FOLDER, total_target_mb=9.5)
