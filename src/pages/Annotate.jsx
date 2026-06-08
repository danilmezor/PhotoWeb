import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PhotoImage from '../components/PhotoImage';
import { allPhotos, photoUrl } from '../utils/photoRegistry';
import '../styles/Annotate.css';

// Dev-only annotation tool (route registered only when import.meta.env.DEV).
// Walks the full photo registry one photo at a time; saves are debounced and
// POSTed to the vite dev-server endpoint, which persists them into
// src/utils/photoMeta.json. Writing guidelines: docs/photo-annotations.md.

const FIELDS = ['title', 'alt', 'story', 'location', 'keywords'];

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const toForm = (meta) => ({
    title: meta?.title || '',
    alt: meta?.alt || '',
    story: meta?.story || '',
    location: meta?.location || '',
    keywords: (meta?.keywords || []).join(', '),
});

const toMeta = (form) => ({
    title: form.title.trim(),
    alt: form.alt.trim(),
    story: form.story.trim(),
    location: form.location.trim(),
    keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
});

const isEmptyForm = (form) => FIELDS.every((f) => !form[f].trim());

const formatExif = (exif) => {
    if (!exif) return null;
    return [exif.camera, exif.lens, exif.focalLength, exif.aperture, exif.shutter, exif.iso && `ISO ${exif.iso}`, exif.capturedAt]
        .filter(Boolean)
        .join(' · ');
};

// Counter badge that colors itself against a target range.
const Counter = ({ value, min, max, unit }) => {
    const cls = value === 0 ? 'idle' : value < min ? 'warn' : value > max ? 'over' : 'ok';
    return <span className={`annotate-counter ${cls}`}>{value} {unit}</span>;
};

const Annotate = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [metaMap, setMetaMap] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [form, setForm] = useState(toForm(null));
    const [saveState, setSaveState] = useState('idle'); // idle | dirty | saving | saved | error
    const [galleryFilter, setGalleryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const formRef = useRef(form);
    formRef.current = form;
    const dirtyRef = useRef(false);
    const timerRef = useRef(null);

    const slugParam = searchParams.get('photo');
    const current = useMemo(
        () => allPhotos.find((p) => p.slug === slugParam) || allPhotos[0],
        [slugParam]
    );
    const currentRef = useRef(current);

    const allIndex = useMemo(() => new Map(allPhotos.map((p, i) => [p.slug, i])), []);

    const galleries = useMemo(() => {
        const seen = new Map();
        for (const p of allPhotos) seen.set(p.gallery.slug, p.gallery.title);
        return [...seen.entries()];
    }, []);

    const annotatedCount = useMemo(() => {
        if (!metaMap) return 0;
        return allPhotos.filter((p) => metaMap[p.src]).length;
    }, [metaMap]);

    const navList = useMemo(() => allPhotos.filter((p) => {
        if (galleryFilter !== 'all' && p.gallery.slug !== galleryFilter) return false;
        if (statusFilter === 'annotated' && !metaMap?.[p.src]) return false;
        if (statusFilter === 'unannotated' && metaMap?.[p.src]) return false;
        return true;
    }), [galleryFilter, statusFilter, metaMap]);

    const locationOptions = useMemo(() => {
        if (!metaMap) return [];
        return [...new Set(Object.values(metaMap).map((m) => m.location).filter(Boolean))].sort();
    }, [metaMap]);

    // Initial load of the live metadata file.
    useEffect(() => {
        fetch('/__photo-meta')
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
            .then(setMetaMap)
            .catch((e) => setLoadError(String(e.message || e)));
    }, []);

    const save = useCallback(async (photo, snapshot) => {
        dirtyRef.current = false;
        setSaveState('saving');
        try {
            const meta = toMeta(snapshot);
            const res = await fetch('/__photo-meta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src: photo.src, meta }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMetaMap((map) => {
                const next = { ...map };
                if (isEmptyForm(snapshot)) delete next[photo.src];
                else next[photo.src] = meta;
                return next;
            });
            setSaveState('saved');
        } catch {
            dirtyRef.current = true;
            setSaveState('error');
        }
    }, []);

    const flushSave = useCallback(() => {
        clearTimeout(timerRef.current);
        if (dirtyRef.current) save(currentRef.current, formRef.current);
    }, [save]);

    // Load form when the photo changes (flushing any pending edit first).
    useEffect(() => {
        if (currentRef.current !== current) flushSave();
        currentRef.current = current;
        setForm(toForm(metaMap?.[current.src]));
        dirtyRef.current = false;
        setSaveState('idle');
        // metaMap is intentionally not a dep: re-running on every save would
        // clobber in-progress typing with the just-saved snapshot.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, metaMap !== null]);

    const onField = (field) => (event) => {
        const value = event.target.value;
        setForm((f) => ({ ...f, [field]: value }));
        dirtyRef.current = true;
        setSaveState('dirty');
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => save(currentRef.current, formRef.current), 800);
    };

    const goTo = useCallback((slug) => {
        flushSave();
        setSearchParams({ photo: slug });
        window.scrollTo({ top: 0 });
    }, [flushSave, setSearchParams]);

    // Prev/next walk the filtered list; if the current photo just fell out of
    // the filter (e.g. it gained an annotation under "unannotated"), jump to
    // the nearest filtered photo in registry order.
    const step = useCallback((direction) => {
        if (!navList.length) return;
        const pos = navList.findIndex((p) => p.slug === currentRef.current.slug);
        if (pos >= 0) {
            goTo(navList[(pos + direction + navList.length) % navList.length].slug);
            return;
        }
        const currentIdx = allIndex.get(currentRef.current.slug) ?? 0;
        const candidates = direction > 0
            ? navList.filter((p) => allIndex.get(p.slug) > currentIdx)
            : navList.filter((p) => allIndex.get(p.slug) < currentIdx).reverse();
        goTo((candidates[0] || navList[direction > 0 ? 0 : navList.length - 1]).slug);
    }, [navList, allIndex, goTo]);

    useEffect(() => {
        const onKey = (event) => {
            const arrow = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
            if (!arrow) return;
            const typing = /^(INPUT|TEXTAREA)$/.test(event.target.tagName);
            // Plain arrows navigate outside fields; Cmd/Ctrl+arrows always do.
            if (typing && !(event.metaKey || event.ctrlKey)) return;
            event.preventDefault();
            step(arrow);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step]);

    // Flush pending edits if the tab closes mid-debounce.
    useEffect(() => {
        window.addEventListener('beforeunload', flushSave);
        return () => {
            window.removeEventListener('beforeunload', flushSave);
            flushSave();
        };
    }, [flushSave]);

    if (loadError) {
        return (
            <div className="annotate-page">
                <p className="annotate-error">
                    Could not reach the dev metadata endpoint ({loadError}). The annotation
                    tool only works under <code>npm run dev</code>.
                </p>
            </div>
        );
    }
    if (!metaMap) {
        return <div className="annotate-page"><p>Loading…</p></div>;
    }

    const exifLine = formatExif(current.exif);
    const storyWords = countWords(form.story);
    const isAnnotated = Boolean(metaMap[current.src]);
    const navPos = navList.findIndex((p) => p.slug === current.slug);

    const SAVE_LABELS = {
        idle: isAnnotated ? 'Annotated ✓' : 'Not annotated',
        dirty: 'Editing…',
        saving: 'Saving…',
        saved: 'Saved ✓',
        error: 'Save failed — edit again to retry',
    };

    return (
        <div className="annotate-page">
            <header className="annotate-header">
                <h1>Annotate</h1>
                <div className="annotate-progress">
                    <strong>{annotatedCount}</strong> / {allPhotos.length} annotated
                    <span className="annotate-progress-bar">
                        <span style={{ width: `${(annotatedCount / allPhotos.length) * 100}%` }} />
                    </span>
                </div>
                <div className="annotate-filters">
                    <select value={galleryFilter} onChange={(e) => setGalleryFilter(e.target.value)}>
                        <option value="all">All galleries</option>
                        {galleries.map(([slug, title]) => (
                            <option key={slug} value={slug}>{title}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All photos</option>
                        <option value="unannotated">Unannotated</option>
                        <option value="annotated">Annotated</option>
                    </select>
                    <span className="annotate-filter-pos">
                        {navPos >= 0 ? `${navPos + 1} / ${navList.length}` : `— / ${navList.length}`} in filter
                    </span>
                </div>
            </header>

            <div className="annotate-layout">
                <div className="annotate-photo">
                    <PhotoImage
                        src={current.src}
                        alt={current.alt}
                        loading="eager"
                        sizes="(max-width: 900px) 100vw, 55vw"
                    />
                    <div className="annotate-photo-meta">
                        <span className="annotate-serial">{current.serial}</span>
                        <span>{current.gallery.title}</span>
                        {exifLine && <span className="annotate-exif">{exifLine}</span>}
                        <code>{current.src}</code>
                        <Link to={photoUrl(current.slug)} target="_blank" rel="noreferrer">
                            Open photo page ↗
                        </Link>
                    </div>

                    {/* Live preview — mirrors PhotoPage's info block and SEO
                        title/description logic so what you type is what
                        ships. Keep in sync with PhotoPage.jsx. */}
                    <div className="annotate-preview">
                        <div className="annotate-preview-page">
                            <h2 className="annotate-preview-title">{form.title.trim() || current.serial}</h2>
                            {form.location.trim() && (
                                <p className="annotate-preview-location">{form.location.trim()}</p>
                            )}
                            {(form.story.trim() || form.alt.trim()) && (
                                <p className="annotate-preview-story">{form.story.trim() || form.alt.trim()}</p>
                            )}
                        </div>
                        <div className="annotate-preview-serp">
                            <span className="annotate-serp-url">danilzanozin.com › photo › {current.slug}</span>
                            <span className="annotate-serp-title">
                                {(() => {
                                    const title = form.title.trim() || current.serial;
                                    const tail = form.location.trim() || form.alt.trim();
                                    return `${tail ? `${title} — ${tail}` : title} | Danil Zanozin Photography`;
                                })()}
                            </span>
                            <span className="annotate-serp-desc">
                                {form.alt.trim() || `${current.gallery.title} photograph by Danil Zanozin: ${form.title.trim() || current.serial}.`}
                            </span>
                        </div>
                    </div>
                </div>

                <form className="annotate-form" onSubmit={(e) => e.preventDefault()}>
                    <label>
                        <span className="annotate-label">
                            Title <em>3–8 evocative words — becomes the H1 and &lt;title&gt;</em>
                            <Counter value={countWords(form.title)} min={3} max={8} unit="words" />
                        </span>
                        <input
                            type="text"
                            value={form.title}
                            onChange={onField('title')}
                            placeholder="Enshrined Forever"
                            autoFocus
                        />
                    </label>

                    <label>
                        <span className="annotate-label">
                            Location <em>Landmark, Place, State — name it explicitly</em>
                        </span>
                        <input
                            type="text"
                            value={form.location}
                            onChange={onField('location')}
                            placeholder="Lincoln Memorial, Washington, D.C."
                            list="annotate-locations"
                        />
                        <datalist id="annotate-locations">
                            {locationOptions.map((loc) => <option key={loc} value={loc} />)}
                        </datalist>
                    </label>

                    <label>
                        <span className="annotate-label">
                            Alt text <em>factual: what's visible + location, no keyword lists</em>
                            <Counter value={form.alt.length} min={20} max={125} unit="chars" />
                        </span>
                        <input
                            type="text"
                            value={form.alt}
                            onChange={onField('alt')}
                            placeholder="Long-exposure black-and-white photo of the Lincoln Memorial statue with motion-blurred visitors"
                        />
                    </label>

                    <label>
                        <span className="annotate-label">
                            Story <em>first person: where, when, the idea, one technique detail. Don't describe what's already visible</em>
                            <Counter value={storyWords} min={40} max={90} unit="words" />
                        </span>
                        <textarea
                            rows={7}
                            value={form.story}
                            onChange={onField('story')}
                            placeholder="I set up inside the chamber on a crowded evening…"
                        />
                    </label>

                    <label>
                        <span className="annotate-label">
                            Keywords <em>3–6, comma-separated</em>
                            <Counter
                                value={form.keywords.split(',').map((k) => k.trim()).filter(Boolean).length}
                                min={3}
                                max={6}
                                unit="tags"
                            />
                        </span>
                        <input
                            type="text"
                            value={form.keywords}
                            onChange={onField('keywords')}
                            placeholder="long exposure, black and white, night photography"
                        />
                    </label>

                    <div className="annotate-actions">
                        <button type="button" onClick={() => step(-1)}>← Prev</button>
                        <span className={`annotate-save-state ${saveState}`}>{SAVE_LABELS[saveState]}</span>
                        <button type="button" className="primary" onClick={() => step(1)}>Next →</button>
                    </div>
                    <p className="annotate-hint">
                        Autosaves as you type · ← → to navigate (⌘← ⌘→ while typing)
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Annotate;
