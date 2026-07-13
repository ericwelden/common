"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRecommendation(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const businessName = formData.get("businessName")?.toString().trim();
  const contactName = formData.get("contactName")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const note = formData.get("note")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const website = formData.get("website")?.toString().trim();

  if (!businessName && !contactName) {
    return { error: "Add a business name or a contact name." };
  }
  if (!category || !note) {
    return { error: "Category and a note are both required." };
  }

  const { error } = await supabase.from("recommendations").insert({
    author_id: data.claims.sub,
    business_name: businessName || null,
    contact_name: contactName || null,
    category,
    note,
    phone: phone || null,
    email: email || null,
    website: website || null,
  });

  if (error) return { error: "Couldn't save that — try again." };

  revalidatePath("/recommendations");
  redirect("/recommendations");
}
