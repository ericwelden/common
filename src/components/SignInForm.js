"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        Check <strong className="text-foreground">{email}</strong> for a
        sign-in link.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-3"
    >
      <Input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send sign-in link"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
