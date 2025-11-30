import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Idle detection
    useEffect(() => {
        let timeoutId;

        const resetTimer = () => {
            setIsIdle(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (window.scrollY > 50) {
                    setIsIdle(true);
                }
            }, 5000);
        };

        const handleActivity = () => {
            resetTimer();
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        resetTimer(); // Start timer initially

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, []);

    const links = [
        { name: 'Landscapes', path: '/landscapes' },
        { name: 'Cities', path: '/cities' },
        { name: 'People', path: '/people' },
        { name: 'Events', path: '/events' },
        { name: 'JMT', path: '/jmt' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isScrolled && isIdle ? 'idle-hidden' : ''}`}>
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                    DANIL<span className="logo-accent">.ZANOZIN</span>
                </Link>

                {/* Desktop Links */}
                <div className="navbar-links desktop-only">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div
                                    layoutId="underline"
                                    className="active-underline"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="mobile-menu-overlay"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mobile-menu-links">
                                {links.map((link, index) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
