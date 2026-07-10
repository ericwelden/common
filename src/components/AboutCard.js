"use client";

import { useAboutCard } from "./AboutCardContext";

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
    <aside
      className={`absolute inset-x-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] ${OVERLAY_Z} rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-80`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Welcome to Common
        </h2>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close about card"
          className="-mr-2 -mt-2 rounded-full p-2 text-zinc-500 transition hover:text-zinc-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        A living map of our corner of Oakland — a place for neighbors to see
        what&apos;s nearby, share what they have, and lend a hand.
      </p>
      <ul className="mt-4 space-y-2">
        {FEATURES.map(({ label, live }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                live ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            />
            <span className="text-zinc-700">{label}</span>
            <span className="ml-auto text-xs text-zinc-500">
              {live ? "live" : "coming soon"}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
