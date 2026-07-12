"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ItemCard from "./ItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available now" },
  { value: "unavailable", label: "Not available" },
];

// Filters client-side rather than round-tripping to the server per
// keystroke -- reasonable at neighborhood scale (dozens to low hundreds of
// items, not thousands).
export default function ResourcesList({ cards }) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter(({ item, status }) => {
      if (availability === "available" && !status.available) return false;
      if (availability === "unavailable" && status.available) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [cards, query, availability]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="shrink-0 text-lg font-semibold tracking-tight">
          Resources
        </h1>
        {/* flex-1 so this middle group claims the leftover space between the
            title and the button, then centers search+filter within it --
            that's what keeps the button pinned to the end even when the
            group below is empty (zero items) or narrower than that space. */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          {/* Search + filter are moot with nothing to search, so they only
              join the row once there's at least one item. */}
          {cards.length > 0 && (
            <>
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search items…"
                className="rounded-full sm:w-56"
              />
              <Select
                value={availability}
                onValueChange={setAvailability}
                items={AVAILABILITY_OPTIONS}
              >
                <SelectTrigger className="w-full shrink-0 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <Button render={<Link href="/resources/new" />} className="shrink-0">
          Add item
        </Button>
      </div>

      {cards.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nothing shared yet — be the first to add something.
        </p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map(({ item, photoUrl, posterPhotoUrl, status, isOwn }) => (
            <ItemCard
              key={item.id}
              item={item}
              photoUrl={photoUrl}
              posterPhotoUrl={posterPhotoUrl}
              status={status}
              isOwn={isOwn}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No items match your search.
        </p>
      )}
    </>
  );
}
