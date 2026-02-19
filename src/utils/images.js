const buildPhotoSrc = (category, fileName) => (
  `/photos/${category}/${encodeURIComponent(fileName)}`
);

const formatTitle = (fileName) => (
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const mapCategoryFiles = (category, files) => (
  files.map((fileName, index) => ({
    id: index + 1,
    src: buildPhotoSrc(category, fileName),
    title: formatTitle(fileName),
  }))
);

const heroFiles = [
  "_AC14997.jpg",
  "_AC15233-Pano.jpg",
  "_AC16232-HDR-2.jpg",
  "_AC16368-Pano.jpg",
  "_DSC1471-Enhanced-NR.jpg",
  "_DSC2014.jpg",
  "_DSC3788-Enhanced-NR.jpg",
  "_DSC4063-Enhanced-NR.jpg",
  "_DSC4277-Edit.jpg",
  "_DSC4592.jpg",
  "_DSC5428.jpg",
  "_DSC5570.jpg",
  "_DSC6099.jpg",
  "_DSC6193.jpg",
  "H53-idjr5hk.jpg"
];
const landscapeFiles = [
  "_AC11346-Edit.JPG",
  "_AC11398-Edit.JPG",
  "_AC14997.jpg",
  "_AC16043.jpg",
  "_AC16126.jpg",
  "_AC16128-HDR.jpg",
  "_AC16158-HDR.jpg",
  "_AC16437-HDR.jpg",
  "_AC16617.jpg",
  "_AC16640-HDR.jpg",
  "_AC16669.jpg",
  "_AC16711.jpg",
  "_DSC0273.jpg",
  "_DSC0519.jpg",
  "_DSC0869.jpg",
  "_DSC0871.jpg",
  "_DSC1471-Enhanced-NR.jpg",
  "_DSC4277-Edit.jpg",
  "_DSC5121-HDR.jpg",
  "_DSC5226.jpg",
  "_DSC5401.jpg",
  "_DSC5428.jpg",
  "_DSC5599.jpg",
  "_DSC5697.jpg",
  "_DSC6087.jpg",
  "_DSC6099.jpg",
  "njcRmx4hCQA.jpg",
  "photo_2025-05-18 16.54.39.jpeg",
  "uFZYpJ8oVJQ.jpg"
];
const cityFiles = [
  "_AC10425.jpg",
  "_AC15366.jpg",
  "_AC15369.jpg",
  "_AC16232-HDR-2.jpg",
  "_AC16368-Pano.jpg",
  "_DSC5033.jpg",
  "_DSC5344.jpg",
  "_DSC5364.jpg",
  "_sGN2QO7P6c.jpg",
  "0ijyGqzFXDE.jpg",
  "CHHBd8lS8RY.jpg",
  "Ekkr8JiDBIc.jpg",
  "fyCOWS2l5JI.jpg",
  "image.jpg",
  "K8gJ8Fc1M-I.jpg",
  "s_9N2ACzGmE.jpg",
  "v6TW68bhNDE.jpg",
  "WruL2-cDbDk.jpg",
  "xHImx8XxQZs.jpg"
];
const peopleFiles = [
  "_AC10892.jpg",
  "_AC12324.jpg",
  "_AC13561.jpg",
  "_DSC4773.jpg",
  "81dJdwzh6qQ.jpg",
  "89BLwDYfYxc.jpg",
  "F5010006.JPG",
  "HYYPRzv6ytQ.jpg",
  "iP_Efdxg24s.jpg",
  "mZv5pHSXO0g.jpg",
  "N4UZxbKEieM.jpg",
  "Nk0OWd6YWM0.jpg",
  "RtAe1QpNR0A.jpg",
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

export const images = {
  hero: heroFiles.map((fileName) => buildPhotoSrc('hero', fileName)),
  landscapes: mapCategoryFiles('landscapes', landscapeFiles),
  cities: mapCategoryFiles('cities', cityFiles),
  people: mapCategoryFiles('people', peopleFiles),
  events: mapCategoryFiles('events', eventFiles),
  jmt: [
    {
      id: 1,
      src: buildPhotoSrc('JMT', "_DSC4039.jpg"),
      title: 'John Muir Trail',
    },
  ],
};
