import React from 'react';
import TrailPage from '../components/TrailPage';
import { images } from '../utils/images';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, buildPlace, buildTouristTrip, toAbsoluteUrl } from '../utils/site';

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
    const parkPlace = buildPlace({
        name: 'Grand Canyon National Park',
        description: 'A 277-mile-long canyon carved by the Colorado River through the Colorado Plateau, in northern Arizona.',
        geo: { latitude: 36.0544, longitude: -112.1401 },
    });
    const touristTripJsonLd = buildTouristTrip({
        name: 'Grand Canyon Rim-to-Rim Photo Diary',
        description,
        path: '/grand-canyon',
        place: parkPlace,
        itinerary: ['North Rim', 'North Kaibab Trail', 'Cottonwood Campground', 'Phantom Ranch', 'Bright Angel Trail', 'South Rim'],
        image: leadImage,
    });

    return (
        <TrailPage
            title="Grand Canyon"
            blurb="A week on the rims, hiking North Rim to South Rim along the Rim-to-Rim trail."
            stats={['Rim to Rim', '~24 Miles', '11,000ft Elevation Change']}
            mapDataUrl="/R2R_full.json"
            photos={photos}
            breadcrumbs={[
                { name: 'Home', path: '/' },
                { name: 'Galleries', path: '/galleries' },
                { name: 'Grand Canyon' },
            ]}
            relatedSlug="grand-canyon"
            seo={{
                title: 'Grand Canyon Rim-to-Rim Hike — Photo Story',
                description,
                path: '/grand-canyon',
                image: leadImage,
                jsonLd: [jsonLd, touristTripJsonLd, breadcrumbsJsonLd],
            }}
        />
    );
};

export default GrandCanyonPage;
