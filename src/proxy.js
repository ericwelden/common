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

  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|fonts/).*)",
  ],
};
