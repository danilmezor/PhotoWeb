// Blog post registry — the single source of truth for post metadata.
//
// IMPORTANT: this file must stay node-safe (plain data + plain functions, no
// JSX, no Vite-only syntax like `?raw` or import.meta.glob). It is imported by
// scripts/routes.mjs at build time (sitemap + prerender) as well as by the
// React pages. The Markdown *bodies* live in src/content/blog/<slug>.md and are
// loaded separately in BlogPost.jsx via import.meta.glob (browser/build only).
//
// `images` lists every image URL the post embeds (gallery photos + blog-local
// assets) so the image-sitemap can advertise them for the post's URL.

export const blogPosts = [
    {
        slug: 'grand-canyon-rim-to-rim',
        title: 'Grand Canyon Rim-to-Rim: A Photographer’s Guide to Hiking and Shooting Both Rims',
        description:
            'A photographer’s guide to hiking the Grand Canyon Rim-to-Rim — my itinerary, the best light and gear, sunrise and sunset spots, permits and water for the South Kaibab Trail, and what the North Rim looks like after the fire.',
        excerpt:
            'A week hiking from the North Rim to the South Rim with a camera on my back — itinerary, the best light and gear, where to shoot sunrise and sunset, rim-to-rim permits and water, and what the fire left on the North Rim.',
        datePublished: '2026-06-09',
        dateModified: '2026-06-09',
        heroImage: '/photos/grand-canyon/_DSC6909.jpg',
        heroSlug: 'grand-canyon-dsc6909',
        ogImage: '/photos/grand-canyon/_DSC6909.jpg',
        tags: ['Grand Canyon', 'Rim to Rim', 'landscape photography', 'hiking', 'American West'],
        assetBase: '/blog/grand-canyon-rim-to-rim',
        images: [
            // Gallery frames embedded via :photo (link through to their /photo pages)
            '/photos/grand-canyon/_DSC6909.jpg',
            '/photos/grand-canyon/_DSC6792.jpg',
            '/photos/grand-canyon/_DSC6767.jpg',
            '/photos/grand-canyon/_DSC6976.jpg',
            '/photos/grand-canyon/_DSC7101.jpg',
            '/photos/grand-canyon/_DSC7696.jpg',
            '/photos/grand-canyon/_DSC7793.jpg',
            // Blog-local images (phone shots + North Rim DSLR frames + draft-only frames)
            '/blog/grand-canyon-rim-to-rim/grand-canyon-route-map.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-sunrise-tripod-grandview-point.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-blue-hour-lens-pov.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-north-rim-trail-closed-fire.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-north-rim-cabins-fire-damage.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-pack-weight-scale-heat-warning.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-south-kaibab-switchbacks.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-redwall-footbridge-hikers.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-hikers-below-butte.jpg',
        ],
    },
];

const byDateDesc = (a, b) => (a.datePublished < b.datePublished ? 1 : a.datePublished > b.datePublished ? -1 : 0);

export const getAllPosts = () => [...blogPosts].sort(byDateDesc);

export const getPostBySlug = (slug) => blogPosts.find((post) => post.slug === slug) || null;

// --- Cross-link derivation (topic clusters) ---------------------------------
// A post's embedded gallery photos define which galleries and photo pages it
// relates to — so photo pages, gallery pages, and posts cross-link
// automatically as content is added, with no hand-maintained mapping.

const galleryOfImage = (src) => {
    const match = /^\/photos\/([^/]+)\//.exec(src || '');
    return match ? match[1].toLowerCase() : null;
};

// Posts that embed at least one photo from the given gallery slug.
export const getPostsForGallery = (slug) =>
    getAllPosts().filter((post) =>
        (post.images || []).some((src) => galleryOfImage(src) === slug)
    );

// Posts that embed this exact photo (for "Featured in" links on photo pages).
export const getPostsForPhoto = (src) =>
    getAllPosts().filter((post) => (post.images || []).includes(src));

// Unique gallery slugs a post draws photos from (for post → gallery links).
export const getGalleriesForPost = (post) =>
    [...new Set((post.images || []).map(galleryOfImage).filter(Boolean))];
