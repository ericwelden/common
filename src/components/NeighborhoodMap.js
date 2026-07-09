"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { NEIGHBORHOOD_CENTER, PLACES } from "@/data/neighborhood";

// text-emerald-600 sets the div's color; the SVG's fill="currentColor" picks it
// up, so the pin tracks the same accent token as the rest of the chrome.
const markerIcon = L.divIcon({
  className: "common-pin text-emerald-600",
  html: `<svg width="34" height="34" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="9" r="2.6" fill="#fff"/>
  </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});

export default function NeighborhoodMap() {
  // The About card overlays the map: top-right on sm+ screens (w-80 + margin),
  // a bottom strip on smaller ones. Keep popup auto-pan clear of that region so
  // popups never slide behind the card. This component is client-only, but keep
  // the window guard so it degrades to symmetric padding anywhere else.
  const cardOnRight =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 640px)").matches;
  const autoPanPaddingBottomRight = cardOnRight ? [352, 16] : [16, 240];

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
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={markerIcon}
          title={place.name}
        >
          <Popup
            autoPanPaddingTopLeft={[16, 16]}
            autoPanPaddingBottomRight={autoPanPaddingBottomRight}
          >
            <strong>{place.name}</strong>
            <br />
            {place.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
