import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoImage from './PhotoImage';
import { allPhotos, photoUrl } from '../utils/photoRegistry';
import { splatFor, supports3D, formatMB } from '../utils/splat3d';
import '../styles/Lightbox.css';

// Lazy chunk: playcanvas + viewer only ever load on the first "View in 3D"
// click — never on lightbox open, never in the main bundle.
const SplatViewer = lazy(() => import('./SplatViewer'));

const slugBySrc = new Map(allPhotos.map((p) => [p.src, p.slug]));

const Lightbox = ({ photos, selectedIndex, onClose, onSelect }) => {
    const stripRef = useRef(null);
    const activeThumbRef = useRef(null);
    const frameRef = useRef(null);

    // 3D state: the viewer mounts on first request and stays mounted for the
    // lightbox session (it caches loaded splats). All 3D state is keyed by
    // photo src, so navigating to another photo drops back to the 2D view
    // with no reset effect needed.
    const [viewerMounted, setViewerMounted] = useState(false);
    const [shown3dSrc, setShown3dSrc] = useState(null);
    const [loading3dSrc, setLoading3dSrc] = useState(null);
    const [error3dSrc, setError3dSrc] = useState(null);

    const total = photos?.length || 0;
    const photo = total > 0 && selectedIndex != null ? photos[selectedIndex] : null;

    const splat = photo ? splatFor(photo.src) : null;
    const can3d = Boolean(splat) && supports3D();
    const mode3d = Boolean(photo) && shown3dSrc === photo.src;
    const loading3d = Boolean(photo) && loading3dSrc === photo.src;
    const error3d = Boolean(photo) && error3dSrc === photo.src;

    const goNext = () => onSelect((selectedIndex + 1) % total);
    const goPrev = () => onSelect((selectedIndex - 1 + total) % total);

    const enter3d = () => {
        setError3dSrc(null);
        setLoading3dSrc(photo.src);
        setViewerMounted(true);
    };
    const exit3d = () => {
        setShown3dSrc(null);
        setLoading3dSrc(null);
    };
    const handleLoaded = (src) => {
        // Ignore loads that finish after the user navigated away.
        if (photo && src === photo.src) {
            setLoading3dSrc(null);
            setShown3dSrc(src);
        }
    };
    const handleError = () => {
        setLoading3dSrc(null);
        setShown3dSrc(null);
        setError3dSrc(photo?.src || null);
    };

    const toggleLabel = error3d
        ? '3D unavailable'
        : loading3d
            ? `Loading ${formatMB(splat?.bytes || 0)}…`
            : mode3d
                ? 'View Photo'
                : 'View in 3D';

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
                        <div
                            className={`lightbox-frame ${mode3d ? 'is-3d' : ''}`}
                            ref={frameRef}
                        >
                            <PhotoImage
                                src={photo.src}
                                alt={photo.alt || photo.title}
                                className="lightbox-image"
                                loading="eager"
                                sizes="(max-width: 600px) 95vw, 80vw"
                            />
                            {viewerMounted && (
                                <Suspense fallback={null}>
                                    <SplatViewer
                                        photo={photo}
                                        splat={splat}
                                        active={loading3d || mode3d}
                                        frameRef={frameRef}
                                        onLoaded={handleLoaded}
                                        onError={handleError}
                                    />
                                </Suspense>
                            )}
                        </div>
                    </div>

                    {(photo.title || photo.caption || can3d) && (() => {
                        const slug = slugBySrc.get(photo.src);
                        const inner = (
                            <>
                                {photo.caption && <div className="lightbox-caption-description">{photo.caption}</div>}
                                {slug && <div className="lightbox-caption-permalink">View photo page →</div>}
                            </>
                        );
                        return (
                            <div className="lightbox-caption">
                                {(photo.title || can3d) && (
                                    <div className="lightbox-caption-title-row">
                                        {photo.title && <div className="lightbox-caption-title">{photo.title}</div>}
                                        {can3d && (
                                            <button
                                                className="lightbox-3d-toggle"
                                                disabled={loading3d}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (mode3d) exit3d(); else enter3d();
                                                }}
                                            >
                                                {toggleLabel}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {slug ? (
                                    <Link
                                        to={photoUrl(slug)}
                                        className="lightbox-caption-link"
                                        onClick={onClose}
                                    >
                                        {inner}
                                    </Link>
                                ) : (
                                    inner
                                )}
                            </div>
                        );
                    })()}

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
                                    <PhotoImage src={p.src} alt="" sizes="96px" />
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
