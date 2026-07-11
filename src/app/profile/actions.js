"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/profile");
}

// Upserts rather than updates -- this is also what creates the profiles row
// on a user's first save (no signup trigger exists; items/recommendations
// require a display name to exist before they can be posted, see their
// respective new/page.js gates).
export async function updateDisplayName(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile");

  const displayName = formData.get("displayName")?.toString().trim();
  if (!displayName) return { error: "Enter a name." };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: data.claims.sub, display_name: displayName });

  if (error) return { error: "Couldn't save that -- try again." };

  revalidatePath("/profile");
  // Both "new post" pages gate their entire render on this same field
  // (src/components/DisplayNameGate.js) -- without revalidating them too,
  // navigating back to one right after setting a name can still show the
  // stale "add your name" gate from Next's Router Cache.
  revalidatePath("/resources/new");
  revalidatePath("/recommendations/new");
  return { success: true };
}
