import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/supabase/storage";
import EditItemForm from "./EditItemForm";

export default async function EditItemPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Defense in depth -- see src/app/resources/page.js for why.
  if (!data?.claims) redirect("/profile?error=sign-in-required");
  const userId = data.claims.sub;

  const { data: item } = await supabase
    .from("items")
    .select("id, owner_id, name, description, photo_path, suggested_daily_rate")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();
  // The Edit link is only ever rendered for the owner (see resources/[id]/page.js),
  // but someone could still type this URL in directly.
  if (item.owner_id !== userId) redirect(`/resources/${id}`);

  const photoUrl = await getSignedPhotoUrl(supabase, item.photo_path);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-8 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-8">
      <h1 className="text-lg font-semibold tracking-tight">Edit item</h1>
      <EditItemForm
        itemId={item.id}
        initialName={item.name}
        initialDescription={item.description}
        initialPhotoUrl={photoUrl}
        initialSuggestedDailyRate={item.suggested_daily_rate}
      />
    </main>
  );
}
