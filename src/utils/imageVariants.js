// Responsive-variant URL builders shared by PhotoImage (srcsets), Hero
// (CSS image-set) and per-page LCP preloads (SEO component's preload prop).
//
// scripts/compress_with_metadata.py produces sibling -<N>w.jpg / -<N>w.webp
// variants at 480w / 1080w / 1920w (skipping widths >= the source) plus a
// full-size .webp, and records what actually exists — together with the
// native dimensions — in photoManifest.generated.json. Srcsets are built
// strictly from that manifest: browsers fetch exactly one srcset candidate
// and do NOT fall back on 404, so every URL we emit must exist.

import manifest from './photoManifest.generated.json' with { type: 'json' };

// Matches the largest width in RESPONSIVE_WIDTHS in the script.
const MAX_VARIANT_WIDTH = 1920;

const safeDecode = (s) => {
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
};

export const buildVariantUrls = (src) => {
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

// Largest capped WebP for a photo (never the multi-MB original) — the 1x
// image-set slot in the Hero and the safe href for LCP preload links.
export const largestWebp = (src) => {
    const entry = manifest[src] || manifest[safeDecode(src)];
    const dotIndex = src.lastIndexOf('.');
    if (!entry || dotIndex < 0) return null;
    const base = src.slice(0, dotIndex);
    const variants = entry.variants || [];
    const largeWidth = variants[variants.length - 1];
    return largeWidth ? `${base}-${largeWidth}w.webp` : `${base}.webp`;
};
