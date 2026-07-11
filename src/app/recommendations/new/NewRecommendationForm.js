"use client";

import { useActionState } from "react";
import { createRecommendation } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewRecommendationForm() {
  const [state, action, pending] = useActionState(
    createRecommendation,
    undefined
  );

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Dave's Plumbing" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          required
          placeholder="Home services, food & drink, babysitting…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Why do you recommend it?</Label>
        <Textarea
          id="note"
          name="note"
          rows={3}
          required
          placeholder="Called them for a leak, fixed same day and fair price."
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post recommendation"}
      </Button>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
