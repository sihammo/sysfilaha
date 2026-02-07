import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin } from "lucide-react";

interface FarmerLocationViewProps {
  region: string;
  landArea: string;
  address: string;
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

export default function FarmerLocationView({ region, landArea, address }: FarmerLocationViewProps) {
  const regionCoords = REGIONS.find((r) => r.name === region);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          موقع أراضيك على خريطة الجزائر
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100 aspect-video">
            <svg viewBox="0 0 60 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Algeria map outline - simplified shape */}
              <defs>
                <pattern id="grid-farmer" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e0e0e0" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="60" height="100" fill="url(#grid-farmer)" />
              <rect width="60" height="100" fill="#e3f2fd" opacity="0.3" />

              {/* Simplified Algeria outline */}
              <path
                d="M 8 15 L 20 12 L 30 14 L 40 10 L 50 12 L 52 15 L 52 25 L 55 30 L 55 45 L 52 55 L 48 65 L 45 75 L 40 82 L 30 90 L 15 88 L 8 75 L 6 65 L 5 50 L 5 35 L 6 20 Z"
                fill="#e8f5e9"
                stroke="#2f7d32"
                strokeWidth="0.8"
                opacity="0.5"
              />

              {/* Your location marker */}
              {regionCoords && (
                <g>
                  {/* Glow effect */}
                  <circle
                    cx={regionCoords.x}
                    cy={regionCoords.y}
                    r="6"
                    fill="#2f7d32"
                    opacity="0.12"
                  />
                  {/* Pulse animation circle */}
                  <circle
                    cx={regionCoords.x}
                    cy={regionCoords.y}
                    r="4"
                    fill="none"
                    stroke="#2f7d32"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                  {/* Main marker */}
                  <circle
                    cx={regionCoords.x}
                    cy={regionCoords.y}
                    r="2.5"
                    fill="#2f7d32"
                    stroke="#fff"
                    strokeWidth="0.4"
                  />
                  {/* Tractor icon representation */}
                  <text
                    x={regionCoords.x}
                    y={regionCoords.y + 0.5}
                    textAnchor="middle"
                    fontSize="5"
                    fontWeight="bold"
                    fill="white"
                  >
                    🚜
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-l-green-600">
              <p className="text-sm font-semibold text-gray-600">المنطقة</p>
              <p className="text-lg font-bold text-green-600 mt-2">{region}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-l-blue-600">
              <p className="text-sm font-semibold text-gray-600">مساحة الأرض</p>
              <p className="text-lg font-bold text-blue-600 mt-2">{landArea} هكتار</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-l-amber-600">
              <p className="text-sm font-semibold text-gray-600">العنوان</p>
              <p className="text-sm font-semibold text-amber-600 mt-2 truncate">{address || "لم يتم تحديد"}</p>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-green-100 border border-green-300 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-semibold">📍 ملاحظة:</span> موقعك محفوظ وآمن. يستخدمه الإدارة فقط للتفتيش والدعم اللوجستي.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
