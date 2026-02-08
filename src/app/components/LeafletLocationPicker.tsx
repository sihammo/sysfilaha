import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl, LayerGroup } from "react-leaflet";
import { Button } from "./ui/button";
import { Crosshair } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [30, 48],
    iconAnchor: [15, 48]
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
        locationfound(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        }
    });

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon} />
    );
}

export default function LeafletLocationPicker({ onLocationSelect, selectedRegion }: LeafletLocationPickerProps) {
    const [regionName, setRegionName] = useState(selectedRegion || "");

    const handlePointSelect = async (lat: number, lng: number) => {
        try {
            // Use Nominatim (OpenStreetMap's geocoder) - 100% free
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
        <div className="space-y-3 font-arabic" dir="rtl">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-800 font-medium">حدد موقعك على الخريطة الحقيقية:</span>
                {regionName && (
                    <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm animate-in fade-in slide-in-from-right-2">
                        📍 {regionName}
                    </div>
                )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-green-200 h-[350px] z-0 shadow-lg">
                <MapContainer
                    center={[36.7538, 3.0588]}
                    zoom={7}
                    style={{ height: "100%", width: "100%" }}
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="خريطة الشوارع">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="خريطة القمر الصناعي (Real Algeria)">
                            <LayerGroup>
                                <TileLayer
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                />
                            </LayerGroup>
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <LocationMarker onSelect={handlePointSelect} />
                </MapContainer>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                <span>💡 يمكنك التبديل لوضع القمر الصناعي لزيادة الدقة</span>
            </div>
        </div>
    );
}
