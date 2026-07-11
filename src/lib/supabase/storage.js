const ITEM_PHOTOS_BUCKET = "item-photos";
const SIGNED_URL_TTL_SECONDS = 3600;

// The item-photos bucket is private, and a plain <img src> can't attach an
// auth header — so every render mints a fresh short-lived signed URL using
// the *caller's* Supabase client, not a service-role client, so the
// bucket's "authenticated" storage policy is what actually gates access.
export async function getSignedPhotoUrl(supabase, path) {
  const { data } = await supabase.storage
    .from(ITEM_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function getSignedPhotoUrls(supabase, paths) {
  if (paths.length === 0) return new Map();
  const { data } = await supabase.storage
    .from(ITEM_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  return new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
}
