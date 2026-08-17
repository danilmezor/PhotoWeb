import React, { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import PhotoImage from './PhotoImage';
import useMediaQuery from '../hooks/useMediaQuery';
import { getPhotoBySlug, photoUrl } from '../utils/photoRegistry';

// Provides the per-post asset base (e.g. "/blog/grand-canyon-rim-to-rim") so
// :image / :map directives can reference files by bare filename.
const AssetBaseContext = createContext('');

// remark plugin: turn our custom directives (::photo / ::image / ::map) into
// named hast elements with their attributes forwarded as props. The directive
// label (text in [ ]) flows through as children → used as the caption.
const KNOWN = { photo: 'blogphoto', image: 'blogimage', map: 'blogmap', button: 'blogbutton' };

const DIRECTIVE_TYPES = new Set(['textDirective', 'leafDirective', 'containerDirective']);

// Flatten a node's children to their text content (for reconstructing labels).
const textOf = (nodes) =>
    (nodes || []).map((n) => (n.value != null ? n.value : textOf(n.children))).join('');

function remarkBlogDirectives() {
    return (tree) => {
        visit(tree, (node) => {
            if (!DIRECTIVE_TYPES.has(node.type)) return;

            const hName = KNOWN[node.name];
            if (hName) {
                const data = node.data || (node.data = {});
                data.hName = hName;
                data.hProperties = { ...(node.attributes || {}) };
                return;
            }

            // Unknown directive — almost always a false positive from the
            // single-colon text-directive syntax colliding with real prose
            // (e.g. the "3:30" in a time, or "12:00"). remark-directive would
            // otherwise swallow it; turn it back into literal text.
            const prefix =
                node.type === 'containerDirective' ? ':::' : node.type === 'leafDirective' ? '::' : ':';
            const label = node.children && node.children.length ? `[${textOf(node.children)}]` : '';
            const attrs =
                node.attributes && Object.keys(node.attributes).length
                    ? `{${Object.entries(node.attributes)
                          .map(([k, v]) => `${k}="${v}"`)
                          .join(' ')}}`
                    : '';
            node.type = 'text';
            node.value = `${prefix}${node.name}${label}${attrs}`;
            delete node.children;
            delete node.attributes;
            delete node.data;
        });
    };
}

const resolveAsset = (assetBase, src) => {
    if (!src) return '';
    if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
    return `${assetBase}/${src}`.replace(/\/+/g, '/');
};

const hasChildren = (children) => React.Children.count(children) > 0;

// Gallery photo embed → pulls image + alt from the registry, links to the
// photo's own /photo/<slug> page. Caption falls back to the photo title.
function BlogPhoto({ slug, children }) {
    const photo = getPhotoBySlug(slug);
    if (!photo) {
        if (import.meta.env?.DEV) {
            console.warn(`[blog] :photo references unknown slug "${slug}"`);
        }
        return null;
    }
    const caption = hasChildren(children) ? children : photo.title;
    return (
        <figure className="blog-figure blog-figure--gallery">
            <Link to={photoUrl(slug)} className="blog-figure-link">
                <span className="blog-photo-mat">
                    <PhotoImage src={photo.src} alt={photo.alt} sizes="(max-width: 1040px) 100vw, 1040px" />
                </span>
            </Link>
            {caption && <figcaption className="blog-figcaption">{caption}</figcaption>}
        </figure>
    );
}

// Blog-local image (phone shots, documentary frames). Rendered smaller than
// gallery work and without the print mat, so the portfolio frames read as the
// hero artwork and these as supporting context. No link-out.
function BlogImage({ src, alt, children }) {
    const assetBase = useContext(AssetBaseContext);
    const resolved = resolveAsset(assetBase, src);
    return (
        <figure className="blog-figure blog-figure--support">
            <PhotoImage src={resolved} alt={alt || ''} sizes="(max-width: 728px) 100vw, 728px" />
            {hasChildren(children) && <figcaption className="blog-figcaption">{children}</figcaption>}
        </figure>
    );
}

// Prominent call-to-action link, styled as a button.
function BlogButton({ href = '', children }) {
    const inner = href.startsWith('/') ? (
        <Link to={href} className="blog-cta-button">
            {children}
        </Link>
    ) : (
        <a href={href} className="blog-cta-button" target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
    return <div className="blog-cta-wrap">{inner}</div>;
}

// Responsive embed: static image (linked out) on mobile; live iframe on
// desktop. The static image is always in the markup (crawlable); the iframe
// only mounts on wide screens. If no `src` screenshot is provided, the mobile
// view degrades to a labeled link card instead of a broken image.
function BlogMap({ src, href, alt, children }) {
    const assetBase = useContext(AssetBaseContext);
    const isDesktop = useMediaQuery('(min-width: 900px)');
    const resolved = resolveAsset(assetBase, src);
    const caption = hasChildren(children) ? children : null;

    return (
        <figure className="blog-map">
            <a className="blog-map-static" href={href} target="_blank" rel="noopener noreferrer">
                {resolved ? (
                    <PhotoImage src={resolved} alt={alt || 'Route map'} sizes="(max-width: 820px) 100vw, 760px" />
                ) : (
                    <span className="blog-map-fallback">View the interactive route map →</span>
                )}
            </a>
            {isDesktop && href && (
                <div className="blog-map-interactive">
                    <iframe src={href} title={alt || 'Interactive route map'} loading="lazy" allowFullScreen />
                </div>
            )}
            {caption && <figcaption className="blog-figcaption">{caption}</figcaption>}
        </figure>
    );
}

// Internal links use the router; external links open in a new tab.
function MarkdownLink({ href = '', children }) {
    if (href.startsWith('#')) {
        // In-page jump link (to a heading id) — plain anchor, same tab.
        return (
            <a href={href} className="blog-link">
                {children}
            </a>
        );
    }
    if (href.startsWith('/')) {
        return (
            <Link to={href} className="blog-link">
                {children}
            </Link>
        );
    }
    return (
        <a href={href} className="blog-link" target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
}

// Headings get a stable, GitHub-style id so posts can jump-link to their own
// sections (e.g. "[the two-day plan](#the-one-day-and-two-day-plans)").
const slugifyHeading = (nodes) =>
    textOf(nodes)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

const makeHeading = (tag) =>
    function MarkdownHeading({ node, children, ...rest }) {
        return React.createElement(tag, { id: slugifyHeading(node?.children), ...rest }, children);
    };

const COMPONENTS = {
    a: MarkdownLink,
    h2: makeHeading('h2'),
    h3: makeHeading('h3'),
    blogphoto: BlogPhoto,
    blogimage: BlogImage,
    blogmap: BlogMap,
    blogbutton: BlogButton,
};

const REMARK_PLUGINS = [remarkGfm, remarkDirective, remarkBlogDirectives];

export default function MarkdownRenderer({ content, assetBase = '' }) {
    return (
        <AssetBaseContext.Provider value={assetBase}>
            <div className="blog-prose">
                <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
                    {content}
                </ReactMarkdown>
            </div>
        </AssetBaseContext.Provider>
    );
}
