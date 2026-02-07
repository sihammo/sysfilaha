import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AlgeriaMapProps {
  selectedRegion: string;
  onRegionSelect: (region: string) => void;
}

const REGIONS = [
  { id: 1, name: "الجزائر", x: 50, y: 45 },
  { id: 16, name: "الجزائرية العاصمة", x: 50, y: 46 },
  { id: 2, name: "قسنطينة", x: 60, y: 20 },
  { id: 31, name: "عنابة", x: 65, y: 15 },
  { id: 34, name: "سكيكدة", x: 62, y: 18 },
  { id: 5, name: "بجاية", x: 57, y: 25 },
  { id: 15, name: "تيزي وزو", x: 52, y: 28 },
  { id: 35, name: "جيجل", x: 60, y: 22 },
  { id: 3, name: "وهران", x: 35, y: 22 },
  { id: 22, name: "تلمسان", x: 30, y: 20 },
  { id: 13, name: "تيارت", x: 40, y: 30 },
  { id: 46, name: "سعيدة", x: 32, y: 32 },
  { id: 48, name: "غليزان", x: 35, y: 26 },
  { id: 6, name: "بومرداس", x: 52, y: 42 },
  { id: 42, name: "تيبازة", x: 48, y: 40 },
  { id: 19, name: "سطيف", x: 58, y: 35 },
  { id: 4, name: "باتنة", x: 62, y: 38 },
  { id: 8, name: "بسكرة", x: 65, y: 50 },
  { id: 9, name: "الأغواط", x: 55, y: 52 },
  { id: 47, name: "الجلفة", x: 50, y: 48 },
  { id: 17, name: "لاغوات", x: 60, y: 55 },
  { id: 18, name: "بوسعادة", x: 58, y: 50 },
  { id: 28, name: "ورقلة", x: 70, y: 65 },
  { id: 1, name: "ادرار", x: 30, y: 75 },
  { id: 7, name: "الواحات", x: 50, y: 75 },
  { id: 33, name: "الوادي", x: 75, y: 60 },
  { id: 37, name: "تمنراست", x: 50, y: 85 },
  { id: 41, name: "إليزي", x: 80, y: 80 },
];

export default function AlgeriaMap({ selectedRegion, onRegionSelect }: AlgeriaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">اختر موقع أرضك على الخريطة</h3>
        <div className="bg-white p-4 rounded-lg border-2 border-green-300">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto max-w-2xl mx-auto"
          >
            {/* Background */}
            <rect width="100" height="100" fill="#e8f5e9" />

            {/* Grid lines */}
            <g stroke="#ccc" strokeWidth="0.2" opacity="0.5">
              {Array.from({ length: 11 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 10}
                  x2="100"
                  y2={i * 10}
                />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 10}
                  y1="0"
                  x2={i * 10}
                  y2="100"
                />
              ))}
            </g>

            {/* Regional points and labels */}
            {REGIONS.map((region) => (
              <g key={region.name}>
                {/* Circle for region */}
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={selectedRegion === region.name ? 2.5 : hoveredRegion === region.name ? 2 : 1.5}
                  fill={selectedRegion === region.name ? "#2f7d32" : "#558b2f"}
                  opacity={selectedRegion === region.name ? 1 : hoveredRegion === region.name ? 0.8 : 0.6}
                  stroke={selectedRegion === region.name ? "#1b5e20" : "none"}
                  strokeWidth="0.3"
                  className="cursor-pointer hover:opacity-100"
                  onMouseEnter={() => setHoveredRegion(region.name)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => onRegionSelect(region.name)}
                />

                {/* Label - show on hover or selected */}
                {(hoveredRegion === region.name || selectedRegion === region.name) && (
                  <g>
                    {/* Background for text */}
                    <rect
                      x={region.x - 8}
                      y={region.y - 5}
                      width="16"
                      height="4"
                      fill="white"
                      stroke={selectedRegion === region.name ? "#2f7d32" : "#558b2f"}
                      strokeWidth="0.3"
                      rx="0.5"
                    />
                    {/* Text */}
                    <text
                      x={region.x}
                      y={region.y - 1}
                      fontSize="1.2"
                      fill={selectedRegion === region.name ? "#2f7d32" : "#558b2f"}
                      fontWeight={selectedRegion === region.name ? "bold" : "normal"}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none"
                    >
                      {region.name.split(" ")[0]}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-l-green-600 rounded text-sm text-gray-700">
          <p className="font-semibold text-green-800 mb-2">📍 مفتاح الخريطة:</p>
          <ul className="space-y-1 text-xs">
            <li>🟢 <span className="text-green-700 font-semibold">النقطة الخضراء الداكنة</span> = الولاية المختارة</li>
            <li>🟢 <span className="text-green-700">النقاط الخضراء</span> = الولايات الأخرى</li>
            <li>💡 مرر الفأرة فوق أي نقطة لرؤية اسم الولاية</li>
          </ul>
        </div>
      </div>

      {selectedRegion && (
        <Card className="border-2 border-green-400 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">الولاية المختارة:</p>
                <p className="text-lg font-bold text-green-800">{selectedRegion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
