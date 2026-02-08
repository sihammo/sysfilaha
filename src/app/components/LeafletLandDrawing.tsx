import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { Button } from "./ui/button";
import { Trash2, Save, Map as MapIcon } from "lucide-react";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Point {
    lat: number;
    lng: number;
}

interface LeafletLandDrawingProps {
    initialCoordinates?: Point[];
    onSave: (coordinates: Point[], area: number) => void;
    onCancel: () => void;
}

// Internal component to handle drawing logic with the map instance
function GeomanControl({ onPolygonChange, initialCoordinates }: {
    onPolygonChange: (coords: Point[], area: number) => void,
    initialCoordinates?: Point[]
}) {
    const map = useMap();
    const featureGroupRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

    useEffect(() => {
        featureGroupRef.current.addTo(map);

        // Load initial polygon if exists
        if (initialCoordinates && initialCoordinates.length > 0) {
            const latlngs = initialCoordinates.map(p => [p.lat, p.lng] as L.LatLngExpression);
            const poly = L.polygon(latlngs, {
                color: "#16a34a",
                fillColor: "#22c55e",
                fillOpacity: 0.4,
            });
            poly.addTo(featureGroupRef.current);
            map.fitBounds(poly.getBounds());
        }

        map.pm.addControls({
            position: "topleft",
            drawMarker: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawCircle: false,
            drawPolygon: true,
            editMode: true,
            dragMode: true,
            cutPolygon: false,
            removalMode: true,
        });

        map.pm.setLang("ar");

        const calculateAndNotify = (layer: any) => {
            if (layer instanceof L.Polygon) {
                const geojson = layer.toGeoJSON();
                const areaInSqMeters = turf.area(geojson);
                const areaInHectares = areaInSqMeters / 10000;

                const latlngs = layer.getLatLngs()[0] as L.LatLng[];
                const coords = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));

                onPolygonChange(coords, parseFloat(areaInHectares.toFixed(2)));
            }
        };

        map.on("pm:create", (e) => {
            // Allow only one polygon
            featureGroupRef.current.clearLayers();
            const layer = e.layer;
            layer.addTo(featureGroupRef.current);
            calculateAndNotify(layer);

            layer.on("pm:edit", () => calculateAndNotify(layer));
            layer.on("pm:update", () => calculateAndNotify(layer));
            layer.on("pm:dragend", () => calculateAndNotify(layer));
        });

        map.on("pm:remove", () => {
            onPolygonChange([], 0);
        });

        return () => {
            map.pm.removeControls();
            map.off("pm:create");
            map.off("pm:remove");
        };
    }, [map]);

    return null;
}

export default function LeafletLandDrawing({ initialCoordinates, onSave, onCancel }: LeafletLandDrawingProps) {
    const [coords, setCoords] = useState<Point[]>(initialCoordinates || []);
    const [area, setArea] = useState<number>(0);

    const handlePolygonChange = (newCoords: Point[], newArea: number) => {
        setCoords(newCoords);
        setArea(newArea);
    };

    const handleSave = () => {
        if (coords.length < 3) return;
        onSave(coords, area);
    };

    return (
        <div className="flex flex-col h-[600px] gap-4" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {coords.length === 0 ? (
                        <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded">استخدم أداة الرسم لتحديد حدود أرضك (OpenStreetMap)</p>
                    ) : (
                        <div className="bg-green-100 p-2 rounded flex items-center gap-2">
                            <span className="font-bold text-green-700">المساحة: {area} هكتار</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>إلغاء</Button>
                    <Button onClick={handleSave} disabled={coords.length < 3} className="bg-green-600 hover:bg-green-700 gap-2 font-arabic">
                        <Save className="w-4 h-4" /> حفظ الأرض
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative rounded-lg overflow-hidden border-2 border-green-200 z-0">
                <MapContainer
                    center={[28.0339, 1.6596]}
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <GeomanControl
                        onPolygonChange={handlePolygonChange}
                        initialCoordinates={initialCoordinates}
                    />
                </MapContainer>
            </div>

            <div className="text-xs text-gray-500 text-center font-arabic">
                💡 اختر أيقونة المضلع في الفوق، ثم اضغط على الخريطة لرسم الحدود. يمكنك تحريك النقاط لتعديلها.
            </div>
        </div>
    );
}
