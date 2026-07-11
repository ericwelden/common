import DisplayNameGate from "@/components/DisplayNameGate";
import NewItemForm from "./NewItemForm";

export default function NewItemPage() {
  return (
    <DisplayNameGate nudgeText="Neighbors see who's sharing what — add a display name before posting an item.">
      <main className="flex flex-1 flex-col items-center gap-6 px-6 py-8 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-8">
        <h1 className="text-lg font-semibold tracking-tight">Share an item</h1>
        <NewItemForm />
      </main>
    </DisplayNameGate>
  );
}
