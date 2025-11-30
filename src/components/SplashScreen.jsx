import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/SplashScreen.css';

const SplashScreen = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show on home page and if not shown in this session
        const hasShown = sessionStorage.getItem('splashShown');
        const isHome = location.pathname === '/';

        if (isHome && !hasShown) {
            setIsVisible(true);
            sessionStorage.setItem('splashShown', 'true');
        }
    }, [location]);

    useEffect(() => {
        if (!isVisible) return;

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="splash-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className="splash-content">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="splash-logo"
                        >
                            DANIL<span className="splash-accent">.ZANOZIN</span>
                        </motion.h1>
                        <motion.div
                            className="scroll-hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                        >
                            <p>Scroll to Explore</p>
                            <div className="scroll-arrow">↓</div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
