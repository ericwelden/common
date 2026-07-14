"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAP_PIN_TYPES } from "@/lib/mapPinTypes";

const PIN_TYPE_VALUES = MAP_PIN_TYPES.map((t) => t.value);

function readPinFields(formData) {
  return {
    name: formData.get("name")?.toString().trim(),
    description: formData.get("description")?.toString().trim(),
    type: formData.get("type")?.toString().trim(),
    lat: Number.parseFloat(formData.get("lat")),
    lng: Number.parseFloat(formData.get("lng")),
  };
}

function validatePinFields({ name, description, type, lat, lng }) {
  if (!name || !description) {
    return "Add a name and a description.";
  }
  if (!type || !PIN_TYPE_VALUES.includes(type)) {
    return "Choose a type.";
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "Something went wrong placing that pin -- try again.";
  }
  return null;
}

// The map itself (src/app/page.js) is publicly viewable, unlike
// resources/recommendations -- but adding/editing a pin still requires an
// account, same as everywhere else content gets posted.
export async function createMapPin(prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile");

  const fields = readPinFields(formData);
  const error = validatePinFields(fields);
  if (error) return { error };

  const { error: insertError } = await supabase.from("map_pins").insert({
    author_id: data.claims.sub,
    name: fields.name,
    description: fields.description,
    type: fields.type,
    lat: fields.lat,
    lng: fields.lng,
  });

  if (insertError) {
    console.error("createMapPin failed", insertError);
    return { error: "Couldn't save that pin -- try again." };
  }

  revalidatePath("/");
  return { success: true };
}

// pinId is bound before (prevState, formData) by the caller (PinForm.js in
// edit mode). RLS's map_pins_update_own policy restricts this to the pin's
// own author -- defense in depth, same pattern as every other edit action
// in this app -- so lat/lng are deliberately not accepted here at all: this
// form never offers a way to move an existing pin, only rename/redescribe/
// retype it.
export async function updateMapPin(pinId, prevState, formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/profile");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const type = formData.get("type")?.toString().trim();

  if (!name || !description) {
    return { error: "Add a name and a description." };
  }
  if (!type || !PIN_TYPE_VALUES.includes(type)) {
    return { error: "Choose a type." };
  }

  const { error } = await supabase
    .from("map_pins")
    .update({ name, description, type })
    .eq("id", pinId);

  if (error) {
    console.error("updateMapPin failed", error);
    return { error: "Couldn't save that pin -- try again." };
  }

  revalidatePath("/");
  return { success: true };
}
