import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from './Lightbox';
import ParallaxImage from './ParallaxImage';
import { getPhotoUrlBySrc } from '../utils/photoRegistry';
import '../styles/Gallery.css';

const Gallery = ({ photos }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    return (
        <>
            <div className="gallery-container">
                {photos.map((photo, index) => (
                    <motion.a
                        key={photo.id}
                        className="gallery-item"
                        href={getPhotoUrlBySrc(photo.src) || undefined}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        onClick={(e) => {
                            // Keep the lightbox UX; the href is for crawlers and
                            // cmd/middle-click "open in new tab".
                            e.preventDefault();
                            setSelectedIndex(index);
                        }}
                    >
                        <ParallaxImage
                            src={photo.src}
                            alt={photo.alt || `${photo.title} photo by Danil Zanozin`}
                        />
                    </motion.a>
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
