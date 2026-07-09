import MapLoader from "@/components/MapLoader";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <h1 className="text-xl font-semibold">Common</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          A map of your neighborhood.
        </p>
      </header>
      <main className="flex-1">
        <MapLoader />
      </main>
    </div>
  );
}
