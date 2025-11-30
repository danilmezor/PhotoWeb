import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from './Lightbox';
import '../styles/Gallery.css';

const Gallery = ({ photos }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleNext = () => {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % photos.length);
    };

    const handlePrev = () => {
        setSelectedIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    };

    const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

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
                        <img src={photo.src} alt={photo.title} loading="lazy" />
                        <div className="gallery-overlay">
                            <h3 className="gallery-title">{photo.title}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>
            {selectedPhoto && (
                <Lightbox
                    photo={selectedPhoto}
                    onClose={() => setSelectedIndex(null)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            )}
        </>
    );
};

export default Gallery;
