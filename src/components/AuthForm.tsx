"use client";

import { useState } from "react";
import { authBrowser } from "@/lib/auth";

// Passwordless magic-link sign-in / founding-member signup. One email field → Supabase emails a one-time
// link → /auth/callback. No passwords (on-brand: minimal data, nothing to breach).
export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await authBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent-tint p-5 text-sm text-black/80">
        Check your inbox — we emailed a one-time sign-in link to <b>{email}</b>. Open it on this device to finish.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-full border border-black/15 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? "Sending…" : "Email me a sign-in link"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-black/40 text-center">No password. We email you a one-time link — that&apos;s it.</p>
    </form>
  );
}
