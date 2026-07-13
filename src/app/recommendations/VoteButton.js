"use client";

import { useActionState, useState } from "react";
import { ThumbsUpIcon } from "lucide-react";
import { toggleRecommendationVote } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Removing your own vote is a single click, no confirmation -- but adding
// one first expands into an optional note, since that's the one moment
// this app can actually collect it (see Recommenders.js for where it's
// shown afterward). Submitting blank just votes with no note, same as
// clicking straight through used to.
export default function VoteButton({ recommendationId, count, hasVoted }) {
  const [state, action, pending] = useActionState(
    toggleRecommendationVote.bind(null, recommendationId),
    undefined
  );
  const [expanded, setExpanded] = useState(false);

  if (hasVoted) {
    return (
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          aria-pressed="true"
          className="flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors disabled:opacity-50"
        >
          <ThumbsUpIcon aria-hidden="true" className="size-3.5 fill-current" />
          {count}
        </button>
      </form>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-pressed="false"
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
        )}
      >
        <ThumbsUpIcon aria-hidden="true" className="size-3.5" />
        {count}
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
