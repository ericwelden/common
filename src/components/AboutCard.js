"use client";

import { useState } from "react";

const FEATURES = [
  { label: "Map of the neighborhood", live: true },
  { label: "Shared resources", live: false },
  { label: "Neighbor services", live: false },
];

// Leaflet's own controls go up to z-index 1000 (see leaflet.css), so the card
// and its reopen button need at least that to paint above the map UI.
const OVERLAY_Z = "z-[1000]";

export default function AboutCard() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="About Common"
        className={`absolute right-4 top-4 ${OVERLAY_Z} flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-600 shadow-lg ring-1 ring-zinc-900/10 transition hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10 dark:hover:text-white`}
      >
        i
      </button>
    );
  }

  return (
    <aside
      className={`absolute inset-x-4 bottom-6 ${OVERLAY_Z} rounded-2xl bg-white/95 p-5 shadow-xl ring-1 ring-zinc-900/10 backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-80 dark:bg-zinc-900/95 dark:ring-white/10`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Welcome to Common
        </h2>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close about card"
          className="-mr-2 -mt-2 rounded-full p-2 text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        A living map of our corner of Oakland — a place for neighbors to see
        what&apos;s nearby, share what they have, and lend a hand.
      </p>
      <ul className="mt-4 space-y-2">
        {FEATURES.map(({ label, live }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                live ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            />
            <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
            <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
              {live ? "live" : "coming soon"}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
