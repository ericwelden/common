import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Server Components can't write cookies, so this proxy (this Next.js
// version's renamed middleware.js) refreshes the Supabase session on every
// request and forwards the refreshed cookies both ways: onto the request
// (so Server Components read a current session) and onto the response (so
// the browser stores it). getClaims() is used rather than getSession()
// because it verifies the JWT signature against Supabase's published public
// keys on every call instead of trusting an unverified cookie value.
export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();

  // Optimistic, cookie-derived check only — the real security boundary is
  // Postgres RLS on the resources/recommendations tables (`to authenticated`
  // policies), not this redirect. This just avoids flashing protected page
  // content at signed-out visitors before they bounce.
  //
  // GET-only: Server Actions on these routes (reserveItem, createItem, etc.)
  // POST back to the same pathname, and each already has its own
  // getClaims()-based redirect. Gating those POSTs here too would mean a
  // stale-session form submission hits a raw 307 (which preserves method
  // and body by default) instead of the action's own redirect() call, which
  // Next.js's client-side action runner is specifically built to turn into
  // a clean navigation.
  const pathname = request.nextUrl.pathname;
  const requiresAuth = ["/resources", "/recommendations"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (requiresAuth && !data?.claims && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    url.searchParams.set("error", "sign-in-required");
    const redirectResponse = NextResponse.redirect(url);
    // Carry over any session cookies getClaims() just refreshed, so a
    // mid-refresh session isn't dropped by the redirect.
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|fonts/).*)",
  ],
};
