import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import { images } from '../utils/images';

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
            <div className="container" style={{ padding: '4rem 2rem', marginTop: '20vh' }}>
                <motion.div
                    className="collections-grid"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}
                >
                    {collections.map((collection, index) => (
                        <Link
                            to={collection.link}
                            key={collection.id}
                            style={{
                                position: 'relative',
                                display: 'block',
                                height: collection.fullWidth ? '300px' : '500px',
                                overflow: 'hidden',
                                borderRadius: '4px',
                                gridColumn: collection.fullWidth ? '1 / -1' : 'auto'
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <img src={collection.image} alt={collection.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <h3 style={{ color: '#fff', fontSize: '2rem', fontFamily: 'var(--font-serif)', letterSpacing: '1px' }}>{collection.title}</h3>
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
