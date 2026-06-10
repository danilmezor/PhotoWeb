import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import PhotoImage from '../components/PhotoImage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import NewsletterForm from '../components/NewsletterForm';
import { getPostBySlug } from '../utils/blogPosts';
import { photoUrl } from '../utils/photoRegistry';
import { SITE_AUTHOR, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';
import '../styles/BlogPost.css';

// Markdown bodies are bundled at build time (raw strings), keyed by filename.
const bodies = import.meta.glob('../content/blog/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
});

const getBody = (slug) => bodies[`../content/blog/${slug}.md`] || '';

const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

// Rough reading time from the prose, ignoring directive/markup syntax.
const readingMinutes = (markdown) => {
    const words = markdown
        .replace(/::?[a-z]+(\[[^\]]*\])?(\{[^}]*\})?/gi, ' ') // strip directives
        .replace(/[#>*_`!\[\]()-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
};

const BlogPost = () => {
    const { slug } = useParams();
    const post = getPostBySlug(slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const body = getBody(slug);
    const path = `/blog/${post.slug}`;

    const blogPostingJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: toAbsoluteUrl(post.ogImage || post.heroImage),
        datePublished: post.datePublished,
        dateModified: post.dateModified || post.datePublished,
        author: { '@type': 'Person', name: SITE_AUTHOR, url: toAbsoluteUrl('/about') },
        publisher: { '@type': 'Person', name: SITE_AUTHOR, url: toAbsoluteUrl('/about') },
        mainEntityOfPage: { '@type': 'WebPage', '@id': toAbsoluteUrl(path) },
        url: toAbsoluteUrl(path),
        keywords: post.tags?.length ? post.tags.join(', ') : undefined,
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="container blog-post"
            style={{ paddingTop: 'var(--navbar-height)', paddingBottom: '60px' }}
        >
            <SEO
                title={post.title}
                description={post.description}
                path={path}
                image={post.ogImage || post.heroImage}
                type="article"
                jsonLd={[blogPostingJsonLd, breadcrumbsJsonLd]}
            />
            <Breadcrumb
                items={[
                    { name: 'Home', path: '/' },
                    { name: 'Blog', path: '/blog' },
                    { name: post.title },
                ]}
            />

            <header className="blog-post-header">
                <h1 className="blog-post-title">{post.title}</h1>
                <p className="blog-post-byline">
                    By {SITE_AUTHOR} ·{' '}
                    <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time> ·{' '}
                    {readingMinutes(body)} min read
                </p>
            </header>

            {post.heroImage && (
                <figure className="blog-post-hero blog-figure--gallery">
                    {post.heroSlug ? (
                        <Link to={photoUrl(post.heroSlug)} className="blog-figure-link">
                            <span className="blog-photo-mat">
                                <PhotoImage
                                    src={post.heroImage}
                                    alt={post.title}
                                    loading="eager"
                                    sizes="(max-width: 1100px) 100vw, 1040px"
                                />
                            </span>
                        </Link>
                    ) : (
                        <span className="blog-photo-mat">
                            <PhotoImage
                                src={post.heroImage}
                                alt={post.title}
                                loading="eager"
                                sizes="(max-width: 1100px) 100vw, 1040px"
                            />
                        </span>
                    )}
                </figure>
            )}

            <article className="blog-post-body">
                <MarkdownRenderer content={body} assetBase={post.assetBase} />
            </article>

            <NewsletterForm variant="card" />
        </motion.div>
    );
};

export default BlogPost;
