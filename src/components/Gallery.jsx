import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from './Lightbox';
import ParallaxImage from './ParallaxImage';
import '../styles/Gallery.css';

const Gallery = ({ photos }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    return (
        <>
            <div className="gallery-container">
                {photos.map((photo, index) => (
                    <motion.div
                        key={photo.id}
                        className="gallery-item"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        onClick={() => setSelectedIndex(index)}
                    >
                        <ParallaxImage
                            src={photo.src}
                            alt={photo.alt || `${photo.title} photo by Danil Zanozin`}
                        />
                    </motion.div>
                ))}
            </div>
            {selectedIndex !== null && (
                <Lightbox
                    photos={photos}
                    selectedIndex={selectedIndex}
                    onClose={() => setSelectedIndex(null)}
                    onSelect={setSelectedIndex}
                />
            )}
        </>
    );
};

export default Gallery;
