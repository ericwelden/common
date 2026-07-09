"use client";

import dynamic from "next/dynamic";

const NeighborhoodMap = dynamic(() => import("./NeighborhoodMap"), {
  ssr: false,
});

export default function MapLoader() {
  return <NeighborhoodMap />;
}
