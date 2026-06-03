import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SEO from './SEO';
import MasonryGallery from './MasonryGallery';
import { parseGeoJSON, generateSVGPath } from '../utils/geojsonParser';
import '../styles/TrailPage.css';

const TrailPage = ({
    title,
    blurb,
    stats,
    mapDataUrl,
    mapViewBox = { width: 300, height: 600 },
    photos,
    seo,
}) => {
    const containerRef = useRef(null);
    const [svgPath, setSvgPath] = useState("");

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

    useEffect(() => {
        let cancelled = false;
        const loadMapData = async () => {
            const points = await parseGeoJSON(mapDataUrl);
            const path = generateSVGPath(points, mapViewBox.width, mapViewBox.height);
            if (!cancelled) setSvgPath(path);
        };
        loadMapData();
        return () => {
            cancelled = true;
        };
    }, [mapDataUrl, mapViewBox.width, mapViewBox.height]);

    return (
        <div className="trail-page" ref={containerRef}>
            {seo && <SEO {...seo} />}
            <div className="trail-sidebar">
                <div className="trail-map-container">
                    <h2>{title}</h2>
                    {blurb && (
                        <p style={{ lineHeight: '1.6', opacity: 0.85 }}>{blurb}</p>
                    )}
                    <svg
                        viewBox={`0 0 ${mapViewBox.width} ${mapViewBox.height}`}
                        className="trail-map-svg"
                    >
                        <path
                            d={svgPath}
                            fill="none"
                            stroke="#333"
                            strokeWidth="2"
                        />
                        <motion.path
                            d={svgPath}
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2"
                            style={{ pathLength }}
                        />
                    </svg>
                    {stats && stats.length > 0 && (
                        <div className="trail-stats">
                            {stats.map((stat, i) => (
                                <p key={i}>{stat}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="trail-content-wrapper">
                <MasonryGallery photos={photos} />
            </div>
        </div>
    );
};

export default TrailPage;
