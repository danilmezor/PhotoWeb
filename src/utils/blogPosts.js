// Blog post registry — the single source of truth for post metadata.
//
// IMPORTANT: this file must stay node-safe (plain data + plain functions, no
// JSX, no Vite-only syntax like `?raw` or import.meta.glob). It is imported by
// scripts/routes.mjs at build time (sitemap + prerender) as well as by the
// React pages. The Markdown *bodies* live in src/content/blog/<slug>.md and are
// loaded separately in BlogPost.jsx via import.meta.glob (browser/build only).
//
// `images` lists every image URL the post embeds (gallery photos + blog-local
// assets) so the image-sitemap can advertise them for the post's URL.

export const blogPosts = [
    {
        slug: 'john-muir-trail-photography',
        title: 'John Muir Trail Photography: 22 Days from Whitney to Yosemite with One Lens',
        description:
            'A John Muir Trail photo essay from 22 days northbound — Mount Whitney at dawn, Forester Pass in a storm, the Evolution Lake ledge camp, Thousand Island Lake at blue hour, and what one lens and a 1.8 kg camera kit taught me about photographing the Sierra.',
        excerpt:
            '238 miles from Whitney Portal to Happy Isles with a 25-year-old lens and a knee-high tripod — the passes, the people, the mouse that ate my backpack, and the photographs that came home.',
        datePublished: '2026-07-30',
        dateModified: '2026-07-30',
        heroImage: '/photos/JMT/_DSC1616.jpg',
        heroSlug: 'jmt-dsc1616',
        ogImage: '/photos/JMT/_DSC1616.jpg',
        tags: [
            'John Muir Trail',
            'JMT',
            'Mount Whitney',
            'Yosemite National Park',
            'Sierra Nevada',
            'landscape photography',
            'photo essay',
            'backpacking',
            'thru-hiking',
        ],
        assetBase: '/blog/john-muir-trail-photography',
        images: [
            // Gallery frames embedded via :photo (link through to their /photo pages)
            '/photos/JMT/_DSC1510.jpg',
            '/photos/JMT/_DSC1514.jpg',
            '/photos/JMT/_DSC1554.jpg',
            '/photos/JMT/_DSC1562.jpg',
            '/photos/JMT/_DSC1581.jpg',
            '/photos/JMT/_DSC1583.jpg',
            '/photos/JMT/_DSC1616.jpg',
            '/photos/JMT/_DSC1636.jpg',
            '/photos/JMT/_DSC1648.jpg',
            '/photos/JMT/_DSC1804.jpg',
            '/photos/JMT/_DSC1827.jpg',
            '/photos/JMT/_DSC1865.jpg',
            '/photos/JMT/_DSC1878-Edit.jpg',
            '/photos/JMT/_DSC1939.jpg',
            '/photos/JMT/_DSC2021.jpg',
            '/photos/JMT/_DSC2074.jpg',
            '/photos/JMT/_DSC2137.jpg',
            '/photos/JMT/_DSC2304.jpg',
            '/photos/JMT/_DSC2446.jpg',
            '/photos/JMT/_DSC2779.jpg',
            '/photos/JMT/_DSC2799.jpg',
            '/photos/JMT/_DSC2813-HDR.jpg',
            '/photos/JMT/_DSC2848.jpg',
            '/photos/JMT/_DSC2907.jpg',
            '/photos/JMT/_DSC2975-HDR.jpg',
            '/photos/JMT/_DSC3065.jpg',
            '/photos/JMT/_DSC3111.jpg',
            '/photos/JMT/_DSC3151-HDR.jpg',
            '/photos/JMT/_DSC3155.jpg',
            '/photos/JMT/_DSC3166.jpg',
            '/photos/JMT/_DSC3257.jpg',
            '/photos/JMT/_DSC3272-HDR.jpg',
            '/photos/JMT/_DSC3370.jpg',
            '/photos/JMT/_DSC3446-Enhanced-NR.jpg',
            '/photos/JMT/_DSC3457.jpg',
            '/photos/JMT/_DSC3592.jpg',
            '/photos/JMT/_DSC3649-HDR.jpg',
            '/photos/JMT/_DSC3751.jpg',
            '/photos/JMT/_DSC3788-Enhanced-NR.jpg',
            '/photos/JMT/_DSC3804-Edit.jpg',
            '/photos/JMT/_DSC3832.jpg',
            '/photos/JMT/_DSC3921-HDR.jpg',
            '/photos/JMT/_DSC4039.jpg',
            '/photos/JMT/_DSC4063-Enhanced-NR.jpg',
            // Blog-local images (phone shots + route map)
            '/blog/john-muir-trail-photography/john-muir-trail-route-map.jpg',
            '/blog/john-muir-trail-photography/jmt-gear-layout-groundsheet.jpg',
            '/blog/john-muir-trail-photography/jmt-food-resupply-prep.jpg',
            '/blog/john-muir-trail-photography/whitney-portal-pack-scale.jpg',
            '/blog/john-muir-trail-photography/mount-whitney-summit-sign.jpg',
            '/blog/john-muir-trail-photography/onion-valley-bear-box-food-drop.jpg',
            '/blog/john-muir-trail-photography/tyndall-creek-marmot.jpg',
            '/blog/john-muir-trail-photography/tyndall-creek-last-light.jpg',
            '/blog/john-muir-trail-photography/evolution-lake-ledge-camp.jpg',
            '/blog/john-muir-trail-photography/capture-clip-muir-pass-climb.jpg',
            '/blog/john-muir-trail-photography/mtr-resupply-buckets.jpg',
            '/blog/john-muir-trail-photography/vvr-lake-edison-beach-zero-day.jpg',
            '/blog/john-muir-trail-photography/duck-pass-junction-group.jpg',
            '/blog/john-muir-trail-photography/rosalie-lake-first-trout.jpg',
            '/blog/john-muir-trail-photography/jmt-mouse-chewed-gear-night.jpg',
        ],
    },
    {
        slug: 'high-sierra-trail-photography',
        title: 'High Sierra Trail: A Photographer’s Guide to Crescent Meadow and Mount Whitney',
        description:
            'A photographer’s guide to hiking the High Sierra Trail — our 7-day itinerary from Crescent Meadow to Whitney Portal, how the permits really work, the elevation profile, Hamilton Lake and Kaweah Gap, the Kern canyon, and shooting sunrise from the summit of Mount Whitney.',
        excerpt:
            'Seventy-two miles from Crescent Meadow to Mount Whitney with ten pounds of camera gear — our day-by-day itinerary, why walk-up permits beat the online lottery, and why the hardest day wasn’t the one with the mountain on it.',
        datePublished: '2026-07-25',
        dateModified: '2026-07-30',
        heroImage: '/photos/HST/_DSC9825-Edit.jpg',
        heroSlug: 'hst-dsc9825',
        ogImage: '/photos/HST/_DSC9825-Edit.jpg',
        tags: [
            'High Sierra Trail',
            'Mount Whitney',
            'Sequoia National Park',
            'landscape photography',
            'backpacking',
            'Sierra Nevada',
        ],
        assetBase: '/blog/high-sierra-trail-photography',
        images: [
            // Gallery frames embedded via :photo (link through to their /photo pages)
            '/photos/HST/_DSC9825-Edit.jpg',
            '/photos/HST/_DSC9760-HDR-Edit.jpg',
            '/photos/HST/_DSC9765-HDR.jpg',
            '/photos/HST/_DSC9860.jpg',
            '/photos/HST/_DSC9970.jpg',
            '/photos/HST/_DSC9957.jpg',
            '/photos/HST/_DSC0054-Edit.jpg',
            '/photos/HST/_DSC0181.jpg',
            '/photos/HST/_DSC0221.jpg',
            '/photos/HST/_DSC0238-Edit.jpg',
            '/photos/HST/_DSC0263-Edit.jpg',
            '/photos/HST/_DSC0293.jpg',
            // Blog-local images (phone shots, documentary frames, route graphics)
            '/blog/high-sierra-trail-photography/high-sierra-trail-crescent-meadow-trailhead-sign.jpg',
            '/blog/high-sierra-trail-photography/high-sierra-trail-route-map.jpg',
            '/blog/high-sierra-trail-photography/high-sierra-trail-elevation-profile.jpg',
            '/blog/high-sierra-trail-photography/bearpaw-meadow-black-bear.jpg',
            '/blog/high-sierra-trail-photography/high-sierra-trail-yellow-bellied-marmot.jpg',
            '/blog/high-sierra-trail-photography/hamilton-lake-camera-tripod-driftwood.jpg',
            '/blog/high-sierra-trail-photography/precipice-lake-high-sierra-trail.jpg',
            '/blog/high-sierra-trail-photography/moraine-lake-high-sierra-trail.jpg',
            '/blog/high-sierra-trail-photography/big-arroyo-camp-tripod-creek.jpg',
            '/blog/high-sierra-trail-photography/kern-canyon-burned-forest-hiker.jpg',
            '/blog/high-sierra-trail-photography/kern-river-canyon-burn-scar.jpg',
            '/blog/high-sierra-trail-photography/kern-canyon-rattlesnake.jpg',
            '/blog/high-sierra-trail-photography/mount-whitney-summit-sign-sunrise.jpg',
        ],
    },
    {
        slug: 'grand-canyon-rim-to-rim',
        title: 'Grand Canyon Rim-to-Rim: A Photographer’s Guide to Hiking and Shooting Both Rims',
        description:
            'A photographer’s guide to hiking the Grand Canyon Rim-to-Rim — my itinerary, the best light and gear, sunrise and sunset spots, permits and water for the South Kaibab Trail, and what the North Rim looks like after the fire.',
        excerpt:
            'A week hiking from the North Rim to the South Rim with a camera on my back — itinerary, the best light and gear, where to shoot sunrise and sunset, rim-to-rim permits and water, and what the fire left on the North Rim.',
        datePublished: '2026-06-09',
        dateModified: '2026-06-09',
        heroImage: '/photos/grand-canyon/_DSC6909.jpg',
        heroSlug: 'grand-canyon-dsc6909',
        ogImage: '/photos/grand-canyon/_DSC6909.jpg',
        tags: ['Grand Canyon', 'Rim to Rim', 'landscape photography', 'hiking', 'American West'],
        assetBase: '/blog/grand-canyon-rim-to-rim',
        images: [
            // Gallery frames embedded via :photo (link through to their /photo pages)
            '/photos/grand-canyon/_DSC6909.jpg',
            '/photos/grand-canyon/_DSC6792.jpg',
            '/photos/grand-canyon/_DSC6767.jpg',
            '/photos/grand-canyon/_DSC6976.jpg',
            '/photos/grand-canyon/_DSC7101.jpg',
            '/photos/grand-canyon/_DSC7696.jpg',
            '/photos/grand-canyon/_DSC7793.jpg',
            // Blog-local images (phone shots + North Rim DSLR frames + draft-only frames)
            '/blog/grand-canyon-rim-to-rim/grand-canyon-route-map.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-sunrise-tripod-grandview-point.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-blue-hour-lens-pov.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-north-rim-trail-closed-fire.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-north-rim-cabins-fire-damage.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-pack-weight-scale-heat-warning.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-south-kaibab-switchbacks.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-redwall-footbridge-hikers.jpg',
            '/blog/grand-canyon-rim-to-rim/grand-canyon-hikers-below-butte.jpg',
        ],
    },
];

const byDateDesc = (a, b) => (a.datePublished < b.datePublished ? 1 : a.datePublished > b.datePublished ? -1 : 0);

export const getAllPosts = () => [...blogPosts].sort(byDateDesc);

export const getPostBySlug = (slug) => blogPosts.find((post) => post.slug === slug) || null;

// --- Cross-link derivation (topic clusters) ---------------------------------
// A post's embedded gallery photos define which galleries and photo pages it
// relates to — so photo pages, gallery pages, and posts cross-link
// automatically as content is added, with no hand-maintained mapping.

const galleryOfImage = (src) => {
    const match = /^\/photos\/([^/]+)\//.exec(src || '');
    return match ? match[1].toLowerCase() : null;
};

// Posts that embed at least one photo from the given gallery slug.
export const getPostsForGallery = (slug) =>
    getAllPosts().filter((post) =>
        (post.images || []).some((src) => galleryOfImage(src) === slug)
    );

// Posts that embed this exact photo (for "Featured in" links on photo pages).
export const getPostsForPhoto = (src) =>
    getAllPosts().filter((post) => (post.images || []).includes(src));

// Unique gallery slugs a post draws photos from (for post → gallery links).
export const getGalleriesForPost = (post) =>
    [...new Set((post.images || []).map(galleryOfImage).filter(Boolean))];
