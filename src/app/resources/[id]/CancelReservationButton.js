"use client";

import { useActionState } from "react";
import { cancelReservation } from "./actions";

export default function CancelReservationButton({ reservationId, itemId }) {
  const [state, action, pending] = useActionState(
    cancelReservation.bind(null, reservationId, itemId),
    undefined
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Canceling…" : "Cancel"}
      </button>
      {state?.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
    </form>
  );
}
