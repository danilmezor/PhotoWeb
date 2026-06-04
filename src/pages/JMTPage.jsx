import React, { useMemo } from 'react';
import TrailPage from '../components/TrailPage';
import { jmtData } from '../utils/jmtData';
import { titleFromSrc } from '../utils/images';
import { captionFor } from '../utils/captions';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, buildPlace, buildTouristTrip, toAbsoluteUrl } from '../utils/site';

const JMTPage = () => {
    const photos = useMemo(() => (
        jmtData.flatMap(day =>
            day.images.map((src, index) => {
                const caption = captionFor(src);
                return {
                    id: `${day.id}-${index}`,
                    src,
                    title: titleFromSrc(src),
                    caption,
                    alt: caption || `${day.day} — John Muir Trail photo by Danil Zanozin`,
                };
            })
        )
    ), []);

    const description = 'A 21-day photo diary of hiking the 211-mile John Muir Trail from Whitney Portal to Yosemite Valley — granite passes, alpine lakes, high passes, and weather across the Sierra Nevada.';
    const leadImage = photos[0]?.src || '/photos/JMT/_DSC4039.jpg';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'John Muir Trail Photography Story',
        description,
        url: toAbsoluteUrl('/jmt'),
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
            name: 'John Muir Trail',
        },
        primaryImageOfPage: toAbsoluteUrl(leadImage),
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Galleries', path: '/galleries' },
        { name: 'JMT', path: '/jmt' },
    ]);
    const trailPlace = buildPlace({
        name: 'John Muir Trail',
        description: 'A 211-mile long-distance hiking trail through the Sierra Nevada, running from Whitney Portal to Yosemite Valley.',
        geo: { latitude: 36.8158, longitude: -118.7917 },
    });
    const touristTripJsonLd = buildTouristTrip({
        name: 'John Muir Trail Photo Diary',
        description,
        path: '/jmt',
        place: trailPlace,
        itinerary: ['Whitney Portal', 'Trail Camp', 'Mount Whitney', 'Crabtree Meadow', 'Forester Pass', 'Glen Pass', 'Pinchot Pass', 'Mather Pass', 'Muir Pass', 'Selden Pass', 'Silver Pass', 'Lake Edison', 'Donohue Pass', 'Tuolumne Meadows', 'Yosemite Valley'],
        image: leadImage,
        datePublished: '2025-07-20',
    });

    return (
        <TrailPage
            title="John Muir Trail"
            blurb="A 21-day photo diary from Whitney Portal to Yosemite Valley."
            stats={['211 Miles', '21 Days', '47,000ft Elevation']}
            mapDataUrl="/JMT_2025.json"
            photos={photos}
            breadcrumbs={[
                { name: 'Home', path: '/' },
                { name: 'Galleries', path: '/galleries' },
                { name: 'JMT' },
            ]}
            relatedSlug="jmt"
            seo={{
                title: 'John Muir Trail Photo Diary — 211 Miles in the Sierra Nevada',
                description,
                path: '/jmt',
                image: leadImage,
                jsonLd: [jsonLd, touristTripJsonLd, breadcrumbsJsonLd],
            }}
        />
    );
};

export default JMTPage;
