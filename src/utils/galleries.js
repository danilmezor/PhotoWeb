import { images } from './images.js';
import { jmtData } from './jmtData.js';

const jmtCover = jmtData[0]?.images?.[0] || '/photos/JMT/_DSC4039.jpg';

export const galleries = [
    {
        slug: 'landscapes',
        title: 'Landscapes',
        path: '/landscapes',
        cover: images.landscapes[0]?.src,
    },
    {
        slug: 'cities',
        title: 'Cities',
        path: '/cities',
        cover: images.cities[0]?.src,
    },
    {
        slug: 'people',
        title: 'People',
        path: '/people',
        cover: images.people[0]?.src,
    },
    {
        slug: 'events',
        title: 'Events',
        path: '/events',
        cover: images.events[0]?.src,
    },
    {
        slug: 'death-valley',
        title: 'Death Valley',
        path: '/death-valley',
        cover: images['death-valley'][0]?.src,
    },
    {
        slug: 'grand-canyon',
        title: 'Grand Canyon',
        path: '/grand-canyon',
        cover: images['grand-canyon'][0]?.src,
    },
    {
        slug: 'jmt',
        title: 'JMT',
        path: '/jmt',
        cover: jmtCover,
    },
];
