"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfileForm({
  initialName,
  initialStreet,
  initialAboutMe,
  initialPhotoUrl,
  initialVenmoHandle,
  initialCashappHandle,
  initialPaypalHandle,
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [previewUrl, setPreviewUrl] = useState(initialPhotoUrl ?? null);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : (initialPhotoUrl ?? null));
  }

  return (
    <form action={action} className="flex w-full max-w-xs flex-col gap-4 text-left">
      <div className="flex flex-col items-center gap-2 self-center">
        {/* No extra border class -- the primitive already draws its own ring
            via an ::after pseudo-element; a real border on top would double it. */}
        <Avatar className="size-20">
          {previewUrl && <AvatarImage src={previewUrl} alt="" />}
          <AvatarFallback aria-hidden="true" />
        </Avatar>
        <label className="cursor-pointer text-xs font-medium text-primary hover:underline">
          Change photo
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={initialName ?? ""}
          placeholder="Your name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="street" className="text-xs text-muted-foreground">
          Street
        </Label>
        <Input
          id="street"
          name="street"
          defaultValue={initialStreet ?? ""}
          placeholder="Maple Avenue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="aboutMe" className="text-xs text-muted-foreground">
          About me
        </Label>
        <Textarea
          id="aboutMe"
          name="aboutMe"
          rows={3}
          defaultValue={initialAboutMe ?? ""}
          placeholder="A little about you..."
        />
      </div>

      {/* All optional -- set any of these and a neighbor who reserves one of
          your items gets a skippable "send a thank-you" prompt after booking,
          with a link that opens straight to whichever of these they pick.
          This app never touches the money itself; it just builds the link. */}
      <div className="flex flex-col gap-1.5 border-t border-border pt-4">
        <p className="text-xs font-medium text-foreground">
          Payment handles (optional)
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          Let neighbors send you a thank-you when they borrow something of
          yours.
        </p>
      </div>

      {/* The leading @/$ is stripped before storage (see updateProfile in
          actions.js) -- link-building already adds the platform-correct
          symbol back where the URL needs it (paymentLinks.js), so storing it
          symbol-free avoids ever doubling up. Re-prepending it here just for
          display keeps that invisible to the user: what they see always
          matches what they'd naturally type. */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="venmoHandle" className="text-xs text-muted-foreground">
          Venmo
        </Label>
        <Input
          id="venmoHandle"
          name="venmoHandle"
          defaultValue={initialVenmoHandle ? `@${initialVenmoHandle}` : ""}
          placeholder="@your-venmo-handle"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cashappHandle" className="text-xs text-muted-foreground">
          Cash App
        </Label>
        <Input
          id="cashappHandle"
          name="cashappHandle"
          defaultValue={initialCashappHandle ? `$${initialCashappHandle}` : ""}
          placeholder="$yourcashtag"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paypalHandle" className="text-xs text-muted-foreground">
          PayPal
        </Label>
        <Input
          id="paypalHandle"
          name="paypalHandle"
          defaultValue={initialPaypalHandle ? `@${initialPaypalHandle}` : ""}
          placeholder="@your-paypal-handle"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {/* text-primary is now a near-black neutral (no distinct accent color
          left in the palette), so weight carries the "this succeeded" signal
          instead of a color barely different from ordinary body text. */}
      {state?.success && (
        <p className="text-sm font-medium text-foreground">Saved.</p>
      )}
    </form>
  );
}
