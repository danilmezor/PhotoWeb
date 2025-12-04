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
        if (isVisible) {
            // Lock scrolling immediately
            window.scrollTo(0, 0); // Reset to top immediately
            document.body.classList.add('splash-active');
            document.documentElement.classList.add('splash-active');
        } else {
            // Unlock scrolling and reset position
            window.scrollTo(0, 0);
            document.body.classList.remove('splash-active');
            document.documentElement.classList.remove('splash-active');
        }

        return () => {
            document.body.classList.remove('splash-active');
            document.documentElement.classList.remove('splash-active');
        };
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        const handleWheel = (e) => {
            if (e.deltaY > 0) {
                // Prevent the actual scroll
                e.preventDefault(); // Note: wheel event might be passive, so preventDefault might not work unless listener is non-passive
                setIsVisible(false);
            }
        };

        let touchStartY = 0;
        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            const touchEndY = e.touches[0].clientY;
            const diff = touchStartY - touchEndY;

            // If swiping up (scrolling down)
            if (diff > 50) {
                e.preventDefault(); // Prevent default touch scroll
                setIsVisible(false);
            }
        };

        // Add non-passive listener for wheel to allow preventDefault if needed, 
        // but for now just relying on overflow: hidden should be enough if it works.
        // However, if overflow: hidden is working, the page shouldn't scroll anyway.
        // The issue might be that the scroll happens *after* we unlock.

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
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
