"use client";

import { useMemo, useState } from "react";

// Filters client-side rather than round-tripping to the server per
// keystroke -- reasonable at neighborhood scale. Categories are free text
// (no fixed taxonomy), so the filter dropdown is built from whatever
// categories neighbors have actually used so far, not a hardcoded list.
export default function RecommendationsList({ recommendations, userId }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(recommendations.map((rec) => rec.category))].sort(),
    [recommendations]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recommendations.filter((rec) => {
      if (category !== "all" && rec.category !== category) return false;
      if (!q) return true;
      return (
        rec.name.toLowerCase().includes(q) ||
        rec.note.toLowerCase().includes(q)
      );
    });
  }, [recommendations, query, category]);

  if (recommendations.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        No recommendations yet — be the first to share one.
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
          placeholder="Search recommendations…"
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-emerald-600 focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {filtered.map((rec) => (
            <li
              key={rec.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold text-zinc-900">
                  {rec.name}
                </h2>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {rec.category}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {rec.note}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                —{" "}
                {rec.author_id === userId
                  ? "posted by you"
                  : `posted by ${rec.profiles?.display_name ?? "a neighbor"}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-zinc-500">
          No recommendations match your search.
        </p>
      )}
    </>
  );
}
