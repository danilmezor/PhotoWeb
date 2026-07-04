import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { heroPhotos } from '../utils/hero';
import { largestWebp } from '../utils/imageVariants';
import manifest from '../utils/photoManifest.generated.json' with { type: 'json' };
import '../styles/Hero.css';

// Build an image-set() value that lets the browser pick a WebP variant
// at the right size for the viewport. Falls back to the original JPG so
// modern browsers without WebP (very rare now) still see the photo.
// Variant URLs come from photoManifest.generated.json — variants wider
// than the source are never generated, so referencing fixed widths
// blindly would 404 (and CSS image-set, like srcset, does not fall back).
const heroBackgroundImage = (src) => {
    const entry = manifest[src];
    const dotIndex = src.lastIndexOf('.');
    if (!entry || dotIndex < 0) return `url("${src}")`;
    const base = src.slice(0, dotIndex);
    const variants = entry.variants || [];
    // 1x slot: largest available variant (capped at 1920w — never the
    // multi-MB full-size original); a photo with no variants is itself
    // small, so its full-size webp is fine.
    const largeWebp = largestWebp(src) || `${base}.webp`;
    // 0.5x slot: largest variant <= 1080, else whatever the 1x slot uses.
    const midWidth = [...variants].reverse().find((w) => w <= 1080);
    const midWebp = midWidth ? `${base}-${midWidth}w.webp` : largeWebp;
    return `image-set(url("${largeWebp}") type("image/webp") 1x, url("${midWebp}") type("image/webp") 0.5x, url("${src}") type("image/jpeg"))`;
};

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backgrounds = useMemo(() => heroPhotos.map(heroBackgroundImage), []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroPhotos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
                    style={{ backgroundImage: backgrounds[currentImageIndex] }}
                />
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

                <motion.p
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="hero-subtitle"
                >
                    since 2011
                </motion.p>
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
