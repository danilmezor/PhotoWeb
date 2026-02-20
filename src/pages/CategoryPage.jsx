import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Gallery from '../components/Gallery';
import { images } from '../utils/images';
import { SITE_AUTHOR, SITE_NAME, toAbsoluteUrl } from '../utils/site';

const categoryMetadata = {
    landscapes: {
        path: '/landscapes',
        description: 'Desert night skies, alpine rivers, and granite valleys across the American West, photographed for light, scale, and quiet atmosphere.',
    },
    cities: {
        path: '/cities',
        description: 'City studies from San Francisco, Paris, Rome, and beyond: bridges, riverfronts, architecture, and twilight street light.',
    },
    people: {
        path: '/people',
        description: 'Portraits focused on character and mood, from clean low-key setups to candid black-and-white moments.',
    },
    events: {
        path: '/events',
        description: 'Live music and nightlife photography with crowd energy, stage movement, and neon-lit performances captured in real time.',
    },
};

const CategoryPage = ({ category, title }) => {
    const photos = images[category] || [];
    const metadata = categoryMetadata[category] || {
        path: `/${category}`,
        description: `${title} photography collection by ${SITE_AUTHOR}.`,
    };
    const pageImage = photos[0]?.src || images.hero[0];
    const imageItemList = photos.slice(0, 20).map((photo, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
            '@type': 'ImageObject',
            name: photo.title,
            contentUrl: toAbsoluteUrl(photo.src),
            creator: {
                '@type': 'Person',
                name: SITE_AUTHOR,
            },
        },
    }));
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${title} Photography`,
        description: metadata.description,
        url: toAbsoluteUrl(metadata.path),
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: toAbsoluteUrl('/'),
        },
        primaryImageOfPage: toAbsoluteUrl(pageImage),
        hasPart: {
            '@type': 'ItemList',
            itemListElement: imageItemList,
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container"
            style={{ paddingTop: '100px', paddingBottom: '50px' }}
        >
            <SEO
                title={`${title} Photography`}
                description={metadata.description}
                path={metadata.path}
                image={pageImage}
                jsonLd={collectionJsonLd}
            />
            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    fontSize: '3rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}
            >
                {title}
            </motion.h1>
            <p
                style={{
                    maxWidth: '760px',
                    margin: '0 auto 2.5rem',
                    textAlign: 'center',
                    lineHeight: '1.7',
                    opacity: 0.85,
                }}
            >
                {metadata.description}
            </p>
            <Gallery photos={photos} />
        </motion.div>
    );
};

export default CategoryPage;
