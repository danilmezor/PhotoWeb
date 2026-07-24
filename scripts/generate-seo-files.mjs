import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { images } from '../src/utils/images.js';
import { jmtData } from '../src/utils/jmtData.js';
import { heroPhotos } from '../src/utils/hero.js';
import { favorites } from '../src/utils/favorites.js';
import { galleries } from '../src/utils/galleries.js';
import { ALL_ROUTES, BLOG_ROUTES, INDEXABLE_PHOTO_ROUTES } from './routes.mjs';
import { getAllPosts } from '../src/utils/blogPosts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const normalizeOrigin = (value) => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const resolveSiteUrl = () => {
  const candidates = [
    normalizeOrigin(process.env.SITE_URL),
    normalizeOrigin(process.env.VITE_SITE_URL),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ];

  const firstNonEmpty = candidates.find((value) => value && value.trim());

  if (!firstNonEmpty) {
    return 'https://example.com';
  }

  return normalizeOrigin(firstNonEmpty);
};

const siteUrl = resolveSiteUrl();
const isoDate = new Date().toISOString();

// --- Real per-URL <lastmod> from git history ---------------------------------
// A single identical build timestamp on every URL teaches Google to ignore
// lastmod entirely; content-true dates make recrawl prioritization work.
// Falls back to the build timestamp when history is unavailable (shallow
// clone) — on Vercel set VERCEL_DEEP_CLONE=true so full history is present.

const fullHistoryAvailable = (() => {
  try {
    return (
      execSync('git rev-parse --is-shallow-repository', { cwd: projectRoot, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim() === 'false'
    );
  } catch {
    return false;
  }
})();

const gitDateCache = new Map();
const gitDate = (args) => {
  if (!fullHistoryAvailable) {
    return null;
  }
  if (gitDateCache.has(args)) {
    return gitDateCache.get(args);
  }
  let result = null;
  try {
    result =
      execSync(`git log -1 --format=%cI ${args}`, { cwd: projectRoot, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim() || null;
  } catch {
    result = null;
  }
  gitDateCache.set(args, result);
  return result;
};

const CATEGORY_PATHS = [
  '/landscapes',
  '/cities',
  '/people',
  '/events',
  '/death-valley',
  '/grand-canyon',
  '/lassen-volcanic',
  '/yosemite',
];

const blogDates = new Map(
  getAllPosts().map((post) => [`/blog/${post.slug}`, post.dateModified || post.datePublished])
);
const newestBlogDate = [...blogDates.values()].sort().pop();

const lastmodFor = (route) => {
  // Photo permalinks: the date the photo's annotation was added/last edited.
  if (route.path.startsWith('/photo/') && route.image) {
    return gitDate(`-S ${JSON.stringify(route.image)} -- src/utils/photoMeta.json`);
  }
  if (blogDates.has(route.path)) {
    return blogDates.get(route.path);
  }
  if (route.path === '/blog') {
    return newestBlogDate;
  }
  // Category galleries: the last time the category's photo files changed
  // (images.js lists bare filenames, so the directory is the source of truth)
  // or one of its photos' annotations changed in photoMeta.json.
  if (CATEGORY_PATHS.includes(route.path)) {
    const slug = route.path.slice(1);
    const filesDate = gitDate(`-- ${JSON.stringify(`public/photos/${slug}`)}`);
    const metaDate = gitDate(`-S ${JSON.stringify(`/photos/${slug}/`)} -- src/utils/photoMeta.json`);
    return [filesDate, metaDate].filter(Boolean).sort().pop() || null;
  }
  if (route.path === '/jmt') {
    return gitDate('-- src/utils/jmtData.js public/photos/JMT');
  }
  if (route.path === '/hst') {
    return gitDate('-- src/utils/images.js public/photos/HST');
  }
  if (route.path === '/favorites') {
    return gitDate('-- src/utils/favorites.js');
  }
  if (route.path === '/galleries') {
    return gitDate('-- src/utils/galleries.js src/utils/images.js');
  }
  if (route.path === '/about') {
    return gitDate('-- src/pages/About.jsx');
  }
  if (route.path === '/') {
    return gitDate('-- src/utils/images.js src/utils/photoMeta.json src/utils/blogPosts.js src/pages/Home.jsx');
  }
  return null;
};

// Normalize date-only strings (blog registry) to full ISO; leave git's
// ISO-with-offset untouched.
const normalizeLastmod = (raw) =>
  /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw;

const routes = [...ALL_ROUTES, ...INDEXABLE_PHOTO_ROUTES];

// Vercel clones shallowly (VERCEL_DEEP_CLONE is not reliably honored), so git
// dates are computed on local builds — where full history exists — and
// persisted to a committed snapshot that CI builds read back. Local builds
// refresh the snapshot automatically as part of `npm run build`.
const SNAPSHOT_PATH = path.join(__dirname, 'seo', 'lastmod.generated.json');

let lastmodByPath = {};
if (fullHistoryAvailable) {
  for (const route of routes) {
    const raw = lastmodFor(route);
    if (raw) {
      lastmodByPath[route.path] = normalizeLastmod(raw);
    }
  }
  await mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(lastmodByPath, null, 2)}\n`, 'utf8');
} else {
  try {
    lastmodByPath = JSON.parse(await readFile(SNAPSHOT_PATH, 'utf8'));
    console.warn('[seo] No full git history (shallow clone) — using committed lastmod snapshot.');
  } catch {
    console.warn('[seo] No git history and no lastmod snapshot — sitemap lastmod falls back to build time.');
  }
  // Registry-derived dates (blog) need no git; they win over a stale snapshot.
  for (const route of routes) {
    const raw = lastmodFor(route);
    if (raw) {
      lastmodByPath[route.path] = normalizeLastmod(raw);
    }
  }
}

const lastmodValue = (route) => lastmodByPath[route.path] || isoDate;

const aboutImage = '/photos/000245650034.jpg';

const routeImageMap = {
  '/': [
    ...heroPhotos.slice(0, 8),
    images.landscapes[0]?.src,
    images.cities[0]?.src,
    images.people[0]?.src,
    images.events[0]?.src,
    images['death-valley'][0]?.src,
    images['grand-canyon'][0]?.src,
    images.jmt[0]?.src,
  ],
  '/about': [aboutImage],
  '/favorites': favorites.map((photo) => photo.src),
  '/galleries': galleries.map((gallery) => gallery.cover).filter(Boolean),
  '/landscapes': images.landscapes.map((photo) => photo.src),
  '/cities': images.cities.map((photo) => photo.src),
  '/people': images.people.map((photo) => photo.src),
  '/events': images.events.map((photo) => photo.src),
  '/death-valley': images['death-valley'].map((photo) => photo.src),
  '/grand-canyon': images['grand-canyon'].map((photo) => photo.src),
  '/lassen-volcanic': images['lassen-volcanic'].map((photo) => photo.src),
  '/yosemite': images.yosemite.map((photo) => photo.src),
  '/jmt': jmtData.flatMap((day) => day.images),
  '/hst': images.HST.map((photo) => photo.src),
};

// Each curated photo permalink lists only its own image. (Un-curated photo
// pages are noindex and excluded from the sitemap; their images remain in the
// image-sitemap via their gallery/category page entries above.)
for (const route of INDEXABLE_PHOTO_ROUTES) {
  routeImageMap[route.path] = [route.image];
}

// Blog index + each post advertise their embedded images.
for (const route of BLOG_ROUTES) {
  routeImageMap[route.path] = route.images || [];
}

const toAbsoluteUrl = (pathname) => {
  if (!pathname) {
    return '';
  }

  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  if (pathname.startsWith('/')) {
    return `${siteUrl}${pathname}`;
  }

  return `${siteUrl}/${pathname}`;
};

const xmlEscape = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const uniqueImages = (imagesForRoute) => {
  const deduped = new Set(imagesForRoute.filter(Boolean).map((image) => toAbsoluteUrl(image)));
  return [...deduped];
};

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${xmlEscape(toAbsoluteUrl(route.path))}</loc>
    <lastmod>${lastmodValue(route)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const imageSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .map((route) => {
    const imagesForRoute = uniqueImages(routeImageMap[route.path] || []);
    if (!imagesForRoute.length) {
      return '';
    }

    return `  <url>
    <loc>${xmlEscape(toAbsoluteUrl(route.path))}</loc>
${imagesForRoute
  .map(
    (imageUrl) => `    <image:image>
      <image:loc>${xmlEscape(imageUrl)}</image:loc>
    </image:image>`
  )
  .join('\n')}
  </url>`;
  })
  .filter(Boolean)
  .join('\n')}
</urlset>
`;

// Explicit user-agent blocks for major LLM training and live-retrieval bots.
// `User-agent: *` already allows them, but listing them by name is the
// conventional way to signal opt-in and ensures bots that prefer named
// directives over wildcards still see an Allow.
const llmAgents = [
  'GPTBot',          // OpenAI training crawler
  'ChatGPT-User',    // OpenAI live-browse on user request
  'OAI-SearchBot',   // OpenAI SearchGPT
  'ClaudeBot',       // Anthropic training crawler
  'Claude-User',     // Anthropic live-browse on user request
  'Claude-SearchBot',
  'anthropic-ai',    // legacy Anthropic UA
  'Google-Extended', // Gemini training opt-in
  'PerplexityBot',   // Perplexity AI
  'CCBot',           // Common Crawl (training data feed for many LLMs)
  'cohere-ai',       // Cohere
  'FacebookBot',     // Meta crawler
  'Meta-ExternalAgent',
  'Applebot-Extended', // Apple Intelligence training opt-in
];

const llmAgentBlocks = llmAgents
  .map((agent) => `User-agent: ${agent}\nAllow: /`)
  .join('\n\n');

const robotsTxt = `User-agent: *
Allow: /

${llmAgentBlocks}

Sitemap: ${toAbsoluteUrl('/sitemap.xml')}
Sitemap: ${toAbsoluteUrl('/image-sitemap.xml')}
`;

// RSS 2.0 feed of blog posts. Enables feed readers, is a positive SEO signal,
// and lets MailerLite's RSS-to-email automation be switched on later with no
// code changes. Galleries are intentionally excluded (they aren't dated;
// new galleries go out as manual broadcasts).
const FEED_TITLE = 'Danil Zanozin Photography';
const FEED_DESCRIPTION = 'Photography field notes and trip guides from the American West.';

const toRfc822 = (isoDateOnly) => new Date(`${isoDateOnly}T00:00:00Z`).toUTCString();

const feedItems = getAllPosts()
  .map((post) => {
    const url = toAbsoluteUrl(`/blog/${post.slug}`);
    const categories = (post.tags || [])
      .map((tag) => `      <category>${xmlEscape(tag)}</category>`)
      .join('\n');
    return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <description>${xmlEscape(post.excerpt || post.description || '')}</description>
      <pubDate>${toRfc822(post.datePublished)}</pubDate>
${categories}
    </item>`;
  })
  .join('\n');

const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(FEED_TITLE)}</title>
    <link>${xmlEscape(toAbsoluteUrl('/blog'))}</link>
    <description>${xmlEscape(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(isoDate).toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(toAbsoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />
${feedItems}
  </channel>
</rss>
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
await writeFile(path.join(publicDir, 'image-sitemap.xml'), imageSitemapXml, 'utf8');
await writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
await writeFile(path.join(publicDir, 'feed.xml'), feedXml, 'utf8');

if (siteUrl === 'https://example.com') {
  console.warn(
    '[seo] SITE_URL is not set. Generated sitemap uses https://example.com. Set SITE_URL (or VITE_SITE_URL) in your environment.'
  );
}

console.log(`[seo] Generated robots.txt, sitemap.xml, image-sitemap.xml, and feed.xml for ${siteUrl}`);
