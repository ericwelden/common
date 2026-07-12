"use client";

import { useActionState, useState } from "react";
import { format, subDays, addDays, differenceInCalendarDays } from "date-fns";
import { XIcon } from "lucide-react";
import { todayISO as getTodayISO, parseISODate } from "@/lib/date";
import { reserveItem } from "./actions";
import ThankOwnerPrompt from "./ThankOwnerPrompt";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// presentation="inline" (default, desktop): the calendar and its Reserve
// button sit directly on the page, always visible -- the original behavior.
// presentation="drawer" (mobile): a "Reserve" button opens the calendar in a
// full-screen bottom sheet with its own header/footer, matching a "Change
// dates" picker rather than an always-open inline widget.
export default function BookingCalendar({
  itemId,
  reservations,
  presentation = "inline",
  ownerId,
  ownerDisplayName,
  ownerVenmoHandle,
  ownerCashappHandle,
  ownerPaypalHandle,
  itemSuggestedDailyRate,
  currentUserId,
}) {
  const [range, setRange] = useState();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reserveItem, undefined);

  // Shown once, right after a successful reservation, in place of the
  // calendar -- see ThankOwnerPrompt.js. Never shown for a self-reservation
  // (nothing to gate on if you're borrowing your own item) or when the
  // owner hasn't set up any payment handle.
  const [showThankYou, setShowThankYou] = useState(false);
  const [completedDays, setCompletedDays] = useState(0);
  const canShowThankYou =
    currentUserId !== ownerId &&
    Boolean(ownerVenmoHandle || ownerCashappHandle || ownerPaypalHandle);

  // A successful reservation clears the selection -- otherwise the just-booked
  // range stays visually "selected" even though it's now also in the
  // (revalidated) reservations list and therefore disabled. Adjusted during
  // render (React's recommended pattern) rather than in a useEffect, which
  // would cause an extra cascading render for the same result.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) {
      // "Days you'll have it," not "nights stayed" -- matches how the app
      // already reads the calendar's inclusive end day (see endDateValue
      // below), just measured before range gets cleared out from under it.
      const days =
        range?.from && range?.to
          ? differenceInCalendarDays(range.to, range.from) + 1
          : 0;
      setCompletedDays(days);
      setRange(undefined);
      if (canShowThankYou) {
        setShowThankYou(true);
      } else {
        setOpen(false);
      }
    }
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

  const startDateValue = range?.from ? format(range.from, "yyyy-MM-dd") : "";
  // The calendar's "to" is read as the last day you'll have the item
  // (inclusive) -- the natural reading for borrowing something, vs. a
  // hotel's "night stayed" convention. The DB's end_date is the exclusive
  // checkout day, one day after that.
  const endDateValue = range?.to ? format(addDays(range.to, 1), "yyyy-MM-dd") : "";
  const canSubmit = !pending && Boolean(range?.from) && Boolean(range?.to);

  // Any way the drawer closes (X, swipe, backdrop) should also reset back to
  // the calendar view for next time -- one place to keep that in sync,
  // rather than wiring the same cleanup into every individual close trigger.
  function handleOpenChange(next) {
    setOpen(next);
    if (!next) setShowThankYou(false);
  }

  const thankYouPrompt = (
    <ThankOwnerPrompt
      ownerName={ownerDisplayName}
      venmoHandle={ownerVenmoHandle}
      cashappHandle={ownerCashappHandle}
      paypalHandle={ownerPaypalHandle}
      nights={completedDays}
      suggestedDailyRate={itemSuggestedDailyRate}
      onDismiss={() => handleOpenChange(false)}
    />
  );

  if (presentation === "drawer") {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger render={<Button className="w-full" />}>
          Reserve
        </DrawerTrigger>
        <DrawerContent className="h-[92dvh]">
          {showThankYou ? (
            <div className="flex h-full flex-col">
              <DrawerHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <DrawerTitle className="text-lg font-semibold">
                  All set!
                </DrawerTitle>
                <DrawerClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label="Close"
                    />
                  }
                >
                  <XIcon aria-hidden="true" />
                </DrawerClose>
              </DrawerHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {thankYouPrompt}
              </div>
            </div>
          ) : (
            <form action={action} className="flex h-full flex-col">
              <input type="hidden" name="itemId" value={itemId} />
              <input type="hidden" name="startDate" value={startDateValue} />
              <input type="hidden" name="endDate" value={endDateValue} />

              <DrawerHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <DrawerTitle className="text-lg font-semibold">
                  Change dates
                </DrawerTitle>
                <DrawerClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label="Close"
                    />
                  }
                >
                  <XIcon aria-hidden="true" />
                </DrawerClose>
              </DrawerHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  disabled={disabled}
                  excludeDisabled
                  numberOfMonths={2}
                  // With two months stacked and scrollable, a trailing/leading
                  // filler day (e.g. Aug 1 at the end of July's grid) would
                  // just repeat the same date that's about to appear as a real
                  // cell at the start of the next month's own grid.
                  showOutsideDays={false}
                  className="w-full border-0 p-0"
                />
              </div>

              <DrawerFooter className="flex flex-row items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setRange(undefined)}
                  className="text-sm font-semibold text-foreground"
                >
                  Clear dates
                </button>
                {/* Deliberately near-black, not the app's coral primary --
                    matches the reference screenshot's own date-picker colors,
                    which stay neutral even on a site whose CTAs elsewhere are
                    colored. "Save" doubles as the actual reserve submission --
                    this app has no separate staging/checkout step. */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {pending ? "Saving…" : "Save"}
                </Button>
              </DrawerFooter>
              {state?.error && (
                <p className="px-4 pb-4 text-sm text-destructive">{state.error}</p>
              )}
            </form>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showThankYou ? (
        thankYouPrompt
      ) : (
        <>
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
            <input type="hidden" name="startDate" value={startDateValue} />
            <input type="hidden" name="endDate" value={endDateValue} />
            <Button type="submit" disabled={!canSubmit}>
              {pending ? "Reserving…" : "Reserve these dates"}
            </Button>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          </form>
        </>
      )}
    </div>
  );
}
