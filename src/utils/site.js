export const SITE_NAME = 'Danil Zanozin Photography';

export const SITE_DESCRIPTION = 'Personal photography portfolio by Danil Zanozin featuring landscapes, cities, people, events, and a John Muir Trail photo story.';

export const SITE_AUTHOR = 'Danil Zanozin';

export const SOCIAL_PROFILES = [
  'https://www.instagram.com/muscrue/',
  'https://www.linkedin.com/in/danil-zanozin-603878199/',
  'https://github.com/danilmezor',
];

export const DEFAULT_SOCIAL_IMAGE = '/photos/hero/_DSC3788-Enhanced-NR.jpg';

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
