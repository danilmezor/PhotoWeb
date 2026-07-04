// Curated slideshow images for the home page Hero.
// Pulled directly from existing category folders — no duplication into /hero/.
// Order here is the slideshow order (5s per slide, fades on Hero.jsx).

// Explicit extension: this file is imported by node scripts (routes.mjs)
// where extensionless specifiers don't resolve.
import { largestWebp } from './imageVariants.js';

export const heroPhotos = [
    '/photos/landscapes/_AC14997.jpg',
    '/photos/cities/_AC16368-Pano.jpg',
    '/photos/landscapes/_DSC1471-Enhanced-NR.jpg',
    '/photos/landscapes/_DSC2014.jpg',
    '/photos/JMT/_DSC3788-Enhanced-NR.jpg',
    '/photos/JMT/_DSC4063-Enhanced-NR.jpg',
    '/photos/landscapes/_DSC4277-Edit.jpg',
    '/photos/events/_DSC4592.jpg',
    '/photos/death-valley/_DSC5570.jpg',
    '/photos/death-valley/_DSC6099.jpg',
    '/photos/death-valley/_DSC6068.jpg',
    '/photos/grand-canyon/_DSC6639.jpg',
    '/photos/grand-canyon/_DSC6976.jpg',
    '/photos/JMT/_DSC3151-HDR.jpg',
];

// The LCP candidate on the homepage: the first slide's 1x image-set choice.
// Home.jsx passes this to <SEO preload> so the prerendered HTML preloads it.
export const firstHeroImage = () => largestWebp(heroPhotos[0]) || heroPhotos[0];
