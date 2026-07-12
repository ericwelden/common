"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO as getTodayISO } from "@/lib/date";

export async function reserveItem(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const itemId = formData.get("itemId");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");

  if (!startDate || !endDate) {
    return { error: "Pick a date range first." };
  }
  // Never trust the client picker alone -- re-validate the same rules the
  // DB constraints enforce. Uses the neighborhood's fixed timezone (see
  // src/lib/date.js), not server UTC, so this agrees with what the calendar
  // itself showed as selectable.
  const todayISO = getTodayISO();
  if (endDate <= startDate) {
    return { error: "Invalid date range." };
  }
  if (startDate < todayISO) {
    return { error: "Pick a date in the future." };
  }

  const { error } = await supabase.from("reservations").insert({
    item_id: itemId,
    reserver_id: data.claims.sub,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    // 23P01 = Postgres's exclusion_violation -- the expected, recoverable
    // outcome of the exact race the EXCLUDE constraint exists to catch.
    if (error.code === "23P01") {
      return { error: "Those dates just got booked — try different ones." };
    }
    return { error: "Something went wrong — try again." };
  }

  revalidatePath(`/resources/${itemId}`);
  revalidatePath("/resources"); // status line may flip from "available" to "currently out"
  return { success: true };
}

// itemId is bound before (prevState, formData) by the caller (EditItemForm.js),
// matching useActionState's expected action signature. Photo replacement
// follows updateProfile's upload-then-swap pattern (src/app/profile/actions.js)
// -- optional on every edit, only touched when a new file is actually chosen.
export async function updateItem(itemId, prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile"); // defense in depth -- proxy already blocks this page

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const photo = formData.get("photo");
  const hasNewPhoto = photo && photo.size > 0;
  // Per-item, not per-owner -- see createItem in resources/new/actions.js.
  const suggestedDailyRateRaw = formData.get("suggestedDailyRate")?.toString().trim();
  const parsedDailyRate = suggestedDailyRateRaw ? Number.parseInt(suggestedDailyRateRaw, 10) : NaN;
  const suggestedDailyRate = Number.isFinite(parsedDailyRate) ? parsedDailyRate : null;

  if (!name) return { error: "Name is required." };

  let newPhotoPath = null;
  if (hasNewPhoto) {
    const ext = photo.type.split("/")[1] ?? "jpg";
    newPhotoPath = `${data.claims.sub}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("item-photos")
      .upload(newPhotoPath, photo, { contentType: photo.type });
    if (uploadError) return { error: "Photo upload failed — try again." };
  }

  const { data: existingItem } = await supabase
    .from("items")
    .select("photo_path")
    .eq("id", itemId)
    .maybeSingle();

  // RLS's items_update_own policy already restricts this to the item's
  // owner -- a non-owner's update would just silently affect 0 rows, but the
  // UI never renders an Edit link on anyone else's item (see page.js), and
  // the edit page itself redirects a non-owner away before this can be hit.
  const { error } = await supabase
    .from("items")
    .update({
      name,
      description,
      suggested_daily_rate: suggestedDailyRate,
      ...(hasNewPhoto ? { photo_path: newPhotoPath } : {}),
    })
    .eq("id", itemId);

  if (error) {
    if (hasNewPhoto) {
      await supabase.storage.from("item-photos").remove([newPhotoPath]);
    }
    return { error: "Couldn't save that — try again." };
  }

  if (hasNewPhoto && existingItem?.photo_path) {
    await supabase.storage.from("item-photos").remove([existingItem.photo_path]);
  }

  revalidatePath(`/resources/${itemId}`);
  revalidatePath("/resources");
  redirect(`/resources/${itemId}`);
}

// Extra args (reservationId, itemId) are bound before (prevState, formData)
// by the caller (CancelReservationButton.js), matching useActionState's
// expected action signature.
export async function cancelReservation(reservationId, itemId, prevState, formData) {
  const supabase = await createClient();
  // RLS's reservations_delete_own policy already restricts this to the
  // caller's own row -- a non-owner's delete would just silently affect 0
  // rows, but the UI never renders a Cancel button on anyone else's booking.
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", reservationId);

  if (error) return { error: "Couldn't cancel that — try again." };

  revalidatePath(`/resources/${itemId}`);
  revalidatePath("/resources");
  return { success: true };
}
