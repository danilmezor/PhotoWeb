import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Gallery from '../components/Gallery';
import Breadcrumb from '../components/Breadcrumb';
import RelatedGalleries from '../components/RelatedGalleries';
import RelatedReading from '../components/RelatedReading';
import { getPostsForGallery } from '../utils/blogPosts';
import { images } from '../utils/images';
import { heroPhotos } from '../utils/hero';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';

const categoryMetadata = {
    landscapes: {
        path: '/landscapes',
        seoTitle: 'Landscape Photography — Sierra Nevada, Zion & the American West',
        description: 'Landscape photography from across the American West and beyond — granite valleys, alpine rivers, desert night skies, and quiet light in the Sierra Nevada, Zion, and the open Southwest.',
    },
    cities: {
        path: '/cities',
        seoTitle: 'City Photography — San Francisco, Paris, Rome Travel Shots',
        description: 'City and street photography studies — bridges, riverfronts, architecture, and twilight street light from San Francisco, Paris, Rome, and other cities photographed by Danil Zanozin.',
    },
    people: {
        path: '/people',
        seoTitle: 'Portrait Photography — Studio & Black-and-White Work',
        description: 'Portrait photography focused on character and mood — clean low-key studio setups, candid black-and-white moments, and editorial lighting work.',
    },
    events: {
        path: '/events',
        seoTitle: 'Live Music & Concert Photography',
        description: 'Live music, concert, and nightlife photography — crowd energy, stage movement, and neon-lit performances captured in real time at venues across the country.',
    },
    'death-valley': {
        path: '/death-valley',
        seoTitle: 'Death Valley National Park Photography',
        description: 'Death Valley National Park photography — salt flats, eroded badlands, dune fields, and the long shadows of the Panamint Range, captured during a week in the high desert.',
    },
    'lassen-volcanic': {
        path: '/lassen-volcanic',
        seoTitle: 'Lassen Volcanic National Park Photography',
        description: 'Lassen Volcanic National Park photography — steaming hydrothermal basins, the bulk of Lassen Peak, alpine lakes, and volcanic terrain in California\'s southern Cascades.',
    },
};

const CategoryPage = ({ category, title }) => {
    const photos = images[category] || [];
    const metadata = categoryMetadata[category] || {
        path: `/${category}`,
        description: `${title} photography collection by ${SITE_AUTHOR}.`,
    };
    const pageImage = photos[0]?.src || heroPhotos[0];
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
        '@type': ['CollectionPage', 'ImageGallery'],
        name: `${title} Photography`,
        description: metadata.description,
        url: toAbsoluteUrl(metadata.path),
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: toAbsoluteUrl('/'),
        },
        primaryImageOfPage: toAbsoluteUrl(pageImage),
        author: {
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: toAbsoluteUrl('/about'),
        },
        copyrightHolder: {
            '@type': 'Person',
            name: SITE_AUTHOR,
        },
        license: toAbsoluteUrl('/about'),
        hasPart: {
            '@type': 'ItemList',
            itemListElement: imageItemList,
        },
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Galleries', path: '/galleries' },
        { name: title, path: metadata.path },
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
                title={metadata.seoTitle || title}
                description={metadata.description}
                path={metadata.path}
                image={pageImage}
                jsonLd={[collectionJsonLd, breadcrumbsJsonLd]}
            />
            <Breadcrumb items={[
                { name: 'Home', path: '/' },
                { name: 'Galleries', path: '/galleries' },
                { name: title },
            ]} />
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
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                <RelatedReading posts={getPostsForGallery(category)} heading="Guides & field notes" />
            </div>
            <Gallery photos={photos} />
            <RelatedGalleries currentSlug={category} />
        </motion.div>
    );
};

export default CategoryPage;
