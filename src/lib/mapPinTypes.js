import {
  TreePineIcon,
  FerrisWheelIcon,
  BookOpenIcon,
  StoreIcon,
  TriangleAlertIcon,
  PartyPopperIcon,
  MapPinIcon,
  BrushCleaningIcon,
} from "lucide-react";

// The fixed taxonomy for map pins -- also enforced in the DB via a CHECK
// constraint (see the map_pins table), so the `value`s here must stay in
// sync with that. Each type gets its own marker color and legend/popup
// icon, so the legend and the pins on the map read as the same system.
export const MAP_PIN_TYPES = [
  { value: "Park / Green Space", color: "#4C9A6A", icon: TreePineIcon },
  { value: "Playground", color: "#D9A02C", icon: FerrisWheelIcon },
  { value: "Community Spot", color: "#4A7FC9", icon: BookOpenIcon },
  { value: "Business", color: "#9061C2", icon: StoreIcon },
  { value: "Hazard / Safety Issue", color: "#C9622C", icon: TriangleAlertIcon },
  { value: "Event", color: "#C2578F", icon: PartyPopperIcon },
  { value: "Other", color: "#6B7280", icon: MapPinIcon },
];

// Not a pin type -- this is the existing street-sweeping line layer, but
// the legend (PinLegend.js) treats it as just one more entry in the same
// toggle list, so it needs the same color/icon shape as a real pin type.
export const STREET_SWEEPING_LEGEND_ENTRY = {
  value: "Street Sweeping",
  color: "#E94F52",
  icon: BrushCleaningIcon,
};

export function mapPinTypeStyle(type) {
  return MAP_PIN_TYPES.find((t) => t.value === type) ?? MAP_PIN_TYPES.at(-1);
}
