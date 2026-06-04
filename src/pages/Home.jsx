import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import PhotoImage from '../components/PhotoImage';
import SEO from '../components/SEO';
import { heroPhotos } from '../utils/hero';
import {
    SITE_AUTHOR,
    SITE_DESCRIPTION,
    SITE_NAME,
    SOCIAL_PROFILES,
    toAbsoluteUrl,
} from '../utils/site';
import '../styles/Home.css';

const collections = [
    { id: 'landscapes', title: 'Landscapes', image: '/photos/landscapes/_AC11398-Edit.JPG', link: '/landscapes' },
    { id: 'cities', title: 'Cities', image: '/photos/cities/_AC15369.jpg', link: '/cities' },
    { id: 'people', title: 'People', image: '/photos/people/81dJdwzh6qQ.jpg', link: '/people' },
    { id: 'events', title: 'Events', image: '/photos/events/_AC17417.jpg', link: '/events' },
    { id: 'jmt', title: 'JMT', image: '/photos/JMT/_DSC3151-HDR.jpg', link: '/jmt', fullWidth: true },
    { id: 'grand-canyon', title: 'Grand Canyon', image: '/photos/grand-canyon/_DSC7748.jpg', link: '/grand-canyon', fullWidth: true },
    { id: 'death-valley', title: 'Death Valley', image: '/photos/death-valley/_DSC5828.jpg', link: '/death-valley', fullWidth: true },
];

const Home = () => {
    const homeDescription = 'Explore Danil Zanozin photography collections featuring landscapes, cities, people, events, and a visual diary from the John Muir Trail.';
    const socialImage = heroPhotos[0];
    const siteUrl = toAbsoluteUrl('/');
    const homeJsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: siteUrl,
            description: SITE_DESCRIPTION,
            inLanguage: 'en',
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: toAbsoluteUrl('/about'),
            sameAs: SOCIAL_PROFILES,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Photography Collections',
            itemListElement: collections.map((collection, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: collection.title,
                url: toAbsoluteUrl(collection.link),
            })),
        },
    ];

    return (
        <div>
            <SEO
                title="Photography Portfolio"
                description={homeDescription}
                path="/"
                image={socialImage}
                jsonLd={homeJsonLd}
            />
            <Hero />
            <div className="container home-container">
                <motion.div
                    className="collections-grid"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {collections.map((collection) => (
                        <Link
                            to={collection.link}
                            key={collection.id}
                            className={`collection-item ${collection.fullWidth ? 'full-width' : ''}`}
                        >
                            <motion.div
                                className="collection-content"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            >
                                <PhotoImage
                                    src={collection.image}
                                    alt={`${collection.title} photography gallery preview`}
                                    className="collection-image"
                                />
                                <div className="collection-overlay">
                                    <h3 className="collection-title">{collection.title}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
