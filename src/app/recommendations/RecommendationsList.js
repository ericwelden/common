"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GlobeIcon, MailIcon, PhoneIcon, PlusIcon } from "lucide-react";
import VoteButton from "./VoteButton";
import DeleteRecommendationButton from "./DeleteRecommendationButton";
import Recommenders from "./Recommenders";
import { RECOMMENDATION_CATEGORIES } from "@/lib/recommendationCategories";
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
// keystroke -- reasonable at neighborhood scale. The category filter uses
// the fixed taxonomy (src/lib/recommendationCategories.js), not whatever's
// currently in use -- picking "Legal" should work even before anyone's
// posted one. Selecting "Other" matches every other_category, but the free
// text search box can still find a specific one ("knife" finds the knife
// sharpener even though its category is just "Other").
export default function RecommendationsList({
  recommendations,
  photoUrls,
  userId,
  votesByRec,
  myVotedRecIds,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recommendations.filter((rec) => {
      if (category !== "all" && rec.category !== category) return false;
      if (!q) return true;
      return (
        rec.business_name?.toLowerCase().includes(q) ||
        rec.contact_name?.toLowerCase().includes(q) ||
        rec.other_category?.toLowerCase().includes(q) ||
        rec.note?.toLowerCase().includes(q)
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
                ...RECOMMENDATION_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
            >
              <SelectTrigger size="sm" className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {RECOMMENDATION_CATEGORIES.map((cat) => (
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
                  ...RECOMMENDATION_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
                ]}
              >
                <SelectTrigger className="w-full shrink-0 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {RECOMMENDATION_CATEGORIES.map((cat) => (
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
          {filtered.map((rec) => {
            const primary = {
              name: rec.profiles?.display_name ?? rec.author_name ?? "a neighbor",
              photoUrl: photoUrls[rec.profiles?.photo_path],
              isYou: rec.author_id === userId,
            };
            const others = (votesByRec[rec.id] ?? []).map((v) => ({
              voterId: v.voterId,
              name: v.name,
              photoUrl: photoUrls[v.photoPath],
              note: v.note,
              isYou: v.voterId === userId,
            }));
            const voteCount = 1 + others.length;

            return (
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
                      recommendation's name from heading navigation.
                      business_name and contact_name are both optional (the
                      DB only requires at least one) -- whichever exists
                      leads the heading, and if both are set the other shows
                      as a small line underneath rather than getting lost. */}
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-heading text-base leading-snug font-semibold">
                      {rec.business_name ?? rec.contact_name}
                    </h2>
                    {rec.business_name && rec.contact_name && (
                      <p className="text-xs text-muted-foreground">
                        {rec.contact_name}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {rec.category === "Other" ? `Other: ${rec.other_category}` : rec.category}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {/* Only null after a promotion where the newly-promoted
                      author hadn't left their own note (see
                      deleteRecommendation in actions.js) -- never inheriting
                      someone else's words rather than showing empty text. */}
                  {rec.note && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {rec.note}
                    </p>
                  )}
                  {(rec.phone || rec.email || rec.website) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {rec.phone && (
                        <a
                          href={`tel:${rec.phone}`}
                          className="flex items-center gap-1 text-xs font-medium text-primary"
                        >
                          <PhoneIcon aria-hidden="true" className="size-3.5" />
                          {rec.phone}
                        </a>
                      )}
                      {rec.email && (
                        <a
                          href={`mailto:${rec.email}`}
                          className="flex items-center gap-1 text-xs font-medium text-primary"
                        >
                          <MailIcon aria-hidden="true" className="size-3.5" />
                          {rec.email}
                        </a>
                      )}
                      {rec.website && (
                        <a
                          href={/^https?:\/\//i.test(rec.website) ? rec.website : `https://${rec.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-primary"
                        >
                          <GlobeIcon aria-hidden="true" className="size-3.5" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                  <Recommenders primary={primary} others={others} />
                  {/* Delete only ever shows for the card's current author
                      (also enforced server-side via RLS, see actions.js) --
                      everyone else gets the +1 control instead, never both. */}
                  <div className="flex items-center justify-between gap-3">
                    {rec.author_id === userId ? (
                      <DeleteRecommendationButton recommendationId={rec.id} />
                    ) : (
                      <span />
                    )}
                    {rec.author_id !== userId && (
                      <VoteButton
                        recommendationId={rec.id}
                        count={voteCount}
                        hasVoted={myVotedRecIds.includes(rec.id)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No recommendations match your search.
        </p>
      )}
    </>
  );
}
