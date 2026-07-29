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

// Alt text for the slideshow. The hero renders real <img> elements (Google
// does not index CSS background images), so these are the homepage's only
// image descriptions — and the homepage is the site's highest-authority page.
//
// Curated photos take their alt from photoMeta (captionFor) instead; these are
// the fallbacks for the hero frames that have no annotation yet. When a photo
// here gets annotated via /annotate, its entry below becomes dead weight and
// can be dropped.
export const heroAlt = {
    '/photos/landscapes/_AC14997.jpg':
        'Long-exposure surf smoothing to mist on a Florida beach at dusk, beachfront buildings lit under a storm-dark sky.',
    '/photos/cities/_AC16368-Pano.jpg':
        'The Golden Gate Bridge lit at twilight, seen from the Marin Headlands with the San Francisco skyline across the bay.',
    '/photos/landscapes/_DSC1471-Enhanced-NR.jpg':
        'The mouth of a sea cave at Leo Carrillo State Beach, Malibu, framing a star-filled night sky above the shoreline.',
    '/photos/landscapes/_DSC2014.jpg':
        'Cumulus clouds building over the alpine lakes below Kearsarge Pass in the Sierra Nevada, California.',
    '/photos/JMT/_DSC3788-Enhanced-NR.jpg':
        'Sunset light on granite domes reflected in a still river, lodgepole pines along the bank on the John Muir Trail.',
    '/photos/JMT/_DSC4063-Enhanced-NR.jpg':
        'Star trails wheeling above the granite walls at Mirror Lake, Yosemite Valley, California.',
    '/photos/landscapes/_DSC4277-Edit.jpg':
        'The Malibu coastline at night seen from Point Dume, city lights tracing the shore under a magenta sky.',
    '/photos/events/_DSC4592.jpg':
        'Black-and-white long exposure of a warehouse party, dancers blurred in motion around a neon-lit art installation.',
    '/photos/JMT/_DSC3151-HDR.jpg':
        'Deep blue twilight over a still alpine lake reflecting the Sierra crest on the John Muir Trail.',
};

// The LCP candidate on the homepage: the first slide's 1x image-set choice.
// Home.jsx passes this to <SEO preload> so the prerendered HTML preloads it.
export const firstHeroImage = () => largestWebp(heroPhotos[0]) || heroPhotos[0];
