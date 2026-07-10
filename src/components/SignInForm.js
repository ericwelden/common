"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// No emailRedirectTo here — the redirect target is baked into the Supabase
// email template itself (see src/app/auth/confirm/route.js), since the
// confirmation link is often opened in a different browser context (e.g. an
// email app's webview) than this form, which breaks the PKCE flow's
// code-verifier matching.
export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="max-w-sm text-sm leading-6 text-zinc-600">
        Check <strong className="text-zinc-900">{email}</strong> for a
        sign-in link.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-3"
    >
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
