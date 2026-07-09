// The entire look of the map lives in this file. It's a MapLibre style:
// vector tiles (raw OpenStreetMap data from OpenFreeMap, no API key) drawn
// entirely by the layer list below — nothing renders unless a layer asks for it.
//
// To customize: change any color/width here, delete a layer to remove that
// feature class, or add layers for things currently hidden (place names,
// transit, shops/POIs...). Layer reference: https://maplibre.org/maplibre-style-spec/
// Available source-layers (OpenMapTiles schema): water, waterway, landcover,
// landuse, park, boundary, aeroway, transportation, building, water_name,
// transportation_name, place, housenumber, poi, aerodrome_label.

const palette = {
  background: "#ffffff",
  water: "#d7e9f7",
  // A creek is a 1-3px line, not a filled area — the pale water fill would
  // nearly vanish at that width, so its line gets a touch more saturation.
  waterLine: "#a9cbe8",
  park: "#dcefdc",
  road: "#ececec",
  roadLabel: "#a8a8a8",
  buildingFill: "#f5f5f5",
  buildingOutline: "#dcdcdc",
  // Darkest thing on the map on purpose: addresses are the one label the map
  // keeps, so they meet WCAG AA contrast (4.5:1) against the building fill
  // (the lightest surface they can sit on).
  housenumber: "#6b6b6b",
};

export const mapStyle = {
  version: 8,
  // Self-hosted glyph files (public/fonts) — OpenFreeMap's glyph server has no
  // Inter, so its ranges were pre-rendered with genfontgl and shipped with the
  // app. To add another font/weight, generate its folder the same way.
  glyphs: "/fonts/{fontstack}/{range}.pbf",
  sources: {
    openfreemap: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
      // Overrides the "OpenFreeMap © OpenMapTiles Data from OpenStreetMap"
      // attribution OpenFreeMap's server sends by default. Their terms say
      // the "OpenFreeMap" part is optional to display — OpenMapTiles and
      // OpenStreetMap are the two that must stay.
      attribution: "© OpenMapTiles Data from OpenStreetMap",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": palette.background },
    },
    {
      // Parks, gardens, nature reserves. "landcover" catches informal green
      // space (grass/wood) that isn't tagged as a formal park boundary.
      id: "landcover-green",
      type: "fill",
      source: "openfreemap",
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["wood", "grass"]]],
      paint: { "fill-color": palette.park },
    },
    {
      id: "parks",
      type: "fill",
      source: "openfreemap",
      "source-layer": "park",
      paint: { "fill-color": palette.park },
    },
    {
      // Peralta Creek and any other water. Delete to hide.
      id: "water",
      type: "fill",
      source: "openfreemap",
      "source-layer": "water",
      paint: { "fill-color": palette.water },
    },
    {
      // Creeks and streams too small to be water polygons.
      id: "waterway",
      type: "line",
      source: "openfreemap",
      "source-layer": "waterway",
      paint: {
        "line-color": palette.waterLine,
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1, 18, 3],
      },
    },
    {
      id: "roads",
      type: "line",
      source: "openfreemap",
      "source-layer": "transportation",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": palette.road,
        // Wider for bigger road classes, and everything grows as you zoom in.
        "line-width": [
          "interpolate",
          ["exponential", 1.6],
          ["zoom"],
          13,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 3, 1],
          18,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 26, 14],
        ],
      },
    },
    {
      id: "buildings",
      type: "fill",
      source: "openfreemap",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-color": palette.buildingFill,
        "fill-outline-color": palette.buildingOutline,
      },
    },
    {
      // Hairline building outlines that thicken slightly as you zoom.
      id: "building-outlines",
      type: "line",
      source: "openfreemap",
      "source-layer": "building",
      minzoom: 15,
      paint: {
        "line-color": palette.buildingOutline,
        "line-width": ["interpolate", ["linear"], ["zoom"], 15, 0.3, 19, 1.4],
      },
    },
    {
      // Faint street names along the road lines. Excludes driveways/parking-lot
      // service roads and paths, which would otherwise clutter a residential area.
      id: "road-labels",
      type: "symbol",
      source: "openfreemap",
      "source-layer": "transportation_name",
      minzoom: 14,
      filter: ["!", ["in", ["get", "class"], ["literal", ["service", "track", "path"]]]],
      layout: {
        "symbol-placement": "line",
        "text-field": ["get", "name"],
        "text-font": ["Inter Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 14, 9, 18, 12],
        "text-letter-spacing": 0.02,
      },
      paint: {
        "text-color": palette.roadLabel,
        "text-halo-color": palette.background,
        "text-halo-width": 1.2,
      },
    },
    {
      // House numbers from OpenStreetMap address data.
      id: "housenumbers",
      type: "symbol",
      source: "openfreemap",
      "source-layer": "housenumber",
      minzoom: 16,
      layout: {
        "text-field": ["get", "housenumber"],
        "text-font": ["Inter Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 16, 8, 19, 13],
      },
      paint: { "text-color": palette.housenumber },
    },
  ],
};
