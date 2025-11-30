export const parseGPX = async (url) => {
    try {
        const response = await fetch(url);
        const str = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(str, "text/xml");
        let pointsList = xmlDoc.getElementsByTagName("trkpt");

        // Fallback to waypoints if no track points found
        if (pointsList.length === 0) {
            pointsList = xmlDoc.getElementsByTagName("wpt");
        }

        const points = [];
        for (let i = 0; i < pointsList.length; i++) {
            const lat = parseFloat(pointsList[i].getAttribute("lat"));
            const lon = parseFloat(pointsList[i].getAttribute("lon"));
            points.push({ lat, lon });
        }

        return points;
    } catch (error) {
        console.error("Error parsing GPX:", error);
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
