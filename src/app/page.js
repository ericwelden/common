import MapLoader from "@/components/MapLoader";
import AboutCard from "@/components/AboutCard";
import { createClient } from "@/lib/supabase/server";

// Unlike resources/recommendations, the map stays publicly viewable when
// signed out (see src/proxy.js -- "/" isn't in its requiresAuth list) --
// pins are fetched regardless of auth, and userId is passed down as null
// for a signed-out visitor rather than redirecting. Adding/editing a pin
// still requires an account (enforced in src/app/actions.js and by RLS),
// but just looking at the map never has.
export default async function MapPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  const { data: pins } = await supabase
    .from("map_pins")
    .select("id, author_id, name, description, type, lat, lng");

  return (
    <main className="relative flex-1">
      <MapLoader pins={pins ?? []} userId={userId} />
      <AboutCard />
    </main>
  );
}
