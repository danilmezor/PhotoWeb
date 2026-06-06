// Curated per-photo metadata — the single source of editorial text for photo
// pages, lightbox captions, alt text, and JSON-LD. Edited via the dev-only
// /annotate tool (see docs/photo-annotations.md); avoid hand-editing the JSON.
//
// Key: the photo's full src path (matches what's stored on photo objects).
// Value (all fields optional — presence of an entry marks the photo "curated"):
//   title     3–8 evocative words. Replaces the camera serial as the page H1,
//             <title>, and schema name.
//   alt       <= 125 chars. Factual description of what's visible + location.
//             Feeds the img alt attribute and the meta description.
//   story     40–90 words, first person: where, when, the idea behind the
//             shot, optionally one technique detail. This is the indexable
//             prose on the photo page.
//   location  "Landmark, Place, State" — named explicitly; feeds the visible
//             location line and schema contentLocation.
//   keywords  3–6 tags for schema keywords (array of strings).
//
// Strategy note: curate ~60–100 of the strongest, most location-identifiable
// photos rather than annotating everything — unique depth on fewer pages
// beats templated text on all of them. Photos without an entry fall back to
// "<Category> photograph by Danil Zanozin" alt text.

import meta from './photoMeta.json' with { type: 'json' };

export const photoMeta = meta;

export const metaFor = (src) => (src ? meta[src] : null) || null;

// Back-compat with the old captions.js API: the short factual line used as
// the lightbox's second caption line and as alt text.
export const captionFor = (src) => metaFor(src)?.alt || null;
