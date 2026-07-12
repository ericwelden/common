import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";

// No card container at all -- Airbnb's grid has no bounding box, border, or
// background behind a listing; the rounded photo and the text below it are
// the whole "card". The status tag floats directly on the photo instead of
// sitting in a text row below it.
export default function ItemCard({ item, photoUrl, posterPhotoUrl, status, isOwn }) {
  return (
    <Link href={`/resources/${item.id}`} className="block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- photoUrl is a short-lived signed URL, not a static asset next/image can optimize.
          <img
            src={photoUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        )}
        {/* Opaque white pill (not the usual translucent secondary grey) so
            the tag stays legible over whatever's in the photo underneath,
            matching Airbnb's "Guest favorite" treatment. */}
        <Badge className="absolute left-2 top-2 border-0 bg-card text-foreground shadow-elevated">
          {status.label}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 pt-3">
        <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {item.name}
        </h2>
        <div className="flex items-center gap-1.5">
          <Avatar photoUrl={posterPhotoUrl} />
          <p className="truncate text-xs text-muted-foreground">
            {isOwn ? "posted by you" : `posted by ${item.profiles?.display_name ?? "a neighbor"}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
