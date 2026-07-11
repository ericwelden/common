import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- see src/app/resources/page.js for why.
  if (!data?.claims) redirect("/profile?error=sign-in-required");
  const userId = data.claims.sub;

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 px-5 py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
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

        {recommendations && recommendations.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {recommendations.map((rec) => (
              <li
                key={rec.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {rec.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {rec.category}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {rec.note}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  —{" "}
                  {rec.author_id === userId
                    ? "posted by you"
                    : `posted by ${rec.profiles?.display_name ?? "a neighbor"}`}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm text-zinc-500">
            No recommendations yet — be the first to share one.
          </p>
        )}
      </div>
    </main>
  );
}
