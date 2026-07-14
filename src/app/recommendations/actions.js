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
//
// Add-only -- removing your own vote goes through deleteVote below instead
// (each review entry, including your own vote, carries its own delete
// control now -- see Recommenders.js), so there's no toggle-off branch here
// anymore.
export async function addVote(recommendationId, prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page
  const userId = data.claims.sub;

  const note = formData.get("note")?.toString().trim();
  const { error } = await supabase.from("recommendation_votes").insert({
    recommendation_id: recommendationId,
    voter_id: userId,
    note: note || null,
  });

  if (error) {
    // Logged, not surfaced -- the generic message stays user-facing, but a
    // real Postgres error (RLS denial, missing column, etc.) is otherwise
    // invisible once it's collapsed to "Couldn't update", making a repeat
    // failure impossible to diagnose from the UI alone.
    console.error("addVote failed", error);
    return { error: "Couldn't add — try again." };
  }

  revalidatePath("/recommendations");
  return { success: true };
}

// voteId is bound before (prevState, formData) by the caller
// (DeleteVoteButton.js). RLS's recommendation_votes_delete_own policy
// restricts this to the vote's own voter -- defense in depth, same pattern
// as everything else in this file. Unlike deleteRecommendation, there's no
// promotion to do here: a vote is just one neighbor's own contribution, not
// the thing the whole card hangs off of.
export async function deleteVote(voteId, prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const { error } = await supabase
    .from("recommendation_votes")
    .delete()
    .eq("id", voteId);

  if (error) {
    console.error("deleteVote failed", error);
    return { error: "Couldn't delete — try again." };
  }

  revalidatePath("/recommendations");
  return { success: true };
}

// recommendationId is bound before (prevState, formData) by the caller
// (DeleteRecommendationButton.js). RLS's recommendations_delete_own /
// recommendations_update_own policies restrict this to the card's current
// author -- the UI only ever renders the delete control for that person
// (see RecommendationsList.js), so this is defense in depth, same pattern
// as toggleRecommendationVote above.
//
// A card is more than just its current author's words -- other neighbors
// may have +1'd it, some with their own note. Deleting shouldn't erase
// their contributions along with it, so this doesn't just delete the row:
// if anyone else recommended it, the *oldest* remaining voter is promoted
// to author (their own note becomes the card's note, or the note goes
// blank if they didn't leave one -- never inheriting the deleted author's
// words under a new name) and their now-redundant vote row is removed.
// Only when nobody else recommended it does the whole card disappear.
export async function deleteRecommendation(recommendationId, prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const { data: votes } = await supabase
    .from("recommendation_votes")
    .select("id, voter_id, note")
    .eq("recommendation_id", recommendationId)
    .order("created_at", { ascending: true });

  const nextVoter = votes?.[0];

  if (!nextVoter) {
    const { error } = await supabase
      .from("recommendations")
      .delete()
      .eq("id", recommendationId);
    if (error) {
      console.error("deleteRecommendation failed (no remaining voters)", error);
      return { error: "Couldn't delete — try again." };
    }
  } else {
    const { error: updateError } = await supabase
      .from("recommendations")
      .update({ author_id: nextVoter.voter_id, author_name: null, note: nextVoter.note })
      .eq("id", recommendationId);
    if (updateError) {
      console.error("deleteRecommendation failed (promotion update)", updateError);
      return { error: "Couldn't delete — try again." };
    }

    // Best-effort cleanup -- if this fails, the promoted voter is briefly
    // double-counted (once as author, once as a leftover vote row) until
    // retried, not a broken or lost state.
    await supabase.from("recommendation_votes").delete().eq("id", nextVoter.id);
  }

  revalidatePath("/recommendations");
  return { success: true };
}
