import React from 'react';

// Drop-in replacement for <img src={photo.src} alt={photo.alt} /> that
// emits a <picture> with a WebP source so modern browsers download the
// smaller, sharper variant. The JPEG path is the fallback.
//
// Assumes scripts/compress_with_metadata.py has produced a sibling .webp
// next to every .jpg / .jpeg / .JPG in public/photos/.
const toWebp = (src) => {
    if (!src) return src;
    return src.replace(/\.(jpe?g|JPE?G)$/i, '.webp');
};

const PhotoImage = ({ src, alt, loading = 'lazy', className, style, onLoad, draggable }) => {
    if (!src) return null;
    const webpSrc = toWebp(src);
    return (
        <picture>
            {webpSrc !== src && <source srcSet={webpSrc} type="image/webp" />}
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
