const { create } = require('xmlbuilder2');

/**
 * Convert GeoJSON coordinates to KML format
 * @param {Array} lands - Array of land documents with coordinates
 * @returns {string} KML XML string
 */
function landsToKML(lands) {
    const kml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('kml', { xmlns: 'http://www.opengis.net/kml/2.2' })
        .ele('Document')
        .ele('name').txt('منصة الفلاح - الأراضي الفلاحية').up()
        .ele('description').txt('خريطة الأراضي الفلاحية المسجلة في منصة الفلاح الوطنية').up();

    // Add styles for different farm sizes
    kml.ele('Style', { id: 'smallFarm' })
        .ele('LineStyle')
        .ele('color').txt('ff34d399').up()
        .ele('width').txt('3').up().up()
        .ele('PolyStyle')
        .ele('color').txt('6634d399').up().up().up();

    kml.ele('Style', { id: 'mediumFarm' })
        .ele('LineStyle')
        .ele('color').txt('ff10b981').up()
        .ele('width').txt('3').up().up()
        .ele('PolyStyle')
        .ele('color').txt('6610b981').up().up().up();

    kml.ele('Style', { id: 'largeFarm' })
        .ele('LineStyle')
        .ele('color').txt('ff059669').up()
        .ele('width').txt('3').up().up()
        .ele('PolyStyle')
        .ele('color').txt('66059669').up().up().up();

    // Add placemarks for each land
    lands.forEach(land => {
        if (!land.coordinates || land.coordinates.length < 3) return;

        const farmerName = typeof land.user === 'object'
            ? `${land.user.firstName} ${land.user.lastName}`
            : 'فلاح';

        const area = land.area || 0;
        const styleUrl = area > 50 ? '#largeFarm' : area > 20 ? '#mediumFarm' : '#smallFarm';

        const placemark = kml.ele('Placemark');
        placemark.ele('name').txt(land.name || 'أرض فلاحية').up();

        // Description with farm details
        const description = `
            <![CDATA[
                <h3>${farmerName}</h3>
                <p><strong>المستغلة:</strong> ${land.name || 'غير محدد'}</p>
                <p><strong>الموقع:</strong> ${land.location || 'غير محدد'}</p>
                <p><strong>المساحة:</strong> ${area.toFixed(2)} هكتار</p>
                ${typeof land.user === 'object' && land.user.phone ? `<p><strong>الهاتف:</strong> ${land.user.phone}</p>` : ''}
                ${typeof land.user === 'object' && land.user.region ? `<p><strong>الولاية:</strong> ${land.user.region}</p>` : ''}
                ${land.soilType ? `<p><strong>نوع التربة:</strong> ${land.soilType}</p>` : ''}
            ]]>
        `;
        placemark.ele('description').txt(description).up();
        placemark.ele('styleUrl').txt(styleUrl).up();

        // Create polygon
        const polygon = placemark.ele('Polygon')
            .ele('extrude').txt('1').up()
            .ele('altitudeMode').txt('clampToGround').up()
            .ele('outerBoundaryIs')
            .ele('LinearRing')
            .ele('coordinates');

        // Add coordinates (KML uses lon,lat,altitude format)
        const coordsString = land.coordinates.map(coord =>
            `${coord.lng},${coord.lat},0`
        ).join(' ');

        polygon.txt(coordsString);
    });

    return kml.end({ prettyPrint: true });
}

/**
 * Convert a single land to KML
 * @param {Object} land - Land document with coordinates
 * @returns {string} KML XML string
 */
function landToKML(land) {
    return landsToKML([land]);
}

/**
 * Parse KML string and extract polygon coordinates
 * @param {string} kmlString - KML XML string
 * @returns {Array} Array of land objects with coordinates
 */
function parseKMLToLands(kmlString) {
    const lands = [];

    try {
        // Simple regex-based parser for KML (for basic polygon extraction)
        const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
        const nameRegex = /<name>(.*?)<\/name>/;
        const coordsRegex = /<coordinates>([\s\S]*?)<\/coordinates>/;

        let match;
        while ((match = placemarkRegex.exec(kmlString)) !== null) {
            const placemarkContent = match[1];

            const nameMatch = nameRegex.exec(placemarkContent);
            const coordsMatch = coordsRegex.exec(placemarkContent);

            if (coordsMatch) {
                const coordsText = coordsMatch[1].trim();
                const coordPairs = coordsText.split(/\s+/);

                const coordinates = coordPairs
                    .map(pair => {
                        const parts = pair.split(',');
                        if (parts.length >= 2) {
                            return {
                                lng: parseFloat(parts[0]),
                                lat: parseFloat(parts[1])
                            };
                        }
                        return null;
                    })
                    .filter(coord => coord && !isNaN(coord.lat) && !isNaN(coord.lng));

                if (coordinates.length >= 3) {
                    lands.push({
                        name: nameMatch ? nameMatch[1] : 'أرض مستوردة من KML',
                        coordinates: coordinates,
                        area: calculatePolygonArea(coordinates)
                    });
                }
            }
        }
    } catch (error) {
        console.error('KML parsing error:', error);
        throw new Error('فشل في تحليل ملف KML');
    }

    return lands;
}

/**
 * Calculate polygon area in hectares using Shoelace formula
 * @param {Array} coordinates - Array of {lat, lng} objects
 * @returns {number} Area in hectares
 */
function calculatePolygonArea(coordinates) {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const earthRadius = 6371000; // meters

    for (let i = 0; i < coordinates.length; i++) {
        const j = (i + 1) % coordinates.length;
        const lat1 = coordinates[i].lat * Math.PI / 180;
        const lat2 = coordinates[j].lat * Math.PI / 180;
        const lng1 = coordinates[i].lng * Math.PI / 180;
        const lng2 = coordinates[j].lng * Math.PI / 180;

        area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area * earthRadius * earthRadius / 2);
    return area / 10000; // Convert to hectares
}

module.exports = {
    landsToKML,
    landToKML,
    parseKMLToLands,
    calculatePolygonArea
};
