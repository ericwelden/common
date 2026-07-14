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
// reveals the rest, "Show less" collapses back. A viewer who hasn't
// contributed their own review yet gets a prompt to add one at the bottom.
export default function Recommenders({ entries, recommendationId }) {
  const [expanded, setExpanded] = useState(false);
  const hasContributed = entries.some((e) => e.isYou);
  const visible = expanded ? entries : entries.slice(0, 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {visible.map((entry, i) => (
          <div key={`${entry.kind}-${entry.id}`} className="flex flex-col gap-1.5">
            {i > 0 && <div className="border-t border-border" />}
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
        ))}
      </div>

      {entries.length > 1 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="self-start text-xs font-medium text-primary"
        >
          {expanded ? "Show less" : `Show ${entries.length - 1} more`}
        </button>
      )}

      {!hasContributed && <VoteButton recommendationId={recommendationId} />}
    </div>
  );
}
