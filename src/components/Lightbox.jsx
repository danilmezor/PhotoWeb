import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Lightbox.css';

const Lightbox = ({ photos, selectedIndex, onClose, onSelect }) => {
    const stripRef = useRef(null);
    const activeThumbRef = useRef(null);

    const total = photos?.length || 0;
    const photo = total > 0 && selectedIndex != null ? photos[selectedIndex] : null;

    const goNext = () => onSelect((selectedIndex + 1) % total);
    const goPrev = () => onSelect((selectedIndex - 1 + total) % total);

    useEffect(() => {
        if (!photo) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onSelect((selectedIndex + 1) % total);
            if (e.key === 'ArrowLeft') onSelect((selectedIndex - 1 + total) % total);
        };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [photo, onClose, onSelect, selectedIndex, total]);

    useEffect(() => {
        if (activeThumbRef.current) {
            activeThumbRef.current.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

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
                <motion.div
                    className="lightbox-stage"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="lightbox-mat">
                        <img
                            src={photo.src}
                            alt={photo.alt || photo.title}
                            className="lightbox-image"
                        />
                    </div>

                    {(photo.title || photo.caption) && (
                        <div className="lightbox-caption">
                            {photo.title && <div className="lightbox-caption-title">{photo.title}</div>}
                            {photo.caption && <div className="lightbox-caption-description">{photo.caption}</div>}
                        </div>
                    )}

                    <div className="lightbox-strip-row">
                        <button
                            className="lightbox-nav-button prev"
                            onClick={(e) => { e.stopPropagation(); goPrev(); }}
                            aria-label="Previous photo"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        <div className="lightbox-strip" ref={stripRef}>
                            {photos.map((p, i) => (
                                <button
                                    key={p.id ?? p.src}
                                    ref={i === selectedIndex ? activeThumbRef : null}
                                    className={`lightbox-strip-thumb ${i === selectedIndex ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); onSelect(i); }}
                                    aria-label={`Show photo ${i + 1} of ${total}`}
                                >
                                    <img src={p.src} alt="" loading="lazy" />
                                </button>
                            ))}
                        </div>

                        <button
                            className="lightbox-nav-button next"
                            onClick={(e) => { e.stopPropagation(); goNext(); }}
                            aria-label="Next photo"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <button
                        className="lightbox-close"
                        onClick={onClose}
                        aria-label="Close lightbox"
                    >
                        &times;
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Lightbox;
