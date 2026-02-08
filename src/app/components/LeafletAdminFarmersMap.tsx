import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Leaf, Users } from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [15, 25],
    iconAnchor: [7, 25]
});

interface FarmerLocation {
    _id: string;
    firstName: string;
    lastName: string;
    region: string;
    landArea: string;
    phone: string;
}

export default function LeafletAdminFarmersMap() {
    const [farmers, setFarmers] = useState<FarmerLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFarmers();
    }, []);

    const loadFarmers = async () => {
        try {
            setIsLoading(true);
            const allFarmers = await api.admin.getFarmers();
            const approvedFarmers = allFarmers.filter((f: any) => f.status === 'approved');
            setFarmers(approvedFarmers);
        } catch (e) {
            toast.error("فشل تحميل مواقع الفلاحين");
        } finally {
            setIsLoading(false);
        }
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
                                <div className="text-3xl font-bold text-green-600 mt-1">{farmers.length}</div>
                            </div>
                            <Users className="w-8 h-8 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">إجمالي المساحة</p>
                                <div className="text-3xl font-bold text-amber-600 mt-1">
                                    {farmers.reduce((sum, f) => sum + (parseInt(f.landArea) || 0), 0).toLocaleString()}
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
                                <p className="text-sm text-gray-600">توزيع المناطق</p>
                                <div className="text-xl font-bold text-blue-600 mt-1">خريطة تفاعلية</div>
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
                        توزيع الفلاحين على خريطة الجزائر (OpenStreetMap)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[500px] border-2 border-green-200 rounded-lg relative overflow-hidden z-0">
                        <MapContainer
                            center={[28.0339, 1.6596]}
                            zoom={5}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {farmers.map((farmer) => (
                                <Marker
                                    key={farmer._id}
                                    // Fallback to random variation if coords missing, but here we just use region based mocks if needed
                                    // or just skip if no real coords. For now we center on Algeria cities.
                                    position={[36.7538 + (Math.random() - 0.5) * 5, 3.0588 + (Math.random() - 0.5) * 5]}
                                    icon={DefaultIcon}
                                >
                                    <Popup>
                                        <div className="text-right" dir="rtl">
                                            <h3 className="font-bold text-green-700 m-0">{farmer.firstName} {farmer.lastName}</h3>
                                            <p className="m-1 text-sm">{farmer.region}</p>
                                            <p className="m-0 text-amber-600 font-bold">{farmer.landArea} هكتار</p>
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
