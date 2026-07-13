import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/storage";
import RecommendationsList from "./RecommendationsList";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- see src/app/resources/page.js for why.
  if (!data?.claims) redirect("/profile?error=sign-in-required");
  const userId = data.claims.sub;

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, profiles(display_name, photo_path)")
    .order("created_at", { ascending: false });

  // Fetched as one flat table (joined to the voter's own profile for their
  // avatar/name) rather than an embedded PostgREST count -- simpler to
  // reason about, and at neighborhood scale there's no real cost to
  // grouping it in JS instead of asking the DB to aggregate it. Ordered
  // oldest-first so both the "recommended by" display order and
  // deleteRecommendation's promotion pick (see actions.js) agree on who
  // recommended something first.
  const { data: votes } = await supabase
    .from("recommendation_votes")
    .select("id, recommendation_id, voter_id, voter_name, note, profiles(display_name, photo_path)")
    .order("created_at", { ascending: true });

  const votesByRec = {};
  const myVotedRecIds = [];
  for (const vote of votes ?? []) {
    // A vote is normally a real account, but a backfilled co-recommendation
    // (imported from the listserv, same as name-only recommendations
    // themselves) has no linked profile -- isLinkedAccount tells the UI not
    // to render an avatar for those (see Recommenders.js).
    (votesByRec[vote.recommendation_id] ??= []).push({
      voterId: vote.voter_id,
      name: vote.profiles?.display_name ?? vote.voter_name ?? "a neighbor",
      photoPath: vote.profiles?.photo_path ?? null,
      isLinkedAccount: vote.voter_id !== null,
      note: vote.note,
    });
    if (vote.voter_id === userId) myVotedRecIds.push(vote.recommendation_id);
  }

  const photoPaths = [
    ...new Set([
      ...(recommendations ?? []).map((rec) => rec.profiles?.photo_path),
      ...(votes ?? []).map((vote) => vote.profiles?.photo_path),
    ].filter(Boolean)),
  ];
  const photoUrls = await getSignedPhotoUrls(supabase, photoPaths, "profile-photos");

  return (
    <main className="flex-1 px-5 py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <RecommendationsList
          recommendations={recommendations ?? []}
          photoUrls={Object.fromEntries(photoUrls)}
          userId={userId}
          votesByRec={votesByRec}
          myVotedRecIds={myVotedRecIds}
        />
      </div>
    </main>
  );
}
