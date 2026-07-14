"use client";

import { useState } from "react";
import { format } from "date-fns";
import Avatar from "@/components/Avatar";
import VoteButton from "./VoteButton";
import DeleteRecommendationButton from "./DeleteRecommendationButton";
import DeleteVoteButton from "./DeleteVoteButton";

// entries is every review on this card -- the original post plus every
// +1 -- already sorted newest-first by the caller (RecommendationsList.js).
// Each renders identically (note, then "-- Name · Date", then a delete
// control if it's the viewer's own), divided by a hairline. Only the
// newest shows by default once there's more than one; "Show N more"
// reveals the rest, "Show less" collapses back, animating the height
// change (grid-rows 0fr/1fr is what makes an "auto" height transition-able
// in CSS without measuring anything in JS). A viewer who hasn't
// contributed their own review yet gets a prompt to add one at the bottom.
export default function Recommenders({ entries, recommendationId }) {
  const [expanded, setExpanded] = useState(false);
  const hasContributed = entries.some((e) => e.isYou);
  const [first, ...rest] = entries;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <EntryRow entry={first} />
        {rest.length > 0 && (
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
          >
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="border-t border-border" />
              {rest.map((entry, i) => (
                <div key={`${entry.kind}-${entry.id}`} className="flex flex-col gap-3">
                  {i > 0 && <div className="border-t border-border" />}
                  <EntryRow entry={entry} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="self-start text-xs font-medium text-primary"
        >
          {expanded ? "Show less" : `Show ${rest.length} more`}
        </button>
      )}

      {!hasContributed && <VoteButton recommendationId={recommendationId} />}
    </div>
  );
}

function EntryRow({ entry }) {
  return (
    <div className="flex flex-col gap-1.5">
      {entry.note && (
        <p className="text-sm leading-6 text-muted-foreground">{entry.note}</p>
      )}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>—</span>
          {entry.isLinkedAccount && <Avatar photoUrl={entry.photoUrl} />}
          <span>{entry.isYou ? "You" : entry.name}</span>
          <span>·</span>
          <span>{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
        </div>
        {entry.isYou &&
          (entry.kind === "primary" ? (
            <DeleteRecommendationButton recommendationId={entry.id} />
          ) : (
            <DeleteVoteButton voteId={entry.id} />
          ))}
      </div>
    </div>
  );
}
