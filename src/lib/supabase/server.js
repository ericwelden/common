import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For Server Components, Server Actions, and Route Handlers. Server
// Components can't write cookies, so setAll below is wrapped in a try/catch —
// it's a no-op there and relies on src/proxy.js to keep sessions refreshed.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — safe to ignore, proxy.js
            // handles session refresh on the way in.
          }
        },
      },
    }
  );
}
