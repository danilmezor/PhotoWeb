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

// Project the trail to an SVG path that preserves the route's real-world
// proportions. Returns { d, width, height } — the caller sets the SVG viewBox
// to width×height so the shape is never stretched to fit a fixed aspect box.
// A wide east-west trail stays wide; a tall north-south trail stays tall.
export const generateSVGPath = (points, padding = 20) => {
    const empty = { d: "", width: 0, height: 0 };
    if (points.length === 0) return empty;

    // Find bounds
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    points.forEach(p => {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lon < minLon) minLon = p.lon;
        if (p.lon > maxLon) maxLon = p.lon;
    });

    // Equirectangular projection: at this latitude a degree of longitude spans
    // less ground than a degree of latitude, so compress lon by cos(lat) to
    // keep the aspect ratio true (otherwise an E-W trail looks stretched).
    const midLat = (minLat + maxLat) / 2;
    const lonScale = Math.cos((midLat * Math.PI) / 180);
    const projWidth = (maxLon - minLon) * lonScale;
    const projHeight = maxLat - minLat;
    if (projWidth === 0 && projHeight === 0) return empty;

    // Normalize the longer side to a fixed unit count; the viewBox scales to fit.
    const SCALE = 1000 / Math.max(projWidth, projHeight);
    const drawWidth = projWidth * SCALE;
    const drawHeight = projHeight * SCALE;

    // Latitude increases upwards (Y decreases in SVG); longitude rightwards.
    const svgPoints = points.map(p => {
        const x = padding + (p.lon - minLon) * lonScale * SCALE;
        const y = padding + (maxLat - p.lat) * SCALE; // Flip Y for SVG
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return {
        d: `M ${svgPoints.join(" L ")}`,
        width: +(drawWidth + padding * 2).toFixed(2),
        height: +(drawHeight + padding * 2).toFixed(2),
    };
};
