import { useEffect, useState } from 'react';

// Returns whether `query` currently matches. SSR/prerender-safe: starts from
// the actual matchMedia result when a window exists (the prerender browser is
// desktop-width, so desktop-only branches render into the static HTML), and
// subscribes to changes for live client resizing.
export default function useMediaQuery(query) {
    const getMatch = () =>
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia(query).matches
            : false;

    const [matches, setMatches] = useState(getMatch);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}
