"use client";

import { useState } from "react";
import { authBrowser } from "@/lib/auth";

// Passwordless magic-link sign-in / free signup. One email field → Supabase emails a one-time
// link → /auth/callback. No passwords (on-brand: minimal data, nothing to breach).
export default function AuthForm({ next = "/account" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await authBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function google() {
    setError("");
    const { error } = await authBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) setError(error.message);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent-tint p-5 text-sm text-black/80">
        Check your inbox — we emailed a one-time sign-in link to <b>{email}</b>. Open it on this device to finish.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={google}
        className="w-full flex items-center justify-center gap-2.5 border border-black/15 rounded-xl px-5 py-3 text-sm font-medium hover:bg-black/5 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-black/35">
        <span className="h-px flex-1 bg-black/10" /> or <span className="h-px flex-1 bg-black/10" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="happytraveler@email.com"
          className="w-full border border-black/15 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-accent text-white font-semibold px-5 py-3 rounded-full hover:opacity-90 transition disabled:opacity-60"
        >
          {busy ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-black/40 text-center">No password — sign in with Google or a one-time email link.</p>
    </div>
  );
}
