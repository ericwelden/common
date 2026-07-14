"use client";

import { useActionState } from "react";
import { deleteVote } from "./actions";

export default function DeleteVoteButton({ voteId }) {
  const [state, action, pending] = useActionState(
    deleteVote.bind(null, voteId),
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
