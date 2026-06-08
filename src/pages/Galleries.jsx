import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ParallaxImage from '../components/ParallaxImage';
import Breadcrumb from '../components/Breadcrumb';
import { galleries } from '../utils/galleries';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';
import '../styles/Galleries.css';

const Galleries = () => {
    const description = 'Browse the photography galleries — landscapes from the American West, urban and city studies, portraits, live music and events, Death Valley National Park, the Grand Canyon Rim-to-Rim, and the John Muir Trail.';
    const leadImage = galleries[0]?.cover;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Galleries',
        description,
        url: toAbsoluteUrl('/galleries'),
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: toAbsoluteUrl('/'),
        },
        author: {
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: toAbsoluteUrl('/about'),
        },
        hasPart: galleries.map(g => ({
            '@type': 'CollectionPage',
            name: g.title,
            url: toAbsoluteUrl(g.path),
        })),
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Galleries', path: '/galleries' },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container"
            style={{ paddingTop: 'var(--navbar-height)', paddingBottom: '50px' }}
        >
            <SEO
                title="Photo Galleries — Landscape, Travel, Portrait"
                description={description}
                path="/galleries"
                image={leadImage}
                jsonLd={[jsonLd, breadcrumbsJsonLd]}
            />
            <Breadcrumb items={[
                { name: 'Home', path: '/' },
                { name: 'Galleries' },
            ]} />
            <h1 style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '2px',
            }}>
                Galleries
            </h1>
            <p style={{
                maxWidth: '760px',
                margin: '0 auto 2.5rem',
                textAlign: 'center',
                lineHeight: '1.7',
                opacity: 0.85,
            }}>
                {description}
            </p>
            <div className="galleries-grid">
                {galleries.map((gallery, index) => (
                    <motion.div
                        key={gallery.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                        <Link to={gallery.path} className="gallery-tile">
                            <div className="gallery-tile-image-wrap">
                                <ParallaxImage
                                    src={gallery.cover}
                                    alt={`${gallery.title} gallery cover`}
                                    sizes="(max-width: 600px) 50vw, 33vw"
                                />
                            </div>
                            <h2 className="gallery-tile-title">{gallery.title}</h2>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Galleries;
