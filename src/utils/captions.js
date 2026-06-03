// Curated per-photo descriptions used as the second line of the lightbox
// caption and as the alt text for SEO/accessibility.
//
// Key: the photo's full src path (matches what's stored on photo objects).
// Value: a short, factual description — what's actually in the frame.
//        Aim ~5–15 words mentioning subject + location + mood.
//        These feed crawlers (alt text) and Google Image search, so
//        concrete keywords matter more than flowery prose.
//
// Photos NOT listed here show only their title (e.g. "AC15794", "Untitled")
// in the lightbox and get a generic "<Category> photograph by Danil Zanozin"
// alt fallback.
//
// Add entries here as you go — there's no rush to fill everything in.

export const captions = {
    // Verified portrait — foil backdrop studio shoot.
    '/photos/people/81dJdwzh6qQ.jpg': 'Studio portrait with metallic foil backdrop and dramatic lighting',
};

export const captionFor = (src) => (src ? captions[src] : null) || null;
