import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Leaf, Users } from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";

interface FarmerLocation {
  _id: string;
  firstName: string;
  lastName: string;
  region: string;
  landArea: string;
  phone: string;
}

interface RegionData {
  name: string;
  x: number;
  y: number;
  farmers: FarmerLocation[];
}

const REGIONS = [
  { name: "وهران", x: 15, y: 25 },
  { name: "الشلف", x: 20, y: 28 },
  { name: "تيبازة", x: 22, y: 30 },
  { name: "الجزائر العاصمة", x: 26, y: 32 },
  { name: "البليدة", x: 28, y: 32 },
  { name: "قسنطينة", x: 48, y: 28 },
  { name: "عنابة", x: 52, y: 18 },
  { name: "بسكرة", x: 45, y: 48 },
  { name: "ورقلة", x: 38, y: 70 },
];

export default function FarmersLocationMap() {
  const [farmers, setFarmers] = useState<FarmerLocation[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionsData, setRegionsData] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setIsLoading(true);
      const allFarmers = await api.admin.getFarmers();
      const approvedFarmers = allFarmers.filter((f: any) => f.status === 'approved' && f.region);
      setFarmers(approvedFarmers);

      const grouped: Record<string, FarmerLocation[]> = {};
      approvedFarmers.forEach((farmer: any) => {
        if (!grouped[farmer.region]) grouped[farmer.region] = [];
        grouped[farmer.region].push(farmer);
      });

      const combined: RegionData[] = REGIONS.map((region) => ({
        ...region,
        farmers: grouped[region.name] || [],
      })).filter((region) => region.farmers.length > 0);

      setRegionsData(combined);
    } catch (e) {
      toast.error("فشل تحميل مواقع الفلاحين");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">الفلاحون</p><div className="text-3xl font-bold text-green-600 mt-1">{farmers.length}</div></div><Users className="w-8 h-8 text-green-600 opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">المناطق</p><div className="text-3xl font-bold text-blue-600 mt-1">{regionsData.length}</div></div><MapPin className="w-8 h-8 text-blue-600 opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">إجمالي الأراضي</p><div className="text-3xl font-bold text-amber-600 mt-1">{farmers.reduce((sum, f) => sum + (parseInt(f.landArea) || 0), 0).toLocaleString()}</div><p className="text-xs text-gray-500">هكتار</p></div><Leaf className="w-8 h-8 text-amber-600 opacity-20" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>خريطة الجزائر - مواقع الفلاحين</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full aspect-[3/5] border rounded-lg bg-blue-50 relative overflow-hidden">
            <svg viewBox="0 0 60 100" className="w-full h-full">
              <path d="M 8 15 L 20 12 L 30 14 L 40 10 L 50 12 L 52 15 L 52 25 L 55 30 L 55 45 L 52 55 L 48 65 L 45 75 L 40 82 L 30 90 L 15 88 L 8 75 L 6 65 L 5 50 L 5 35 L 6 20 Z" fill="#fff" stroke="#ccc" strokeWidth="0.5" />
              {regionsData.map((region) => (
                <g key={region.name} onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)} className="cursor-pointer">
                  <circle cx={region.x} cy={region.y} r={2} fill={selectedRegion === region.name ? "#16a34a" : "#4ade80"} stroke="#fff" strokeWidth="0.2" />
                  <text x={region.x} y={region.y - 3} textAnchor="middle" fontSize="3" className="fill-green-900 font-bold">{region.name}</text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {selectedRegion && (
        <Card>
          <CardHeader><CardTitle>الفلاحون في {selectedRegion}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {regionsData.find(r => r.name === selectedRegion)?.farmers.map(f => (
                <div key={f._id} className="p-3 bg-green-50 rounded border flex justify-between items-center">
                  <div>
                    <p className="font-bold">{f.firstName} {f.lastName}</p>
                    <p className="text-sm text-gray-600">{f.phone}</p>
                  </div>
                  <p className="text-amber-600 font-bold">{f.landArea} هكتار</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
