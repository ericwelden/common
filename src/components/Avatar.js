import {
  Avatar as AvatarPrimitive,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// Shared by every "posted by" line (item cards, item detail, recommendations)
// so a future change to how avatars look happens in one place.
export default function Avatar({ photoUrl }) {
  return (
    // No extra border class here -- the primitive already draws its own ring
    // via an ::after pseudo-element sized to the root's full box; adding a
    // real `border` on top shrinks the content box and doubles the ring.
    <AvatarPrimitive size="sm">
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      {/* Purely decorative placeholder -- the accessible "posted by X" text
          sits right next to it, so this shouldn't be announced separately. */}
      <AvatarFallback aria-hidden="true" />
    </AvatarPrimitive>
  );
}
