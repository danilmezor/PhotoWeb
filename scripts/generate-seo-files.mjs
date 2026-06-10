import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { images } from '../src/utils/images.js';
import { jmtData } from '../src/utils/jmtData.js';
import { heroPhotos } from '../src/utils/hero.js';
import { favorites } from '../src/utils/favorites.js';
import { galleries } from '../src/utils/galleries.js';
import { ALL_ROUTES, BLOG_ROUTES, PHOTO_ROUTES } from './routes.mjs';
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

const routes = [...ALL_ROUTES, ...PHOTO_ROUTES];

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
  '/jmt': jmtData.flatMap((day) => day.images),
};

// Each photo permalink lists only its own image.
for (const route of PHOTO_ROUTES) {
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
    <lastmod>${isoDate}</lastmod>
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
