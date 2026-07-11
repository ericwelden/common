"use client";

import { useActionState } from "react";
import { updateDisplayName } from "./actions";

export default function DisplayNameForm({ initialName }) {
  const [state, action, pending] = useActionState(updateDisplayName, undefined);

  return (
    <form action={action} className="flex w-full max-w-xs flex-col gap-2">
      <label
        htmlFor="displayName"
        className="text-left text-xs font-medium text-zinc-500"
      >
        Display name
      </label>
      <div className="flex gap-2">
        <input
          id="displayName"
          name="displayName"
          defaultValue={initialName ?? ""}
          placeholder="Your name"
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state?.error && (
        <p className="text-left text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-left text-sm text-emerald-600">Saved.</p>
      )}
      <p className="text-left text-xs text-zinc-500">
        Shown to neighbors on items and recommendations you post.
      </p>
    </form>
  );
}
