import React from 'react';
import TrailPage from '../components/TrailPage';
import { images } from '../utils/images';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';

const GrandCanyonPage = () => {
    const photos = images['grand-canyon'] || [];

    const description = 'A week in Grand Canyon National Park, hiking Rim-to-Rim from the North Rim to the South Rim — layered canyon walls, the Colorado River, switchbacks, and changing light from rim to inner gorge.';
    const leadImage = photos[0]?.src;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Grand Canyon Rim-to-Rim Photography',
        description,
        url: toAbsoluteUrl('/grand-canyon'),
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
        about: {
            '@type': 'Thing',
            name: 'Grand Canyon National Park',
        },
        primaryImageOfPage: leadImage ? toAbsoluteUrl(leadImage) : undefined,
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Galleries', path: '/galleries' },
        { name: 'Grand Canyon', path: '/grand-canyon' },
    ]);

    return (
        <TrailPage
            title="Grand Canyon"
            blurb="A week on the rims, hiking North Rim to South Rim along the Rim-to-Rim trail."
            stats={['Rim to Rim', '~24 Miles', '11,000ft Elevation Change']}
            mapDataUrl="/R2R_full.json"
            photos={photos}
            seo={{
                title: 'Grand Canyon Rim-to-Rim',
                description,
                path: '/grand-canyon',
                image: leadImage,
                jsonLd: [jsonLd, breadcrumbsJsonLd],
            }}
        />
    );
};

export default GrandCanyonPage;
