"use client";

import { useActionState } from "react";
import { ThumbsUpIcon } from "lucide-react";
import { toggleRecommendationVote } from "./actions";
import { cn } from "@/lib/utils";

// One neighbor, one vote -- clicking again withdraws it (toggleRecommendationVote
// is a toggle, not a one-way add). The count shown includes the original
// poster (see RecommendationsList.js: count = 1 + votes.length), so this
// button's own label only needs to reflect whether *this* viewer has added
// their own +1, not carry the total by itself.
export default function VoteButton({ recommendationId, count, hasVoted }) {
  const [, action, pending] = useActionState(
    toggleRecommendationVote.bind(null, recommendationId),
    undefined
  );

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        aria-pressed={hasVoted}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
          hasVoted
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        <ThumbsUpIcon
          aria-hidden="true"
          className={cn("size-3.5", hasVoted && "fill-current")}
        />
        {count}
      </button>
    </form>
  );
}
