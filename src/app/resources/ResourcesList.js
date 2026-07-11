"use client";

import { useId, useMemo, useState } from "react";
import ItemCard from "./ItemCard";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Filters client-side rather than round-tripping to the server per
// keystroke -- reasonable at neighborhood scale (dozens to low hundreds of
// items, not thousands).
export default function ResourcesList({ cards }) {
  const availableOnlyId = useId();
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter(({ item, status }) => {
      if (availableOnly && !status.available) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [cards, query, availableOnly]);

  if (cards.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nothing shared yet — be the first to add something.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items…"
          className="flex-1 bg-card"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Checkbox
            id={availableOnlyId}
            checked={availableOnly}
            onCheckedChange={(checked) => setAvailableOnly(checked === true)}
          />
          <Label htmlFor={availableOnlyId} className="text-sm font-normal text-muted-foreground">
            Available now only
          </Label>
        </div>
      </div>

      {filtered.length > 0 ? (
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
