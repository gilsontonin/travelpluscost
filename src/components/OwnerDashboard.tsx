"use client";

import { useEffect, useState } from "react";
import { authBrowser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

interface Row {
  id: string;
  name: string;
  net: number;
  ssp: number;
  member: number;
  atProperty: number;
  marginSSP: number;
  marginMember: number;
  spreadPct: number;
  refundable: boolean;
}

const money = (n: number) => `$${n.toLocaleString()}`;

export default function OwnerDashboard() {
  const [state, setState] = useState<"loading" | "signin" | "denied" | "ok">("loading");
  const [city, setCity] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await authBrowser().auth.getSession();
      if (!data.session) {
        setState("signin");
        return;
      }
      const r = await fetch("/api/owner/me")
        .then((x) => x.json())
        .catch(() => ({ owner: false }));
      setState(r.owner ? "ok" : "denied");
    })();
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/owner/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, checkin, checkout, adults: 2 }),
      }).then((x) => x.json());
      setRows(r.rows ?? []);
    } catch {
      setRows([]);
    }
    setBusy(false);
  }

  if (state === "loading") return <div className="mx-auto max-w-2xl px-4 py-16 text-black/60">Loading…</div>;

  if (state === "signin")
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold">Owner sign in</h1>
        <p className="mt-1 mb-6 text-sm text-black/60">Private dashboard — owner access only.</p>
        <AuthForm next="/owner" />
      </div>
    );

  if (state === "denied")
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-black/60">This dashboard is owner-only.</p>
      </div>
    );

  const field = "block mt-1 border border-black/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Owner price scanner</h1>
      <p className="mt-1 text-sm text-black/55">
        Real-time <b>net cost</b>, SSP, member price + your margins. Owner-only — these numbers are never shown to users.
      </p>

      <form onSubmit={search} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-black/60">
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Honolulu" required className={`${field} w-48`} />
        </label>
        <label className="text-xs font-medium text-black/60">
          Check-in
          <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className={field} />
        </label>
        <label className="text-xs font-medium text-black/60">
          Check-out
          <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className={field} />
        </label>
        <button disabled={busy} className="bg-accent text-white font-semibold px-5 py-2.5 rounded-full transition hover:opacity-90 disabled:opacity-60">
          {busy ? "Scanning…" : "Scan"}
        </button>
      </form>

      {rows ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-black/60 border-b border-black/10">
                <th className="py-2 pr-3">Hotel</th>
                <th className="px-3 text-right">Net</th>
                <th className="px-3 text-right">SSP</th>
                <th className="px-3 text-right">Member</th>
                <th className="px-3 text-right">Margin @SSP</th>
                <th className="px-3 text-right">Margin @Member</th>
                <th className="px-3 text-right">Spread</th>
                <th className="px-3 text-right">At-prop</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-black/5">
                  <td className="py-2 pr-3 font-medium max-w-[16rem] truncate">{r.name}</td>
                  <td className="px-3 text-right tabular-nums">{money(r.net)}</td>
                  <td className="px-3 text-right tabular-nums">{money(r.ssp)}</td>
                  <td className="px-3 text-right tabular-nums font-semibold text-accent">{money(r.member)}</td>
                  <td className="px-3 text-right tabular-nums text-emerald-700">{money(r.marginSSP)}</td>
                  <td className="px-3 text-right tabular-nums text-emerald-700">{money(r.marginMember)}</td>
                  <td className="px-3 text-right tabular-nums">{r.spreadPct}%</td>
                  <td className="px-3 text-right tabular-nums text-black/60">{money(r.atProperty)}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-black/60">No rates — try another city or dates.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
