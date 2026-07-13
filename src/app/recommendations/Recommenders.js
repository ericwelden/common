"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";

const MAX_STACK = 3;

// primary is always the oldest recommender (the card's current author) --
// others is every +1, oldest first (see page.js's ordering), each carrying
// their own optional note. 1 recommender keeps today's plain byline; 2 show
// in full, one after another; 3+ collapse the avatars into a stack (max 3,
// "+N" for the rest) behind a "recommended by N neighbors" toggle that
// expands to the same per-person list as the 2-person case -- the avatars
// compress for space, but nobody's note gets hidden for good, just tucked
// behind a click once there'd otherwise be too many to show at once.
export default function Recommenders({ primary, others }) {
  const [expanded, setExpanded] = useState(false);
  const people = [primary, ...others];
  const total = people.length;

  if (total === 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>—</span>
        <Avatar photoUrl={primary.photoUrl} />
        <span>{primary.isYou ? "posted by you" : `posted by ${primary.name}`}</span>
      </div>
    );
  }

  if (total === 2) {
    return <PersonList people={people} />;
  }

  const stacked = people.slice(0, MAX_STACK);
  const overflow = total - MAX_STACK;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex items-center gap-2"
      >
        <AvatarGroup className="*:data-[slot=avatar]:ring-card">
          {stacked.map((p) => (
            <Avatar key={p.voterId ?? "primary"} photoUrl={p.photoUrl} />
          ))}
          {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
        </AvatarGroup>
        <span className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2">
          recommended by {total} neighbors
        </span>
      </button>
      {expanded && <PersonList people={people} indent />}
    </div>
  );
}

function PersonList({ people, indent = false }) {
  return (
    <div className={indent ? "flex flex-col gap-2 pl-1" : "flex flex-col gap-2"}>
      {people.map((p, i) => (
        <div key={p.voterId ?? "primary"} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {!indent && <span>—</span>}
            <Avatar photoUrl={p.photoUrl} />
            <span>
              {i === 0
                ? p.isYou
                  ? "posted by you"
                  : `posted by ${p.name}`
                : p.isYou
                  ? "recommended by you"
                  : `recommended by ${p.name}`}
            </span>
          </div>
          {/* The primary's own words are already the card's main note above
              -- repeating them here would just be the same text twice. */}
          {i > 0 && p.note && (
            <p className="pl-[26px] text-xs leading-5 text-muted-foreground italic">
              “{p.note}”
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
