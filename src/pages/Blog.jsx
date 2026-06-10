import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ParallaxImage from '../components/ParallaxImage';
import Breadcrumb from '../components/Breadcrumb';
import { getAllPosts } from '../utils/blogPosts';
import { SITE_AUTHOR, SITE_NAME, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';
import '../styles/Blog.css';

const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

const Blog = () => {
    const posts = getAllPosts();
    const description =
        'Photography field notes and trip guides from the American West — long-form write-ups on hiking and shooting the landscapes I travel through.';
    const leadImage = posts[0]?.heroImage;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${SITE_NAME} — Blog`,
        description,
        url: toAbsoluteUrl('/blog'),
        author: { '@type': 'Person', name: SITE_AUTHOR, url: toAbsoluteUrl('/about') },
        blogPost: posts.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: toAbsoluteUrl(`/blog/${post.slug}`),
            datePublished: post.datePublished,
            image: toAbsoluteUrl(post.ogImage || post.heroImage),
        })),
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container"
            style={{ paddingTop: 'var(--navbar-height)', paddingBottom: '50px' }}
        >
            <SEO
                title="Blog — Photography Field Notes & Trip Guides"
                description={description}
                path="/blog"
                image={leadImage}
                jsonLd={[jsonLd, breadcrumbsJsonLd]}
            />
            <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Blog' }]} />
            <h1 className="blog-index-title">Blog</h1>
            <p className="blog-index-intro">{description}</p>

            <div className="blog-grid">
                {posts.map((post, index) => (
                    <motion.div
                        key={post.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                        <Link to={`/blog/${post.slug}`} className="blog-card">
                            <div className="blog-card-image-wrap">
                                <ParallaxImage
                                    src={post.heroImage}
                                    alt={post.title}
                                    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>
                            <div className="blog-card-body">
                                <time className="blog-card-date" dateTime={post.datePublished}>
                                    {formatDate(post.datePublished)}
                                </time>
                                <h2 className="blog-card-title">{post.title}</h2>
                                <p className="blog-card-excerpt">{post.excerpt}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Blog;
