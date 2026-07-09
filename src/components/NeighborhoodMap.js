"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { NEIGHBORHOOD_CENTER, MAP_VIEW, PLACES } from "@/data/neighborhood";
import { mapStyle } from "@/data/mapStyle";

// text-emerald-600 sets the element's color; the SVG's fill="currentColor"
// picks it up, so the pin tracks the same accent token as the rest of the chrome.
const PIN_SIZE = 34;
const PIN_SVG = `<svg width="${PIN_SIZE}" height="${PIN_SIZE}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" stroke="#fff" stroke-width="1.5"/>
  <circle cx="12" cy="9" r="2.6" fill="#fff"/>
</svg>`;

// Popup content is built with textContent (not HTML) so place data can never
// inject markup — important once places come from neighbors, not this repo.
function popupContent(place) {
  const content = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = place.name;
  const description = document.createElement("div");
  description.textContent = place.description;
  content.append(title, description);
  return content;
}

export default function NeighborhoodMap() {
  const containerRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [NEIGHBORHOOD_CENTER.lng, NEIGHBORHOOD_CENTER.lat],
      zoom: MAP_VIEW.zoom,
      minZoom: MAP_VIEW.minZoom,
      maxZoom: MAP_VIEW.maxZoom,
      maxBounds: MAP_VIEW.maxBounds,
      attributionControl: { compact: true },
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-left"
    );

    for (const place of PLACES) {
      const el = document.createElement("div");
      el.className = "common-pin text-emerald-600";
      el.innerHTML = PIN_SVG;
      // MapLibre makes the element a focusable Enter/Space popup toggle, so it
      // must announce as a button, with its expanded state kept in sync.
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", place.name);
      el.setAttribute("aria-expanded", "false");

      const popup = new maplibregl.Popup({ offset: PIN_SIZE - 4 });
      popup.setDOMContent(popupContent(place));
      popup.on("open", () => el.setAttribute("aria-expanded", "true"));
      popup.on("close", () => el.setAttribute("aria-expanded", "false"));

      new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map);
    }

    // map.remove() also tears down the markers (they live in the map's DOM).
    return () => map.remove();
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
