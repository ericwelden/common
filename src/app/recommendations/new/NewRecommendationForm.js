"use client";

import { useActionState } from "react";
import { createRecommendation } from "./actions";

export default function NewRecommendationForm() {
  const [state, action, pending] = useActionState(
    createRecommendation,
    undefined
  );

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
          placeholder="Dave's Plumbing"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="category"
          className="text-sm font-medium text-zinc-700"
        >
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          placeholder="Home services, food & drink, babysitting…"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm font-medium text-zinc-700">
          Why do you recommend it?
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          required
          placeholder="Called them for a leak, fixed same day and fair price."
          className="resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post recommendation"}
      </button>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
