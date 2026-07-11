"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "./actions";

const FIELD_CLASSNAME =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none";

export default function ProfileForm({
  initialName,
  initialStreet,
  initialAboutMe,
  initialPhotoUrl,
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [previewUrl, setPreviewUrl] = useState(initialPhotoUrl ?? null);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : (initialPhotoUrl ?? null));
  }

  return (
    <form action={action} className="flex w-full max-w-xs flex-col gap-4 text-left">
      <div className="flex flex-col items-center gap-2 self-center">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed URL or a local object URL preview, not an optimizable static asset.
          <img
            src={previewUrl}
            alt=""
            className="h-20 w-20 rounded-full border border-zinc-200 object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-full border border-zinc-200 bg-zinc-100" />
        )}
        <label className="cursor-pointer text-xs font-medium text-emerald-600 hover:underline">
          Change photo
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-xs font-medium text-zinc-500">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={initialName ?? ""}
          placeholder="Your name"
          className={FIELD_CLASSNAME}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="street" className="text-xs font-medium text-zinc-500">
          Street
        </label>
        <input
          id="street"
          name="street"
          defaultValue={initialStreet ?? ""}
          placeholder="Maple Avenue"
          className={FIELD_CLASSNAME}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="aboutMe" className="text-xs font-medium text-zinc-500">
          About me
        </label>
        <textarea
          id="aboutMe"
          name="aboutMe"
          rows={3}
          defaultValue={initialAboutMe ?? ""}
          placeholder="A little about you..."
          className={`resize-none ${FIELD_CLASSNAME}`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Saved.</p>}
    </form>
  );
}
