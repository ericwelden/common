import { createBrowserClient } from "@supabase/ssr";

// For Client Components — reads the publishable key, which is safe to
// expose in the browser bundle (it's not a secret, unlike the service role key).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
