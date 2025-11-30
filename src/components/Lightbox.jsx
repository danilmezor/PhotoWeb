import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Lightbox.css';

const Lightbox = ({ photo, onClose, onNext, onPrev }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose, onNext, onPrev]);

    if (!photo) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="lightbox-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <button className="lightbox-nav-button prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <motion.div
                    className="lightbox-content"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img src={photo.src} alt={photo.title} className="lightbox-image" />
                    <div className="lightbox-info">
                        <h3>{photo.title}</h3>
                        <p>ISO 100 • f/2.8 • 1/125s</p> {/* Placeholder EXIF */}
                    </div>
                    <button className="lightbox-close" onClick={onClose}>
                        &times;
                    </button>
                </motion.div>

                <button className="lightbox-nav-button next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default Lightbox;
