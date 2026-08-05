# SEO Rollout Runbook

Last updated: 2026-02-20

## Goal

Increase discoverability for a personal photography portfolio (not a commercial lead-gen site), with emphasis on:

- Better crawlability/indexing
- Better image discoverability
- Faster image delivery than the original upload set

## What Was Implemented

### 1. Route-level SEO metadata

Added dynamic page metadata for main routes:

- `/`
- `/about`
- `/landscapes`
- `/cities`
- `/people`
- `/events`
- `/jmt`

Includes:

- `<title>`
- `meta description`
- `robots` directives
- Open Graph tags
- Twitter card tags
- Canonical URL

Key files:

- `src/components/SEO.jsx`
- `src/utils/site.js`
- `src/pages/Home.jsx`
- `src/pages/About.jsx`
- `src/pages/CategoryPage.jsx`
- `src/pages/JMTPage.jsx`

### 2. Structured data (JSON-LD)

Added schema markup:

- `WebSite`
- `Person`
- `CollectionPage`
- `ItemList`
- `ImageObject`

Key files:

- `src/pages/Home.jsx`
- `src/pages/About.jsx`
- `src/pages/CategoryPage.jsx`
- `src/pages/JMTPage.jsx`

### 3. XML sitemaps + robots

Added generation of:

- `public/robots.txt`
- `public/sitemap.xml`
- `public/image-sitemap.xml`

Generator script:

- `scripts/generate-seo-files.mjs`

Build integration:

- `package.json` (`seo:generate` and updated `build` script)

### 4. Image SEO and alt text

Improved image alt handling:

- Gallery images now use explicit `photo.alt` if available
- Fallback alt format provided
- Generated category-aware alt text in image data

Key files:

- `src/components/Gallery.jsx`
- `src/utils/images.js`

### 5. Base HTML metadata

Added safe default metadata in `index.html` for first paint and non-JS fallbacks.

Key file:

- `index.html`

### 6. Image size policy (performance pass)

Applied in-place compression targets:

- Hero images (`public/photos/hero/*`) capped to `<= 5 MB`
- All other `public/photos/**/*` capped to `<= 3 MB`

Validation performed after compression:

- `hero_over = 0`
- `other_over = 0`

## Environment Configuration

### Required on Vercel

Set:

- `VITE_SITE_URL=https://danilzanozin.com`

This ensures generated sitemap and robots files use the real production domain.

Sitemap `<lastmod>` dates are git-derived and need full history, which Vercel's shallow clone lacks (`VERCEL_DEEP_CLONE` is not honored). Local builds compute them and write `scripts/seo/lastmod.generated.json` (committed); Vercel builds read that snapshot back. Consequence: run `npm run build` (or `npm run seo:generate`) locally and commit the refreshed snapshot as part of each content batch — which the batch workflow already does via the committed sitemap files.

Related local template:

- `.env.example`

## Deployment Checklist

1. Ensure `VITE_SITE_URL` is set in Vercel project env vars.
2. Push latest `main` to GitHub.
3. Confirm Vercel production deploy succeeded.
4. Verify these endpoints are live:
   - `https://danilzanozin.com/robots.txt`
   - `https://danilzanozin.com/sitemap.xml`
   - `https://danilzanozin.com/image-sitemap.xml`
5. Confirm sitemap URLs reference `https://danilzanozin.com` (not `example.com`).
6. Run `npm run seo:indexnow` — pings Bing/IndexNow with the URLs whose `lastmod` changed since the last submission (Bing's index grounds Copilot and ChatGPT Search). Must run after the deploy is live. First-ever run: `npm run seo:indexnow -- --all`.

## Bing Webmaster Tools Checklist (one-time)

1. Sign in at https://www.bing.com/webmasters and use "Import from Google Search Console" (reuses the verified GSC property — no DNS record needed).
2. Submit `sitemap.xml` and `image-sitemap.xml`.
3. Confirm the IndexNow key file is live: `https://danilzanozin.com/025337d476131b080390421b4f7bb18f.txt`.
4. After a few weeks, check Search Performance and the AI Performance report (Copilot/AI citations + grounding queries).

## Google Search Console Checklist

### Domain verification via DNS (Vercel DNS)

1. In Search Console, choose Domain property: `danilzanozin.com`.
2. Copy provided TXT token (`google-site-verification=...`).
3. In Vercel DNS for `danilzanozin.com`, add:
   - Type: `TXT`
   - Name: `@`
   - Value: full verification token
   - TTL: Auto/default
4. Click `VERIFY` in Search Console.

### Sitemap submission

In Search Console -> Sitemaps, submit:

- `sitemap.xml`
- `image-sitemap.xml`

Expected status: `Success`.

### GSC API access (for benchmarks)

One-time setup so `scripts/seo/gsc-pull.mjs` can pull query/position data and index coverage into `docs/seo-benchmarks/`:

1. [console.cloud.google.com](https://console.cloud.google.com) -> new project (e.g. `danilzanozin-seo`).
2. Enable the **Google Search Console API** (and optionally **PageSpeed Insights API** + an API key, for CWV pulls).
3. IAM -> Service Accounts -> create (e.g. `gsc-reader`) -> Keys -> Add key (JSON) -> save as `~/.config/gsc/danilzanozin-gsc.json` (`chmod 600`; never commit).
4. Search Console -> Settings -> Users and permissions -> Add user -> the service account email -> permission **Full** (needed for URL inspection).
5. Run `node scripts/seo/gsc-pull.mjs` — writes `docs/seo-benchmarks/<date>/{snapshot.json,summary.md}`. Re-run monthly and after each annotate->deploy batch.

Env overrides: `GSC_KEY_FILE`, `GSC_SITE` (default `sc-domain:danilzanozin.com`), `GSC_DAYS` (default 90), `GSC_SKIP_INSPECTION=1`.

## Troubleshooting

### Sitemaps show `example.com`

Cause:

- `VITE_SITE_URL` missing at build time.

Fix:

1. Set `VITE_SITE_URL=https://danilzanozin.com` in Vercel env.
2. Redeploy production.

### DNS verification fails

Check:

- TXT record is on host `@` (root), not `www`
- Value matches exactly (no extra quotes/spaces)
- Wait 5-30 minutes and retry

### Push fails with very large pack / HTTP 500

Cause:

- Large binary history from photo commits.

Fix used previously:

- Squash unpublished large commits before pushing, then push once.

## Quick Commands

Generate SEO files manually:

```bash
npm run seo:generate
```

Build (includes sitemap/robots generation):

```bash
npm run build
```
