import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import PhotoImage from '../components/PhotoImage';
import RelatedReading from '../components/RelatedReading';
import { buildVariantUrls } from '../utils/imageVariants';
import { getPostsForPhoto, getPostsForGallery } from '../utils/blogPosts';
import Breadcrumb from '../components/Breadcrumb';
import { getPhotoBySlug, getNeighbors, getNearbyPhotos, getSameLocationPhotos, photoUrl } from '../utils/photoRegistry';
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
    // Location strip takes precedence; the gallery strip drops any photo the
    // location strip already shows so the two never duplicate a thumb.
    const sameLocation = getSameLocationPhotos(slug, 6);
    const sameLocationSlugs = new Set(sameLocation.map((p) => p.slug));
    const nearby = getNearbyPhotos(slug, 6).filter((p) => !sameLocationSlugs.has(p.slug));

    const description = photo.caption || `${photo.gallery.title} photograph by ${SITE_AUTHOR}: ${photo.title}.`;
    // SERP title: curated location beats caption — "Title — Landmark, City".
    const seoTitle = photo.location
        ? `${photo.title} — ${photo.location}`
        : photo.caption ? `${photo.title} — ${photo.caption}` : photo.title;
    const exifLine = formatExifLine(photo.exif);
    const captureDate = formatCaptureDate(photo.exif?.capturedAt);
    const path = photoUrl(slug);

    // The photo is the LCP element and renders near full container width on
    // every breakpoint (.photo-image is max-width:100% in an up-to-1800px
    // stage) — the PhotoImage default of "33vw on desktop" undersizes it.
    const heroSizes = '(max-width: 1024px) 95vw, 90vw';
    const heroVariants = buildVariantUrls(photo.src);
    // Preload href is the fallback for browsers without imagesrcset support —
    // use the largest capped WebP, never the multi-MB original.
    const heroPreloadHref = heroVariants
        ? heroVariants.webp.split(', ').pop().split(' ')[0]
        : photo.src;

    // Cluster link back to the blog: "Featured in" when this exact photo is
    // embedded in a post; otherwise any guide drawing on this photo's gallery.
    const featuredIn = getPostsForPhoto(photo.src);
    const galleryPosts = featuredIn.length
        ? featuredIn
        : getPostsForGallery(photo.gallery.path.slice(1));
    const relatedHeading = featuredIn.length ? 'Featured in' : 'Related reading';

    const imageObjectJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: toAbsoluteUrl(photo.src),
        url: toAbsoluteUrl(path),
        name: photo.title,
        caption: photo.caption || undefined,
        description: photo.story || description,
        contentLocation: photo.location
            ? { '@type': 'Place', name: photo.location }
            : undefined,
        keywords: photo.keywords?.length ? photo.keywords.join(', ') : undefined,
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
        dateCreated: photo.exif?.capturedAt || undefined,
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
                title={seoTitle}
                description={description}
                path={path}
                image={photo.src}
                type="article"
                jsonLd={[imageObjectJsonLd, breadcrumbsJsonLd]}
                noindex={!photo.curated}
                preload={{
                    href: heroPreloadHref,
                    imageSrcSet: heroVariants?.webp,
                    imageSizes: heroVariants ? heroSizes : undefined,
                }}
            />

            <Breadcrumb items={[
                { name: 'Home', path: '/' },
                { name: 'Galleries', path: '/galleries' },
                { name: photo.gallery.title, path: photo.gallery.path },
                { name: photo.title },
            ]} />

            <div className="photo-stage">
                <div className="photo-mat">
                    <PhotoImage
                        src={photo.src}
                        alt={photo.alt}
                        className="photo-image"
                        loading="eager"
                        sizes={heroSizes}
                    />
                </div>

                <div className="photo-info">
                    <h1 className="photo-title">{photo.title}</h1>
                    {photo.location && <p className="photo-location">{photo.location}</p>}
                    {/* Story is the long-form prose; the short caption only
                        shows when there's no story (it duplicates alt text). */}
                    {photo.story
                        ? <p className="photo-story">{photo.story}</p>
                        : photo.caption && <p className="photo-caption">{photo.caption}</p>}
                    {exifLine && <p className="photo-exif">{exifLine}</p>}
                    {captureDate && <p className="photo-date">{captureDate}</p>}
                    <RelatedReading posts={galleryPosts} heading={relatedHeading} />
                </div>

                <div className="photo-nav">
                    {prev && (
                        <Link to={photoUrl(prev.slug)} className="photo-nav-link prev" rel="prev" aria-label={`Previous photo: ${prev.title}`}>
                            <span className="photo-nav-arrow" aria-hidden="true">←</span>
                            <span className="photo-nav-label">Previous</span>
                        </Link>
                    )}
                    <Link to={photo.gallery.path} className="photo-nav-link back">
                        Back to {photo.gallery.title}
                    </Link>
                    {next && (
                        <Link to={photoUrl(next.slug)} className="photo-nav-link next" rel="next" aria-label={`Next photo: ${next.title}`}>
                            <span className="photo-nav-label">Next</span>
                            <span className="photo-nav-arrow" aria-hidden="true">→</span>
                        </Link>
                    )}
                </div>

                {sameLocation.length > 0 && (
                    <section className="photo-nearby" aria-label={`More photos from ${photo.location}`}>
                        <h2 className="photo-nearby-heading">More from {photo.location}</h2>
                        <div className="photo-nearby-strip">
                            {sameLocation.map((p) => (
                                <Link
                                    key={p.slug}
                                    to={photoUrl(p.slug)}
                                    className="photo-nearby-thumb"
                                    aria-label={p.title}
                                >
                                    <PhotoImage src={p.src} alt={p.alt || p.title} />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {nearby.length > 0 && (
                    <section className="photo-nearby" aria-label={`More from ${photo.gallery.title}`}>
                        <h2 className="photo-nearby-heading">More from {photo.gallery.title}</h2>
                        <div className="photo-nearby-strip">
                            {nearby.map((p) => (
                                <Link
                                    key={p.slug}
                                    to={photoUrl(p.slug)}
                                    className="photo-nearby-thumb"
                                    aria-label={p.title}
                                >
                                    <PhotoImage src={p.src} alt={p.alt || p.title} />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </motion.div>
    );
};

export default PhotoPage;
