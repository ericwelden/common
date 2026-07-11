"use client";

import { useActionState, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, subDays, addDays } from "date-fns";
import { todayISO as getTodayISO, parseISODate } from "@/lib/date";
import { reserveItem } from "./actions";

// react-day-picker's classNames prop replaces the default (unstyled) class
// per part, matching the "no default CSS bleeds through" approach already
// used for MapLibre's controls in globals.css, just via props here instead
// of a stylesheet override.
const CALENDAR_CLASSNAMES = {
  root: "text-sm",
  months: "flex flex-col gap-4",
  month_caption:
    "flex items-center justify-center py-2 font-medium text-zinc-900",
  nav: "flex items-center justify-between",
  button_previous: "rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100",
  button_next: "rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-center text-xs font-medium text-zinc-400",
  week: "flex",
  day: "h-9 w-9 p-0 text-center",
  day_button: "h-9 w-9 rounded-full text-sm text-zinc-700 hover:bg-zinc-100",
  selected: "bg-emerald-600 text-white hover:bg-emerald-600",
  range_start: "rounded-l-full bg-emerald-600 text-white hover:bg-emerald-600",
  range_end: "rounded-r-full bg-emerald-600 text-white hover:bg-emerald-600",
  range_middle: "rounded-none bg-emerald-50 text-emerald-900",
  today: "font-semibold text-emerald-600",
  disabled:
    "cursor-not-allowed text-zinc-300 line-through hover:bg-transparent",
  outside: "text-zinc-300",
};

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
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        disabled={disabled}
        excludeDisabled
        classNames={CALENDAR_CLASSNAMES}
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
        <button
          type="submit"
          disabled={pending || !range?.from || !range?.to}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Reserving…" : "Reserve these dates"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
