import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search } from "lucide-react";
import { Button } from "./ui/button";

interface FarmData {
  id: string;
  farmerName: string;
  lat: number;
  lng: number;
  farmName: string;
}

export default function AdminFarmersMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [farms, setFarms] = useState<FarmData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFarms, setFilteredFarms] = useState<FarmData[]>([]);

  // Load all farms from localStorage
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const allFarms: FarmData[] = [];

    users.forEach((user: any) => {
      if (user.role === "farmer") {
        const farmLocation = localStorage.getItem(`farmLocation_${user.id}`);
        if (farmLocation) {
          try {
            const location = JSON.parse(farmLocation);
            allFarms.push({
              id: user.id,
              farmerName: `${user.firstName} ${user.lastName}`,
              lat: location.lat,
              lng: location.lng,
              farmName: location.name || "أرض غير محددة",
            });
          } catch (e) {
            console.error("Error parsing farm location:", e);
          }
        }
      }
    });

    setFarms(allFarms);
    setFilteredFarms(allFarms);
  }, []);

  // Filter farms based on search
  useEffect(() => {
    const filtered = farms.filter(
      (farm) =>
        farm.farmerName.includes(searchTerm) ||
        farm.farmName.includes(searchTerm)
    );
    setFilteredFarms(filtered);
    updateMapMarkers(filtered);
  }, [searchTerm, farms]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Algerian coordinates center
    const defaultLocation: [number, number] = [28.0339, 1.6596];

    map.current = L.map(mapContainer.current, {
      center: defaultLocation,
      zoom: 5,
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 3,
        }),
      ],
    });

    // Add all markers
    updateMapMarkers(filteredFarms);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const updateMapMarkers = (farmsToShow: FarmData[]) => {
    // Remove existing markers
    markersRef.current.forEach((marker) => {
      if (map.current) {
        map.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add new markers for each farm
    farmsToShow.forEach((farm) => {
      const markerIcon = L.divIcon({
        className: "custom-admin-marker",
        html: `
          <div class="flex flex-col items-center">
            <div class="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" stroke="white" stroke-width="0.5"/>
                <path d="M6 9l3 3 5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap text-blue-900 border border-blue-300" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
              ${farm.farmerName}
            </div>
          </div>
        `,
        iconSize: [45, 55],
        iconAnchor: [22, 55],
        popupAnchor: [0, -55],
      });

      const marker = L.marker([farm.lat, farm.lng], { icon: markerIcon }).addTo(
        map.current!
      );

      const popupContent = `
        <div class="text-right" dir="rtl" style="min-width: 250px;">
          <h3 class="font-bold text-blue-900 mb-2 text-sm">${farm.farmerName}</h3>
          <div class="space-y-1 text-xs text-gray-700">
            <p><strong>اسم الأرض:</strong> ${farm.farmName}</p>
            <p><strong>خط العرض:</strong> ${farm.lat.toFixed(4)}</p>
            <p><strong>خط الطول:</strong> ${farm.lng.toFixed(4)}</p>
          </div>
          <button class="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 w-full">
            تفاصيل المزرعة
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // If there are farms, fit bounds to show all
    if (farmsToShow.length > 0 && map.current) {
      const bounds = L.latLngBounds(
        farmsToShow.map((farm) => [farm.lat, farm.lng])
      );
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleZoomToFarm = (farm: FarmData) => {
    if (map.current) {
      map.current.setView([farm.lat, farm.lng], 12);
      // Find and open the marker popup
      const marker = markersRef.current.find(
        (m) => m.getLatLng().lat === farm.lat && m.getLatLng().lng === farm.lng
      );
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white shadow-lg" dir="rtl">
      <div className="flex flex-col h-full" style={{ height: "calc(100vh - 200px)" }}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6" />
            <h2 className="text-2xl font-bold">خريطة أراضي الفلاحين</h2>
          </div>
          <p className="text-sm text-blue-50">
            عرض مواقع جميع الأراضي المسجلة للفلاحين - يمكنك القيام بتفتيشات مفاجئة
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن الفلاح أو اسم الأرض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm text-gray-600 font-semibold">
              {filteredFarms.length} أرضية
            </span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Map Container */}
          <div
            ref={mapContainer}
            className="flex-1 bg-gray-100"
          />

          {/* Sidebar with farm list */}
          <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-b from-blue-50 to-white p-3 border-b border-blue-200">
              <h3 className="font-bold text-blue-900 text-sm">قائمة الأراضي</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredFarms.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">لا توجد نتائج بحث</p>
                </div>
              ) : (
                filteredFarms.map((farm) => (
                  <div
                    key={farm.id}
                    className="p-4 hover:bg-blue-50 transition-colors cursor-pointer border-b"
                    onClick={() => handleZoomToFarm(farm)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          {farm.farmerName}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {farm.farmName}
                        </p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                            {farm.lat.toFixed(3)}°
                          </span>
                          <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                            {farm.lng.toFixed(3)}°
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomToFarm(farm);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
                      >
                        عرض
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
