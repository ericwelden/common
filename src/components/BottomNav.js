"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/data/nav";

// Short labels for the cramped bottom bar; full labels (from NAV_ITEMS) are
// used for aria-label so screen readers still get the complete word.
const SHORT_LABELS = {
  "/": "Map",
  "/recommendations": "Recs",
  "/resources": "Resources",
  "/profile": "Profile",
};

// Same hand-drawn stroke style as the icons in AboutCard.js/MapAttribution.js
// (currentColor, ~1.5 stroke width, rounded caps).
const ICONS = {
  "/": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5c-3.04 0-5.5 2.46-5.5 5.5 0 4.13 5.5 9.5 5.5 9.5s5.5-5.37 5.5-9.5c0-3.04-2.46-5.5-5.5-5.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  "/recommendations": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7 8.5V17h6.5c.7 0 1.3-.47 1.45-1.15l1.05-4.85c.2-.9-.5-1.75-1.45-1.75H11.3l.55-2.9c.14-.75-.44-1.35-1.15-1.35-.4 0-.77.2-.98.55L7 8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7 8.5H4.5V17H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/resources": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M3.5 6.5 10 10l6.5-3.5M10 10v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/profile": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6.8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 17c.6-3.2 3.1-5 6-5s5.4 1.8 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// z-40 sits above every other overlay (AboutCard z-10, header z-20,
// MapAttribution popover z-30) — this is persistent chrome and should never
// be covered.
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition ${
              active ? "font-semibold text-primary" : "text-muted-foreground"
            }`}
          >
            {ICONS[href]}
            <span className="text-[10px]">{SHORT_LABELS[href]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
