import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RelatedReading.css';

// Contextual links from photos/galleries to their blog guides — the
// back-half of the topic-cluster loop (blog → photo links already exist via
// the :photo embeds). Descriptive anchors (the post title) on purpose:
// that's the text search engines associate with the linked guide.
const RelatedReading = ({ posts, heading = 'Related reading' }) => {
    if (!posts?.length) return null;

    return (
        <aside className="related-reading">
            <span className="related-reading-heading">{heading}</span>
            {posts.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="related-reading-link">
                    {post.title}
                </Link>
            ))}
        </aside>
    );
};

export default RelatedReading;
