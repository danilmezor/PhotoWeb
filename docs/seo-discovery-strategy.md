# SEO & Discovery Strategy

_Last updated: 2026-06-08. Based on two deep-research runs (each ~100 verified-claim agents) on (1) blog content strategy and (2) free traffic/backlink channels for a zero-audience photography portfolio. Every claim below was adversarially verified; refuted tactics are flagged explicitly so we don't chase them later._

Site context: `danilzanozin.com` — static React (Vite) SPA with build-time prerender, strong existing technical SEO (per-page meta, JSON-LD, dual sitemaps, responsive images). Starting from **zero audience** on every platform.

---

## Core mental model: two separate tracks

Most bad advice conflates these. Keep them apart.

| | **Track 1 — Referral traffic** | **Track 2 — SEO equity** |
|---|---|---|
| What it does | Sends real human visitors | Raises your domain's rankings |
| Link type | nofollow (no ranking credit) | dofollow / on-site |
| Examples | Reddit, Pinterest, 500px, social | On-site image SEO, earned editorial links |
| Role | The "snowball" spark | Long-term compounding |

Google treats `nofollow` as a *hint*, not credit — so Track-1 channels move visitors, not rankings. Both matter, for different jobs.

---

## Decision 1: Blog content lives on the OWN domain (`/blog`), not Medium

**Verdict: build `/blog` on `danilzanozin.com`. Do not host blog content on Medium.**

Why (all adversarially verified):
- **Link equity and ranking accrue to whichever domain hosts the content.** Post on Medium → you build Medium's authority. Post on `/blog` → you compound your own.
- **The "Medium has high domain authority so my post ranks faster" myth was REFUTED three separate ways (0–3 unanimous).** Medium does not buy you ranking power.
- **For photographers, photos rank in Google Images/Discover off the surrounding page's text, captions, and titles** (Google's own docs). Trip write-ups are exactly that context — and they keep visitors in *your* funnel. Google's Martin Splitt: photographer storytelling "can only happen on some space that you control. That is generally your website."
- **Medium is "rented land"** — documented ~40% traffic decline (32M→19M monthly views, Aug–Nov 2024) from algorithm/paywall changes.
- **Syndication caveat:** the classic "publish own → syndicate to Medium with `rel=canonical`" hybrid is weaker than believed — Google **no longer recommends** canonical for syndicated content (as of ~May 2023; treats it as a hint). Medium's import tool *does* auto-set canonical back to your source, making selective syndication relatively safe — but use it only as a later reach experiment, publish on your domain **first**, and never rely on canonical for SEO protection.

---

## Decision 2: Discovery channels, ranked

### #1 — Google Images / Discover (Track 2, highest ROI, fully owned)
The **only** high-confidence channel where both traffic *and* ranking equity accrue to your own domain.
- Mechanics (verified): Google ranks images via **descriptive alt text + surrounding page text + computer vision**; "sharp images increase the likelihood of getting traffic."
- This is *why the blog compounds* — it's the textual surface that makes our photos rank.
- **Action:** finish alt-text coverage on the long tail; ship `/blog` trip write-ups with rich context; keep images sharp.

### #2 — Reddit (Track 1, best referral engine)
- **Referral:** High but spiky. Viral ceiling = thousands of visits in hours (case studies: ~12k from one post). Median = a few hundred over weeks.
- **SEO equity:** ~none (nearly all outbound links nofollow).
- **Risk (the thing to manage):** escalation = post removal → mod warning → subreddit ban → sitewide shadowban → account suspension. #1 trigger = **new account posting the same link across ~5 subs in a day.** Build comment history *first*.
- **Funnel catch:** photo subs prefer native image posts, not blog links (r/EarthPorn requires location + resolution in title + "OC" tag). Funnel runs through *recognition* — handle, watermark, profile Social Links — not post links.
- **Myth killed:** "bio links are safe from self-promo rules" — REFUTED 0–3.
- **Target subs:** r/EarthPorn, r/JohnMuirTrail, r/Ultralight, r/WildernessBackpacking, r/hiking, location subs.

### #3 — Pinterest (Track 1, promising but UNVERIFIED)
Strong for landscape/hiking visual discovery (long-lived pins), but no claim survived verification. Test before investing; verify current outbound-link/referral value first.

### #4 — Earned niche editorial links (Track 2, slow, real)
- Verified: **one high-quality, topically-relevant link beats dozens of low-quality ones; for location-tied work, topical/local relevance beats raw domain authority.**
- Targets that fit our niches: **JMT/PCT associations, Death Valley / Grand Canyon tourism boards, ultralight cottage-gear brands.** Offer photos for genuine features. Slow, not guaranteed dofollow, but the real off-site compounder.

### #5 — Photography competitions / awards (Track 2 via press, monthly-cadence-friendly)
- The standout for a low-frequency photographer: a handful of strong images/year → real credibility → **third-party PRESS coverage** (PetaPixel, My Modern Met) = the relevant editorial backlinks that compound owned-site SEO. The awards' own pages usually don't link to you; the press does.
- **Full master list, calendar, and rights-grab checklist: `photo-competitions.md`.**
- Cleanest free/credible core: **Sony World Photography Awards** (free) + **Wildlife POTY** (free if ≤26) + **BigPicture** (cheap, on-subject) + **NLPA / ILPOTY** (paid, reputable landscape).
- ⚠️ **Avoid rights grabs:** PCTA and Share the Experience are perfect subject-fit but impose perpetual royalty-free sublicensable licenses. (Correction: Share the Experience was earlier mis-flagged as a safe free pick — its full Official Rules are a rights grab.)
- Social/curator-account reality: platforms best at exposure (IG, X) are worst at handing off clicks; monthly cadence is below IG's viable floor (2–3/week); IG feature/hub reposts give exposure but **no proven owned-site traffic**. Treat social as a *verification layer*, not a discovery engine.

### Lower priority / skip
- **500px / Behance / Flickr:** 500px outbound = nofollow; weak evidence of meaningful external referral; largely enriches the platform (same trap as Medium). Behance dofollow status **unresolved** (the "nofollow by default" claim was refuted). Use as a low-effort mirror at most.
- **Wikimedia Commons:** attribution exposure, *not* a reliable backlink (CC BY-SA 4.0 is irrevocable, reuse can't be restricted, attribution need not be a crawlable link). Only if comfortable ceding reuse control.

---

## Refuted tactics — do NOT chase these

Popular in photography-SEO blogs, but killed in verification:
- ❌ Guest-post author-bio dofollow links (refuted 0–3)
- ❌ Negotiating a dofollow link as an image-license condition (refuted 0–3)
- ❌ Reddit bio link being "safe" from self-promo rules (refuted 0–3)
- ❌ "Behance is nofollow by default" (refuted 0–3 → status simply unknown)
- ❌ Broad free-backlink lists (podcast show-notes, styled shoots, directories) (refuted 1–2)

---

## Not yet researched (open gaps worth a follow-up run)
HARO-style digital PR (Qwoted / Featured.com / Connectively), link reclamation (reverse-image-search for uncredited use of our photos), 1x / Glass / Vero, and EXIF-embedded attribution — all named but produced no verified claims. Treat silence as "unknown," not "no."

---

## Sequenced action plan

**Now — Track 2 (owned, compounds, zero risk):**
1. Maximize Google Images/Discover: finish long-tail alt text, ship `/blog` trip write-ups, keep images sharp.
2. Add an email-capture / newsletter signup — the only portable, owned audience asset (real platform-risk mitigation; building Medium followers is just as "from scratch" but not portable).

**Weeks 1–8 — Track 1 (referral snowball):**
3. Reddit, done right: pick 3–4 subs, comment-only for 2–3 weeks to build history, then post best single images natively per each sub's rules, set up profile Social Links. Never blast one link across subs in a day.
4. Test Pinterest with strongest landscapes (verify its referral value first).

**Months 2–6 — Track 2 (slow off-site equity):**
5. Earn relevant editorial links: pitch JMT/PCT associations, Death Valley / Grand Canyon tourism orgs, ultralight gear brands — offer photos for genuine features. One good link > fifty directories.
6. Link reclamation: reverse-image-search published photos; request attribution *with a link* where used uncredited.

**Skip:** 500px/Behance as a "strategy," guest-post-bio-link and license-condition schemes, free-backlink-list SEO spam.

**Throughline:** own-site image SEO is the engine; Reddit/Pinterest are the spark; earned niche links are the slow compounder. No single off-site link moves rankings — our own image-optimized pages do.

---

## Key sources
- Google Search Central — Google Images SEO: https://developers.google.com/search/docs/appearance/google-images
- Google — canonical / duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google — canonical for syndicated content (deprecation): https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting#syndicated-content
- dofollow vs nofollow: https://wonderfulmachine.com/article/dofollow-and-nofollow-link-attributes/
- Reddit photo communities & rules: https://petapixel.com/2025/07/25/these-are-the-top-photo-communities-on-reddit/
- Reddit self-promotion rules: https://redship.io/blog/reddit-self-promotion-rules-2026
- Backlinks for photographers (relevance > DA): https://aftershoot.com/blog/seo-for-photographers/
- Platform risk / rented land: https://contentmarketinginstitute.com/content-creation-distribution/yet-another-reason-not-to-build-your-content-home-on-rented-land
- Wikimedia Commons licensing: https://wikimediafoundation.org/news/2018/01/17/add-your-photos-to-wikimedia-commons/
