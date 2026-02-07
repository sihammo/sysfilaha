import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Leaf, Users } from "lucide-react";

interface FarmerLocation {
  farmerId: string;
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
  // الشمال الغربي
  { name: "وهران", x: 15, y: 25 },
  { name: "الشلف", x: 20, y: 28 },
  { name: "تيبازة", x: 22, y: 30 },
  { name: "الجزائر العاصمة", x: 26, y: 32 },
  { name: "سيدي بليدة", x: 25, y: 35 },
  { name: "عين الدفلة", x: 20, y: 38 },
  
  // الشمال الوسط
  { name: "الغليزان", x: 18, y: 32 },
  { name: "معسكر", x: 17, y: 34 },
  { name: "تيسمسيلت", x: 22, y: 36 },
  { name: "سعيدة", x: 19, y: 40 },
  { name: "الجلفة", x: 28, y: 42 },
  
  // الشمال الشرقي
  { name: "الشرقية", x: 35, y: 24 },
  { name: "جيجل", x: 42, y: 22 },
  { name: "بجاية", x: 40, y: 24 },
  { name: "تيزي وزو", x: 36, y: 26 },
  { name: "البويرة", x: 34, y: 30 },
  { name: "البليدة", x: 28, y: 32 },
  { name: "بومرداس", x: 30, y: 31 },
  { name: "قسنطينة", x: 48, y: 28 },
  { name: "سكيكدة", x: 46, y: 20 },
  { name: "عنابة", x: 52, y: 18 },
  
  // الوسط
  { name: "مسيلة", x: 38, y: 38 },
  { name: "برج بوعريريج", x: 32, y: 34 },
  { name: "متيجة", x: 32, y: 36 },
  { name: "بسكرة", x: 45, y: 48 },
  
  // الجنوب الغربي
  { name: "إدرار", x: 12, y: 60 },
  { name: "عين صالح", x: 20, y: 62 },
  { name: "أدرار الصحراء", x: 10, y: 70 },
  { name: "تندوف", x: 8, y: 75 },
  
  // الجنوب الوسط
  { name: "النعامية", x: 18, y: 68 },
  { name: "البيض", x: 24, y: 65 },
  { name: "أفلو", x: 26, y: 58 },
  { name: "الواحات", x: 28, y: 72 },
  { name: "ورقلة", x: 38, y: 70 },
  { name: "حاسي مسعود", x: 42, y: 72 },
  
  // الجنوب الشرقي
  { name: "إليزي", x: 48, y: 80 },
  { name: "تمنراست", x: 35, y: 88 },
];

export default function FarmersLocationMap() {
  const [farmers, setFarmers] = useState<FarmerLocation[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionsData, setRegionsData] = useState<RegionData[]>([]);

  useEffect(() => {
    // Load all approved farmers and their locations
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const approvedFarmers = users.filter(
      (user: any) =>
        user.role === "farmer" &&
        user.approved &&
        user.region &&
        user.status !== "rejected"
    );

    setFarmers(approvedFarmers);

    // Group farmers by region
    const grouped: Record<string, FarmerLocation[]> = {};
    approvedFarmers.forEach((farmer: any) => {
      if (!grouped[farmer.region]) {
        grouped[farmer.region] = [];
      }
      grouped[farmer.region].push({
        farmerId: farmer.id,
        firstName: farmer.firstName,
        lastName: farmer.lastName,
        region: farmer.region,
        landArea: farmer.landArea || "غير محدد",
        phone: farmer.phone || "غير متوفر",
      });
    });

    // Combine with region coordinates
    const combined: RegionData[] = REGIONS.map((region) => ({
      ...region,
      farmers: grouped[region.name] || [],
    })).filter((region) => region.farmers.length > 0); // Only show regions with farmers

    setRegionsData(combined);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد الفلاحين</p>
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
                <p className="text-sm text-gray-600">المناطق المخدومة</p>
                <div className="text-3xl font-bold text-blue-600 mt-1">{regionsData.length}</div>
              </div>
              <MapPin className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأراضي</p>
                <div className="text-3xl font-bold text-amber-600 mt-1">
                  {farmers
                    .reduce((sum, f) => {
                      const area = parseInt(f.landArea) || 0;
                      return sum + area;
                    }, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">هكتار</p>
              </div>
              <Leaf className="w-8 h-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            خريطة الجزائر - مواقع الفلاحين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-auto border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-b from-blue-200 to-green-100">
            <svg viewBox="0 0 60 100" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Algeria map outline - simplified shape */}
              <defs>
                <pattern id="grid2" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e0e0e0" strokeWidth="0.2" />
                </pattern>
                <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4AB8FF" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Background */}
              <rect width="60" height="100" fill="url(#grid2)" />
              <rect width="60" height="100" fill="url(#seaGradient)" />

              {/* Simplified Algeria outline */}
              <path
                d="M 8 15 L 20 12 L 30 14 L 40 10 L 50 12 L 52 15 L 52 25 L 55 30 L 55 45 L 52 55 L 48 65 L 45 75 L 40 82 L 30 90 L 15 88 L 8 75 L 6 65 L 5 50 L 5 35 L 6 20 Z"
                fill="#e8f5e9"
                stroke="#2f7d32"
                strokeWidth="0.5"
                opacity="0.3"
              />

              {/* Regions with farmers - circles and labels */}
              {regionsData.map((region) => (
                <g key={region.name}>
                  {/* Interactive circle */}
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r={Math.min(2.5, region.farmers.length * 0.4 + 1)}
                    fill={selectedRegion === region.name ? "#1b5e20" : "#2f7d32"}
                    opacity={selectedRegion === region.name ? 1 : 0.7}
                    stroke={selectedRegion === region.name ? "#fff" : "#1b5e20"}
                    strokeWidth={selectedRegion === region.name ? "0.4" : "0.2"}
                    className="cursor-pointer hover:opacity-100 transition-all duration-200"
                    onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                  />

                  {/* Count badge */}
                  <text
                    x={region.x}
                    y={region.y + 0.2}
                    textAnchor="middle"
                    className="fill-white font-bold pointer-events-none"
                    fontSize="5"
                    fontWeight="bold"
                  >
                    {region.farmers.length}
                  </text>

                  {/* Label (always visible for selected, hover for others) */}
                  {selectedRegion === region.name && (
                    <>
                      <rect
                        x={region.x - 8}
                        y={region.y - 5}
                        width="16"
                        height="4"
                        fill="white"
                        stroke="#2f7d32"
                        strokeWidth="0.2"
                        rx="1"
                      />
                      <text
                        x={region.x}
                        y={region.y - 1.5}
                        textAnchor="middle"
                        className="fill-gray-800 pointer-events-none"
                        fontSize="3"
                        fontWeight="600"
                      >
                        {region.name.substring(0, 12)}
                      </text>
                    </>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">📌 إرشادات الخريطة:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600 opacity-70"></div>
                <span>منطقة بها فلاحون</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 opacity-30"></div>
                <span>حجمها = عدد الفلاحين</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-900"></div>
                <span>منطقة مختارة</span>
              </div>
              <div className="text-gray-600">
                💡 انقر على أي منطقة لعرض تفاصيل الفلاحين
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farmers Details */}
      {selectedRegion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">الفلاحون في منطقة {selectedRegion}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionsData
                .find((r) => r.name === selectedRegion)
                ?.farmers.map((farmer) => (
                  <div
                    key={farmer.farmerId}
                    className="p-4 border-l-4 border-l-green-600 bg-green-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">الاسم</p>
                        <p className="text-lg font-bold text-gray-800">
                          {farmer.firstName} {farmer.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">المنطقة</p>
                        <p className="text-sm text-gray-700 mt-1">{farmer.region}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">مساحة الأرض</p>
                        <p className="text-sm text-amber-600 font-semibold mt-1">
                          {farmer.landArea} هكتار
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">رقم الهاتف</p>
                        <p className="text-sm text-green-600 font-semibold mt-1 direction-ltr">
                          {farmer.phone}
                        </p>
                      </div>
                      <div>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold transition">
                          📍 زيارة/فحص
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Farmers List */}
      {farmers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>قائمة جميع الفلاحين المسجلين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-100 border-b-2 border-green-600">
                  <tr>
                    <th className="p-3 text-right">الاسم</th>
                    <th className="p-3 text-right">المنطقة</th>
                    <th className="p-3 text-right">مساحة الأرض</th>
                    <th className="p-3 text-right">الهاتف</th>
                    <th className="p-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((farmer) => (
                    <tr key={farmer.farmerId} className="border-b hover:bg-green-50 transition">
                      <td className="p-3 font-semibold text-gray-800">
                        {farmer.firstName} {farmer.lastName}
                      </td>
                      <td className="p-3 text-gray-700">{farmer.region}</td>
                      <td className="p-3 text-amber-600 font-semibold">{farmer.landArea} هكتار</td>
                      <td className="p-3 text-gray-700 direction-ltr">{farmer.phone}</td>
                      <td className="p-3">
                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                          ✓ نشط
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {farmers.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-semibold">لم يتم تسجيل أي فلاحين بعد</p>
            <p className="text-gray-400 text-sm mt-2">سيظهر الفلاحون هنا بعد موافقتك على طلبات تسجيلهم</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
