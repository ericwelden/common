"use client";

import { useActionState, useState } from "react";
import { createItem } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewItemForm() {
  const [state, action, pending] = useActionState(createItem, undefined);
  const [previewUrl, setPreviewUrl] = useState(null);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Ladder, lawnmower, folding tables…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Anything a neighbor should know before borrowing it."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="photo">Photo</Label>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- a local object URL preview, not an optimizable static/remote asset.
          <img
            src={previewUrl}
            alt=""
            className="aspect-square w-32 rounded-lg border border-border object-cover"
          />
        )}
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          required
          onChange={handlePhotoChange}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Sharing…" : "Share this item"}
      </Button>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
