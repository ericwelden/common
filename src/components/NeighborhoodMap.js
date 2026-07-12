"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { BrushCleaningIcon } from "lucide-react";
import { NEIGHBORHOOD_CENTER, MAP_VIEW, PLACES } from "@/data/neighborhood";
import { mapStyle } from "@/data/mapStyle";
import { STREET_SWEEPING } from "@/data/streetSweeping";
import { Button } from "@/components/ui/button";

const SWEEPING_SOURCE_ID = "street-sweeping";
const SWEEPING_LAYER_ID = "street-sweeping-lines";
// A separate, invisible, much wider line for click/hover only. MapLibre's
// hit-testing checks the exact rendered pixel with no built-in tolerance --
// against a 1.5-4px visible line that's nearly impossible to hit precisely
// (confirmed empirically: a click dead-center on the visible line's own
// midpoint still missed). This is the standard fix for thin-line layers.
const SWEEPING_HIT_LAYER_ID = "street-sweeping-hit";
// Oakland doesn't publish a legend for its internal route-timeslot codes
// (TIME_ODD/TIME_EVEN), so this app only shows the day it's confident about
// and sends people here for the exact time rather than guessing at one.
const SWEEPING_LOOKUP_URL =
  "https://www.oaklandca.gov/resources/street-sweeping-schedule-map";

// Same textContent-only construction as popupContent() below, for the same
// reason -- plus a fixed, app-authored link (not sweeping data) that's safe
// to set via a real <a> rather than text.
function sweepingPopupContent(props) {
  const content = document.createElement("div");
  content.className = "flex flex-col gap-1";

  const title = document.createElement("strong");
  title.textContent = props.street;
  content.append(title);

  const oddLine = document.createElement("div");
  oddLine.textContent = `Odd side: ${props.scheduleOdd ?? `code ${props.rawDayOdd ?? "unknown"}`}`;
  content.append(oddLine);

  const evenLine = document.createElement("div");
  evenLine.textContent = `Even side: ${props.scheduleEven ?? `code ${props.rawDayEven ?? "unknown"}`}`;
  content.append(evenLine);

  const link = document.createElement("a");
  link.href = SWEEPING_LOOKUP_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Check exact time on Oakland's site";
  link.className = "text-xs text-primary underline";
  content.append(link);

  return content;
}

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
  const mapRef = useRef(null);
  const [showSweeping, setShowSweeping] = useState(false);
  // Mirrors showSweeping for the "load" handler below to read -- it's set up
  // in an effect with an empty dependency array, so it can't close over state
  // that changes later (e.g. a toggle click that lands before "load" fires).
  const showSweepingRef = useRef(showSweeping);

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
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-left"
    );
    // MapLibre's compact attribution starts pre-expanded and only collapses
    // to the small icon after the map's first drag. The expanded class gets
    // added asynchronously once the source's attribution text loads (well
    // after this line runs), so wait for "load" rather than collapsing here.
    map.once("load", () => {
      map
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib")
        ?.classList.remove("maplibregl-compact-show");
    });

    // Source/layer calls need the style loaded first, unlike the PLACES
    // markers below (plain DOM overlays MapLibre positions itself).
    map.once("load", () => {
      map.addSource(SWEEPING_SOURCE_ID, { type: "geojson", data: STREET_SWEEPING });
      // Inserted before "buildings" so building fills and house-number labels
      // (added after "roads" in mapStyle.js) still draw on top and stay legible.
      map.addLayer(
        {
          id: SWEEPING_LAYER_ID,
          type: "line",
          source: SWEEPING_SOURCE_ID,
          layout: {
            visibility: showSweepingRef.current ? "visible" : "none",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1.5, 18, 4],
            "line-offset": 2,
          },
        },
        "buildings"
      );
      // Same geometry and offset as the visible layer (so the hit area lines
      // up with what's drawn), but wide and fully transparent -- this is
      // what click/hover actually bind to, not the thin visible line above.
      map.addLayer(
        {
          id: SWEEPING_HIT_LAYER_ID,
          type: "line",
          source: SWEEPING_SOURCE_ID,
          layout: {
            visibility: showSweepingRef.current ? "visible" : "none",
            "line-cap": "round",
          },
          paint: { "line-color": "#3b82f6", "line-opacity": 0, "line-width": 20, "line-offset": 2 },
        },
        "buildings"
      );

      // Querying a single exact pixel (what MapLibre's delegated
      // map.on("click", layerId, ...) shorthand does internally) turned out
      // unreliable against this offset line layer in testing -- clicks dead
      // center on a known feature's own coordinates still missed. A tiny
      // bounding box around the pointer, queried by hand, hits reliably.
      const HIT_PADDING = 4;
      function featuresNear(point) {
        return map.queryRenderedFeatures(
          [
            [point.x - HIT_PADDING, point.y - HIT_PADDING],
            [point.x + HIT_PADDING, point.y + HIT_PADDING],
          ],
          { layers: [SWEEPING_HIT_LAYER_ID] }
        );
      }

      // Skipped while the overlay is hidden -- nothing to hover, and this
      // query runs on every pointer movement, not just clicks.
      map.on("mousemove", (e) => {
        if (!showSweepingRef.current) return;
        map.getCanvas().style.cursor = featuresNear(e.point).length ? "pointer" : "";
      });
      map.on("click", (e) => {
        if (!showSweepingRef.current) return;
        const feature = featuresNear(e.point)[0];
        if (!feature) return;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setDOMContent(sweepingPopupContent(feature.properties))
          .addTo(map);
      });
    });

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
    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Guarded on the layer existing -- a toggle click can land (and update
  // showSweepingRef above) before the "load" handler has added the layer;
  // that handler reads the ref directly rather than missing this update.
  useEffect(() => {
    showSweepingRef.current = showSweeping;
    const map = mapRef.current;
    if (!map?.getLayer(SWEEPING_LAYER_ID)) return;
    const visibility = showSweeping ? "visible" : "none";
    map.setLayoutProperty(SWEEPING_LAYER_ID, "visibility", visibility);
    map.setLayoutProperty(SWEEPING_HIT_LAYER_ID, "visibility", visibility);
  }, [showSweeping]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <Button
        variant="secondary"
        size="icon-sm"
        className="absolute top-4 right-4 z-10 shadow-sm"
        aria-pressed={showSweeping}
        aria-label={
          showSweeping
            ? "Hide street sweeping schedule"
            : "Show street sweeping schedule"
        }
        onClick={() => setShowSweeping((prev) => !prev)}
      >
        <BrushCleaningIcon aria-hidden="true" />
      </Button>
    </div>
  );
}
