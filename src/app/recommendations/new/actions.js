"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRecommendation(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  if (!name || !category || !note) {
    return { error: "Name, category, and a note are all required." };
  }

  const { error } = await supabase
    .from("recommendations")
    .insert({ author_id: data.claims.sub, name, category, note });

  if (error) return { error: "Couldn't save that — try again." };

  revalidatePath("/recommendations");
  redirect("/recommendations");
}
