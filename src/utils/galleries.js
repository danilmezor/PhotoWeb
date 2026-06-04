import { images } from './images.js';
import { jmtData } from './jmtData.js';

const jmtCover = jmtData[0]?.images?.[0] || '/photos/JMT/_DSC4039.jpg';

export const galleries = [
    {
        slug: 'landscapes',
        title: 'Landscapes',
        path: '/landscapes',
        cover: images.landscapes[0]?.src,
        relatedSlugs: ['death-valley', 'grand-canyon', 'jmt'],
    },
    {
        slug: 'cities',
        title: 'Cities',
        path: '/cities',
        cover: images.cities[0]?.src,
        relatedSlugs: ['events', 'people'],
    },
    {
        slug: 'people',
        title: 'People',
        path: '/people',
        cover: images.people[0]?.src,
        relatedSlugs: ['events', 'cities'],
    },
    {
        slug: 'events',
        title: 'Events',
        path: '/events',
        cover: images.events[0]?.src,
        relatedSlugs: ['cities', 'people'],
    },
    {
        slug: 'death-valley',
        title: 'Death Valley',
        path: '/death-valley',
        cover: images['death-valley'][0]?.src,
        relatedSlugs: ['grand-canyon', 'jmt', 'landscapes'],
    },
    {
        slug: 'grand-canyon',
        title: 'Grand Canyon',
        path: '/grand-canyon',
        cover: images['grand-canyon'][0]?.src,
        relatedSlugs: ['jmt', 'death-valley', 'landscapes'],
    },
    {
        slug: 'jmt',
        title: 'JMT',
        path: '/jmt',
        cover: jmtCover,
        relatedSlugs: ['grand-canyon', 'death-valley', 'landscapes'],
    },
];

export const getRelatedGalleries = (slug) => {
    const current = galleries.find((g) => g.slug === slug);
    if (!current || !current.relatedSlugs) return [];
    return current.relatedSlugs
        .map((s) => galleries.find((g) => g.slug === s))
        .filter(Boolean);
};
