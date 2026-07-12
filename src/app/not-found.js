import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-[calc(4rem+env(safe-area-inset-bottom))] text-center sm:pb-0">
      <h1 className="text-lg font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        That page doesn&apos;t exist, or the item may have been removed.
      </p>
      <Button render={<Link href="/" />}>Back to the map</Button>
    </main>
  );
}
