import { captionFor } from './captions.js';

const buildPhotoSrc = (category, fileName) => (
  `/photos/${category}/${encodeURIComponent(fileName)}`
);

// Extract a clean display title from a filename.
// Camera-serial names like _AC15794-HDR-2.jpg, _DSC1471-Enhanced-NR.jpg,
// _AC16368-Pano.jpg, _DSC4277-Edit.jpg all reduce to just AC15794 / DSC1471 /
// AC16368 / DSC4277. Anything else (random hashes, timestamped phone uploads)
// becomes "Untitled".
export const formatTitle = (fileName) => {
  const base = fileName.replace(/\.[^.]+$/, '');
  const match = base.match(/^_?((?:DSC|AC)\d+)/i);
  return match ? match[1].toUpperCase() : 'Untitled';
};

// Same, but accepts a full src like /photos/landscapes/_AC15794-HDR-2.jpg.
export const titleFromSrc = (src) => formatTitle(src.split('/').pop() || '');

const formatCategoryLabel = (category) => (
  category
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
);

const mapCategoryFiles = (category, files) =>
  files.map((fileName, index) => {
    const title = formatTitle(fileName);
    const categoryLabel = formatCategoryLabel(category);
    const src = buildPhotoSrc(category, fileName);
    const caption = captionFor(src);

    return {
      id: index + 1,
      src,
      title,
      caption,
      alt: caption || `${categoryLabel} photograph by Danil Zanozin (${title})`,
    };
  });

const landscapeFiles = [
  "_AC11398-Edit.JPG",
  "_AC14997.jpg",
  "_AC15794-HDR-2.jpg",
  "_AC16043.jpg",
  "_AC16126.jpg",
  "_AC16128-HDR.jpg",
  "_AC16617.jpg",
  "_AC16640-HDR.jpg",
  "_AC16669.jpg",
  "_AC16711.jpg",
  "_DSC0273.jpg",
  "_DSC0519.jpg",
  "_DSC0869.jpg",
  "_DSC1471-Enhanced-NR.jpg",
  "_DSC4277-Edit.jpg",
  "_DSC5401.jpg",
  "njcRmx4hCQA.jpg",
  "uFZYpJ8oVJQ.jpg"
];
const cityFiles = [
  "_sGN2QO7P6c.jpg",
  "_AC10425.jpg",
  "_AC15366.jpg",
  "_AC15369.jpg",
  "_AC16232-HDR-2.jpg",
  "_AC16368-Pano.jpg",
  "_DSC5033.jpg",
  "_DSC5344.jpg",
  "CHHBd8lS8RY.jpg",
  "Ekkr8JiDBIc.jpg",
  "fyCOWS2l5JI.jpg",
  "s_9N2ACzGmE.jpg",
  "v6TW68bhNDE.jpg",
  "WruL2-cDbDk.jpg",
  "xHImx8XxQZs.jpg",
  "photo_2025-05-18 16.54.39.jpeg"
];
const peopleFiles = [
  "_AC10892.jpg",
  "_AC12324.jpg",
  "81dJdwzh6qQ.jpg",
  "89BLwDYfYxc.jpg",
  "HYYPRzv6ytQ.jpg",
  "iP_Efdxg24s.jpg",
  "mZv5pHSXO0g.jpg",
  "N4UZxbKEieM.jpg",
  "Nk0OWd6YWM0.jpg",
  "SD6tb-jvVtA.jpg",
  "UfI6nxbJFDQ.jpg",
  "zVkEZWxRSrU.jpg"
];
const eventFiles = [
  "_AC10955.jpg",
  "_AC16015.jpg",
  "_AC17221.jpg",
  "_AC17417.jpg",
  "_DSC4592.jpg",
  "_DSC4611.jpg",
  "_DSC4773.jpg",
  "_DSC5014.jpg",
  "_MiBemNLXsM.jpg",
  "6OHgrzMQ7vU.jpg",
  "7bCcFgOofyk8Sd6OHHQtk1gTAyWZ2nf2sSqCwV6b_ds8H-sgK7GV_WbRG0upQXzlVWVYCGfp.jpg",
  "8IB8HnJL2yk.jpg",
  "CdeDKw2W1iU.jpg",
  "GTZvJobrj1U.jpg",
  "Idu8L57IO_o.jpg",
  "ZYRyh9_pilg.jpg"
];
const deathValleyFiles = [
  "_DSC5570.jpg",
  "_DSC5599-Edit.jpg",
  "_DSC5707.jpg",
  "_DSC5808.jpg",
  "_DSC5828.jpg",
  "_DSC5865.jpg",
  "_DSC6007.jpg",
  "_DSC6068.jpg",
  "_DSC6099.jpg",
  "_DSC6135.jpg"
];
const grandCanyonFiles = [
  "_DSC6639.jpg",
  "_DSC6767.jpg",
  "_DSC6792.jpg",
  "_DSC6882.jpg",
  "_DSC6909.jpg",
  "_DSC6976.jpg",
  "_DSC7101.jpg",
  "_DSC7356.jpg",
  "_DSC7438.jpg",
  "_DSC7592.jpg",
  "_DSC7696.jpg",
  "_DSC7748.jpg",
  "_DSC7793.jpg"
];

export const images = {
  landscapes: mapCategoryFiles('landscapes', landscapeFiles),
  cities: mapCategoryFiles('cities', cityFiles),
  people: mapCategoryFiles('people', peopleFiles),
  events: mapCategoryFiles('events', eventFiles),
  'death-valley': mapCategoryFiles('death-valley', deathValleyFiles),
  'grand-canyon': mapCategoryFiles('grand-canyon', grandCanyonFiles),
  jmt: [
    {
      id: 1,
      src: buildPhotoSrc('JMT', "_DSC4039.jpg"),
      title: 'John Muir Trail',
      alt: 'John Muir Trail landscape photo',
    },
  ],
};
