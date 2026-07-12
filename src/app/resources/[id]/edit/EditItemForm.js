"use client";

import { useActionState, useState } from "react";
import { updateItem } from "../actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditItemForm({
  itemId,
  initialName,
  initialDescription,
  initialPhotoUrl,
  initialSuggestedDailyRate,
}) {
  const [state, action, pending] = useActionState(
    updateItem.bind(null, itemId),
    undefined
  );
  const [previewUrl, setPreviewUrl] = useState(initialPhotoUrl ?? null);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : (initialPhotoUrl ?? null));
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initialName ?? ""}
          placeholder="Ladder, lawnmower, folding tables…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialDescription ?? ""}
          placeholder="Anything a neighbor should know before borrowing it."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="photo">Photo</Label>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- a signed URL or local object URL preview, not an optimizable static/remote asset.
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
          onChange={handlePhotoChange}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="suggestedDailyRate" className="text-xs text-muted-foreground">
          Suggested $ per day (optional)
        </Label>
        <Input
          id="suggestedDailyRate"
          name="suggestedDailyRate"
          type="number"
          min="0"
          max="100"
          step="1"
          inputMode="numeric"
          defaultValue={initialSuggestedDailyRate ?? ""}
          placeholder="5"
        />
        <p className="text-xs text-muted-foreground">
          Shown as a suggested thank-you amount when someone reserves this.
        </p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
