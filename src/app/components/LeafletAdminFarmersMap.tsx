import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup, LayersControl, Marker } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Leaf, Users } from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons if needed elsewhere
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface LandInfo {
    _id: string;
    name: string;
    area: number;
    location: string;
    coordinates: { lat: number, lng: number }[];
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
}

export default function LeafletAdminFarmersMap() {
    const [lands, setLands] = useState<LandInfo[]>([]);
    const [farmersWithLocation, setFarmersWithLocation] = useState<any[]>([]);
    const [stats, setStats] = useState({ approvedFarmers: 0, totalArea: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMapData();
    }, []);

    const loadMapData = async () => {
        try {
            setIsLoading(true);
            const data = await api.admin.getFullData();

            // 1. Get approved farmers
            const approvedFarmers = data.farmers.filter((f: any) => f.status === 'approved');
            const approvedFarmerIds = new Set(approvedFarmers.map((f: any) => f._id));

            // 2. Filter lands (Polygons)
            const validLands = data.lands.filter((l: any) => {
                // Handle both populated and unpopulated user field
                const userId = typeof l.user === 'object' ? l.user?._id : l.user;
                return (
                    l.coordinates &&
                    l.coordinates.length > 2 &&
                    approvedFarmerIds.has(userId)
                );
            });

            // 3. Filter farmers with point locations (Markers)
            const validMarkers = approvedFarmers.filter((f: any) => f.lat && f.lng);

            setLands(validLands);
            setFarmersWithLocation(validMarkers);
            setStats({
                approvedFarmers: approvedFarmers.length,
                totalArea: validLands.reduce((sum: number, l: any) => sum + (l.area || 0), 0)
            });
        } catch (e) {
            toast.error("فشل تحميل بيانات الخريطة");
        } finally {
            setIsLoading(false);
        }
    };

    const getPolygonPath = (coords: { lat: number, lng: number }[]) => {
        return coords.map(c => [c.lat, c.lng] as [number, number]);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-arabic">جاري التحميل...</div>;

    return (
        <div className="space-y-6 font-arabic" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">الفلاحون المعتمدون</p>
                                <div className="text-3xl font-bold text-green-600 mt-1">{stats.approvedFarmers}</div>
                            </div>
                            <Users className="w-8 h-8 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">إجمالي مساحة الأراضي</p>
                                <div className="text-3xl font-bold text-amber-600 mt-1">
                                    {stats.totalArea.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500">هكتار</p>
                            </div>
                            <Leaf className="w-8 h-8 text-amber-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">الأراضي الممسوحة</p>
                                <div className="text-3xl font-bold text-blue-600 mt-1">{lands.length}</div>
                                <p className="text-xs text-gray-500">{farmersWithLocation.length} مواقع نقطية</p>
                            </div>
                            <MapPin className="w-8 h-8 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="text-green-600" />
                        خارطة الأراضي الفلاحية الوطنية (الجزائر)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[600px] border-2 border-green-200 rounded-lg relative overflow-hidden z-0">
                        <MapContainer
                            center={[28.0339, 1.6596]}
                            zoom={6}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LayersControl position="topright">
                                <LayersControl.BaseLayer checked name="خريطة الشوارع">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                </LayersControl.BaseLayer>
                                <LayersControl.BaseLayer name="خريطة القمر الصناعي">
                                    <TileLayer
                                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    />
                                </LayersControl.BaseLayer>
                            </LayersControl>

                            {/* Draw Land Polygons */}
                            {lands.map((land) => (
                                <Polygon
                                    key={land._id}
                                    positions={getPolygonPath(land.coordinates)}
                                    pathOptions={{
                                        color: '#16a34a',
                                        fillColor: '#22c55e',
                                        fillOpacity: 0.5,
                                        weight: 2
                                    }}
                                >
                                    <Popup>
                                        <div className="text-right font-arabic" dir="rtl">
                                            <h3 className="font-bold text-green-700 m-0">
                                                {typeof land.user === 'object' ? `${land.user.firstName} ${land.user.lastName}` : 'فلاح'}
                                            </h3>
                                            <p className="m-1 text-sm font-bold text-gray-700">المستغلة: {land.name || 'بدون اسم'}</p>
                                            <p className="m-1 text-sm text-gray-600">الموقع: {land.location}</p>
                                            <p className="m-0 text-amber-600 font-bold">{land.area} هكتار</p>
                                            {typeof land.user === 'object' && (
                                                <p className="mt-2 text-xs text-blue-600">الهاتف: {land.user.phone}</p>
                                            )}
                                        </div>
                                    </Popup>
                                </Polygon>
                            ))}

                            {/* Draw Fallback Markers for Farmers without detailed land polygons */}
                            {farmersWithLocation.map((farmer) => (
                                <Marker
                                    key={`marker-${farmer._id}`}
                                    position={[farmer.lat, farmer.lng]}
                                    icon={DefaultIcon}
                                >
                                    <Popup>
                                        <div className="text-right font-arabic" dir="rtl">
                                            <h3 className="font-bold text-green-700 m-0">{farmer.firstName} {farmer.lastName}</h3>
                                            <p className="m-1 text-sm">{farmer.region}</p>
                                            <p className="m-0 text-amber-600 font-bold">{farmer.landArea} هكتار (إجمالي)</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
