// Curated personal favorites. Edit this list freely — order here is the
// order they appear on the /favorites page (left-to-right, top-to-bottom
// across the masonry).
//
// Each entry is just { src, alt }. Add or remove rows anytime.

import { titleFromSrc } from './images.js';
import { captionFor } from './captions.js';

export const favorites = [
    { src: '/photos/landscapes/_AC16711.jpg' },
    { src: '/photos/landscapes/_DSC5401.jpg' },
    { src: '/photos/death-valley/_DSC6068.jpg' },
    { src: '/photos/death-valley/_DSC6099.jpg' },
    { src: '/photos/grand-canyon/_DSC6639.jpg' },
    { src: '/photos/grand-canyon/_DSC6767.jpg' },
    { src: '/photos/grand-canyon/_DSC6976.jpg' },
    { src: '/photos/grand-canyon/_DSC7793.jpg' },
    { src: '/photos/JMT/_DSC2021.jpg' },
    { src: '/photos/JMT/_DSC3649-HDR.jpg' },
    { src: '/photos/JMT/_DSC3788-Enhanced-NR.jpg' },
    { src: '/photos/JMT/_DSC3804-Edit.jpg' },
    { src: '/photos/JMT/_DSC4063-Enhanced-NR.jpg' },
].map((photo, index) => {
    const caption = captionFor(photo.src);
    return {
        id: `fav-${index + 1}`,
        src: photo.src,
        title: titleFromSrc(photo.src),
        caption,
        alt: caption || `Photograph by Danil Zanozin (${titleFromSrc(photo.src)})`,
    };
});
