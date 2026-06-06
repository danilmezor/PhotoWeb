import React from 'react';
import manifest from '../utils/photoManifest.generated.json' with { type: 'json' };

// Drop-in replacement for <img src={photo.src} alt={photo.alt} /> that emits
// a <picture> with responsive size variants in both WebP and JPEG.
//
// scripts/compress_with_metadata.py produces sibling -<N>w.jpg / -<N>w.webp
// variants at 480w / 1080w / 1920w (skipping widths >= the source) plus a
// full-size .webp, and records what actually exists — together with the
// native dimensions — in photoManifest.generated.json. Srcsets are built
// strictly from that manifest: browsers fetch exactly one srcset candidate
// and do NOT fall back on 404, so every URL we emit must exist. Photos
// narrower than the largest variant width additionally get the original
// file as their largest candidate, at its true native width.
//
// Photos missing from the manifest degrade to a plain <img src> — safe,
// just not responsive. Rerun the script with --manifest-only after adding
// or resizing photos.
//
// `sizes` defaults to a sensible "full-width on phone, half on tablet,
// third on desktop" fallback. Override per-surface where the rendered
// width differs (e.g. lightbox = roughly 80vw across the board).

// Matches the largest width in RESPONSIVE_WIDTHS in the script.
const MAX_VARIANT_WIDTH = 1920;

const safeDecode = (s) => {
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
};

const buildVariantUrls = (src) => {
    // Manifest keys are raw paths; srcs from images.js are URI-encoded
    // (spaces etc.), so fall back to the decoded form.
    const entry = manifest[src] || manifest[safeDecode(src)];
    if (!entry) return null;
    const dotIndex = src.lastIndexOf('.');
    if (dotIndex < 0) return null;
    const base = src.slice(0, dotIndex);
    const ext = src.slice(dotIndex); // keeps original case (.JPG / .jpg / .jpeg)
    const widths = entry.variants || [];
    // For photos wide enough to have the largest variant, the srcset is
    // intentionally capped there — multi-MB originals shouldn't be picked
    // by retina screens. Narrow photos get the original (a small file by
    // definition) as their true largest candidate at its native width.
    const includeNative = entry.w <= MAX_VARIANT_WIDTH;
    const webp = widths.map((w) => `${base}-${w}w.webp ${w}w`);
    const jpg = widths.map((w) => `${base}-${w}w${ext} ${w}w`);
    if (includeNative) {
        webp.push(`${base}.webp ${entry.w}w`); // full-size sibling, always written by the script
        jpg.push(`${src} ${entry.w}w`);
    }
    return {
        webp: webp.join(', '),
        jpg: jpg.join(', '),
        width: entry.w,
        height: entry.h,
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
