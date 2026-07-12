"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import { Input } from "@/components/ui/input";
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

  if (recommendations.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No recommendations yet — be the first to share one.
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
          placeholder="Search recommendations…"
          className="flex-1"
        />
        <Select
          value={category}
          onValueChange={setCategory}
          items={[
            { value: "all", label: "All categories" },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
        >
          <SelectTrigger className="w-full shrink-0 sm:w-48">
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

      {filtered.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {filtered.map((rec) => (
            <li key={rec.id}>
              <Card>
                {/* flex, not just flex-row -- CardHeader's base className is
                    `grid`, and flex-row alone (no `flex`) doesn't switch that
                    off, so the badge silently dropped to its own row below
                    the name instead of sitting beside it. Same bug as
                    AboutCard.js's close button. */}
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  {/* A real heading, not shadcn's CardTitle -- CardTitle
                      renders a plain <div>, which would drop every
                      recommendation's name from heading navigation. */}
                  <h2 className="font-heading text-base leading-snug font-medium">
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
                        : `posted by ${rec.profiles?.display_name ?? "a neighbor"}`}
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
