"use client";

import { useMemo, useState } from "react";
import ItemCard from "./ItemCard";

// Filters client-side rather than round-tripping to the server per
// keystroke -- reasonable at neighborhood scale (dozens to low hundreds of
// items, not thousands).
export default function ResourcesList({ cards }) {
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
      <p className="py-12 text-center text-sm text-zinc-500">
        Nothing shared yet — be the first to add something.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items…"
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
        <label className="flex shrink-0 items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(event) => setAvailableOnly(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
          />
          Available now only
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map(({ item, photoUrl, status, isOwn }) => (
            <ItemCard
              key={item.id}
              item={item}
              photoUrl={photoUrl}
              status={status}
              isOwn={isOwn}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-zinc-500">
          No items match your search.
        </p>
      )}
    </>
  );
}
