import React, { useState, useEffect, useMemo } from 'react';
import Lightbox from './Lightbox';
import PhotoImage from './PhotoImage';
import '../styles/MasonryGallery.css';

const getColumnCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.matchMedia('(max-width: 600px)').matches) return 1;
    if (window.matchMedia('(max-width: 1024px)').matches) return 2;
    return 3;
};

const MasonryGallery = ({ photos }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [columnCount, setColumnCount] = useState(getColumnCount);

    useEffect(() => {
        const handleResize = () => setColumnCount(getColumnCount());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = useMemo(() => {
        const cols = Array.from({ length: columnCount }, () => []);
        photos.forEach((photo, index) => {
            cols[index % columnCount].push({ photo, globalIndex: index });
        });
        return cols;
    }, [photos, columnCount]);

    return (
        <>
            <div className="masonry">
                {columns.map((col, colIndex) => (
                    <div className="masonry-column" key={colIndex}>
                        {col.map(({ photo, globalIndex }) => (
                            <div
                                key={photo.id}
                                className="masonry-item"
                                onClick={() => setSelectedIndex(globalIndex)}
                            >
                                <PhotoImage src={photo.src} alt={photo.alt} />
                            </div>
                        ))}
                    </div>
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

export default MasonryGallery;
