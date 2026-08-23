// Single source of truth for static routes shipped with the site.
// Consumed by scripts/generate-seo-files.mjs (sitemap) and
// scripts/prerender.mjs (per-route static HTML generation).
//
// The root '/' lives in ROOT_ROUTE (kept separate from NESTED_ROUTES for the
// sitemap's priority/changefreq); prerender renders it too, overwriting Vite's
// bare dist/index.html so the homepage ships static internal links.

export const ROOT_ROUTE = { path: '/', changefreq: 'weekly', priority: '1.0' };

export const NESTED_ROUTES = [
    { path: '/favorites', changefreq: 'monthly', priority: '0.9' },
    { path: '/galleries', changefreq: 'monthly', priority: '0.9' },
    { path: '/landscapes', changefreq: 'weekly', priority: '0.9' },
    { path: '/cities', changefreq: 'weekly', priority: '0.9' },
    { path: '/people', changefreq: 'weekly', priority: '0.8' },
    { path: '/events', changefreq: 'weekly', priority: '0.8' },
    { path: '/death-valley', changefreq: 'monthly', priority: '0.8' },
    { path: '/grand-canyon', changefreq: 'monthly', priority: '0.8' },
    { path: '/lassen-volcanic', changefreq: 'monthly', priority: '0.8' },
    { path: '/yosemite', changefreq: 'monthly', priority: '0.8' },
    { path: '/jmt', changefreq: 'monthly', priority: '0.9' },
    { path: '/hst', changefreq: 'monthly', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/license', changefreq: 'yearly', priority: '0.4' },
];

// Blog: the index plus one route per post, derived from the post registry.
const { getAllPosts } = await import('../src/utils/blogPosts.js');
const blogPosts = getAllPosts();

export const BLOG_ROUTES = [
    { path: '/blog', changefreq: 'weekly', priority: '0.8', images: blogPosts.map((p) => p.heroImage) },
    ...blogPosts.map((post) => ({
        path: `/blog/${post.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        images: post.images,
    })),
];

export const ALL_ROUTES = [ROOT_ROUTE, ...NESTED_ROUTES, ...BLOG_ROUTES];

// Per-photo permalinks derived from the registry. Each photo gets its own
// indexable URL — these expand the sitemap and the prerender pass.
const { allPhotos } = await import('../src/utils/photoRegistry.js');

// All photo permalinks — prerendered (so each ships its static HTML, including
// the noindex tag for un-curated/thin photos).
export const PHOTO_ROUTES = allPhotos.map((photo) => ({
    path: `/photo/${photo.slug}`,
    changefreq: 'monthly',
    priority: '0.6',
    image: photo.src,
    curated: photo.curated,
}));

// Only curated photo pages belong in the sitemap — un-curated ones are noindex,
// and submitting noindex URLs is contradictory (GSC flags them). Their images
// stay discoverable via their gallery/category page's image-sitemap entries.
export const INDEXABLE_PHOTO_ROUTES = PHOTO_ROUTES.filter((route) => route.curated);

export const ALL_ROUTES_WITH_PHOTOS = [...ALL_ROUTES, ...PHOTO_ROUTES];
