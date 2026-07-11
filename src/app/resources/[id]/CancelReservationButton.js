"use client";

import { useActionState } from "react";
import { cancelReservation } from "./actions";
import { Button } from "@/components/ui/button";

export default function CancelReservationButton({ reservationId, itemId }) {
  const [state, action, pending] = useActionState(
    cancelReservation.bind(null, reservationId, itemId),
    undefined
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <Button type="submit" variant="link" size="sm" disabled={pending} className="h-auto p-0 text-destructive">
        {pending ? "Canceling…" : "Cancel"}
      </Button>
      {state?.error && (
        <span className="text-xs text-destructive">{state.error}</span>
      )}
    </form>
  );
}
