import DisplayNameGate from "@/components/DisplayNameGate";
import NewRecommendationForm from "./NewRecommendationForm";

export default function NewRecommendationPage() {
  return (
    <DisplayNameGate nudgeText="Neighbors see who posted each recommendation — add a display name first.">
      <main className="flex flex-1 flex-col items-center gap-6 px-6 py-8 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-8">
        <h1 className="text-lg font-semibold tracking-tight">
          Add a recommendation
        </h1>
        <NewRecommendationForm />
      </main>
    </DisplayNameGate>
  );
}
