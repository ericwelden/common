import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ItemCard({ item, photoUrl, posterPhotoUrl, status, isOwn }) {
  return (
    <Card className="overflow-hidden py-0 shadow-sm transition hover:shadow-md">
      <Link href={`/resources/${item.id}`} className="flex flex-col">
        <div className="aspect-square w-full bg-muted">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- photoUrl is a short-lived signed URL, not a static asset next/image can optimize.
            <img
              src={photoUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <CardContent className="flex flex-col gap-1 py-4">
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
