// Map center: Madeline Street area, Oakland Hills / Laurel district, Oakland CA 94619.
// Coordinates are intentionally rounded (~100m) so the exact address isn't in the public repo.
export const NEIGHBORHOOD_CENTER = {
  lat: 37.799,
  lng: -122.203,
  zoom: 16,
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
