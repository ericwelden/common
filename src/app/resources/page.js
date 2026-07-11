import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/storage";
import { todayISO as getTodayISO, parseISODate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import ResourcesList from "./ResourcesList";

// "Currently out" only reflects a reservation covering *today* -- an item
// with reservations entirely in the future still reads as "Available now"
// here. The full picture (every upcoming reservation) lives on the detail
// page's calendar, not this summary.
function statusFor(itemId, reservationsByItem, todayISO) {
  const current = (reservationsByItem[itemId] ?? []).find(
    (r) => r.start_date <= todayISO && todayISO < r.end_date
  );

  if (!current) return { available: true, label: "Available now" };

  return {
    available: false,
    label: `Back ${format(parseISODate(current.end_date), "MMM d")}`,
  };
}

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- proxy.js's check is cookie-only and optimistic; this
  // page depends on it directly (no other guard below), so a gap there would
  // otherwise surface as a raw crash instead of a graceful sign-in redirect.
  if (!data?.claims) redirect("/profile?error=sign-in-required");
  const userId = data.claims.sub;
  const todayISO = getTodayISO();

  const [{ data: items }, { data: reservations }] = await Promise.all([
    supabase
      .from("items")
      .select("*, profiles(display_name, photo_path)")
      .order("created_at", { ascending: false }),
    supabase
      .from("reservations")
      .select("item_id, start_date, end_date")
      .gte("end_date", todayISO),
  ]);

  const reservationsByItem = (reservations ?? []).reduce((map, r) => {
    (map[r.item_id] ??= []).push(r);
    return map;
  }, {});

  const posterPhotoPaths = [
    ...new Set(
      (items ?? [])
        .map((item) => item.profiles?.photo_path)
        .filter(Boolean)
    ),
  ];

  const [photoUrls, posterPhotoUrls] = await Promise.all([
    getSignedPhotoUrls(supabase, (items ?? []).map((item) => item.photo_path)),
    getSignedPhotoUrls(supabase, posterPhotoPaths, "profile-photos"),
  ]);

  const cards = (items ?? []).map((item) => ({
    item,
    photoUrl: photoUrls.get(item.photo_path),
    posterPhotoUrl: posterPhotoUrls.get(item.profiles?.photo_path),
    status: statusFor(item.id, reservationsByItem, todayISO),
    isOwn: item.owner_id === userId,
  }));

  return (
    <main className="flex-1 px-5 py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">Resources</h1>
          <Button render={<Link href="/resources/new" />}>+ Add an item</Button>
        </div>

        <ResourcesList cards={cards} />
      </div>
    </main>
  );
}
