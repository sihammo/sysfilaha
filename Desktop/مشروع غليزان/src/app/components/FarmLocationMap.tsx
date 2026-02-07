import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { MapPin, Save, Trash2 } from "lucide-react";

interface FarmLocationMapProps {
  userId: string;
  onLocationSave?: (location: { lat: number; lng: number; name: string }) => void;
}

export default function FarmLocationMap({ userId, onLocationSave }: FarmLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [farmLocation, setFarmLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [farmName, setFarmName] = useState("");
  const [savedLocations, setSavedLocations] = useState<Array<{ lat: number; lng: number; name: string }>>([]);

  // Load saved farm locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`farmLocation_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFarmLocation(parsed);
        setSavedLocations(Array.isArray(parsed) ? parsed : [parsed]);
        if (!Array.isArray(parsed)) {
          setFarmName(parsed.name);
        }
      } catch (e) {
        console.error("Error parsing saved location:", e);
      }
    }
  }, [userId]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // إذا كانت الخريطة موجودة بالفعل، لا تنشئها مرة أخرى
    if (map.current) return;

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
          zoomControl: true,
        }),
      ],
    });

    // If we have a saved location, center on it
    if (farmLocation) {
      map.current.setView([farmLocation.lat, farmLocation.lng], 12);
      addMarker(farmLocation.lat, farmLocation.lng, farmLocation.name);
    }

    // Add click listener to map
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setFarmLocation({ lat, lng, name: farmName || `الأرض في ${lat.toFixed(3)}, ${lng.toFixed(3)}` });
      addMarker(lat, lng, farmName);
    };

    map.current.on("click", handleMapClick);

    return () => {
      if (map.current) {
        map.current.off("click", handleMapClick);
      }
    };
  }, []);

  const addMarker = (lat: number, lng: number, name: string) => {
    if (markerRef.current) {
      map.current?.removeLayer(markerRef.current);
    }

    const markerIcon = L.divIcon({
      className: "custom-farm-marker",
      html: `
        <div class="flex flex-col items-center">
          <div class="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-semibold whitespace-nowrap">${name}</div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    });

    markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map.current!);
    markerRef.current.bindPopup(`<strong>${name}</strong><br/>خط العرض: ${lat.toFixed(4)}<br/>خط الطول: ${lng.toFixed(4)}`);
    markerRef.current.openPopup();
  };

  const handleSaveLocation = () => {
    if (!farmLocation) return;

    const locationToSave = {
      ...farmLocation,
      name: farmName || farmLocation.name,
    };

    setFarmLocation(locationToSave);
    setSavedLocations([...savedLocations, locationToSave]);
    localStorage.setItem(`farmLocation_${userId}`, JSON.stringify(locationToSave));

    if (onLocationSave) {
      onLocationSave(locationToSave);
    }

    setFarmName("");
  };

  const handleClearLocation = () => {
    if (markerRef.current && map.current) {
      map.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setFarmLocation(null);
    setFarmName("");
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-green-600 to-green-500 text-white" dir="rtl">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5" />
            <h2 className="text-lg font-bold">حدد موقع أرضك على الخريطة</h2>
          </div>
          <p className="text-sm text-green-50">اضغط على الخريطة لتحديد موقع أرضك في الجزائر</p>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainer}
          className="flex-1 min-h-[500px] bg-gray-100 relative z-0"
          style={{ height: "600px" }}
        />

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 bg-gray-50" dir="rtl">
          <div className="space-y-3">
            {farmLocation && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="text-gray-600 font-semibold">اسم الأرض:</label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="أدخل اسم أرضك (اختياري)"
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="font-semibold">خط العرض:</span>
                      <p>{farmLocation.lat.toFixed(4)}</p>
                    </div>
                    <div>
                      <span className="font-semibold">خط الطول:</span>
                      <p>{farmLocation.lng.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSaveLocation}
                disabled={!farmLocation}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ الموقع
              </Button>
              <Button
                onClick={handleClearLocation}
                disabled={!farmLocation}
                variant="outline"
                className="flex-1 rounded-lg flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                مسح
              </Button>
            </div>

            {/* Saved Locations */}
            {savedLocations.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 text-sm">أراضيك المسجلة:</h3>
                <div className="space-y-1 text-sm">
                  {savedLocations.map((loc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-gray-700">{loc.name}</span>
                      <span className="text-gray-500 text-xs">{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
