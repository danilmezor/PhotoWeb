import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import { images } from '../utils/images';
import '../styles/Home.css';

const collections = [
    { id: 'landscapes', title: 'Landscapes', image: images.landscapes[0].src, link: '/landscapes' },
    { id: 'cities', title: 'Cities', image: images.cities[0].src, link: '/cities' },
    { id: 'people', title: 'People', image: images.people[0].src, link: '/people' },
    { id: 'events', title: 'Events', image: images.events[0].src, link: '/events' },
    { id: 'jmt', title: 'JMT', image: images.jmt[0].src, link: '/jmt', fullWidth: true },
];

const Home = () => {
    return (
        <div>
            <Hero />
            <div className="container home-container">
                <motion.div
                    className="collections-grid"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {collections.map((collection, index) => (
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
                                <img
                                    src={collection.image}
                                    alt={collection.title}
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
