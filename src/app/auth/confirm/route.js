import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for the magic-link email. The Supabase email template must
// point here with ?token_hash={{ .TokenHash }}&type=email — see the
// Confirm signup / Magic Link templates in the Supabase dashboard.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/profile";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/profile?error=link-expired`);
}
