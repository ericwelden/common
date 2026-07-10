"use client";

import { createContext, useContext, useState } from "react";

// Lives in the root layout (never unmounts on navigation) so the header
// logo can open the card even from a page other than the map, where
// AboutCard itself is actually rendered.
const AboutCardContext = createContext(null);

export function AboutCardProvider({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <AboutCardContext.Provider value={{ open, setOpen }}>
      {children}
    </AboutCardContext.Provider>
  );
}

export function useAboutCard() {
  const context = useContext(AboutCardContext);
  if (!context) {
    throw new Error("useAboutCard must be used within AboutCardProvider");
  }
  return context;
}
