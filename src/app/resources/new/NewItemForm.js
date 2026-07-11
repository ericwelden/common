"use client";

import { useActionState, useState } from "react";
import { createItem } from "./actions";

export default function NewItemForm() {
  const [state, action, pending] = useActionState(createItem, undefined);
  const [previewUrl, setPreviewUrl] = useState(null);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Ladder, lawnmower, folding tables…"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Anything a neighbor should know before borrowing it."
          className="resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="photo" className="text-sm font-medium text-zinc-700">
          Photo
        </label>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- a local object URL preview, not an optimizable static/remote asset.
          <img
            src={previewUrl}
            alt=""
            className="aspect-square w-32 rounded-lg border border-zinc-200 object-cover"
          />
        )}
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          required
          onChange={handlePhotoChange}
          className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Sharing…" : "Share this item"}
      </button>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
