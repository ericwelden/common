"use client";

import { useActionState } from "react";
import { deleteRecommendation } from "./actions";

export default function DeleteRecommendationButton({ recommendationId }) {
  const [state, action, pending] = useActionState(
    deleteRecommendation.bind(null, recommendationId),
    undefined
  );

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-muted-foreground hover:text-destructive"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state?.error && (
        <span className="ml-2 text-xs text-destructive">{state.error}</span>
      )}
    </form>
  );
}
