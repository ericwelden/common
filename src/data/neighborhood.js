// Map center: Madeline Street area, Oakland Hills / Laurel district, Oakland CA 94619.
// Coordinates are intentionally rounded (~100m) so the exact address isn't in the public repo.
export const NEIGHBORHOOD_CENTER = {
  lat: 37.799,
  lng: -122.203,
};

// The initial camera and how far the map can wander. Bounds are
// [west, south] / [east, north] — roughly a 1km box around the center.
export const MAP_VIEW = {
  zoom: 16.8,
  minZoom: 15,
  maxZoom: 19,
  maxBounds: [
    [-122.215, 37.79],
    [-122.191, 37.808],
  ],
};

// Sample points of interest. Replace with real neighborhood spots.
export const PLACES = [
  {
    id: "center",
    name: "Madeline Street neighborhood",
    description: "Home base for the Common neighborhood map.",
    lat: NEIGHBORHOOD_CENTER.lat,
    lng: NEIGHBORHOOD_CENTER.lng,
  },
];
