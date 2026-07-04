// Google Search Console benchmark snapshot.
//
// Pulls search analytics (web + image search separately), sitemap status, and
// URL-inspection index state for every sitemap URL, then writes a dated
// snapshot to docs/seo-benchmarks/<YYYY-MM-DD>/ (raw JSON + summary.md).
// Re-run monthly (or after each annotate→deploy batch) and diff summaries.
//
// One-time setup (see docs/seo-rollout-runbook.md → "GSC API access"):
//   1. Google Cloud project → enable "Google Search Console API"
//   2. Create a service account, download its JSON key to
//      ~/.config/gsc/danilzanozin-gsc.json (or set GSC_KEY_FILE)
//   3. In Search Console → Settings → Users and permissions, add the service
//      account email as a user (Full permission needed for URL inspection).
//
// Env overrides: GSC_KEY_FILE, GSC_SITE (default sc-domain:danilzanozin.com),
// GSC_DAYS (default 90), GSC_SKIP_INSPECTION=1 to skip URL inspection.
//
// Usage: node scripts/seo/gsc-pull.mjs

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { JWT } from 'google-auth-library';

const KEY_FILE =
    process.env.GSC_KEY_FILE || path.join(homedir(), '.config/gsc/danilzanozin-gsc.json');
const SITE = process.env.GSC_SITE || 'sc-domain:danilzanozin.com';
const DAYS = Number(process.env.GSC_DAYS || 90);
const ORIGIN = 'https://danilzanozin.com';

const API = 'https://searchconsole.googleapis.com';
const siteParam = encodeURIComponent(SITE);

// --- auth -------------------------------------------------------------------
let key;
try {
    key = JSON.parse(readFileSync(KEY_FILE, 'utf8'));
} catch {
    console.error(`Cannot read service-account key at ${KEY_FILE}.`);
    console.error('Set GSC_KEY_FILE or follow the setup steps at the top of this script.');
    process.exit(1);
}
const client = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

async function api(pathname, body) {
    const url = `${API}${pathname}`;
    const res = await client.request({
        url,
        method: body ? 'POST' : 'GET',
        data: body,
    });
    return res.data;
}

// --- search analytics ---------------------------------------------------------
// GSC data lags ~2-3 days; end the window 3 days ago.
const end = new Date(Date.now() - 3 * 86400_000);
const start = new Date(end.getTime() - DAYS * 86400_000);
const fmt = (d) => d.toISOString().slice(0, 10);

async function searchAnalytics(searchType, dimensions, rowLimit = 5000) {
    const data = await api(`/webmasters/v3/sites/${siteParam}/searchAnalytics/query`, {
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions,
        type: searchType,
        rowLimit,
        dataState: 'final',
    });
    return data.rows || [];
}

// --- main ---------------------------------------------------------------------
const today = fmt(new Date());
const outDir = path.join(process.cwd(), 'docs', 'seo-benchmarks', today);
mkdirSync(outDir, { recursive: true });

console.log(`GSC snapshot for ${SITE}, ${fmt(start)} → ${fmt(end)}`);

const snapshot = { site: SITE, pulledAt: new Date().toISOString(), window: { start: fmt(start), end: fmt(end) } };

for (const type of ['web', 'image']) {
    console.log(`  pulling ${type} search analytics...`);
    snapshot[type] = {
        byQuery: await searchAnalytics(type, ['query']),
        byPage: await searchAnalytics(type, ['page']),
        byDate: await searchAnalytics(type, ['date']),
        byQueryPage: await searchAnalytics(type, ['query', 'page']),
    };
}

console.log('  pulling sitemap status...');
try {
    snapshot.sitemaps = (await api(`/webmasters/v3/sites/${siteParam}/sitemaps`)).sitemap || [];
} catch (err) {
    console.warn('  sitemap list failed:', err.message);
    snapshot.sitemaps = [];
}

// URL inspection for every URL in the live sitemap (index state + Google-chosen canonical).
if (!process.env.GSC_SKIP_INSPECTION) {
    console.log('  inspecting sitemap URLs...');
    const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    snapshot.inspections = [];
    for (const url of urls) {
        try {
            const data = await api('/v1/urlInspection/index:inspect', {
                inspectionUrl: url,
                siteUrl: SITE,
            });
            const r = data.inspectionResult?.indexStatusResult || {};
            snapshot.inspections.push({
                url,
                verdict: r.verdict,
                coverageState: r.coverageState,
                lastCrawlTime: r.lastCrawlTime,
                googleCanonical: r.googleCanonical,
                indexingState: r.indexingState,
            });
            process.stdout.write('.');
        } catch (err) {
            snapshot.inspections.push({ url, error: err.message });
            process.stdout.write('x');
        }
    }
    console.log();
}

writeFileSync(path.join(outDir, 'snapshot.json'), JSON.stringify(snapshot, null, 2));

// --- summary.md -----------------------------------------------------------------
const sum = (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0);
const lines = [];
lines.push(`# GSC benchmark — ${today}`);
lines.push('');
lines.push(`Property: \`${SITE}\` · Window: ${fmt(start)} → ${fmt(end)} (${DAYS}d)`);
lines.push('');

for (const type of ['web', 'image']) {
    const q = snapshot[type].byQuery;
    const p = snapshot[type].byPage;
    lines.push(`## ${type === 'web' ? 'Web search' : 'Image search'}`);
    lines.push('');
    lines.push(
        `Totals: **${sum(q, 'clicks')} clicks**, **${sum(q, 'impressions')} impressions** across ${q.length} queries / ${p.length} pages.`
    );
    lines.push('');
    lines.push('### Top queries');
    lines.push('');
    lines.push('| Query | Clicks | Impr. | CTR | Avg pos |');
    lines.push('|---|---|---|---|---|');
    for (const r of q.slice(0, 25)) {
        lines.push(
            `| ${r.keys[0]} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(1)}% | ${r.position.toFixed(1)} |`
        );
    }
    lines.push('');
    lines.push('### Top pages');
    lines.push('');
    lines.push('| Page | Clicks | Impr. | Avg pos |');
    lines.push('|---|---|---|---|');
    for (const r of p.slice(0, 25)) {
        lines.push(`| ${r.keys[0].replace(ORIGIN, '')} | ${r.clicks} | ${r.impressions} | ${r.position.toFixed(1)} |`);
    }
    lines.push('');
}

if (snapshot.inspections) {
    const byState = {};
    for (const i of snapshot.inspections) {
        const s = i.coverageState || i.error || 'unknown';
        (byState[s] ||= []).push(i.url);
    }
    lines.push('## Index coverage (sitemap URLs)');
    lines.push('');
    for (const [state, urls] of Object.entries(byState)) {
        lines.push(`- **${state}** (${urls.length})`);
        for (const u of urls) lines.push(`  - ${u.replace(ORIGIN, '')}`);
    }
    lines.push('');
}

if (snapshot.sitemaps.length) {
    lines.push('## Sitemaps');
    lines.push('');
    for (const s of snapshot.sitemaps) {
        const counts = (s.contents || []).map((c) => `${c.type}: ${c.submitted} submitted / ${c.indexed ?? '?'} indexed`).join(', ');
        lines.push(`- ${s.path} — last downloaded ${s.lastDownloaded || 'never'}${counts ? ` (${counts})` : ''}${s.errors > 0 ? ` — **${s.errors} errors**` : ''}`);
    }
    lines.push('');
}

writeFileSync(path.join(outDir, 'summary.md'), lines.join('\n'));
console.log(`\nWrote ${outDir}/snapshot.json and summary.md`);
