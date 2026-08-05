// IndexNow submission — pings Bing (and other IndexNow engines) about changed URLs.
//
// Bing's index grounds Copilot answers AND ChatGPT Search, so fast Bing
// indexing is the gateway to both. IndexNow is the push channel: one POST to
// api.indexnow.org fans out to all participating engines (Bing, Seznam, Naver,
// Yandex). Google does not consume IndexNow — GSC sitemap pings cover that side.
//
// URL source of truth: public/sitemap.xml (already the curated, indexable set
// with content-true <lastmod>). The script diffs lastmod against the committed
// snapshot of the last successful submission and submits only what changed —
// the IndexNow spec asks that unchanged URLs not be resubmitted.
//
// The key file public/<KEY>.txt is served at the site root; engines fetch it to
// verify ownership. The key is public by design — no secret handling needed.
//
// Usage:
//   npm run seo:indexnow            # submit URLs whose lastmod changed
//   npm run seo:indexnow -- --all   # force-submit every sitemap URL (first run)
//   npm run seo:indexnow -- --dry   # show what would be submitted, no network
//
// Run AFTER a deploy is live (the key file and the pages must be reachable),
// i.e. as the last step of the annotate→build→deploy workflow.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

const KEY = '025337d476131b080390421b4f7bb18f';
const SITEMAP_PATH = path.join(projectRoot, 'public', 'sitemap.xml');
const STATE_PATH = path.join(__dirname, 'indexnow-submitted.generated.json');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const forceAll = args.includes('--all');
const dryRun = args.includes('--dry');

// --- read the sitemap --------------------------------------------------------
let xml;
try {
  xml = await readFile(SITEMAP_PATH, 'utf8');
} catch {
  console.error(`Cannot read ${SITEMAP_PATH}. Run \`npm run seo:generate\` first.`);
  process.exit(1);
}

const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => {
  const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
  const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? '';
  return { loc, lastmod };
}).filter((e) => e.loc);

if (!entries.length) {
  console.error('No <url> entries found in sitemap.xml — aborting.');
  process.exit(1);
}

if (entries.some((e) => e.loc.includes('example.com'))) {
  console.error('sitemap.xml contains example.com URLs (SITE_URL was unset at generation). Aborting.');
  process.exit(1);
}

const host = new URL(entries[0].loc).host;

// --- diff against the last successful submission ------------------------------
let submitted = {};
try {
  submitted = JSON.parse(await readFile(STATE_PATH, 'utf8'));
} catch {
  // First run — no snapshot yet; everything counts as changed.
}

const changed = forceAll
  ? entries
  : entries.filter((e) => submitted[e.loc] !== e.lastmod);

if (!changed.length) {
  console.log(`[indexnow] Nothing changed since last submission (${entries.length} URLs in sitemap).`);
  process.exit(0);
}

console.log(`[indexnow] ${changed.length} of ${entries.length} URLs to submit${forceAll ? ' (--all)' : ''}:`);
for (const e of changed) {
  console.log(`  ${e.loc}  (lastmod ${e.lastmod || 'n/a'})`);
}

if (dryRun) {
  console.log('[indexnow] --dry: no request sent, snapshot untouched.');
  process.exit(0);
}

// --- submit -------------------------------------------------------------------
const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host,
    key: KEY,
    urlList: changed.map((e) => e.loc),
  }),
});

// 200 = submitted, 202 = accepted pending key validation. Anything else failed.
if (res.status !== 200 && res.status !== 202) {
  const body = await res.text().catch(() => '');
  console.error(`[indexnow] Submission failed: HTTP ${res.status} ${body}`.trim());
  console.error('[indexnow] Snapshot not updated — the same URLs will retry next run.');
  process.exit(1);
}

for (const e of changed) {
  submitted[e.loc] = e.lastmod;
}
// Prune URLs that left the sitemap so the snapshot mirrors the live set.
const live = new Set(entries.map((e) => e.loc));
submitted = Object.fromEntries(Object.entries(submitted).filter(([url]) => live.has(url)));

await writeFile(STATE_PATH, `${JSON.stringify(submitted, null, 2)}\n`, 'utf8');
console.log(`[indexnow] HTTP ${res.status} — ${changed.length} URLs submitted, snapshot updated.`);
console.log('[indexnow] Note: HTTP 202 means the key file will be verified async; check Bing Webmaster Tools → IndexNow for acceptance.');
