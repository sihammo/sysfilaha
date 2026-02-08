import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup, LayersControl, Marker, Circle } from "react-leaflet";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin, Leaf, Users, Navigation, Phone, AlertCircle, Download } from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "../utils/cn";

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom green icon for farmers with land polygons
let FarmerIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    className: 'farmer-marker'
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
        region?: string;
        landArea?: number;
    };
}

export default function LeafletAdminFarmersMap() {
    const [lands, setLands] = useState<LandInfo[]>([]);
    const [farmersWithLocation, setFarmersWithLocation] = useState<any[]>([]);
    const [stats, setStats] = useState({ approvedFarmers: 0, totalArea: 0, landsWithPolygons: 0, farmersWithMarkers: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMapData();
    }, []);

    const loadMapData = async () => {
        try {
            setIsLoading(true);
            const data = await api.admin.getFullData();

            // --- DEBUG START ---
            console.group("📍 Admin Map Data Debug");
            console.log("Raw Response:", data);
            console.log("Total Farmers:", data.farmers?.length);
            console.log("Total Lands:", data.lands?.length);

            // Check sample land
            if (data.lands?.length > 0) {
                console.log("Sample First Land:", data.lands[0]);
                console.log("Land Coordinates Type:", typeof data.lands[0].coordinates);
                console.log("Land User Field:", data.lands[0].user);
            } else {
                console.warn("⚠️ No lands found in response!");
            }
            console.groupEnd();
            // --- DEBUG END ---

            console.log('📍 Full data received:', data);

            // 1. Get approved farmers
            const approvedFarmers = data.farmers.filter((f: any) => f.status === 'approved');
            // FIX: Convert IDs to string for reliable comparison
            const approvedFarmerIds = new Set(approvedFarmers.map((f: any) => String(f._id)));

            console.log('✅ Approved farmers:', approvedFarmers.length);
            console.log('📋 All lands:', data.lands.length);

            // 2. Filter lands (Polygons) - only for approved farmers with valid coordinates
            const validLands = data.lands.filter((l: any) => {
                // Handle both populated and unpopulated user field
                // FIX: Convert ID to string for lookup
                const rawUserId = typeof l.user === 'object' ? l.user?._id : l.user;
                const userId = String(rawUserId);
                const userObj = typeof l.user === 'object' ? l.user : null;
                const hasValidCoords = l.coordinates && Array.isArray(l.coordinates) && l.coordinates.length > 2;
                const isApproved = approvedFarmerIds.has(userId);

                if (!hasValidCoords) {
                    console.warn(`⚠️ Skipped Land "${l.name}": Invalid coordinates (${l.coordinates?.length || 0})`);
                } else if (!isApproved) {
                    console.warn(`⚠️ Skipped Land "${l.name}": Farmer (${userId}) not approved. Status: ${userObj?.status || 'unknown'}`);
                }

                return hasValidCoords && isApproved;
            });

            console.log('🗺️ Valid lands with polygons:', validLands.length);
            validLands.forEach((land: any) => {
                console.log('  - Land:', land.name, 'Coords:', land.coordinates?.length, 'User:', land.user?.firstName);
            });

            // 3. Filter farmers with point locations (Markers) - only those WITHOUT land polygons
            const farmerIdsWithPolygons = new Set(validLands.map((l: any) =>
                String(typeof l.user === 'object' ? l.user?._id : l.user)
            ));

            const validMarkers = approvedFarmers.filter((f: any) => {
                const hasLocation = f.lat && f.lng;
                const hasNoPolygon = !farmerIdsWithPolygons.has(String(f._id));
                return hasLocation && hasNoPolygon;
            });

            console.log('📍 Farmers with marker locations (no polygons):', validMarkers.length);

            setLands(validLands);
            setFarmersWithLocation(validMarkers);
            setStats({
                approvedFarmers: approvedFarmers.length,
                totalArea: validLands.reduce((sum: number, l: any) => sum + (l.area || 0), 0),
                landsWithPolygons: validLands.length,
                farmersWithMarkers: validMarkers.length
            });

            if (validLands.length === 0 && validMarkers.length === 0) {
                toast.info('لا توجد بيانات موقع للفلاحين المعتمدين حالياً');
            }
        } catch (e: any) {
            console.error('❌ Map data error:', e);
            toast.error("فشل تحميل بيانات الخريطة: " + (e.message || 'خطأ غير معروف'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportKML = async () => {
        try {
            toast.loading('جاري تصدير ملف KML...');
            await api.admin.exportKML();
            toast.success('تم تصدير ملف KML بنجاح');
        } catch (error: any) {
            toast.error(error.message || 'فشل تصدير ملف KML');
        }
    };

    const getPolygonPath = (coords: { lat: number, lng: number }[]) => {
        return coords.map(c => [c.lat, c.lng] as [number, number]);
    };

    const getPolygonColor = (area: number) => {
        if (area > 50) return '#059669'; // Large farms - dark green
        if (area > 20) return '#10b981'; // Medium farms - green
        return '#34d399'; // Small farms - light green
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center" dir="rtl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
                    <div className="h-64 bg-slate-100 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in-fade" dir="rtl">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-none bg-gradient-to-br from-emerald-50 to-white rounded-[2rem] shadow-sm border border-emerald-100">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">الفلاحون المعتمدون</p>
                                    <div className="text-4xl font-black text-emerald-600">{stats.approvedFarmers}</div>
                                </div>
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                    <Users className="w-7 h-7 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-none bg-gradient-to-br from-amber-50 to-white rounded-[2rem] shadow-sm border border-amber-100">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">إجمالي المساحة</p>
                                    <div className="text-4xl font-black text-amber-600">{stats.totalArea.toFixed(1)}</div>
                                    <p className="text-xs font-bold text-slate-400 mt-1">هكتار</p>
                                </div>
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                                    <Leaf className="w-7 h-7 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-none bg-gradient-to-br from-blue-50 to-white rounded-[2rem] shadow-sm border border-blue-100">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">الأراضي الممسوحة</p>
                                    <div className="text-4xl font-black text-blue-600">{stats.landsWithPolygons}</div>
                                    <p className="text-xs font-bold text-slate-400 mt-1">قطعة أرضية</p>
                                </div>
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Navigation className="w-7 h-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-none bg-gradient-to-br from-purple-50 to-white rounded-[2rem] shadow-sm border border-purple-100">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">مواقع نقطية</p>
                                    <div className="text-4xl font-black text-purple-600">{stats.farmersWithMarkers}</div>
                                    <p className="text-xs font-bold text-slate-400 mt-1">موقع</p>
                                </div>
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <MapPin className="w-7 h-7 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Map Card */}
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[3rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <MapPin className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-black text-slate-900">خارطة الأراضي الفلاحية الوطنية</CardTitle>
                                <p className="text-slate-500 font-medium mt-1">توزيع المستثمرات الفلاحية عبر التراب الوطني</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {lands.length === 0 && farmersWithLocation.length === 0 ? (
                        <div className="py-24 text-center">
                            <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-slate-300 mb-2">لا توجد بيانات موقع</h3>
                            <p className="text-slate-400 font-medium">لم يقم أي فلاح <u>معتمد</u> بتحديد موقع أراضيه بعد.</p>
                            <p className="text-xs text-slate-400 mt-2">تأكد من الموافقة على الفلاحين الجدد في لوحة التحكم.</p>
                        </div>
                    ) : (
                        <div className="w-full h-[700px] relative overflow-hidden">
                            <MapContainer
                                center={[28.0339, 1.6596]}
                                zoom={6}
                                style={{ height: "100%", width: "100%" }}
                                scrollWheelZoom={true}
                            >
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="خريطة الشوارع">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="خريطة القمر الصناعي">
                                        <TileLayer
                                            attribution='Tiles &copy; Esri'
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        />
                                    </LayersControl.BaseLayer>
                                </LayersControl>

                                {/* Draw Land Polygons */}
                                {lands.map((land) => {
                                    const color = getPolygonColor(land.area);
                                    return (
                                        <Polygon
                                            key={land._id}
                                            positions={getPolygonPath(land.coordinates)}
                                            pathOptions={{
                                                color: color,
                                                fillColor: color,
                                                fillOpacity: 0.4,
                                                weight: 3
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-right font-arabic p-2" dir="rtl">
                                                    <h3 className="font-black text-emerald-700 text-lg mb-2">
                                                        {typeof land.user === 'object' ? `${land.user.firstName} ${land.user.lastName}` : 'فلاح'}
                                                    </h3>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-700">
                                                            <span className="text-slate-500">المستغلة:</span> {land.name || 'بدون اسم'}
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            <span className="text-slate-500">الموقع:</span> {land.location}
                                                        </p>
                                                        <p className="text-lg font-black text-amber-600 mt-2">
                                                            {land.area.toFixed(2)} هكتار
                                                        </p>
                                                        {typeof land.user === 'object' && land.user.phone && (
                                                            <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1 justify-end">
                                                                <span>{land.user.phone}</span>
                                                                <Phone className="w-3 h-3" />
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Polygon>
                                    );
                                })}

                                {/* Draw Fallback Markers for Farmers without detailed land polygons */}
                                {farmersWithLocation.map((farmer) => (
                                    <Marker
                                        key={`marker-${farmer._id}`}
                                        position={[farmer.lat, farmer.lng]}
                                        icon={FarmerIcon}
                                    >
                                        <Popup>
                                            <div className="text-right font-arabic p-2" dir="rtl">
                                                <h3 className="font-black text-emerald-700 text-lg mb-2">
                                                    {farmer.firstName} {farmer.lastName}
                                                </h3>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-slate-700">
                                                        <span className="text-slate-500">المنطقة:</span> {farmer.region || 'غير محدد'}
                                                    </p>
                                                    {farmer.landArea && (
                                                        <p className="text-lg font-black text-amber-600 mt-2">
                                                            {farmer.landArea} هكتار (إجمالي)
                                                        </p>
                                                    )}
                                                    {farmer.phone && (
                                                        <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1 justify-end">
                                                            <span>{farmer.phone}</span>
                                                            <Phone className="w-3 h-3" />
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-none bg-slate-50 rounded-2xl">
                <CardContent className="p-6">
                    <h4 className="font-black text-slate-900 mb-4">دليل الألوان</h4>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: '#34d399' }}></div>
                            <span className="text-sm font-bold text-slate-600">أراضي صغيرة (&lt; 20 هكتار)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: '#10b981' }}></div>
                            <span className="text-sm font-bold text-slate-600">أراضي متوسطة (20-50 هكتار)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: '#059669' }}></div>
                            <span className="text-sm font-bold text-slate-600">أراضي كبيرة (&gt; 50 هكتار)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
