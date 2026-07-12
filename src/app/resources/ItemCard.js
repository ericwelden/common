import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ItemCard({ item, photoUrl, posterPhotoUrl, status, isOwn }) {
  return (
    // Borderless and shadowless at rest -- Airbnb's photo cards let the
    // photo carry the weight, not a bounding box; shadow-elevated only
    // appears on hover. The photo rounds on all 4 corners via its own
    // rounded-2xl (not Card's clip-path -- Card's *:[img:first-child]
    // selector is a direct-child match that never reaches this nested
    // Card > Link > div > img structure). pt-0.5 overrides just the top
    // half of Card's own py-(--card-spacing) so the photo sits a tight
    // 2px from the card's left/top/right edges without touching the
    // bottom padding below the text, which stays at the card default.
    <Card className="overflow-hidden border-0 pt-0.5 shadow-none ring-0 transition-shadow duration-200 ease-out hover:shadow-elevated">
      {/* block, not flex flex-col -- a column-flex ancestor breaks the
          aspect-square child's aspect-ratio sizing once the <img> inside it
          has its own intrinsic ratio: the box ends up sized to the image's
          ratio instead of the square it's supposed to crop to. Plain block
          stacking achieves the same vertical layout without that bug. */}
      <Link href={`/resources/${item.id}`} className="block">
        <div className="mx-0.5 aspect-square overflow-hidden rounded-2xl bg-muted">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- photoUrl is a short-lived signed URL, not a static asset next/image can optimize.
            <img
              src={photoUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <CardContent className="flex flex-col gap-1 pt-3">
          <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {item.name}
          </h2>
          <div className="flex items-center gap-1.5">
            <Avatar photoUrl={posterPhotoUrl} />
            <p className="truncate text-xs text-muted-foreground">
              {isOwn ? "posted by you" : `posted by ${item.profiles?.display_name ?? "a neighbor"}`}
            </p>
          </div>
          <Badge
            variant={status.available ? "default" : "secondary"}
            className="mt-2 w-fit"
          >
            {status.label}
          </Badge>
        </CardContent>
      </Link>
    </Card>
  );
}
