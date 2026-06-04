import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import MasonryGallery from '../components/MasonryGallery';
import Breadcrumb from '../components/Breadcrumb';
import { favorites } from '../utils/favorites';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';

const Favorites = () => {
    const description = 'Personal favorites — a curated selection of photographs by Danil Zanozin from across landscapes, the John Muir Trail, Death Valley, the Grand Canyon Rim-to-Rim, and personal work.';
    const leadImage = favorites[0]?.src;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Personal Favorites',
        description,
        url: toAbsoluteUrl('/favorites'),
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
        primaryImageOfPage: leadImage ? toAbsoluteUrl(leadImage) : undefined,
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Personal Favorites', path: '/favorites' },
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
                title="Personal Favorites — Selected Photographs by Danil Zanozin"
                description={description}
                path="/favorites"
                image={leadImage}
                jsonLd={[jsonLd, breadcrumbsJsonLd]}
            />
            <Breadcrumb items={[
                { name: 'Home', path: '/' },
                { name: 'Personal Favorites' },
            ]} />
            <h1 style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '2px',
            }}>
                Personal Favorites
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
            <MasonryGallery photos={favorites} />
        </motion.div>
    );
};

export default Favorites;
