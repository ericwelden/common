"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import Avatar from "@/components/Avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filters client-side rather than round-tripping to the server per
// keystroke -- reasonable at neighborhood scale. Categories are free text
// (no fixed taxonomy), so the filter dropdown is built from whatever
// categories neighbors have actually used so far, not a hardcoded list.
export default function RecommendationsList({
  recommendations,
  posterPhotoUrls,
  userId,
}) {
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

  return (
    <>
      {/* Mobile: title + a small icon+label button inline on one row, search
          + filter smaller on their own row below. Desktop (sm+): the
          original single centered row. Two separate blocks (one per
          breakpoint) rather than one responsive tree, matching this app's
          existing BottomNav/HeaderNav split for the same reason -- the
          mobile and desktop arrangements differ enough structurally that
          forcing one DOM shape to cover both got harder to reason about
          than just rendering each. */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Recommendations
          </h1>
          {/* Shortened from "Add recommendation" -- with the longer
              "Recommendations" title, the full label overflows at narrow
              widths (~320px, e.g. iPhone SE), the same reason BottomNav.js
              uses short labels ("Recs" etc.) instead of full nav-item names. */}
          <Button render={<Link href="/recommendations/new" />} size="sm" className="shrink-0">
            <PlusIcon aria-hidden="true" />
            Add
          </Button>
        </div>
        {recommendations.length > 0 && (
          <div className="flex items-center gap-2">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recommendations…"
              className="h-9 flex-1 rounded-full"
            />
            <Select
              value={category}
              onValueChange={setCategory}
              items={[
                { value: "all", label: "All categories" },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
            >
              <SelectTrigger size="sm" className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="hidden sm:flex sm:items-center sm:gap-3">
        <h1 className="shrink-0 text-lg font-semibold tracking-tight">
          Recommendations
        </h1>
        {/* flex-1 so this middle group claims the leftover space between the
            title and the button, then centers search+filter within it --
            that's what keeps the button pinned to the end even when the
            group below is empty (zero recommendations) or narrower than
            that space. */}
        <div className="flex flex-1 items-center justify-center gap-3">
          {/* Search + filter are moot with nothing to search, so they only
              join the row once there's at least one recommendation. */}
          {recommendations.length > 0 && (
            <>
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search recommendations…"
                className="rounded-full sm:w-56"
              />
              <Select
                value={category}
                onValueChange={setCategory}
                items={[
                  { value: "all", label: "All categories" },
                  ...categories.map((cat) => ({ value: cat, label: cat })),
                ]}
              >
                <SelectTrigger className="w-full shrink-0 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <Button render={<Link href="/recommendations/new" />} className="shrink-0">
          Add recommendation
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No recommendations yet — be the first to share one.
        </p>
      ) : filtered.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {filtered.map((rec) => (
            <li key={rec.id}>
              {/* shadow-elevated at rest (not just on hover) -- unlike the
                  photo cards on /resources, these have no photo to carry
                  visual weight, so they keep the hairline ring plus a resting
                  shadow, matching Airbnb's own text-heavy card tokens. */}
              <Card className="shadow-elevated">
                {/* flex, not just flex-row -- CardHeader's base className is
                    `grid`, and flex-row alone (no `flex`) doesn't switch that
                    off, so the badge silently dropped to its own row below
                    the name instead of sitting beside it. Same bug as
                    AboutCard.js's close button. */}
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  {/* A real heading, not shadcn's CardTitle -- CardTitle
                      renders a plain <div>, which would drop every
                      recommendation's name from heading navigation. */}
                  <h2 className="font-heading text-base leading-snug font-semibold">
                    {rec.name}
                  </h2>
                  <Badge variant="secondary" className="shrink-0">
                    {rec.category}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {rec.note}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>—</span>
                    <Avatar photoUrl={posterPhotoUrls[rec.profiles?.photo_path]} />
                    <span>
                      {rec.author_id === userId
                        ? "posted by you"
                        : `posted by ${rec.profiles?.display_name ?? rec.author_name ?? "a neighbor"}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No recommendations match your search.
        </p>
      )}
    </>
  );
}
