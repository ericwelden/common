"use client";

import Link from "next/link";
import { useAboutCard } from "./AboutCardContext";

// Doubles as a link home and the trigger for the welcome/about card, which
// only renders on the map page — clicking from elsewhere navigates there
// too, and the card opens immediately since AboutCardProvider's state
// lives in the root layout and survives the navigation.
export default function LogoButton() {
  const { setOpen } = useAboutCard();

  return (
    <Link
      href="/"
      onClick={() => setOpen(true)}
      aria-label="Common — go to the map and show the welcome info"
      className="text-lg font-semibold tracking-tight whitespace-nowrap"
    >
      Common<span className="text-emerald-600">.</span>
    </Link>
  );
}
