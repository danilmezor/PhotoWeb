import React from 'react';
import { motion } from 'framer-motion';
import Gallery from '../components/Gallery';
import { images } from '../utils/images';

const CategoryPage = ({ category, title }) => {
    const photos = images[category] || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container"
            style={{ paddingTop: '100px', paddingBottom: '50px' }}
        >
            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    fontSize: '3rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}
            >
                {title}
            </motion.h1>
            <Gallery photos={photos} />
        </motion.div>
    );
};

export default CategoryPage;
