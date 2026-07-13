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

  // Fetched as one flat table rather than an embedded PostgREST count --
  // simpler to reason about, and at neighborhood scale there's no real cost
  // to tallying it in JS instead of asking the DB to aggregate it.
  const { data: votes } = await supabase
    .from("recommendation_votes")
    .select("recommendation_id, voter_id");

  const voteCounts = {};
  const myVotedRecIds = [];
  for (const vote of votes ?? []) {
    voteCounts[vote.recommendation_id] = (voteCounts[vote.recommendation_id] ?? 0) + 1;
    if (vote.voter_id === userId) myVotedRecIds.push(vote.recommendation_id);
  }

  const posterPhotoPaths = [
    ...new Set(
      (recommendations ?? [])
        .map((rec) => rec.profiles?.photo_path)
        .filter(Boolean)
    ),
  ];
  const posterPhotoUrls = await getSignedPhotoUrls(
    supabase,
    posterPhotoPaths,
    "profile-photos"
  );

  return (
    <main className="flex-1 px-5 py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <RecommendationsList
          recommendations={recommendations ?? []}
          posterPhotoUrls={Object.fromEntries(posterPhotoUrls)}
          userId={userId}
          voteCounts={voteCounts}
          myVotedRecIds={myVotedRecIds}
        />
      </div>
    </main>
  );
}
