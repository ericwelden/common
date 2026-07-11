// Shared by every "posted by" line (item cards, item detail, recommendations)
// so a future change to how avatars look happens in one place.
export default function Avatar({ photoUrl }) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed URL, not a static asset next/image can optimize.
      <img
        src={photoUrl}
        alt=""
        className="h-5 w-5 shrink-0 rounded-full border border-zinc-200 object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="h-5 w-5 shrink-0 rounded-full border border-zinc-200 bg-zinc-100"
    />
  );
}
