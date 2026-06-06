# Photo Annotations — Workflow & Writing Guide

Last updated: 2026-06-06

## Why

Per-photo pages already have the technical SEO (ImageObject JSON-LD, sitemaps,
OG tags). What they lack is **human-readable, location-rich text** — the main
thing Google Images and long-tail search actually rank on. The strategy
(derived from a deep-research pass on photographer SEO, 2026-06):

- **Curate ~60–100 of the strongest, most location-identifiable photos.**
  Do NOT annotate all ~430 — templated text across hundreds of near-identical
  pages trips Google's scaled-content/thin-content systems. Unannotated photos
  keep their generic alt fallback and stay in galleries.
- Target query space: **location + technique** ("Zabriskie Point long
  exposure", "Lincoln Memorial long exposure photo"), location + photo-spot
  intent, and trail/trip narratives.
- Stage 3 (separate effort): "Photography Guide to [Location]" hub pages,
  800–1,500 words, which link into these photo pages. Highest traffic ceiling.

## Workflow

```bash
npm run dev
# open http://localhost:5173/annotate
```

- One photo at a time, EXIF shown for context, ← / → to navigate
  (⌘← / ⌘→ while a field is focused).
- Autosaves ~1s after you stop typing into `src/utils/photoMeta.json`
  (pretty-printed, sorted keys — clean git diffs). Commit it like any file.
- Filters: by gallery, and annotated/unannotated. "Unannotated" + Next is the
  fastest way to sweep.
- Clearing every field of a photo deletes its entry (un-curates it).
- The tool is dev-only: the route and the save endpoint don't exist in
  production builds.

## The fields

| Field | Target | Guidance |
|---|---|---|
| **Title** | 3–8 words | Evocative name + implicit subject. Becomes H1, `<title>`, schema `name`. E.g. "Enshrined Forever" / "Lincoln Memorial at Blue Hour". |
| **Location** | — | "Landmark, Place, State" — **name it explicitly**; this is the keyword backbone. Reuse exact strings across photos from the same place (autocomplete helps) — matching strings power the "More from {location}" cross-links. |
| **Alt text** | ≤ 125 chars | Plain factual description of *what's visible* + location. No keyword lists — stuffed alt is flagged spam by Google. Also serves as the meta description and lightbox caption line. |
| **Story** | 40–90 words | First person, written for humans: where, when, the idea, optionally one technique detail (e.g. "a 30-second exposure"). **Don't describe what's already visible** (Burkard's rule) — add the unseen: the cold, the wait, the decision. Vary phrasing; no two stories should read alike. |
| **Keywords** | 3–6 tags | For schema `keywords` and future tag pages. e.g. `long exposure, black and white, night photography`. |

### Example (Lincoln Memorial, `/photo/cities-dsc5344`)

- **Title:** Enshrined Forever
- **Location:** Lincoln Memorial, Washington, D.C.
- **Alt:** Long-exposure black-and-white photo of the Lincoln Memorial statue
  with motion-blurred visitors in the chamber
- **Story:** The memorial chamber never empties, so I stopped fighting the
  crowd and made it the subject. A long exposure from a low tripod let the
  visitors dissolve into ghosts while Lincoln — the only one not moving —
  stays carved-sharp under the inscription. Black and white felt right: the
  marble, the shadows between the columns, and sixty years of photographs
  taken from this same floor.
- **Keywords:** long exposure, black and white, night photography, monument

## What the fields feed

- `src/utils/photoMeta.json` → `photoRegistry.js` merges into each photo entry
- Photo page: H1 (title), visible location line, story paragraph,
  `<title>` ("Title — Location"), meta description (alt)
- JSON-LD ImageObject: `name`, `caption`, `description` (story),
  `contentLocation`, `keywords`
- "More from {location}" strip: photos sharing the same location string,
  across galleries
- Galleries/lightbox/favorites: alt text via `captionFor()`
- Prerender + sitemaps pick everything up automatically on `npm run build`

## Later stages (not yet built)

1. Location hub / guide pages ("Photography Guide to Death Valley") wrapping
   annotated photos in 800–1,500 words — biggest traffic lever.
2. Reframe JMT / Death Valley / Grand Canyon galleries as photo essays with
   day-by-day text.
3. Descriptive URL slugs with 301s — only after Stages 1–2 show impressions
   growth in Search Console, and only for top photos.
