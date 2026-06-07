import React, { useEffect, useMemo, useRef } from 'react';
import PhotoImage from './PhotoImage';
import { splatFor, supports3D } from '../utils/splat3d';
import * as parallax from '../utils/parallaxController';
import '../styles/ParallaxImage.css';

// Drop-in superset of PhotoImage for gallery tiles: when the photo has a
// depth map (splatManifest) and the device qualifies (fine hovering pointer,
// motion allowed), hovering plays a depth-parallax instead of the classic
// zoom. The .parallax-tile wrapper carries a static scale(1.06) pre-zoom
// matching the shader's EDGE_ZOOM so the canvas fade-in is seamless —
// see Gallery.css / MasonryGallery.css.
//
// Photos without depth assets (or on touch / reduced-motion) render a plain
// PhotoImage and keep the original CSS hover behavior.

const ParallaxImage = (props) => {
    const ref = useRef(null);
    const depth = useMemo(() => {
        const entry = splatFor(props.src);
        return entry?.depth && supports3D() ? entry.depth : null;
    }, [props.src]);

    // If the tile unmounts mid-hover (page nav), end the session cleanly.
    useEffect(() => {
        if (!depth) return undefined;
        const tile = ref.current;
        return () => parallax.leave(tile);
    }, [depth]);

    if (!depth) return <PhotoImage {...props} />;

    return (
        <div
            className="parallax-tile"
            ref={ref}
            onPointerEnter={() => {
                const img = ref.current?.querySelector('img');
                if (img) parallax.enter(ref.current, img, depth);
            }}
            onPointerMove={parallax.move}
            onPointerLeave={() => parallax.leave(ref.current)}
        >
            <PhotoImage {...props} />
        </div>
    );
};

export default ParallaxImage;
