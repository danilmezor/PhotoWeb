import { useEffect } from 'react';
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  toAbsoluteUrl,
} from '../utils/site';

const JSON_LD_SELECTOR = 'script[data-seo-json-ld="true"]';

const upsertMetaTag = (attr, key, content) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const upsertCanonicalTag = (href) => {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', href);
};

// One preload link per page for the LCP image. Injected in the same effect
// as the rest of the head tags, so the prerender bakes it into static HTML —
// where it matters: on a first (non-SPA) load the browser's preload scanner
// starts the hero fetch before CSS/JS finish. SPA navigations don't need it.
const upsertPreloadTag = (preload) => {
  document.head.querySelectorAll('link[data-seo-preload="true"]').forEach((node) => node.remove());

  if (!preload?.href) {
    return;
  }

  const link = document.createElement('link');
  link.setAttribute('rel', 'preload');
  link.setAttribute('as', 'image');
  link.setAttribute('data-seo-preload', 'true');
  link.setAttribute('fetchpriority', 'high');
  link.setAttribute('href', preload.href);
  if (preload.imageSrcSet) {
    link.setAttribute('imagesrcset', preload.imageSrcSet);
  }
  if (preload.imageSizes) {
    link.setAttribute('imagesizes', preload.imageSizes);
  }
  document.head.appendChild(link);
};

const normalizeJsonLd = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const SEO = ({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  image = DEFAULT_SOCIAL_IMAGE,
  type = 'website',
  jsonLd,
  noindex = false,
  preload,
}) => {
  const jsonLdKey = JSON.stringify(normalizeJsonLd(jsonLd));
  const preloadKey = JSON.stringify(preload ?? null);

  useEffect(() => {
    const canonicalUrl = toAbsoluteUrl(path);
    const imageUrl = toAbsoluteUrl(image);
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    document.title = fullTitle;

    upsertMetaTag('name', 'description', description);
    upsertMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, follow'
        : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    );

    upsertMetaTag('property', 'og:type', type);
    upsertMetaTag('property', 'og:site_name', SITE_NAME);
    upsertMetaTag('property', 'og:title', fullTitle);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:image', imageUrl);

    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', fullTitle);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', imageUrl);

    upsertCanonicalTag(canonicalUrl);
    upsertPreloadTag(JSON.parse(preloadKey));

    document.querySelectorAll(JSON_LD_SELECTOR).forEach((node) => node.remove());

    const entries = JSON.parse(jsonLdKey);

    entries.forEach((entry, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-json-ld', 'true');
      script.setAttribute('id', `seo-json-ld-${index}`);
      script.textContent = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [title, description, path, image, type, jsonLdKey, noindex, preloadKey]);

  return null;
};

export default SEO;
