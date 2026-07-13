"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// recommendationId is bound before (prevState, formData) by the caller
// (VoteButton.js), matching useActionState's expected action signature.
// RLS's recommendation_votes_insert_own policy blocks voting for yourself
// (checked there, not here, since that's the real security boundary --
// see src/app/resources/[id]/actions.js for the same pattern) -- the UI
// also never renders a vote button on your own recommendation (see
// RecommendationsList.js), so this is a defense-in-depth backstop, not the
// only thing standing in the way.
export async function toggleRecommendationVote(recommendationId, prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page
  const userId = data.claims.sub;

  const { data: existing } = await supabase
    .from("recommendation_votes")
    .select("id")
    .eq("recommendation_id", recommendationId)
    .eq("voter_id", userId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("recommendation_votes").delete().eq("id", existing.id)
    : await supabase
        .from("recommendation_votes")
        .insert({ recommendation_id: recommendationId, voter_id: userId });

  if (error) return { error: "Couldn't update — try again." };

  revalidatePath("/recommendations");
  return { success: true };
}
