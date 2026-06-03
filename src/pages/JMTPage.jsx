import React, { useMemo } from 'react';
import TrailPage from '../components/TrailPage';
import { jmtData } from '../utils/jmtData';
import { titleFromSrc } from '../utils/images';
import { captionFor } from '../utils/captions';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';

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

    return (
        <TrailPage
            title="John Muir Trail"
            blurb="A 21-day photo diary from Whitney Portal to Yosemite Valley."
            stats={['211 Miles', '21 Days', '47,000ft Elevation']}
            mapDataUrl="/JMT_2025.json"
            photos={photos}
            seo={{
                title: 'John Muir Trail',
                description,
                path: '/jmt',
                image: leadImage,
                jsonLd: [jsonLd, breadcrumbsJsonLd],
            }}
        />
    );
};

export default JMTPage;
