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
        <Avatar className="size-20 border border-border">
          {previewUrl && <AvatarImage src={previewUrl} alt="" />}
          <AvatarFallback />
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
        <Label htmlFor="displayName" className="text-xs text-muted-foreground">
          Display name
        </Label>
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

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Saved.</p>}
    </form>
  );
}
