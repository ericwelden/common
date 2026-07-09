import MapLoader from "@/components/MapLoader";
import AboutCard from "@/components/AboutCard";

export default function MapPage() {
  return (
    <main className="relative flex-1">
      <MapLoader />
      <AboutCard />
    </main>
  );
}
