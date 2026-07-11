"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/data/nav";

// "/" is a prefix of every route, so it's matched exactly; every other item
// also matches its own subroutes so nested pages (e.g. /resources/[id]) will
// highlight correctly later without touching this component again.
function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden min-w-0 flex-1 items-center justify-center gap-4 sm:flex lg:gap-6"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`text-sm transition ${
              active
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
