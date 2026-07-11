import Link from "next/link";

export default function ItemCard({ item, photoUrl, status, isOwn }) {
  return (
    <Link
      href={`/resources/${item.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300"
    >
      <div className="aspect-square w-full bg-zinc-100">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- photoUrl is a short-lived signed URL, not a static asset next/image can optimize.
          <img
            src={photoUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          {item.name}
        </h2>
        <p className="text-xs text-zinc-500">
          {isOwn ? "posted by you" : `posted by ${item.profiles?.display_name ?? "a neighbor"}`}
        </p>
        <span
          className={`mt-2 w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
            status.available
              ? "bg-emerald-50 text-emerald-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {status.label}
        </span>
      </div>
    </Link>
  );
}
