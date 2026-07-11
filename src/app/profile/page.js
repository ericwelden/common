import { createClient } from "@/lib/supabase/server";
import SignInForm from "@/components/SignInForm";
import DisplayNameForm from "./DisplayNameForm";
import { signOut } from "./actions";

export default async function ProfilePage({ searchParams }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  let displayName = null;
  if (claims) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", claims.sub)
      .maybeSingle();
    displayName = profile?.display_name ?? null;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-[calc(4rem+env(safe-area-inset-bottom))] text-center sm:pb-0">
      {claims ? (
        <>
          <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-zinc-600">
            Signed in as{" "}
            <span className="font-medium text-zinc-900">{claims.email}</span>
          </p>
          <DisplayNameForm initialName={displayName} />
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="max-w-sm text-sm leading-6 text-zinc-600">
            Enter your email and we&apos;ll send you a link to sign in — no
            password needed.
          </p>
          {error === "link-expired" && (
            <p className="text-sm text-red-600">
              That link expired or was already used — request a new one.
            </p>
          )}
          {error === "sign-in-required" && (
            <p className="text-sm text-red-600">
              Sign in to view that page.
            </p>
          )}
          <SignInForm />
        </>
      )}
    </main>
  );
}
