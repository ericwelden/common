import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/supabase/storage";
import { todayISO as getTodayISO, parseISODate } from "@/lib/date";
import Avatar from "@/components/Avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BookingCalendar from "./BookingCalendar";
import CancelReservationButton from "./CancelReservationButton";

function ReservationsList({ reservations, itemId }) {
  return (
    <ul className="flex flex-col gap-2">
      {reservations.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <span>
            {format(parseISODate(r.start_date), "MMM d")} –{" "}
            {format(subDays(parseISODate(r.end_date), 1), "MMM d")}
          </span>
          <CancelReservationButton reservationId={r.id} itemId={itemId} />
        </li>
      ))}
    </ul>
  );
}

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
    .select(
      "*, profiles(display_name, photo_path, venmo_handle, cashapp_handle, paypal_handle)"
    )
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
    <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:px-5 sm:py-6 sm:pb-6">
      {/* Mobile: full-bleed hero photo (no page padding above/beside it) with
          a rounded card of details pulled up over its bottom edge. Desktop
          keeps the original constrained, side-by-side layout below,
          unchanged -- this treatment was asked for "on mobile" specifically. */}
      <div className="sm:hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL, not a static asset
            <img
              src={photoUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          )}
          <Link
            href="/resources"
            aria-label="Back to Resources"
            className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-elevated backdrop-blur-sm"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-5" />
          </Link>
        </div>

        <div className="relative -mt-6 flex flex-col gap-2 rounded-t-3xl bg-card px-5 pb-6 pt-6 shadow-elevated">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {item.name}
            </h1>
            {isOwn && (
              <Link
                href={`/resources/${item.id}/edit`}
                className="shrink-0 pt-1 text-sm font-medium text-primary"
              >
                Edit
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar photoUrl={posterPhotoUrl} />
            <p className="text-xs text-muted-foreground">
              {isOwn
                ? "posted by you"
                : `posted by ${item.profiles?.display_name ?? "a neighbor"}`}
            </p>
          </div>
          {item.description && (
            <p className="text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          )}

          {myReservations.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Your upcoming reservations
              </h2>
              <ReservationsList reservations={myReservations} itemId={item.id} />
            </div>
          )}

          <div className="mt-4">
            <BookingCalendar
              itemId={item.id}
              reservations={reservations ?? []}
              presentation="drawer"
              ownerId={item.owner_id}
              ownerDisplayName={item.profiles?.display_name ?? "the owner"}
              ownerVenmoHandle={item.profiles?.venmo_handle}
              ownerCashappHandle={item.profiles?.cashapp_handle}
              ownerPaypalHandle={item.profiles?.paypal_handle}
              itemSuggestedDailyRate={item.suggested_daily_rate}
              currentUserId={userId}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-2xl flex-col gap-6 sm:flex">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-muted sm:w-56">
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
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {item.name}
              </h1>
              {isOwn && (
                <Link
                  href={`/resources/${item.id}/edit`}
                  className="shrink-0 text-sm font-medium text-primary"
                >
                  Edit
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Avatar photoUrl={posterPhotoUrl} />
              <p className="text-xs text-muted-foreground">
                {isOwn
                  ? "posted by you"
                  : `posted by ${item.profiles?.display_name ?? "a neighbor"}`}
              </p>
            </div>
            {item.description && (
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {myReservations.length > 0 && (
          <Card>
            <CardHeader>
              {/* A real heading, not shadcn's CardTitle -- CardTitle renders
                  a plain <div>, and this page's other heading ("Reserve this
                  item" below) is a real <h2>, so this stayed inconsistent. */}
              <h2 className="text-sm font-semibold text-foreground">
                Your upcoming reservations
              </h2>
            </CardHeader>
            <CardContent>
              <ReservationsList reservations={myReservations} itemId={item.id} />
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Reserve this item
          </h2>
          <BookingCalendar
            itemId={item.id}
            reservations={reservations ?? []}
            ownerId={item.owner_id}
            ownerDisplayName={item.profiles?.display_name ?? "the owner"}
            ownerVenmoHandle={item.profiles?.venmo_handle}
            ownerCashappHandle={item.profiles?.cashapp_handle}
            ownerPaypalHandle={item.profiles?.paypal_handle}
            itemSuggestedDailyRate={item.suggested_daily_rate}
            currentUserId={userId}
          />
        </div>
      </div>
    </main>
  );
}
