"use client";

import { useActionState, useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { todayISO as getTodayISO, parseISODate } from "@/lib/date";
import { reserveItem } from "./actions";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function BookingCalendar({ itemId, reservations }) {
  const [range, setRange] = useState();
  const [state, action, pending] = useActionState(reserveItem, undefined);

  // A successful reservation clears the selection -- otherwise the just-booked
  // range stays visually "selected" even though it's now also in the
  // (revalidated) reservations list and therefore disabled. Adjusted during
  // render (React's recommended pattern) rather than in a useEffect, which
  // would cause an extra cascading render for the same result.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) setRange(undefined);
  }

  // Same neighborhood-fixed timezone as the server's re-validation (see
  // src/lib/date.js) -- using the browser's local clock here instead let a
  // date the server treated as "yesterday" still show as selectable.
  const today = parseISODate(getTodayISO());

  const disabled = [
    { before: today },
    // Block through the night before each reservation's exclusive end_date
    // (the checkout day itself stays selectable as someone else's check-in).
    ...reservations.map((r) => ({
      from: parseISODate(r.start_date),
      to: subDays(parseISODate(r.end_date), 1),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        disabled={disabled}
        excludeDisabled
        className="rounded-lg border border-border"
      />

      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="itemId" value={itemId} />
        <input
          type="hidden"
          name="startDate"
          value={range?.from ? format(range.from, "yyyy-MM-dd") : ""}
        />
        {/* The calendar's "to" is read as the last day you'll have the item
            (inclusive) -- the natural reading for borrowing something, vs. a
            hotel's "night stayed" convention. The DB's end_date is the
            exclusive checkout day, one day after that. */}
        <input
          type="hidden"
          name="endDate"
          value={
            range?.to ? format(addDays(range.to, 1), "yyyy-MM-dd") : ""
          }
        />
        <Button
          type="submit"
          disabled={pending || !range?.from || !range?.to}
        >
          {pending ? "Reserving…" : "Reserve these dates"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </form>
    </div>
  );
}
