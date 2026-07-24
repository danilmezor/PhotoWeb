// Curated personal favorites. Edit this list freely — order here is the
// order they appear on the /favorites page (left-to-right, top-to-bottom
// across the masonry).
//
// Each entry is just { src, alt }. Add or remove rows anytime.

import { titleFromSrc } from './images.js';
import { metaFor } from './photoMeta.js';

export const favorites = [
    { src: '/photos/yosemite/_AC16711.jpg' },
    { src: '/photos/landscapes/_DSC8109-Edit.jpg' },
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
    { src: '/photos/lassen-volcanic/_DSC9002-HDR-Edit.jpg' },
    { src: '/photos/HST/_DSC0054-Edit.jpg' },
    { src: '/photos/HST/_DSC0263-Edit.jpg' },
    { src: '/photos/yosemite/_DSC9663-HDR-Edit.jpg' },
    { src: '/photos/yosemite/_DSC9497-HDR-Edit-2.jpg' },
].map((photo, index) => {
    const meta = metaFor(photo.src);
    const serial = titleFromSrc(photo.src);
    const caption = meta?.alt || null;
    return {
        id: `fav-${index + 1}`,
        src: photo.src,
        title: meta?.title || serial,
        serial,
        location: meta?.location || null,
        caption,
        alt: caption || `Photograph by Danil Zanozin (${serial})`,
    };
});
