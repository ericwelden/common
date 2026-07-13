"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RECOMMENDATION_CATEGORIES } from "@/lib/recommendationCategories";

export async function createRecommendation(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const businessName = formData.get("businessName")?.toString().trim();
  const contactName = formData.get("contactName")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const otherCategory = formData.get("otherCategory")?.toString().trim();
  const note = formData.get("note")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const website = formData.get("website")?.toString().trim();

  if (!businessName && !contactName) {
    return { error: "Add a business name or a contact name." };
  }
  // Never trust the client picker alone -- the DB's own CHECK constraint
  // enforces this too, but a friendly error here beats a raw insert failure.
  if (!category || !RECOMMENDATION_CATEGORIES.includes(category)) {
    return { error: "Choose a category." };
  }
  if (category === "Other" && !otherCategory) {
    return { error: "Say what kind of service it is." };
  }
  if (!note) {
    return { error: "Add a note about why you recommend it." };
  }

  const { error } = await supabase.from("recommendations").insert({
    author_id: data.claims.sub,
    business_name: businessName || null,
    contact_name: contactName || null,
    category,
    other_category: category === "Other" ? otherCategory : null,
    note,
    phone: phone || null,
    email: email || null,
    website: website || null,
  });

  if (error) return { error: "Couldn't save that — try again." };

  revalidatePath("/recommendations");
  redirect("/recommendations");
}
