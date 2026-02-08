import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface LeafletLocationPickerProps {
    onLocationSelect: (region: string, lat: number, lng: number) => void;
    selectedRegion?: string;
}

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon} />
    );
}

export default function LeafletLocationPicker({ onLocationSelect, selectedRegion }: LeafletLocationPickerProps) {
    const [regionName, setRegionName] = useState(selectedRegion || "");

    const handlePointSelect = async (lat: number, lng: number) => {
        try {
            // Use Nominatim (OpenStreetMap's geocoder) - completely free
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
            const data = await res.json();

            const city = data.address.city || data.address.town || data.address.village;
            const state = data.address.state;
            const name = state || city || "الجزائر";

            setRegionName(name);
            onLocationSelect(name, lat, lng);
        } catch (error) {
            console.error("Geocoding error", error);
            onLocationSelect("الجزائر", lat, lng);
        }
    };

    return (
        <div className="space-y-2 font-arabic" dir="rtl">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">انقر على الخريطة لتحديد موقعك:</span>
                {regionName && <span className="text-green-700 font-bold">📍 {regionName}</span>}
            </div>
            <div className="relative rounded-lg overflow-hidden border-2 border-green-200 h-[300px] z-0">
                <MapContainer
                    center={[36.7538, 3.0588]}
                    zoom={6}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker onSelect={handlePointSelect} />
                </MapContainer>
            </div>
            <p className="text-[10px] text-gray-400">💡 سيتم تحديد الولاية أوتوماتيكياً عند النقر (OpenStreetMap)</p>
        </div>
    );
}
