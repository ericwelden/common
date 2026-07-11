"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Upload-then-insert, not the reverse: if the upload fails, nothing else
// has happened yet. If the DB insert fails after a successful upload, the
// leftover storage object is an orphan, but it's invisible and harmless
// (nothing references it). The reverse order risks a visible, broken items
// row pointing at a photo that was never actually uploaded.
export async function createItem(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const userId = data.claims.sub;
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const photo = formData.get("photo");

  if (!name || !photo || photo.size === 0) {
    return { error: "Name and a photo are required." };
  }

  const ext = photo.type.split("/")[1] ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("item-photos")
    .upload(path, photo, { contentType: photo.type });
  if (uploadError) return { error: "Photo upload failed — try again." };

  const { data: item, error: insertError } = await supabase
    .from("items")
    .insert({ owner_id: userId, name, description, photo_path: path })
    .select("id")
    .single();

  if (insertError) {
    await supabase.storage.from("item-photos").remove([path]);
    return { error: "Couldn't save that item — try again." };
  }

  revalidatePath("/resources");
  redirect(`/resources/${item.id}`);
}
