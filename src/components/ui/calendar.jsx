"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-card p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(10)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        // Always stacked vertically (no md:flex-row side-by-side) -- matches
        // the reference "Change dates" picker, where every month is a
        // scrollable section rather than two calendars sitting side by side.
        months: cn("relative flex flex-col gap-8", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn("relative rounded-(--cell-radius)", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
        caption_label: cn("font-semibold select-none", captionLayout === "label"
          ? "text-lg"
          : "flex items-center gap-1 rounded-(--cell-radius) text-lg [&>svg]:size-3.5 [&>svg]:text-muted-foreground", defaultClassNames.caption_label),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-3 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        // No row-edge rounding hack here anymore (the old [&:first-child.../
        // [&:last-child...] rules rounded whichever side of a *row* a
        // selected day landed on -- Sunday/Saturday columns -- regardless of
        // whether that day was actually the range's start or end. Those
        // rules used a compound descendant+attribute selector, which beats a
        // plain class on specificity, so they silently overrode CalendarDayButton's
        // own rounding any time a range endpoint happened to land on a row
        // boundary -- exactly the half-rounded shape that was reported.
        // Rounding is now driven purely by data-range-start/data-range-end on
        // the button itself, which is correct regardless of row position.
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none",
          defaultClassNames.day
        ),
        // Cells fill their full width with no gap between them, and the
        // button inside now has a flat inner edge for range endpoints (see
        // CalendarDayButton), so adjacent range cells already sit flush
        // against each other -- no bridging trick needed here anymore.
        range_start: cn("relative isolate z-0", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("relative isolate z-0", defaultClassNames.range_end),
        // Lighter tint of the brand coral (bg-primary/10), not grey -- same
        // "light fill + solid-color text" pattern already used for the
        // destructive Button variant elsewhere in this app.
        today: cn(
          "rounded-(--cell-radius) bg-primary/10 text-primary data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50 line-through", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (<div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />);
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (<ChevronLeftIcon strokeWidth={1.75} className={cn("size-4", className)} {...props} />);
          }

          if (orientation === "right") {
            return (<ChevronRightIcon strokeWidth={1.75} className={cn("size-4", className)} {...props} />);
          }

          return (<ChevronDownIcon strokeWidth={1.75} className={cn("size-4", className)} {...props} />);
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div
                className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props} />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        // bg-foreground/text-background (near-black), not the app's coral
        // bg-primary -- matches the reference date picker's own colors,
        // which stay neutral even though the rest of the app uses coral CTAs.
        //
        // Base is a full circle (single-day selections and plain hover both
        // want that), but a range's start/end round *only* their outer side
        // -- rounded-r-none/rounded-l-none flatten the inner side facing the
        // rest of the range, so the selection reads as one continuous
        // capsule (rounded caps, flat middle) instead of two separate
        // circles no matter where start/end land in the grid.
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-full border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-start=true]:rounded-r-none data-[range-start=true]:bg-foreground data-[range-start=true]:text-background data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-end=true]:rounded-l-none data-[range-end=true]:bg-foreground data-[range-end=true]:text-background data-[selected-single=true]:bg-foreground data-[selected-single=true]:text-background dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props} />
  );
}

export { Calendar, CalendarDayButton }
