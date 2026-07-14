// Map center: Madeline Street area, Dimond district, Oakland CA 94619.
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
