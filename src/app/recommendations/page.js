import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/storage";
import RecommendationsList from "./RecommendationsList";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- see src/app/resources/page.js for why.
  if (!data?.claims) redirect("/profile?error=sign-in-required");
  const userId = data.claims.sub;

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, profiles(display_name, photo_path)")
    .order("created_at", { ascending: false });

  const posterPhotoPaths = [
    ...new Set(
      (recommendations ?? [])
        .map((rec) => rec.profiles?.photo_path)
        .filter(Boolean)
    ),
  ];
  const posterPhotoUrls = await getSignedPhotoUrls(
    supabase,
    posterPhotoPaths,
    "profile-photos"
  );

  return (
    <main className="flex-1 px-5 py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Recommendations
          </h1>
          <Link
            href="/recommendations/new"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            + Add a recommendation
          </Link>
        </div>

        <RecommendationsList
          recommendations={recommendations ?? []}
          posterPhotoUrls={Object.fromEntries(posterPhotoUrls)}
          userId={userId}
        />
      </div>
    </main>
  );
}
