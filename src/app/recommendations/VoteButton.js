"use client";

import { useActionState, useState } from "react";
import { ThumbsUpIcon } from "lucide-react";
import { addVote } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Only ever rendered when the viewer hasn't already contributed a review of
// their own (see Recommenders.js) -- once they have, their own entry in the
// reviews list carries its own delete control instead, so this never needs
// a "remove" state. Clicking expands into an optional note, since that's
// the one moment this app can actually collect it; submitting blank just
// adds a plain +1, same as clicking straight through used to.
export default function VoteButton({ recommendationId }) {
  const [state, action, pending] = useActionState(
    addVote.bind(null, recommendationId),
    undefined
  );
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-fit items-center gap-1.5 self-start rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        <ThumbsUpIcon aria-hidden="true" className="size-3.5" />
        Recommend this too
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
      <Textarea
        name="note"
        rows={2}
        placeholder="Add why you recommend it too (optional)"
        className="text-xs"
        autoFocus
      />
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-medium text-muted-foreground"
        >
          Cancel
        </button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Recommend"}
        </Button>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
