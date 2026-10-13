"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Marker images are served from /public/leaflet so the map works without a CDN
const pinIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapInnerProps {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
}

function ClickHandler({ setLocation }: { setLocation: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToLocation({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16, { duration: 1 });
    }
  }, [location, map]);
  return null;
}

export default function LocationMapInner({ location, setLocation }: LocationMapInnerProps) {
  // Default center: Chennai
  const center: [number, number] = location
    ? [location.lat, location.lng]
    : [13.0827, 80.2707];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler setLocation={setLocation} />
      <FlyToLocation location={location} />
      {location && (
        <Marker position={[location.lat, location.lng]} icon={pinIcon} />
      )}
    </MapContainer>
  );
}
