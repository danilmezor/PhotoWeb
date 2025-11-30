import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { images } from '../utils/images';
import '../styles/Hero.css';

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.hero.length);
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
                    style={{ backgroundImage: `url(${images.hero[currentImageIndex]})` }}
                />
            </AnimatePresence>

            <div className="hero-overlay" />

            <div className="hero-content container">
                <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="hero-title"
                >
                    CAPTURING <br />
                    <span className="hero-title-accent">MOMENTS</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
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
