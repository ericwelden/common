"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { PlusIcon } from "lucide-react";
import { NEIGHBORHOOD_CENTER, MAP_VIEW } from "@/data/neighborhood";
import { mapStyle } from "@/data/mapStyle";
import { STREET_SWEEPING } from "@/data/streetSweeping";
import { MAP_PIN_TYPES, STREET_SWEEPING_LEGEND_ENTRY, mapPinTypeStyle } from "@/lib/mapPinTypes";
import { Button } from "@/components/ui/button";
import PinLegend from "@/components/PinLegend";
import PinForm from "@/components/PinForm";

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

// Same textContent-only construction as pinPopupContent() below, for the
// same reason -- plus a fixed, app-authored link (not sweeping data) that's
// safe to set via a real <a> rather than text.
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

const PIN_SIZE = 34;
// color is baked directly into the SVG's fill rather than relying on
// currentColor -- each pin type has its own color (mapPinTypeStyle), unlike
// the single accent-colored pin this replaced.
function pinSvg(color) {
  return `<svg width="${PIN_SIZE}" height="${PIN_SIZE}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
  <circle cx="12" cy="9" r="2.6" fill="#fff"/>
</svg>`;
}

// Popup content is built with textContent (not HTML) so pin data can never
// inject markup -- pins come from neighbors, not this repo. The Edit button
// is only added (and only wired up) when the viewer owns the pin.
function pinPopupContent(pin, { canEdit, onEdit }) {
  const content = document.createElement("div");
  content.className = "flex flex-col gap-1";

  const type = document.createElement("div");
  type.className = "text-xs font-medium text-muted-foreground";
  type.textContent = pin.type;
  content.append(type);

  const title = document.createElement("strong");
  title.textContent = pin.name;
  content.append(title);

  const description = document.createElement("div");
  description.textContent = pin.description;
  content.append(description);

  if (canEdit) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "self-start pt-1 text-xs font-medium text-primary";
    editButton.addEventListener("click", () => onEdit(pin));
    content.append(editButton);
  }

  return content;
}

// Street sweeping defaults off (dense, opt-in); every real pin type
// defaults on, so newly added pins are visible without an extra step.
const DEFAULT_VISIBLE = Object.fromEntries([
  [STREET_SWEEPING_LEGEND_ENTRY.value, false],
  ...MAP_PIN_TYPES.map((t) => [t.value, true]),
]);

export default function NeighborhoodMap({ pins, userId }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pinMarkersRef = useRef([]);

  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  // Mirrors visible for handlers set up in the map-init effect below (empty
  // dependency array, so it can't close over state that changes later) --
  // same pattern the sweeping toggle already used for showSweepingRef.
  const visibleRef = useRef(visible);

  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const isPlacingPinRef = useRef(isPlacingPin);

  const [formState, setFormState] = useState({
    open: false,
    mode: "add",
    pin: null,
    lat: null,
    lng: null,
  });

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

    // Source/layer calls need the style loaded first, unlike pin markers
    // (plain DOM overlays MapLibre positions itself, handled in a separate
    // effect below).
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
            visibility: visibleRef.current[STREET_SWEEPING_LEGEND_ENTRY.value] ? "visible" : "none",
            "line-cap": "round",
          },
          paint: {
            // Matches STREET_SWEEPING_LEGEND_ENTRY.color / the app's
            // --primary token -- MapLibre's paint spec needs a literal
            // color, not a CSS var, so this is the pre-computed hex
            // equivalent, kept in sync by hand.
            "line-color": "#E94F52",
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
            visibility: visibleRef.current[STREET_SWEEPING_LEGEND_ENTRY.value] ? "visible" : "none",
            "line-cap": "round",
          },
          paint: { "line-color": "#E94F52", "line-opacity": 0, "line-width": 20, "line-offset": 2 },
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
        if (!visibleRef.current[STREET_SWEEPING_LEGEND_ENTRY.value]) return;
        if (isPlacingPinRef.current) return;
        map.getCanvas().style.cursor = featuresNear(e.point).length ? "pointer" : "";
      });
      map.on("click", (e) => {
        if (isPlacingPinRef.current) return;
        if (!visibleRef.current[STREET_SWEEPING_LEGEND_ENTRY.value]) return;
        const feature = featuresNear(e.point)[0];
        if (!feature) return;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setDOMContent(sweepingPopupContent(feature.properties))
          .addTo(map);
      });
    });

    // Placing a new pin: the next click anywhere on the map (once
    // isPlacingPinRef is set by the "Add pin" button below) captures that
    // location and opens the add form, rather than needing the style/
    // sweeping layers to be loaded first.
    map.on("click", (e) => {
      if (!isPlacingPinRef.current) return;
      setIsPlacingPin(false);
      setFormState({
        open: true,
        mode: "add",
        pin: null,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      });
    });

    // map.remove() also tears down the markers (they live in the map's DOM).
    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Pin markers -- rebuilt only when the pins themselves (or who's viewing,
  // which changes whose Edit button shows) change, not on every legend
  // toggle -- see the visibility effect below, which just flips display on
  // these same elements instead of tearing down and recreating markers
  // (and, critically, any popup a neighbor currently has open).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const { marker } of pinMarkersRef.current) marker.remove();
    pinMarkersRef.current = [];

    for (const pin of pins) {
      const style = mapPinTypeStyle(pin.type);
      const el = document.createElement("div");
      el.className = "common-pin";
      el.innerHTML = pinSvg(style.color);
      // MapLibre makes the element a focusable Enter/Space popup toggle, so it
      // must announce as a button, with its expanded state kept in sync.
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", pin.name);
      el.setAttribute("aria-expanded", "false");
      // Visibility is driven by a CSS rule targeting this attribute (see the
      // legend-toggle effect below), not by mutating this element's style
      // directly from that other effect.
      el.dataset.pinType = pin.type;

      const popup = new maplibregl.Popup({ offset: PIN_SIZE - 4 });
      popup.setDOMContent(
        pinPopupContent(pin, {
          canEdit: pin.author_id === userId,
          onEdit: (p) => setFormState({ open: true, mode: "edit", pin: p, lat: null, lng: null }),
        })
      );
      popup.on("open", () => el.setAttribute("aria-expanded", "true"));
      popup.on("close", () => el.setAttribute("aria-expanded", "false"));

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(popup)
        .addTo(map);

      pinMarkersRef.current.push({ marker, el, type: pin.type });
    }
    // pins/userId identity changes (via revalidatePath after add/edit)
    // are what should trigger a rebuild -- visible is intentionally read
    // fresh off the ref above, not listed as a dependency.
  }, [pins, userId]);

  // A single <style> tag, created once and updated in place, that hides
  // pins by their data-pin-type attribute -- a CSS rule, not direct
  // mutation of the DOM nodes pinMarkersRef holds from a different effect
  // than the one that created them (markers/popups stay untouched, so
  // toggling one type never closes a popup a neighbor has open on another).
  const legendStyleRef = useRef(null);
  useEffect(() => {
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    legendStyleRef.current = styleEl;
    return () => {
      styleEl.remove();
      legendStyleRef.current = null;
    };
  }, []);

  // Legend toggles -- rewrites the <style> tag above and flips the sweeping
  // layer's visibility.
  useEffect(() => {
    visibleRef.current = visible;
    if (legendStyleRef.current) {
      const hiddenTypes = Object.entries(visible)
        .filter(([, isVisible]) => !isVisible)
        .map(([type]) => type);
      legendStyleRef.current.textContent = hiddenTypes
        .map((type) => `.common-pin[data-pin-type="${CSS.escape(type)}"] { display: none; }`)
        .join("\n");
    }
    const map = mapRef.current;
    if (!map?.getLayer(SWEEPING_LAYER_ID)) return;
    const layerVisibility = visible[STREET_SWEEPING_LEGEND_ENTRY.value] ? "visible" : "none";
    map.setLayoutProperty(SWEEPING_LAYER_ID, "visibility", layerVisibility);
    map.setLayoutProperty(SWEEPING_HIT_LAYER_ID, "visibility", layerVisibility);
  }, [visible]);

  useEffect(() => {
    isPlacingPinRef.current = isPlacingPin;
    const map = mapRef.current;
    if (map) map.getCanvas().style.cursor = isPlacingPin ? "crosshair" : "";
  }, [isPlacingPin]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {isPlacingPin && (
        <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-card px-4 py-2 text-sm shadow-elevated">
          <span>Tap the map to place your pin</span>
          <button
            type="button"
            className="font-medium text-primary"
            onClick={() => setIsPlacingPin(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <PinLegend
          visible={visible}
          onToggle={(value) =>
            setVisible((prev) => ({ ...prev, [value]: !prev[value] }))
          }
        />
        {/* Signed-out visitors can still browse the map (see src/app/page.js)
            but adding a pin requires an account, so this simply doesn't
            render rather than showing a button that would just error. */}
        {userId && (
          <Button
            variant="secondary"
            size="icon-sm"
            className="shadow-sm"
            aria-pressed={isPlacingPin}
            aria-label={isPlacingPin ? "Cancel adding a pin" : "Add a pin"}
            onClick={() => setIsPlacingPin((prev) => !prev)}
          >
            <PlusIcon aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Always rendered (not conditionally on formState.open) so the
          Drawer's own close animation can play -- key changes force a fresh
          mount (and fresh useActionState) whenever switching between
          add/edit or between two different pins, so a previous submission's
          state/fields never leak into the next one. */}
      <PinForm
        key={`${formState.mode}-${formState.pin?.id ?? "new"}`}
        open={formState.open}
        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        mode={formState.mode}
        pin={formState.pin}
        lat={formState.lat}
        lng={formState.lng}
      />
    </div>
  );
}
