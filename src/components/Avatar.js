import {
  Avatar as AvatarPrimitive,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// Shared by every "posted by" line (item cards, item detail, recommendations)
// so a future change to how avatars look happens in one place.
export default function Avatar({ photoUrl }) {
  return (
    <AvatarPrimitive size="sm" className="border border-border">
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback />
    </AvatarPrimitive>
  );
}
