import React from 'react';

// Drop-in replacement for <img src={photo.src} alt={photo.alt} /> that emits
// a <picture> with responsive size variants in both WebP and JPEG.
//
// Assumes scripts/compress_with_metadata.py has produced sibling -<N>w.jpg
// and -<N>w.webp variants alongside the source file at 480w / 1080w / 1920w
// (variants larger than the source are skipped at generation time, so we
// reference all three and let the browser pick what's available).
//
// `sizes` defaults to a sensible "full-width on phone, half on tablet,
// third on desktop" fallback. Override per-surface where the rendered
// width differs (e.g. lightbox = roughly 80vw across the board).

const VARIANT_WIDTHS = [480, 1080, 1920];

const buildVariantUrls = (src) => {
    const dotIndex = src.lastIndexOf('.');
    if (dotIndex < 0) return null;
    const base = src.slice(0, dotIndex);
    const ext = src.slice(dotIndex); // keeps original case (.JPG / .jpg / .jpeg)
    return {
        webp: VARIANT_WIDTHS.map((w) => `${base}-${w}w.webp ${w}w`).join(', '),
        jpg: VARIANT_WIDTHS.map((w) => `${base}-${w}w${ext} ${w}w`).join(', '),
        fallbackWebp: src.replace(/\.(jpe?g|JPE?G)$/i, '.webp'),
    };
};

const DEFAULT_SIZES = '(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw';

const PhotoImage = ({
    src,
    alt,
    loading = 'lazy',
    className,
    style,
    onLoad,
    draggable,
    sizes = DEFAULT_SIZES,
}) => {
    if (!src) return null;
    const variants = buildVariantUrls(src);

    return (
        <picture>
            {variants && (
                <source
                    type="image/webp"
                    srcSet={variants.webp}
                    sizes={sizes}
                />
            )}
            {variants && (
                <source
                    srcSet={variants.jpg}
                    sizes={sizes}
                />
            )}
            {/* Fallback for browsers without <source srcset> support. */}
            {variants?.fallbackWebp && variants.fallbackWebp !== src && (
                <source type="image/webp" srcSet={variants.fallbackWebp} />
            )}
            <img
                src={src}
                alt={alt}
                loading={loading}
                className={className}
                style={style}
                onLoad={onLoad}
                draggable={draggable}
            />
        </picture>
    );
};

export default PhotoImage;
