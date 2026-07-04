# SEO Audit & Improvement Backlog — July 2026

Baseline audit of danilzanozin.com: why the site is indexed but not ranking, what to fix, and in what order. Companion to `docs/seo-discovery-strategy.md` (off-site channels) and `docs/seo-rollout-runbook.md` (deployment/GSC ops). Benchmark data lands in `docs/seo-benchmarks/` via `scripts/seo/gsc-pull.mjs`.

## Diagnosis (TL;DR)

The technical plumbing is healthy — the site doesn't rank because **there is almost nothing to rank**: ~31 indexable URLs, one blog post, 17 of ~150 photo pages annotated (the rest deliberately `noindex`), and near-zero backlinks on a young domain. The SERPs we target are won by independent photographer blogs with modest authority (Gary Hart, Noah Lang, JMPeltier, Wildlands Photo) using exactly the guide/photo-diary format this site already has one example of. The path is: grow the indexable, text-rich surface (annotations + guides), fix a handful of technical polish items, and let the existing off-site strategy build authority.

## Phase 0 findings — live-site audit (2026-07-04)

Verified against production, not local artifacts.

### Healthy (no action)

- Canonicals correct on all sampled pages (`https://danilzanozin.com/...` — the local `dist/` localhost-canonical worry is a non-issue; Vercel env is set correctly).
- Prerendered HTML served for every route: real `<a>` anchors, full meta, JSON-LD in raw HTML.
- robots.txt correct, both sitemaps referenced and live (31 URLs / 208 image entries), AI crawlers opted in, `llms.txt` present.
- noindex logic works as designed (curated → index, un-curated → `noindex, follow`).
- JSON-LD valid and rich on photo pages (ImageObject with contentLocation, keywords, creator, license, breadcrumbs).
- CLS **0** and TBT **0 ms** on every page tested — layout stability is excellent.
- SEO Lighthouse category: 100. Accessibility: 98.

### Issues (severity-ordered)

| # | Severity | Finding | Where |
|---|---|---|---|
| 1 | High (strategic) | Indexable surface: 17/~150 photo pages, 1 blog post. Google can't rank text it doesn't have. | content, not code |
| 2 | Medium — **fixed 2026-07-04** | Mobile LCP ~3.9–4.0 s, FCP 3.5 s, perf score 78 (home & photo page): render-blocking Google Fonts CSS + no LCP image preload. Fixed via self-hosted fonts + per-route preloads (backlog #1). | `index.html` (fonts), bundle |
| 3 | Medium — **fixed 2026-07-04** | `lastmod` was one identical build timestamp for every URL. Now derived from git/content dates (backlog #2; needs `VERCEL_DEEP_CLONE=true` on Vercel). | `scripts/generate-seo-files.mjs` |
| 4 | Medium — **fixed 2026-07-04** | Homepage title/description were generic ("Photography Portfolio") — now "Landscape & Travel Photography of the American West", plus an indexable intro paragraph. The h1 remains the stylistic "CAPTURING MOMENTS" (acceptable now that the h2/prose carry the keywords). | `src/pages/Home.jsx` |
| 5 | Low — **fixed 2026-07-04** | ImageObject JSON-LD lacked `dateCreated` — now emitted from EXIF capture date. | `src/pages/PhotoPage.jsx` |
| 6 | Low | Image filenames are camera serials (`_DSC6909.jpg`) — filename is a (weak) image-ranking signal. Don't rename existing files; use descriptive names for new photos going forward. | pipeline convention |
| 7 | Low | Minor heading-order a11y flag on homepage (h1 → h3 in collection cards). | `src/pages/Home.jsx` |

PSI API was quota-blocked (keyless); numbers above are local Lighthouse (emulated Moto-class mobile) against production. Once the GSC cloud project exists, add a PageSpeed API key and re-pull CrUX field data — Vercel Speed Insights dashboard is a second source already live.

## Keyword targets

Brand: `danil zanozin`, `danil zanozin photography` — must be #1 once GSC confirms indexing.

**Tier 1 — long-tail, winnable in weeks–2 months** (low competition, we have or nearly have the content):

- grand canyon rim to rim photography (guide) ✅ *content exists*
- south kaibab trail sunrise photography ✅
- ribbon falls / north kaibab trail photos ✅
- grandview point sunset · hopi point sunrise · desert view sunset photography ✅ (photo pages)
- coconino overlook sunrise ✅
- el matador beach sea cave photography ✅ (photo page; guide post would seal it)
- santa monica pier night photography / ferris wheel long exposure ✅
- lincoln memorial black and white photography ✅
- lassen volcanic national park photography spots ◻ *needs annotations + guide*
- manzanita lake lassen peak reflection ◻
- zabriskie point sunrise photos · mesquite flat sand dunes photography · badwater basin photos ◻ *needs death-valley annotations*
- john muir trail photo diary / jmt day by day photos ◻ *content exists on /jmt but not in blog-guide form*

**Tier 2 — mid-term (3–9 months, needs content + some authority):**

- john muir trail photography
- grand canyon photography spots / best grand canyon viewpoints
- death valley photography locations
- best sunrise spots grand canyon south rim
- malibu beach photography

**Tier 3 — aspirational (track, don't target):**

- landscape photography american west · national park photography · california landscape photographer

### SERP reality check (sampled 2026-07-04)

For every Tier-1/2 query sampled, page 1 is: 1–2 institutional results (NPS, Tripadvisor) + **independent photographer blogs and guide sites**. No fortress domains. The rim-to-rim post (live ~3 weeks) doesn't appear yet — expected at this domain age; this is an authority/time problem, not a content-quality problem. Format that wins: named locations + practical logistics + original photos, i.e. exactly the rim-to-rim post template.

## Technical backlog (in priority order)

1. ✅ **LCP** (implemented 2026-07-04):
   - Fonts self-hosted (`public/fonts/` + `src/styles/fonts.css`); the three above-the-fold faces are preloaded in `index.html` — no more render-blocking fonts.googleapis.com round trips.
   - Per-route LCP image preload via `<SEO preload>` (baked into prerendered HTML): homepage first hero frame (1920w WebP), photo pages the responsive hero (`imagesrcset`/`imagesizes`).
   - Photo-page hero `sizes` corrected (was defaulting to "33vw on desktop" for a ~90vw image).
2. ✅ **Real `lastmod`** (implemented 2026-07-04) in `scripts/generate-seo-files.mjs`: photo pages from their annotation's git date, blog from the registry dates, galleries from photo-dir/annotation git dates, about/home from their sources. Requires `VERCEL_DEEP_CLONE=true` in Vercel env (falls back to build time with a warning otherwise).
3. ✅ **ImageObject `dateCreated`** (implemented 2026-07-04) from EXIF `capturedAt` in `src/pages/PhotoPage.jsx`.
4. ✅ **Homepage prose + heading order** (implemented 2026-07-04): indexable intro (h2 + ~70 words) in `src/pages/Home.jsx`.
5. **New-photo filename convention** (convention, ongoing) — descriptive kebab-case (`grand-canyon-hopi-point-sunrise.jpg`) for future additions; never rename shipped files.
6. **Remaining** LCP ideas if CrUX still shows >2.5s after deploy (verify on production first — local Lighthouse showed FCP 3.9s→2.3s from the font fix, but local LCP numbers aren't comparable to prod):
   - Serve the 1080w hero variant on mobile viewports (media-query'd image-set slots in `Hero.jsx`).
   - Hydration re-fade: framer-motion `initial={{opacity:0}}` wrappers (Hero background, page transitions) blank the already-painted prerendered content on hydration and fade it back in, which can push the *measured* LCP to the post-hydration repaint. Fix would be skipping initial animations on first mount (e.g. `initial={false}` when the page was prerendered).

## Content gap analysis (the main lever)

### Annotation queue — priority order

Each annotation flips a page from noindex→indexed. Order by search demand for what's *in* the photos:

1. **death-valley (0/10)** — every photo is likely a named, searched location (Zabriskie, Badwater, Mesquite Dunes, Dante's View…). Highest image-search demand per photo on the site.
2. **lassen-volcanic (0/9)** — lower search volume but far lower competition; a realistic "rank everywhere for one park" play. Name the exact spots (Manzanita Lake, Bumpass Hell, Kings Creek…).
3. **landscapes (1/20)** — prioritize photos of *nameable* places (Zion, Sierra passes, Yosemite-adjacent) over generic scenes.
4. **cities (2/17)** — landmark shots first (SF, Paris, Rome recognizables); skip generic street scenes.
5. **JMT photos** — annotate in tandem with the JMT blog posts (below) so page text and photo pages reinforce each other.
6. **people / events** — lowest search demand; annotate only portfolio-best shots.

Practical cadence (per existing workflow): batches of ~10 via `/annotate` → deploy → GSC "request indexing" for the new URLs.

### Gallery-page prose

Category pages have good meta descriptions but only ~2 sentences of visible text. Expand to ~150–300 words each (above or below the grid, collapsible is fine): death-valley and lassen-volcanic first (they pair with the guides), then landscapes. Include the named locations that appear in the gallery — this is the text that makes category pages rank and feeds image search context.

### Blog roadmap (ranked; rim-to-rim post is the template)

1. **John Muir Trail photo diary / guide** — biggest dormant asset: 24 days of narrative + 56 photos already on `/jmt` but structured as a gallery page, not an article. One flagship "JMT: a photographer's 24-day diary" post (or a 3-part series) targeting *john muir trail photography / jmt photo diary*.
2. **Death Valley photography guide** — after annotating that gallery. Targets *death valley photography locations*.
3. **Lassen Volcanic photography guide** — lowest-competition park; earliest realistic page-1 win. Targets *lassen volcanic national park photography spots*.
4. **Grand Canyon South Rim viewpoints for sunrise/sunset** — 6+ named-viewpoint photos already annotated; compounds the rim-to-rim post's topical authority.
5. **El Matador sea caves at low tide: a shooting guide** — high photo appeal, strong existing SERP demand.
6. **Santa Monica Pier at night** — smaller, quick to write.

Each post: named locations, practical logistics (light, access, timing), `:photo` embeds linking to annotated photo pages, descriptive local image filenames (the blog already does this right).

### Existing-content changes

- ✅ Homepage title/description rewritten (this audit).
- Homepage h1/prose — see technical backlog #4.
- After GSC data arrives: rewrite titles of any page with impressions but position >20 toward the actual query phrasing (that's the highest-ROI title work; do it from data, not guesses).

## Off-site (sequenced, per existing strategy doc)

- **Now:** nothing new to build — newsletter is live, blog is the engine. Start Reddit account warm-up (comments, no links) so it's aged when content batches land.
- **After each annotation batch/guide:** one native Reddit post to the matching sub (r/JohnMuirTrail, r/DeathValleyNP, r/EarthPorn per its rules).
- **Months 2–6:** earned-link pitches (JMT/PCT orgs, park tourism boards) once 3+ guides exist to pitch; competition entries per `docs/photo-competitions.md` calendar.
- **Expectation setting:** Tier-1 queries can move within weeks of indexing; Tier-2 needs months of accumulated authority. On-site work alone will not rank Tier-2 — the strategy doc's earned-link track is the multiplier.

## Measurement loop

One-time setup (user, ~10 min):

1. [console.cloud.google.com](https://console.cloud.google.com) → new project (e.g. `danilzanozin-seo`).
2. Enable **Google Search Console API** (and **PageSpeed Insights API** + an API key while there, for CWV pulls).
3. IAM → Service Accounts → create (e.g. `gsc-reader`) → Keys → add JSON key → save as `~/.config/gsc/danilzanozin-gsc.json` (chmod 600; never in the repo).
4. Search Console → Settings → Users and permissions → Add user → the service account email → **Full**.

Then, monthly and after each annotate→deploy batch:

```sh
node scripts/seo/gsc-pull.mjs   # writes docs/seo-benchmarks/<date>/{snapshot.json,summary.md}
```

Track across snapshots: indexed URL count (URL-inspection section), **image vs web impressions** (separate sections in the summary), Tier-1 queries entering top 20, and CTR on pages already getting impressions. Diff two `summary.md` files to see movement.
