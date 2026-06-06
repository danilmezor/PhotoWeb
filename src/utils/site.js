export const SITE_NAME = 'Danil Zanozin Photography';

export const SITE_DESCRIPTION = 'Personal photography portfolio by Danil Zanozin featuring landscapes, cities, people, events, and a John Muir Trail photo story.';

export const SITE_AUTHOR = 'Danil Zanozin';

// Routes that render TrailPage's fixed left sidebar — these hide the footer
// (App) and center the navbar logo over the sidebar column (Navbar).
export const TRAIL_PAGES = ['/jmt', '/grand-canyon'];

export const SOCIAL_PROFILES = [
  'https://www.instagram.com/muscrue/',
  'https://www.linkedin.com/in/danil-zanozin-603878199/',
  'https://github.com/danilmezor',
];

export const DEFAULT_SOCIAL_IMAGE = '/photos/landscapes/_AC11398-Edit.JPG';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const withProtocol = (value) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value);

export const getSiteOrigin = () => {
  const configured = import.meta.env.VITE_SITE_URL;

  if (configured && configured.trim()) {
    return trimTrailingSlash(withProtocol(configured.trim()));
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return '';
};

export const toAbsoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const origin = getSiteOrigin();

  if (!origin) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith('/')) {
    return `${origin}${pathOrUrl}`;
  }

  return `${origin}/${pathOrUrl}`;
};

// Build a BreadcrumbList JSON-LD object from an ordered list of crumbs.
// Each crumb is { name: 'Galleries', path: '/galleries' }. The leaf crumb
// (last item) typically points at the current page.
export const buildBreadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path),
  })),
});

// Place schema for trails/parks. geo is { latitude, longitude }.
export const buildPlace = ({ name, description, geo, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  name,
  description,
  ...(url ? { url: toAbsoluteUrl(url) } : {}),
  ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude } } : {}),
});

// TouristTrip schema for hikes / multi-day visits. itinerary is an ordered
// array of Place names.
export const buildTouristTrip = ({ name, description, path, place, itinerary, image, datePublished, touristType = 'Hiking' }) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristTrip',
  name,
  description,
  url: toAbsoluteUrl(path),
  touristType,
  ...(image ? { image: toAbsoluteUrl(image) } : {}),
  ...(datePublished ? { datePublished } : {}),
  provider: {
    '@type': 'Person',
    name: SITE_AUTHOR,
    url: toAbsoluteUrl('/about'),
  },
  ...(place ? { partOfTrip: place } : {}),
  ...(itinerary && itinerary.length
    ? { itinerary: itinerary.map((stop, i) => ({ '@type': 'Place', name: stop, position: i + 1 })) }
    : {}),
});
