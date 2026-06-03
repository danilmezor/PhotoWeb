// Post-build prerender: takes the SPA bundle in dist/ and produces a
// route-specific dist/<route>/index.html for every nested route. The root
// '/' keeps Vite's original dist/index.html.
//
// Why: the site is a client-rendered React app. Without this, social
// crawlers (Facebook, Twitter, Discord, iMessage) and slow-to-execute
// search bots see only the generic head from index.html for every URL.
// After this runs, each route has its own static HTML with the right
// <title>, og:image, canonical, and JSON-LD baked in.
//
// Approach:
//   1. Start a local static file server pointing at dist/.
//   2. Boot a headless Chromium.
//   3. For each route in NESTED_ROUTES: navigate, wait for the SEO
//      component to inject route-specific tags, dump the rendered DOM,
//      write to dist/<route>/index.html.
//   4. Shut everything down.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import handler from 'serve-handler';
import puppeteer from 'puppeteer';
import { NESTED_ROUTES } from './routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const PORT = 4322;
const LOCAL_ORIGIN = `http://127.0.0.1:${PORT}`;
const NAV_TIMEOUT_MS = 20_000;

// Resolve the canonical production origin. SEO injects URLs based on
// `window.location.origin` (the prerender server) by default, so we
// rewrite them after dumping the DOM. Vercel sets VERCEL_PROJECT_PRODUCTION_URL
// automatically; locally the user can set SITE_URL/VITE_SITE_URL.
const resolveProductionOrigin = () => {
    const candidates = [
        process.env.SITE_URL,
        process.env.VITE_SITE_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : '',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    ];
    for (const value of candidates) {
        if (!value) continue;
        const trimmed = value.trim().replace(/\/+$/, '');
        if (!trimmed) continue;
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    }
    return null;
};

const productionOrigin = resolveProductionOrigin();

const startStaticServer = () =>
    new Promise((resolve, reject) => {
        const server = http.createServer((req, res) =>
            handler(req, res, {
                public: distDir,
                rewrites: [{ source: '**', destination: '/index.html' }],
            })
        );
        server.on('error', reject);
        server.listen(PORT, () => resolve(server));
    });

const prerenderRoute = async (browser, route) => {
    const page = await browser.newPage();
    try {
        const url = `http://127.0.0.1:${PORT}${route.path}`;
        await page.goto(url, { waitUntil: 'networkidle0', timeout: NAV_TIMEOUT_MS });

        // SEO component injects canonical + JSON-LD on mount. Wait for both
        // so the dumped HTML contains the route-specific data.
        await page.waitForSelector('link[rel="canonical"]', { timeout: NAV_TIMEOUT_MS });
        await page.waitForSelector('script[data-seo-json-ld="true"]', { timeout: NAV_TIMEOUT_MS });

        let html = await page.content();

        if (productionOrigin) {
            html = html.split(LOCAL_ORIGIN).join(productionOrigin);
        }

        const outDir = path.join(distDir, route.path.replace(/^\//, ''));
        await mkdir(outDir, { recursive: true });
        await writeFile(path.join(outDir, 'index.html'), html, 'utf8');

        console.log(`[prerender] ✓ ${route.path}`);
    } catch (error) {
        console.error(`[prerender] ✗ ${route.path} — ${error.message}`);
        throw error;
    } finally {
        await page.close();
    }
};

const main = async () => {
    console.log(`[prerender] Serving ${distDir} on ${LOCAL_ORIGIN}`);
    if (productionOrigin) {
        console.log(`[prerender] Rewriting URLs to ${productionOrigin}`);
    } else {
        console.log('[prerender] No production origin set; URLs will reference the local prerender server.');
    }
    const server = await startStaticServer();
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        for (const route of NESTED_ROUTES) {
            await prerenderRoute(browser, route);
        }
        console.log(`[prerender] Done. ${NESTED_ROUTES.length} routes prerendered.`);
    } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
};

main().catch((error) => {
    console.error('[prerender] Failed:', error);
    process.exit(1);
});
