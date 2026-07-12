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
// require a display name to exist before they can be posted, see
// src/components/DisplayNameGate.js). Photo is optional on every save --
// only touched when a new file is actually chosen, upload-then-swap so a
// failed save never leaves someone with no photo at all.
export async function updateProfile(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile");
  const userId = data.claims.sub;

  const displayName = formData.get("displayName")?.toString().trim();
  const street = formData.get("street")?.toString().trim();
  const aboutMe = formData.get("aboutMe")?.toString().trim();
  const photo = formData.get("photo");
  const hasNewPhoto = photo && photo.size > 0;

  // Stripped of a leading $/@ so link-building (src/lib/paymentLinks.js)
  // never has to worry about a doubled symbol -- someone pasting their own
  // "$cashtag" or "@handle" in is the expected case, not an edge case.
  const venmoHandle = formData.get("venmoHandle")?.toString().trim().replace(/^[@$]/, "");
  const cashappHandle = formData.get("cashappHandle")?.toString().trim().replace(/^[@$]/, "");
  const paypalHandle = formData.get("paypalHandle")?.toString().trim().replace(/^[@$]/, "");

  if (!displayName) return { error: "Enter a name." };

  let newPhotoPath = null;
  if (hasNewPhoto) {
    const ext = photo.type.split("/")[1] ?? "jpg";
    newPhotoPath = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(newPhotoPath, photo, { contentType: photo.type });
    if (uploadError) return { error: "Photo upload failed — try again." };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("photo_path")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    street: street || null,
    about_me: aboutMe || null,
    venmo_handle: venmoHandle || null,
    cashapp_handle: cashappHandle || null,
    paypal_handle: paypalHandle || null,
    ...(hasNewPhoto ? { photo_path: newPhotoPath } : {}),
  });

  if (error) {
    if (hasNewPhoto) {
      await supabase.storage.from("profile-photos").remove([newPhotoPath]);
    }
    return { error: "Couldn't save that — try again." };
  }

  if (hasNewPhoto && existingProfile?.photo_path) {
    await supabase.storage
      .from("profile-photos")
      .remove([existingProfile.photo_path]);
  }

  revalidatePath("/profile");
  // Both "new post" pages gate their entire render on display_name (see
  // src/components/DisplayNameGate.js) -- without revalidating them too,
  // navigating back to one right after setting a name can still show the
  // stale "add your name" gate from Next's Router Cache.
  revalidatePath("/resources/new");
  revalidatePath("/recommendations/new");
  return { success: true };
}
