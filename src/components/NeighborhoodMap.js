"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { NEIGHBORHOOD_CENTER, PLACES } from "@/data/neighborhood";

const markerIcon = L.icon({
  iconUrl: "/leaflet-images/marker-icon.png",
  iconRetinaUrl: "/leaflet-images/marker-icon-2x.png",
  shadowUrl: "/leaflet-images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function NeighborhoodMap() {
  return (
    <MapContainer
      center={[NEIGHBORHOOD_CENTER.lat, NEIGHBORHOOD_CENTER.lng]}
      zoom={NEIGHBORHOOD_CENTER.zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {PLACES.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]} icon={markerIcon}>
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
