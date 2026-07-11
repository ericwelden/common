const SIGNED_URL_TTL_SECONDS = 3600;

// Both item-photos and profile-photos are private buckets, and a plain
// <img src> can't attach an auth header -- so every render mints a fresh
// short-lived signed URL using the *caller's* Supabase client, not a
// service-role client, so each bucket's "authenticated" storage policy is
// what actually gates access.
export async function getSignedPhotoUrl(supabase, path, bucket = "item-photos") {
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function getSignedPhotoUrls(supabase, paths, bucket = "item-photos") {
  if (paths.length === 0) return new Map();
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  return new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
}
