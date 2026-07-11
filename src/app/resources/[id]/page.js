import { notFound, redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/supabase/storage";
import { todayISO as getTodayISO, parseISODate } from "@/lib/date";
import Avatar from "@/components/Avatar";
import BookingCalendar from "./BookingCalendar";
import CancelReservationButton from "./CancelReservationButton";

export default async function ItemDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- see src/app/resources/page.js for why.
  if (!data?.claims) redirect("/profile?error=sign-in-required");
  const userId = data.claims.sub;
  const todayISO = getTodayISO();

  const { data: item } = await supabase
    .from("items")
    .select("*, profiles(display_name, photo_path)")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, reserver_id, start_date, end_date")
    .eq("item_id", id)
    .gte("end_date", todayISO)
    .order("start_date", { ascending: true });

  const [photoUrl, posterPhotoUrl] = await Promise.all([
    getSignedPhotoUrl(supabase, item.photo_path),
    item.profiles?.photo_path
      ? getSignedPhotoUrl(supabase, item.profiles.photo_path, "profile-photos")
      : null,
  ]);
  const isOwn = item.owner_id === userId;
  const myReservations = (reservations ?? []).filter(
    (r) => r.reserver_id === userId
  );

  return (
    <main className="flex-1 px-5 py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 sm:w-56">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL, not a static asset
              <img
                src={photoUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              {item.name}
            </h1>
            <div className="flex items-center gap-1.5">
              <Avatar photoUrl={posterPhotoUrl} />
              <p className="text-xs text-zinc-500">
                {isOwn
                  ? "posted by you"
                  : `posted by ${item.profiles?.display_name ?? "a neighbor"}`}
              </p>
            </div>
            {item.description && (
              <p className="text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {myReservations.length > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Your upcoming reservations
            </h2>
            <ul className="flex flex-col gap-2">
              {myReservations.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 text-sm text-zinc-600"
                >
                  <span>
                    {format(parseISODate(r.start_date), "MMM d")} –{" "}
                    {format(subDays(parseISODate(r.end_date), 1), "MMM d")}
                  </span>
                  <CancelReservationButton
                    reservationId={r.id}
                    itemId={item.id}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            Reserve this item
          </h2>
          <BookingCalendar itemId={item.id} reservations={reservations ?? []} />
        </div>
      </div>
    </main>
  );
}
