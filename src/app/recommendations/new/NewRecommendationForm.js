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
        <Label htmlFor="businessName">Business name</Label>
        <Input
          id="businessName"
          name="businessName"
          placeholder="Dave's Plumbing"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contactName" className="text-xs text-muted-foreground">
          Contact name
        </Label>
        <Input id="contactName" name="contactName" placeholder="Dave Smith" />
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        At least a business name or a contact name is required.
      </p>

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

      <div className="flex flex-col gap-1.5 border-t border-border pt-4">
        <p className="text-xs font-medium text-foreground">
          Contact info (optional)
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-xs text-muted-foreground">
          Phone
        </Label>
        <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-xs text-muted-foreground">
          Email
        </Label>
        <Input id="email" name="email" type="email" placeholder="dave@example.com" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website" className="text-xs text-muted-foreground">
          Website
        </Label>
        <Input id="website" name="website" placeholder="davesplumbing.com" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post recommendation"}
      </Button>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
