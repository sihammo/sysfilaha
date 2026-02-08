import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, LayersControl, LayerGroup } from "react-leaflet";
import { Button } from "./ui/button";
import { Trash2, Save, Map as MapIcon, Crosshair, MapPin } from "lucide-react";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

// Fix for default marker icons in Leaflet
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

// Locate Me Component
function LocateControl() {
    const map = useMap();
    const [locating, setLocating] = useState(false);

    const handleLocate = () => {
        setLocating(true);
        map.locate({ setView: true, maxZoom: 16 });
    };

    useEffect(() => {
        map.on('locationfound', (e) => {
            setLocating(false);
            L.marker(e.latlng).addTo(map).bindPopup("أنت هنا").openPopup();
        });
        map.on('locationerror', () => {
            setLocating(false);
            alert("فشل تحديد الموقع. تأكد من تفعيل GPS.");
        });
    }, [map]);

    return (
        <div className="leaflet-top leaflet-right" style={{ marginTop: "80px", marginRight: "10px" }}>
            <div className="leaflet-control leaflet-bar">
                <button
                    onClick={(e) => { e.preventDefault(); handleLocate(); }}
                    className="bg-white p-2 hover:bg-gray-100 flex items-center justify-center border-none cursor-pointer"
                    title="حدد موقعي الحالي"
                    disabled={locating}
                >
                    <Crosshair className={`w-5 h-5 ${locating ? "text-blue-500 animate-pulse" : "text-gray-700"}`} />
                </button>
            </div>
        </div>
    );
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

            // Calculate initial area
            const geojson = poly.toGeoJSON();
            const areaInSqMeters = turf.area(geojson);
            onPolygonChange(initialCoordinates, areaInSqMeters / 10000);
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

                const latlngs = (layer.getLatLngs()[0] as L.LatLng[]);
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
        <div className="flex flex-col h-[700px] gap-4" dir="rtl">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                <div className="flex flex-col">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5" /> رسم حدود الأرض الحقيقية
                    </h3>
                    {coords.length === 0 ? (
                        <p className="text-xs text-gray-500">اختر أداة المضلع (Polygon) في الأعلى وابدأ الرسم على الخريطة</p>
                    ) : (
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm animate-in zoom-in">
                                المساحة المحددة: {area} هكتار
                            </span>
                            <span className="text-xs text-gray-400">({coords.length} نقاط إحداثية)</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel} className="rounded-lg">إلغاء</Button>
                    <Button
                        onClick={handleSave}
                        disabled={coords.length < 3}
                        className="bg-green-600 hover:bg-green-700 gap-2 font-arabic rounded-lg shadow-md px-6 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" /> حفظ الأرض
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative rounded-2xl overflow-hidden border-4 border-white shadow-xl z-0 group">
                <MapContainer
                    center={[36.0, 3.0]} // North Algeria for better detail initially
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="خريطة الشوارع (Real Roads)">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="خريطة القمر الصناعي (Satellite View)">
                            <LayerGroup>
                                <TileLayer
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                />
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                                />
                            </LayerGroup>
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="خريطة التضاريس (Terrain View)">
                            <TileLayer
                                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <LocateControl />

                    <GeomanControl
                        onPolygonChange={handlePolygonChange}
                        initialCoordinates={initialCoordinates}
                    />
                </MapContainer>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 text-right font-arabic">
                <p className="font-bold mb-1 underline">💡 طريقة الاستخدام:</p>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                    <li>اضغط على <b>أيقونة المضلع</b> (أول أيقونة من اليسار) لبدء الرسم.</li>
                    <li>اضغط على <b>أيقونة الموقع</b> (على اليمين) لإيجاد مكانك الحالي بالـ GPS.</li>
                    <li>يمكنك التبديل بين <b>خريطة القمر الصناعي</b> و<b>خريطة الطرق</b> من الزاوية العلوية اليمنى.</li>
                    <li>بعد الرسم، يمكنك سحب النقاط لتعديل الحدود أو استخدام الممحاة للحذف.</li>
                </ul>
            </div>
        </div>
    );
}
