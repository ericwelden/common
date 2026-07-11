import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

// Shared by every "post something" page (resources/new, recommendations/new,
// and future ones) so the rule -- and its enforcement -- lives in one place.
export default async function DisplayNameGate({ nudgeText, children }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- see src/app/resources/page.js for why.
  if (!data?.claims) redirect("/profile?error=sign-in-required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (profile?.display_name) return children;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-[calc(4rem+env(safe-area-inset-bottom))] text-center sm:pb-0">
      <h1 className="text-lg font-semibold tracking-tight">
        Add your name first
      </h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        {nudgeText}
      </p>
      <Button render={<Link href="/profile" />}>Set your name</Button>
    </main>
  );
}
