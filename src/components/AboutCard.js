"use client";

import { useAboutCard } from "./AboutCardContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { label: "Map of the neighborhood", live: true },
  { label: "Shared resources", live: false },
  { label: "Neighbor services", live: false },
];

// MapLibre's controls and popups use small z-indexes (≤4), so z-10 keeps
// the card above all map UI. Reopening happens via the header logo
// (src/components/LogoButton.js), not a trigger owned by this component.
const OVERLAY_Z = "z-10";

export default function AboutCard() {
  const { open, setOpen } = useAboutCard();

  if (!open) return null;

  return (
    <Card
      className={`absolute inset-x-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] ${OVERLAY_Z} shadow-sm sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-80`}
    >
      {/* CardHeader's base className is `grid` (single implicit column
          unless it has a CardAction child) -- flex-row alone only sets
          flex-direction, it doesn't switch display off grid, so without an
          explicit `flex` here the heading and close button silently stacked
          into two grid rows instead of sitting side by side. */}
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        {/* A real heading, not shadcn's CardTitle -- CardTitle renders a
            plain <div>, which would drop this from heading/landmark
            navigation for screen reader users. */}
        <h2 className="font-heading text-base leading-snug font-medium">
          Welcome to Common
        </h2>
        <Button
          variant="ghost"
          size="icon-xs"
          className="-mr-2 -mt-2"
          onClick={() => setOpen(false)}
          aria-label="Close about card"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          A living map of our corner of Oakland — a place for neighbors to see
          what&apos;s nearby, share what they have, and lend a hand.
        </p>
        <ul className="space-y-2">
          {FEATURES.map(({ label, live }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm">
              <span className="text-foreground">{label}</span>
              {/* secondary, not outline -- matches ComingSoon.js's "coming
                  soon" badge for the same not-live status elsewhere in the app. */}
              <Badge variant={live ? "default" : "secondary"} className="ml-auto">
                {live ? "live" : "coming soon"}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
