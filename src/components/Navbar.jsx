import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { galleries } from '../utils/galleries';
import '../styles/Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGalleriesOpen, setIsGalleriesOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

        const handleActivity = () => resetTimer();

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        resetTimer();

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
        { name: 'Personal Favorites', path: '/favorites' },
        { name: 'Galleries', path: '/galleries', hasDropdown: true },
        { name: 'About', path: '/about' },
    ];

    const isGalleryRoute = (pathname) =>
        pathname === '/galleries' || galleries.some(g => g.path === pathname);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isScrolled && isIdle ? 'idle-hidden' : ''}`}>
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                    DANIL<span className="logo-accent">.ZANOZIN</span>
                </Link>

                {/* Desktop Links */}
                <div className="navbar-links desktop-only">
                    {links.map((link) => {
                        const isActive = link.hasDropdown
                            ? isGalleryRoute(location.pathname)
                            : location.pathname === link.path;

                        if (link.hasDropdown) {
                            return (
                                <div
                                    key={link.path}
                                    className="navbar-dropdown"
                                    onMouseEnter={() => setIsGalleriesOpen(true)}
                                    onMouseLeave={() => setIsGalleriesOpen(false)}
                                >
                                    <Link
                                        to={link.path}
                                        className={`navbar-link ${isActive ? 'active' : ''}`}
                                    >
                                        {link.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="underline"
                                                className="active-underline"
                                            />
                                        )}
                                    </Link>
                                    <AnimatePresence>
                                        {isGalleriesOpen && (
                                            <motion.div
                                                className="navbar-dropdown-menu"
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                {galleries.map((g) => (
                                                    <Link
                                                        key={g.slug}
                                                        to={g.path}
                                                        className={`navbar-dropdown-item ${location.pathname === g.path ? 'active' : ''}`}
                                                        onClick={() => setIsGalleriesOpen(false)}
                                                    >
                                                        {g.title}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`navbar-link ${isActive ? 'active' : ''}`}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="underline"
                                        className="active-underline"
                                    />
                                )}
                            </Link>
                        );
                    })}
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
                                {links.map((link, index) => {
                                    const isActive = link.hasDropdown
                                        ? isGalleryRoute(location.pathname)
                                        : location.pathname === link.path;
                                    return (
                                        <motion.div
                                            key={link.path}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                to={link.path}
                                                className={`mobile-link ${isActive ? 'active' : ''}`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.name}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
