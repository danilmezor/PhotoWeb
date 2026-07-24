import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import SEO from './SEO';
import MasonryGallery from './MasonryGallery';
import Breadcrumb from './Breadcrumb';
import RelatedGalleries from './RelatedGalleries';
import RelatedReading from './RelatedReading';
import { getPostsForGallery } from '../utils/blogPosts';
import { parseGeoJSON, generateSVGPath } from '../utils/geojsonParser';
import '../styles/TrailPage.css';

const TrailPage = ({
    title,
    blurb,
    stats,
    mapDataUrl,
    photos,
    seo,
    breadcrumbs,
    relatedSlug,
}) => {
    const [map, setMap] = useState({ d: "", width: 300, height: 600 });

    // Draw the route in step with page-scroll progress (0 at top → 1 at
    // bottom), read live from the document scroll on every event. The
    // ResizeObserver recomputes when total page height changes without a
    // scroll (fonts/related-galleries/late layout settling) so the drawn
    // fraction can't drift out of sync with the real scroll position.
    const pathLength = useMotionValue(0);

    useEffect(() => {
        const update = () => {
            const el = document.documentElement;
            const max = el.scrollHeight - el.clientHeight;
            pathLength.set(max > 0 ? Math.min(el.scrollTop / max, 1) : 0);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        const ro = new ResizeObserver(update);
        ro.observe(document.body);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            ro.disconnect();
        };
    }, [pathLength]);

    useEffect(() => {
        let cancelled = false;
        const loadMapData = async () => {
            const points = await parseGeoJSON(mapDataUrl);
            const result = generateSVGPath(points);
            if (!cancelled && result.d) setMap(result);
        };
        loadMapData();
        return () => {
            cancelled = true;
        };
    }, [mapDataUrl]);

    return (
        <div className="trail-page">
            {seo && <SEO {...seo} />}
            <div className="trail-sidebar">
                <div className="trail-head">
                    <h1 className="trail-title">{title}</h1>
                    {blurb && <p className="trail-blurb">{blurb}</p>}
                </div>

                <div className="trail-map-wrap">
                    <svg
                        viewBox={`0 0 ${map.width} ${map.height}`}
                        className="trail-map-svg"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <path
                            d={map.d}
                            fill="none"
                            stroke="#333"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />
                        <motion.path
                            d={map.d}
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                            style={{ pathLength }}
                        />
                    </svg>
                </div>

                <div className="trail-foot">
                    {stats && stats.length > 0 && (
                        <div className="trail-stats">
                            {stats.map((stat, i) => (
                                <p key={i}>{stat}</p>
                            ))}
                        </div>
                    )}
                    {relatedSlug && (
                        <RelatedReading
                            posts={getPostsForGallery(relatedSlug)}
                            heading="Trail guide"
                        />
                    )}
                </div>
            </div>

            <div className="trail-content-wrapper">
                {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
                <MasonryGallery photos={photos} />
                {relatedSlug && <RelatedGalleries currentSlug={relatedSlug} />}
            </div>
        </div>
    );
};

export default TrailPage;
