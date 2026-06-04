import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import PhotoImage from '../components/PhotoImage';
import { getPhotoBySlug, getNeighbors, photoUrl } from '../utils/photoRegistry';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';
import '../styles/PhotoPage.css';

const formatExifLine = (exif) => {
    if (!exif) return null;
    const parts = [];
    if (exif.camera) parts.push(exif.camera);
    if (exif.lens) parts.push(exif.lens);
    if (exif.focalLength) parts.push(exif.focalLength);
    if (exif.aperture) parts.push(exif.aperture);
    if (exif.shutter) parts.push(exif.shutter);
    if (exif.iso) parts.push(`ISO ${exif.iso}`);
    return parts.length ? parts.join(' · ') : null;
};

const formatCaptureDate = (iso) => {
    if (!iso) return null;
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return iso;
    }
};

const PhotoPage = () => {
    const { slug } = useParams();
    const photo = getPhotoBySlug(slug);

    if (!photo) {
        return <Navigate to="/galleries" replace />;
    }

    const { prev, next } = getNeighbors(slug);

    const description = photo.caption || `${photo.gallery.title} photograph by ${SITE_AUTHOR}: ${photo.title}.`;
    const exifLine = formatExifLine(photo.exif);
    const captureDate = formatCaptureDate(photo.exif?.capturedAt);
    const path = photoUrl(slug);

    const imageObjectJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: toAbsoluteUrl(photo.src),
        url: toAbsoluteUrl(path),
        name: photo.title,
        caption: photo.caption || undefined,
        description,
        creditText: `Photo by ${SITE_AUTHOR}`,
        creator: {
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: toAbsoluteUrl('/about'),
        },
        copyrightHolder: {
            '@type': 'Person',
            name: SITE_AUTHOR,
        },
        copyrightYear: photo.exif?.capturedAt?.slice(0, 4),
        copyrightNotice: `© ${photo.exif?.capturedAt?.slice(0, 4) || new Date().getFullYear()} ${SITE_AUTHOR}. All rights reserved.`,
        license: toAbsoluteUrl('/about'),
        acquireLicensePage: toAbsoluteUrl('/about'),
        isPartOf: {
            '@type': 'CollectionPage',
            name: `${photo.gallery.title} Photography`,
            url: toAbsoluteUrl(photo.gallery.path),
        },
    };

    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Galleries', path: '/galleries' },
        { name: photo.gallery.title, path: photo.gallery.path },
        { name: photo.title, path },
    ]);

    return (
        <motion.div
            className="photo-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <SEO
                title={photo.caption ? `${photo.title} — ${photo.caption}` : photo.title}
                description={description}
                path={path}
                image={photo.src}
                type="article"
                jsonLd={[imageObjectJsonLd, breadcrumbsJsonLd]}
            />

            <nav className="photo-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span className="photo-breadcrumb-sep">/</span>
                <Link to="/galleries">Galleries</Link>
                <span className="photo-breadcrumb-sep">/</span>
                <Link to={photo.gallery.path}>{photo.gallery.title}</Link>
                <span className="photo-breadcrumb-sep">/</span>
                <span className="photo-breadcrumb-current">{photo.title}</span>
            </nav>

            <div className="photo-stage">
                <div className="photo-mat">
                    <PhotoImage
                        src={photo.src}
                        alt={photo.alt}
                        className="photo-image"
                        loading="eager"
                    />
                </div>

                <div className="photo-info">
                    <h1 className="photo-title">{photo.title}</h1>
                    {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                    {exifLine && <p className="photo-exif">{exifLine}</p>}
                    {captureDate && <p className="photo-date">{captureDate}</p>}
                </div>

                <div className="photo-nav">
                    {prev && (
                        <Link to={photoUrl(prev.slug)} className="photo-nav-link prev" rel="prev">
                            <span className="photo-nav-arrow" aria-hidden="true">←</span>
                            <span className="photo-nav-label">Previous</span>
                        </Link>
                    )}
                    <Link to={photo.gallery.path} className="photo-nav-link back">
                        Back to {photo.gallery.title}
                    </Link>
                    {next && (
                        <Link to={photoUrl(next.slug)} className="photo-nav-link next" rel="next">
                            <span className="photo-nav-label">Next</span>
                            <span className="photo-nav-arrow" aria-hidden="true">→</span>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PhotoPage;
