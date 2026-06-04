import React from 'react';
import { Link } from 'react-router-dom';
import PhotoImage from './PhotoImage';
import { getRelatedGalleries } from '../utils/galleries';
import '../styles/RelatedGalleries.css';

// Renders a small grid of related-gallery tiles beneath a gallery/trail page.
// Pulls the related list from src/utils/galleries.js via getRelatedGalleries.
const RelatedGalleries = ({ currentSlug }) => {
    const related = getRelatedGalleries(currentSlug);
    if (related.length === 0) return null;

    return (
        <section className="related-galleries" aria-labelledby="related-heading">
            <h2 id="related-heading" className="related-heading">More to explore</h2>
            <div className="related-grid">
                {related.map((gallery) => (
                    <Link key={gallery.slug} to={gallery.path} className="related-tile">
                        <div className="related-tile-image">
                            <PhotoImage src={gallery.cover} alt={`${gallery.title} gallery cover`} />
                        </div>
                        <h3 className="related-tile-title">{gallery.title}</h3>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RelatedGalleries;
