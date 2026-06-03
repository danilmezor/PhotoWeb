// Single source of truth for static routes shipped with the site.
// Consumed by scripts/generate-seo-files.mjs (sitemap) and
// scripts/prerender.mjs (per-route static HTML generation).
//
// The root '/' is intentionally NOT in this list — Vite emits dist/index.html
// for it; nested routes get their own dist/<route>/index.html via prerender.

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
    { path: '/jmt', changefreq: 'monthly', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
];

export const ALL_ROUTES = [ROOT_ROUTE, ...NESTED_ROUTES];
