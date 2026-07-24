import React, { useMemo } from 'react';
import TrailPage from '../components/TrailPage';
import { images } from '../utils/images';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, buildPlace, buildTouristTrip, toAbsoluteUrl } from '../utils/site';

const HSTPage = () => {
    const photos = useMemo(() => (
        images.HST.map((photo) => ({
            ...photo,
            alt: photo.caption || `High Sierra Trail photo by Danil Zanozin (${photo.serial})`,
        }))
    ), []);

    const description = 'A photo diary of the High Sierra Trail — 72 miles across Sequoia and Kings Canyon, from the giant sequoias of Crescent Meadow over Kaweah Gap and the Kern River canyon to the summit of Mount Whitney and down to Whitney Portal.';
    const leadImage = photos[0]?.src || '/photos/HST/_DSC9760-HDR-Edit.jpg';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'High Sierra Trail Photography Story',
        description,
        url: toAbsoluteUrl('/hst'),
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
            name: 'High Sierra Trail',
        },
        primaryImageOfPage: toAbsoluteUrl(leadImage),
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Galleries', path: '/galleries' },
        { name: 'High Sierra Trail', path: '/hst' },
    ]);
    const trailPlace = buildPlace({
        name: 'High Sierra Trail',
        description: 'A 72-mile trans-Sierra trail from Crescent Meadow in Sequoia National Park to the summit of Mount Whitney and down to Whitney Portal.',
        geo: { latitude: 36.5478, longitude: -118.4900 },
    });
    const touristTripJsonLd = buildTouristTrip({
        name: 'High Sierra Trail Photo Diary',
        description,
        path: '/hst',
        place: trailPlace,
        itinerary: ['Crescent Meadow', 'Bearpaw Meadow', 'Hamilton Lakes', 'Kaweah Gap', 'Big Arroyo', 'Moraine Lake', 'Kern Hot Spring', 'Junction Meadow', 'Crabtree Meadow', 'Mount Whitney', 'Whitney Portal'],
        image: leadImage,
        datePublished: '2026-07-24',
    });

    return (
        <TrailPage
            title="High Sierra Trail"
            blurb="A photo diary from the giant sequoias of Crescent Meadow, over Kaweah Gap and the Kern River canyon, to the summit of Mount Whitney."
            stats={['72 Miles', '7 Days', '14,505ft Summit']}
            mapDataUrl="/HST_trail.json"
            photos={photos}
            breadcrumbs={[
                { name: 'Home', path: '/' },
                { name: 'Galleries', path: '/galleries' },
                { name: 'High Sierra Trail' },
            ]}
            relatedSlug="hst"
            seo={{
                title: 'High Sierra Trail Photo Diary — 72 Miles Across the Sierra Nevada',
                description,
                path: '/hst',
                image: leadImage,
                jsonLd: [jsonLd, touristTripJsonLd, breadcrumbsJsonLd],
            }}
        />
    );
};

export default HSTPage;
