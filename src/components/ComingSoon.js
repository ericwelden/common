// Grey dot + "coming soon" pill mirrors the live/coming-soon styling already
// established in AboutCard.js's FEATURES list, scaled up to page level.
export default function ComingSoon({ title, description }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-[calc(4rem+env(safe-area-inset-bottom))] text-center sm:pb-0">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-zinc-300" />
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <p className="max-w-sm text-sm leading-6 text-zinc-600">{description}</p>
      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500">
        coming soon
      </span>
    </main>
  );
}
