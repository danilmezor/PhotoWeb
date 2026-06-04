// Flat photo registry — every photo that has a primary home in a gallery is
// indexed here with a stable slug, prev/next links inside its gallery, and
// any EXIF metadata that the build-time extractor pulled from the JPEG.
//
// "Primary home" means the gallery the photo belongs to in `images`/`jmtData`.
// The same photo can appear in favorites or hero lists — those don't create
// a new permalink; the photo's permalink always points back to its primary
// gallery's slot.

import { images, formatTitle } from './images.js';
import { jmtData } from './jmtData.js';
import { captionFor } from './captions.js';
import exifIndex from './exifData.generated.json' with { type: 'json' };

// Galleries that live under category routes (Gallery component).
const CATEGORY_GALLERIES = [
    { slug: 'landscapes', title: 'Landscapes', path: '/landscapes', key: 'landscapes' },
    { slug: 'cities', title: 'Cities', path: '/cities', key: 'cities' },
    { slug: 'people', title: 'People', path: '/people', key: 'people' },
    { slug: 'events', title: 'Events', path: '/events', key: 'events' },
    { slug: 'death-valley', title: 'Death Valley', path: '/death-valley', key: 'death-valley' },
    { slug: 'grand-canyon', title: 'Grand Canyon', path: '/grand-canyon', key: 'grand-canyon' },
];

// Build a slug for a single photo within a gallery.
// Camera-serial files → "<gallery>-<lowercased-serial>"  e.g. "landscapes-ac11398"
// Hash-named files   → "<gallery>-<first8-of-base>"      e.g. "people-81djdwzh"
const slugFor = (gallerySlug, src) => {
    const base = (src.split('/').pop() || '').replace(/\.[^.]+$/, '');
    const title = formatTitle(`${base}.jpg`);
    if (title === 'Untitled') {
        const hashish = base.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
        return `${gallerySlug}-${hashish}`;
    }
    return `${gallerySlug}-${title.toLowerCase()}`;
};

const buildEntry = ({ slug, src, title, gallery }) => {
    const caption = captionFor(src);
    const exif = exifIndex[src] || null;
    return {
        slug,
        src,
        title,
        caption,
        alt: caption || `${gallery.title} photograph by Danil Zanozin (${title})`,
        gallery,
        exif,
    };
};

const buildAllPhotos = () => {
    const result = [];

    // Each category gallery contributes its photos.
    for (const gallery of CATEGORY_GALLERIES) {
        const photos = images[gallery.key] || [];
        for (const photo of photos) {
            result.push(
                buildEntry({
                    slug: slugFor(gallery.slug, photo.src),
                    src: photo.src,
                    title: photo.title,
                    gallery: { slug: gallery.slug, title: gallery.title, path: gallery.path },
                })
            );
        }
    }

    // JMT is structured by day — flatten.
    const jmtGallery = { slug: 'jmt', title: 'JMT', path: '/jmt' };
    for (const day of jmtData) {
        for (const src of day.images) {
            const fileName = (src.split('/').pop() || '');
            const title = formatTitle(fileName);
            result.push(
                buildEntry({
                    slug: slugFor('jmt', src),
                    src,
                    title,
                    gallery: jmtGallery,
                })
            );
        }
    }

    // Disambiguate any rare slug collisions (two AC11398 in the same gallery,
    // etc.) by appending an index. Single-collision case is extremely rare
    // given how serials work; this is defense-in-depth.
    const seen = new Map();
    return result.map((entry) => {
        const count = seen.get(entry.slug) || 0;
        seen.set(entry.slug, count + 1);
        return count === 0 ? entry : { ...entry, slug: `${entry.slug}-${count + 1}` };
    });
};

export const allPhotos = buildAllPhotos();

// Index for O(1) slug lookup.
const bySlug = new Map(allPhotos.map((p, index) => [p.slug, { ...p, index }]));

// Index by gallery for prev/next within the same gallery.
const byGallery = new Map();
for (const photo of allPhotos) {
    const list = byGallery.get(photo.gallery.slug) || [];
    list.push(photo);
    byGallery.set(photo.gallery.slug, list);
}

export const getPhotoBySlug = (slug) => bySlug.get(slug) || null;

export const getNeighbors = (slug) => {
    const photo = bySlug.get(slug);
    if (!photo) return { prev: null, next: null };
    const galleryList = byGallery.get(photo.gallery.slug) || [];
    const idx = galleryList.findIndex((p) => p.slug === slug);
    if (idx < 0) return { prev: null, next: null };
    const prev = idx > 0 ? galleryList[idx - 1] : galleryList[galleryList.length - 1];
    const next = idx < galleryList.length - 1 ? galleryList[idx + 1] : galleryList[0];
    return { prev, next };
};

export const photoUrl = (slug) => `/photo/${slug}`;
