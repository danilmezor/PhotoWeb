// Flat photo registry — every photo that has a primary home in a gallery is
// indexed here with a stable slug, prev/next links inside its gallery, and
// any EXIF metadata that the build-time extractor pulled from the JPEG.
//
// "Primary home" means the gallery the photo belongs to in `images`/`jmtData`.
// The same photo can appear in favorites or hero lists — those don't create
// a new permalink; the photo's permalink always points back to its primary
// gallery's slot.

import { images, formatTitle, titleFromSrc } from './images.js';
import { jmtData } from './jmtData.js';
import { metaFor } from './photoMeta.js';
import exifIndex from './exifData.generated.json' with { type: 'json' };

// Galleries that live under category routes (Gallery component).
const CATEGORY_GALLERIES = [
    { slug: 'landscapes', title: 'Landscapes', path: '/landscapes', key: 'landscapes' },
    { slug: 'cities', title: 'Cities', path: '/cities', key: 'cities' },
    { slug: 'people', title: 'People', path: '/people', key: 'people' },
    { slug: 'events', title: 'Events', path: '/events', key: 'events' },
    { slug: 'death-valley', title: 'Death Valley', path: '/death-valley', key: 'death-valley' },
    { slug: 'grand-canyon', title: 'Grand Canyon', path: '/grand-canyon', key: 'grand-canyon' },
    { slug: 'lassen-volcanic', title: 'Lassen Volcanic', path: '/lassen-volcanic', key: 'lassen-volcanic' },
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
    const meta = metaFor(src);
    const exif = exifIndex[src] || null;
    const caption = meta?.alt || null;
    // A photo is "curated" when it has real human-written metadata. Un-curated
    // photos are thin pages (serial title + generic alt, no story) and get
    // noindex'd until annotated, so crawl budget concentrates on real content.
    const curated = Boolean(meta && (meta.title || meta.alt || meta.story));
    return {
        slug,
        src,
        curated,
        // Curated title (e.g. "Enshrined Forever") wins over the camera
        // serial; `serial` keeps the original for display/debugging. It's
        // derived from the src because the incoming `title` may itself
        // already be the curated one (images.js merges meta too).
        title: meta?.title || title,
        serial: titleFromSrc(src),
        caption,
        story: meta?.story || null,
        location: meta?.location || null,
        keywords: meta?.keywords || null,
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

// Index by curated location string so photo pages can cross-link "More from
// <location>" — these links work across galleries (e.g. a Death Valley shot
// that lives in /landscapes still links to the death-valley set).
const byLocation = new Map();
for (const photo of allPhotos) {
    if (!photo.location) continue;
    const key = photo.location.toLowerCase();
    const list = byLocation.get(key) || [];
    list.push(photo);
    byLocation.set(key, list);
}

export const getPhotoBySlug = (slug) => bySlug.get(slug) || null;

// Other photos sharing the same curated location (excludes the photo itself).
export const getSameLocationPhotos = (slug, count = 6) => {
    const photo = bySlug.get(slug);
    if (!photo?.location) return [];
    const list = byLocation.get(photo.location.toLowerCase()) || [];
    return list.filter((p) => p.slug !== slug).slice(0, count);
};

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

// Return a window of up to `count` photos centered on the given slug within
// its gallery. Wraps around at the edges so we always get exactly `count`
// items when the gallery is large enough. The current photo is NOT included
// in the returned list (it's the page subject).
export const getNearbyPhotos = (slug, count = 6) => {
    const photo = bySlug.get(slug);
    if (!photo) return [];
    const galleryList = byGallery.get(photo.gallery.slug) || [];
    if (galleryList.length <= 1) return [];
    const idx = galleryList.findIndex((p) => p.slug === slug);
    if (idx < 0) return [];
    const total = galleryList.length;
    const wanted = Math.min(count, total - 1);
    const half = Math.floor(wanted / 2);
    const out = [];
    // Walk outward, alternating after and before the current photo.
    let after = idx + 1;
    let before = idx - 1;
    while (out.length < wanted) {
        if (out.length < wanted) {
            out.push(galleryList[((after % total) + total) % total]);
            after += 1;
        }
        if (out.length < wanted && before !== idx) {
            out.unshift(galleryList[((before % total) + total) % total]);
            before -= 1;
        }
        // Safety: prevent infinite loop on very small galleries
        if (out.length >= total - 1) break;
    }
    return out.slice(0, wanted);
};

export const photoUrl = (slug) => `/photo/${slug}`;

// Resolve a photo's permalink from its image src. Galleries store photos by
// src (not slug), so this lets gallery thumbnails render a crawlable <a href>
// to the photo page while keeping the lightbox on click — the only internal
// link path crawlers have into the /photo/* graph.
const bySrc = new Map(allPhotos.map((p) => [p.src, p]));
export const getPhotoUrlBySrc = (src) => {
    const p = bySrc.get(src);
    return p ? photoUrl(p.slug) : null;
};
