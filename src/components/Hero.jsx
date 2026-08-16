import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoImage from './PhotoImage';
import { heroPhotos, heroAlt } from '../utils/hero';
import { captionFor } from '../utils/photoMeta';
import '../styles/Hero.css';

// The slideshow renders real <img> elements (via PhotoImage's <picture>)
// rather than a CSS background-image. Google does not index CSS images, and
// the homepage is the site's highest-authority page — its photos should carry
// image-search weight. `sizes="100vw"` because the hero is always full-bleed.
//
// Alt text prefers the curated annotation so there's one source of truth;
// heroAlt covers the frames that aren't annotated yet.
const altFor = (src) => captionFor(src) || heroAlt[src] || '';

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroPhotos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentSrc = heroPhotos[currentImageIndex];

    return (
        <section className="hero">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImageIndex}
                    className="hero-background"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <PhotoImage
                        src={currentSrc}
                        alt={altFor(currentSrc)}
                        loading="eager"
                        sizes="100vw"
                        className="hero-image"
                    />
                </motion.div>
            </AnimatePresence>

            <div className="hero-overlay" />

            <div className="hero-content container">
                {/* Title is rendered at full opacity from the first paint so it
                    counts as Lighthouse LCP immediately. Only the slide-in
                    transform is animated for polish. */}
                <motion.h1
                    initial={{ y: 30 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hero-title"
                >
                    CAPTURING <br />
                    <span className="hero-title-accent">MOMENTS</span>
                </motion.h1>
            </div>

            <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
            >
                <div className="scroll-line" />
            </motion.div>
        </section>
    );
};

export default Hero;
