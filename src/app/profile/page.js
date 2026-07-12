import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/supabase/storage";
import SignInForm from "@/components/SignInForm";
import { Button } from "@/components/ui/button";
import ProfileForm from "./ProfileForm";
import { signOut } from "./actions";

export default async function ProfilePage({ searchParams }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  let profile = null;
  let photoUrl = null;
  if (claims) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select(
        "display_name, street, about_me, photo_path, venmo_handle, cashapp_handle, paypal_handle"
      )
      .eq("id", claims.sub)
      .maybeSingle();
    profile = profileRow;
    if (profile?.photo_path) {
      photoUrl = await getSignedPhotoUrl(
        supabase,
        profile.photo_path,
        "profile-photos"
      );
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] text-center sm:pb-8">
      {claims ? (
        <>
          <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{claims.email}</span>
          </p>
          <ProfileForm
            initialName={profile?.display_name}
            initialStreet={profile?.street}
            initialAboutMe={profile?.about_me}
            initialPhotoUrl={photoUrl}
            initialVenmoHandle={profile?.venmo_handle}
            initialCashappHandle={profile?.cashapp_handle}
            initialPaypalHandle={profile?.paypal_handle}
          />
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Enter your email and we&apos;ll send you a link to sign in — no
            password needed.
          </p>
          {error === "link-expired" && (
            <p className="text-sm text-destructive">
              That link expired or was already used — request a new one.
            </p>
          )}
          {error === "sign-in-required" && (
            <p className="text-sm text-destructive">
              Sign in to view that page.
            </p>
          )}
          <SignInForm />
        </>
      )}
    </main>
  );
}
