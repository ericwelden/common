"use client";

import { LayersIcon } from "lucide-react";
import { MAP_PIN_TYPES, STREET_SWEEPING_LEGEND_ENTRY } from "@/lib/mapPinTypes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ENTRIES = [STREET_SWEEPING_LEGEND_ENTRY, ...MAP_PIN_TYPES];

// One toggle list for both real pin types and the street-sweeping line
// layer, even though under the hood they're different kinds of map
// content (DOM markers vs. a GeoJSON layer) -- to a neighbor looking at
// the map, they're just "things I can show or hide."
export default function PinLegend({ visible, onToggle }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            size="icon-sm"
            className="shadow-sm"
            aria-label="Map legend"
          />
        }
      >
        <LayersIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
          Show on map
        </p>
        <div className="flex flex-col gap-0.5">
          {ENTRIES.map((entry) => {
            const Icon = entry.icon;
            const id = `legend-${entry.value}`;
            return (
              <label
                key={entry.value}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  id={id}
                  checked={visible[entry.value] ?? false}
                  onCheckedChange={() => onToggle(entry.value)}
                />
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                  style={{ color: entry.color }}
                />
                <span>{entry.value}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
