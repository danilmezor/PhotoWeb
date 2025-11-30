export const parseGeoJSON = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();

        let allCoordinates = [];

        // Extract coordinates from all features
        if (data.features && Array.isArray(data.features)) {
            // Sort features by title (e.g., "day_1", "day_2")
            const sortedFeatures = data.features.sort((a, b) => {
                const getDayNum = (feature) => {
                    const title = feature.properties?.title || "";
                    const match = title.match(/day_(\d+)/i);
                    return match ? parseInt(match[1], 10) : 999; // Push unknown to end
                };
                return getDayNum(a) - getDayNum(b);
            });

            sortedFeatures.forEach(feature => {
                if (feature.geometry && feature.geometry.type === 'LineString') {
                    // GeoJSON coordinates are [lon, lat]
                    const coords = feature.geometry.coordinates.map(coord => ({
                        lon: coord[0],
                        lat: coord[1]
                    }));
                    allCoordinates = allCoordinates.concat(coords);
                }
            });
        }

        return allCoordinates;
    } catch (error) {
        console.error("Error parsing GeoJSON:", error);
        return [];
    }
};

export const generateSVGPath = (points, width, height) => {
    if (points.length === 0) return "";

    // Find bounds
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    points.forEach(p => {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lon < minLon) minLon = p.lon;
        if (p.lon > maxLon) maxLon = p.lon;
    });

    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;

    // Add some padding
    const padding = 20;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    // Normalize points to SVG coordinates
    // Note: Latitude increases upwards (Y decreases in SVG), Longitude increases rightwards (X increases in SVG)
    const svgPoints = points.map(p => {
        const x = padding + ((p.lon - minLon) / lonRange) * drawWidth;
        const y = height - (padding + ((p.lat - minLat) / latRange) * drawHeight); // Flip Y for SVG
        return `${x},${y}`;
    });

    return `M ${svgPoints.join(" L ")}`;
};
