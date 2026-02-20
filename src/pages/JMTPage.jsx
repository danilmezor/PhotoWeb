import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SEO from '../components/SEO';
import { parseGeoJSON, generateSVGPath } from '../utils/geojsonParser';
import { jmtData } from '../utils/jmtData';
import { SITE_AUTHOR, SITE_NAME, toAbsoluteUrl } from '../utils/site';
import '../styles/JMTPage.css';

const JMTPage = () => {
    const containerRef = useRef(null);
    const [svgPath, setSvgPath] = useState("");
    const [activeSlide, setActiveSlide] = useState(0);
    const [hiddenTexts, setHiddenTexts] = useState(new Set());

    // Flatten data so every image is a "slide"
    const slides = useMemo(() => {
        return jmtData.flatMap(day =>
            day.images.map((img, index) => ({
                ...day,
                image: img,
                isFirstOfDay: index === 0,
                uniqueId: `${day.id}-${index}`
            }))
        );
    }, []);
    const jmtDescription = 'A multi-day visual story of hiking the 211-mile John Muir Trail through the Sierra Nevada, with daily notes and photography.';
    const leadImage = slides[0]?.image || '/photos/JMT/_DSC4039.jpg';
    const jmtJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'John Muir Trail Photography Story',
        description: jmtDescription,
        url: toAbsoluteUrl('/jmt'),
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: toAbsoluteUrl('/'),
        },
        author: {
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: toAbsoluteUrl('/about'),
        },
        about: {
            '@type': 'Thing',
            name: 'John Muir Trail',
        },
        primaryImageOfPage: toAbsoluteUrl(leadImage),
    };

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

    useEffect(() => {
        const loadMapData = async () => {
            const points = await parseGeoJSON('/JMT_2025.json');
            const path = generateSVGPath(points, 300, 600);
            setSvgPath(path);
        };
        loadMapData();
    }, []);

    return (
        <div className="jmt-page" ref={containerRef}>
            <SEO
                title="John Muir Trail Photography"
                description={jmtDescription}
                path="/jmt"
                image={leadImage}
                jsonLd={jmtJsonLd}
            />
            <div className="jmt-sidebar">
                <div className="jmt-map-container">
                    <h2>John Muir Trail</h2>
                    <p style={{ lineHeight: '1.6', opacity: 0.85 }}>
                        A 21-day photo diary from Whitney Portal to Yosemite Valley, combining trail notes with daily images.
                    </p>
                    <svg viewBox="0 0 300 600" className="jmt-map-svg">
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
                    <div className="jmt-stats">
                        <p>211 Miles</p>
                        <p>21 Days</p>
                        <p>47,000ft Elevation</p>
                    </div>
                </div>
            </div>

            <div className="jmt-content-wrapper">
                <div className="jmt-images-sticky">
                    {slides.map((slide, index) => (
                        <motion.img
                            key={slide.uniqueId}
                            src={slide.image}
                            alt={slide.title}
                            className="jmt-sticky-image"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: activeSlide === index ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    ))}
                </div>

                <div className="jmt-text-scroll">
                    {slides.map((slide, index) => (
                        <motion.div
                            key={slide.uniqueId}
                            className="jmt-text-section"
                            onViewportEnter={() => setActiveSlide(index)}
                            viewport={{ amount: 0.5 }}
                        >
                            {slide.isFirstOfDay && !hiddenTexts.has(slide.uniqueId) && activeSlide === index && (
                                <motion.div
                                    className="jmt-text-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <button
                                        className="jmt-text-close"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setHiddenTexts(prev => new Set([...prev, slide.uniqueId]));
                                        }}
                                        aria-label="Close description"
                                    >
                                        ✕
                                    </button>
                                    <h2>{slide.title}</h2>
                                    <p>{slide.text}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JMTPage;
