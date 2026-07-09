import MapLoader from "@/components/MapLoader";
import AboutCard from "@/components/AboutCard";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="z-20 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Common<span className="text-emerald-600">.</span>
          </h1>
          <p className="hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
            A living map of the neighborhood
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950 dark:text-emerald-300">
          Laurel · Oakland
        </span>
      </header>
      <main className="relative flex-1">
        <MapLoader />
        <AboutCard />
      </main>
    </div>
  );
}
