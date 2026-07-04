import React from 'react';
import { buildVariantUrls } from '../utils/imageVariants';

// Drop-in replacement for <img src={photo.src} alt={photo.alt} /> that emits
// a <picture> with responsive size variants in both WebP and JPEG.
//
// Variant URLs come from photoManifest.generated.json via
// src/utils/imageVariants.js (see that file for the manifest contract).
//
// Photos missing from the manifest degrade to a plain <img src> — safe,
// just not responsive. Rerun the script with --manifest-only after adding
// or resizing photos.
//
// `sizes` defaults to a sensible "full-width on phone, half on tablet,
// third on desktop" fallback. Override per-surface where the rendered
// width differs (e.g. lightbox = roughly 80vw across the board).

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
            <img
                src={src}
                alt={alt}
                loading={loading}
                className={className}
                style={style}
                onLoad={onLoad}
                draggable={draggable}
                // Intrinsic dimensions so the browser reserves space before
                // the image loads (CLS). CSS still controls rendered size.
                width={variants?.width}
                height={variants?.height}
            />
        </picture>
    );
};

export default PhotoImage;
