import { Badge } from "@/components/ui/badge";

export default function ComingSoon({ title, description }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-[calc(4rem+env(safe-area-inset-bottom))] text-center sm:pb-0">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Badge variant="secondary">coming soon</Badge>
    </main>
  );
}
