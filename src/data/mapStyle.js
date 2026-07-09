// The entire look of the map lives in this file. It's a MapLibre style:
// vector tiles (raw OpenStreetMap data from OpenFreeMap, no API key) drawn
// entirely by the layer list below — nothing renders unless a layer asks for it.
//
// To customize: change any color/width here, delete a layer to remove that
// feature class, or add layers for things currently hidden (street names,
// parks, transit, shops...). Layer reference: https://maplibre.org/maplibre-style-spec/
// Available source-layers (OpenMapTiles schema): water, waterway, landcover,
// landuse, park, boundary, aeroway, transportation, building, water_name,
// transportation_name, place, housenumber, poi, aerodrome_label.

const palette = {
  background: "#ffffff",
  water: "#f0f0f0",
  road: "#ececec",
  buildingFill: "#ffffff",
  buildingOutline: "#dcdcdc",
  // Darkest thing on the map on purpose: addresses are the one label the map
  // keeps, so they meet WCAG AA contrast (4.5:1) on white.
  housenumber: "#767676",
};

export const mapStyle = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    openfreemap: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": palette.background },
    },
    {
      // Peralta Creek and any other water, barely-there grey. Delete to hide.
      id: "water",
      type: "fill",
      source: "openfreemap",
      "source-layer": "water",
      paint: { "fill-color": palette.water },
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
      // House numbers from OpenStreetMap address data.
      id: "housenumbers",
      type: "symbol",
      source: "openfreemap",
      "source-layer": "housenumber",
      minzoom: 16,
      layout: {
        "text-field": ["get", "housenumber"],
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 16, 8, 19, 13],
      },
      paint: { "text-color": palette.housenumber },
    },
  ],
};
