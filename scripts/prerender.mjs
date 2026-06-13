// Post-build prerender: takes the SPA bundle in dist/ and produces a
// route-specific dist/<route>/index.html for every route, INCLUDING the root
// '/' (overwriting Vite's bare shell so the homepage ships static internal
// links — essential for crawler discovery of the rest of the site).
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
import puppeteer from 'puppeteer-core';
import { ROOT_ROUTE, NESTED_ROUTES, BLOG_ROUTES, PHOTO_ROUTES } from './routes.mjs';

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

// Pick a Chromium launch config that works in both environments:
//   - Vercel / Lambda / Linux CI: @sparticuz/chromium ships a binary with the
//     right shared libraries bundled.
//   - Local dev: use the developer's installed Chrome / Chromium / Edge so we
//     don't ship a 150 MB browser in node_modules.
const resolveLaunchOptions = async () => {
    const isServerless = !!(process.env.VERCEL || process.env.AWS_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
        const chromium = (await import('@sparticuz/chromium')).default;
        return {
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        };
    }

    const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || macChrome,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new',
    };
};

const main = async () => {
    console.log(`[prerender] Serving ${distDir} on ${LOCAL_ORIGIN}`);
    if (productionOrigin) {
        console.log(`[prerender] Rewriting URLs to ${productionOrigin}`);
    } else {
        console.log('[prerender] No production origin set; URLs will reference the local prerender server.');
    }
    const server = await startStaticServer();
    const launchOptions = await resolveLaunchOptions();
    const browser = await puppeteer.launch(launchOptions);

    // The homepage ('/') is prerendered too: it overwrites Vite's bare SPA
    // shell (dist/index.html) with the rendered DOM so the navbar + collection
    // links are present as static <a href> tags. Without this the homepage is a
    // dead end for crawlers — Googlebot's first-wave crawl sees no links out,
    // so it can't discover /galleries, /blog, /photo/*, etc. from the entry page.
    const allRoutes = [ROOT_ROUTE, ...NESTED_ROUTES, ...BLOG_ROUTES, ...PHOTO_ROUTES];
    try {
        for (const route of allRoutes) {
            await prerenderRoute(browser, route);
        }
        console.log(`[prerender] Done. ${allRoutes.length} routes prerendered (home + ${NESTED_ROUTES.length} pages + ${BLOG_ROUTES.length} blog + ${PHOTO_ROUTES.length} photo permalinks).`);
    } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
};

main().catch((error) => {
    console.error('[prerender] Failed:', error);
    process.exit(1);
});
