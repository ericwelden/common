"use client";

import { useState } from "react";
import { ATTRIBUTION_HTML } from "@/data/mapStyle";

// Touch devices have no hover, so the map's own hover-to-reveal attribution
// (globals.css, gated on (hover: hover)) is unreachable there — this renders
// the same required credit in the header instead, out of the map's limited
// screen space. CSS (.mobile-attribution-trigger, (hover: none)) shows this
// and hides the map's floating control on exactly the same devices.
export default function MapAttribution() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-attribution-trigger relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Map data attribution"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:text-zinc-700"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 7.25v4M8 5.1v.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div
          role="note"
          className="absolute right-0 top-9 z-30 w-max max-w-[calc(100vw-2.5rem)] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-lg [&_a]:underline [&_a]:decoration-zinc-300 [&_a]:underline-offset-2 [&_a]:hover:text-zinc-900"
          dangerouslySetInnerHTML={{ __html: ATTRIBUTION_HTML }}
        />
      )}
    </div>
  );
}
