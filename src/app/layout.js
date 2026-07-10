import { Inter, Geist_Mono } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import BottomNav from "@/components/BottomNav";
import MapAttribution from "@/components/MapAttribution";
import LogoButton from "@/components/LogoButton";
import { AboutCardProvider } from "@/components/AboutCardContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Common — a map of the neighborhood",
  description:
    "A living map of the Dimond district in Oakland: explore the neighborhood, share resources, and offer services.",
};

// viewport-fit=cover is required for env(safe-area-inset-bottom) below to
// resolve to anything other than 0 on notched phones.
export const viewport = { viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col">
        <AboutCardProvider>
          <header className="z-20 flex items-center justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-3">
            <div className="flex shrink-0 items-baseline gap-3">
              <LogoButton />
              {/* The nav needs the room starting at `sm`, so this decorative
                  subtitle waits for `lg` to avoid crowding it. */}
              <p className="hidden whitespace-nowrap text-sm text-zinc-500 lg:block">
                A living map of the neighborhood
              </p>
            </div>
            <HeaderNav />
            <div className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Dimond · Oakland
              </span>
              <MapAttribution />
            </div>
          </header>
          {children}
          <BottomNav />
        </AboutCardProvider>
      </body>
    </html>
  );
}
