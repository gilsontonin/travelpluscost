"use client";

import { useEffect, useMemo, useState } from "react";
import { REGIONS } from "@/lib/regions";
import { hotelHref } from "@/lib/hotelUrl";

type Row = { id: string; name: string; city: string; net: number | null; ssp: number | null };

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function CompareClient() {
  const [k, setK] = useState("");
  const [region, setRegion] = useState(REGIONS[0].slug);
  const [checkin, setCheckin] = useState(plusDays(30));
  const [checkout, setCheckout] = useState(plusDays(32));
  const [rows, setRows] = useState<Row[]>([]);
  const [live, setLive] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const saved = sessionStorage.getItem("tpc_k");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate passphrase after mount
    if (saved) setK(saved);
  }, []);

  const load = async () => {
    if (!k) {
      setStatus("Enter the passphrase.");
      return;
    }
    setStatus("Loading…");
    sessionStorage.setItem("tpc_k", k);
    const q = new URLSearchParams({ k, region, checkin, checkout });
    const res = await fetch(`/api/compare?${q}`);
    if (res.status === 401) {
      setStatus("Wrong passphrase (or COMPARE_SECRET not set).");
      setRows([]);
      return;
    }
    const data = await res.json();
    setRows(data.rows ?? []);
    setStatus(`${(data.rows ?? []).filter((r: Row) => r.net != null).length} priced`);
  };

  const ci = checkin;
  const co = checkout;
  const links = (h: Row) => ({
    ours: hotelHref(h),
    google: `https://www.google.com/travel/search?q=${encodeURIComponent(`${h.name} ${h.city}`)}`,
    expedia: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(`${h.name}, ${h.city}`)}&startDate=${ci}&endDate=${co}&rooms=1&adults=2`,
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name)}&checkin=${ci}&checkout=${co}&group_adults=2&no_rooms=1`,
  });

  const summary = useMemo(() => {
    const withLive = rows
      .map((r) => ({ r, lv: parseFloat(live[r.id] ?? "") }))
      .filter((x) => x.r.net != null && !Number.isNaN(x.lv) && x.lv > 0);
    if (!withLive.length) return null;
    const sspInfl = withLive
      .filter((x) => x.r.ssp != null)
      .map((x) => ((x.r.ssp as number) - x.lv) / x.lv * 100);
    const realSpread = withLive.map((x) => x.lv - (x.r.net as number));
    const avg = (a: number[]) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0);
    return {
      n: withLive.length,
      sspInfl: avg(sspInfl),
      realSpreadAbs: avg(realSpread),
      realSpreadPct: avg(withLive.map((x) => (x.lv - (x.r.net as number)) / x.lv * 100)),
    };
  }, [rows, live]);

  const money = (n: number | null) => (n == null ? "—" : `$${n.toFixed(0)}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-xl font-semibold">Private price comparison</h1>
      <p className="text-sm text-black/55 mt-1">
        NET = your LiteAPI cost. SSP = their parity claim. Open Google/Expedia/Booking, type the real live price,
        and see how inflated the SSP is + your true spread. Not public.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-black/60 text-xs mb-1">Passphrase</span>
          <input type="password" value={k} onChange={(e) => setK(e.target.value)} className="border border-black/15 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">
          <span className="block text-black/60 text-xs mb-1">Market</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="border border-black/15 rounded-lg px-3 py-2 text-sm bg-white">
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-black/60 text-xs mb-1">Check-in</span>
          <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="border border-black/15 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">
          <span className="block text-black/60 text-xs mb-1">Check-out</span>
          <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className="border border-black/15 rounded-lg px-3 py-2 text-sm" />
        </label>
        <button onClick={load} className="bg-accent text-white text-sm font-semibold px-5 py-2 rounded-full">
          Load rates
        </button>
        <span className="text-sm text-black/55">{status}</span>
      </div>

      {summary ? (
        <div className="mt-4 rounded-lg bg-accent-tint/60 p-3 text-sm">
          From {summary.n} hotels you priced: SSP runs <b>{summary.sspInfl >= 0 ? "+" : ""}{summary.sspInfl.toFixed(0)}%</b> vs the
          live price you saw{summary.sspInfl > 5 ? " (inflated — trust the live number, not the SSP)" : ""}. Your real
          spread over net averages <b>${summary.realSpreadAbs.toFixed(0)}</b> ({summary.realSpreadPct.toFixed(0)}%).
        </div>
      ) : null}

      {rows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[820px]">
            <thead>
              <tr className="text-left text-black/60 border-b border-black/10">
                <th className="py-2 pr-3">Hotel</th>
                <th className="py-2 px-2 text-right">NET</th>
                <th className="py-2 px-2 text-right">SSP</th>
                <th className="py-2 px-2 text-right">Live $</th>
                <th className="py-2 px-2 text-right">SSP vs live</th>
                <th className="py-2 px-2 text-right">Real spread</th>
                <th className="py-2 pl-2">Open listing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const lv = parseFloat(live[r.id] ?? "");
                const hasLv = !Number.isNaN(lv) && lv > 0;
                const sspVsLive = hasLv && r.ssp != null ? r.ssp - lv : null;
                const realSpread = hasLv && r.net != null ? lv - r.net : null;
                const l = links(r);
                return (
                  <tr key={r.id} className="border-b border-black/[0.06]">
                    <td className="py-2 pr-3">
                      <div className="font-medium leading-tight">{r.name}</div>
                      <div className="text-xs text-black/60">{r.city}</div>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">{money(r.net)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-black/60">{money(r.ssp)}</td>
                    <td className="py-2 px-2 text-right">
                      <input
                        inputMode="decimal"
                        value={live[r.id] ?? ""}
                        onChange={(e) => setLive((s) => ({ ...s, [r.id]: e.target.value }))}
                        placeholder="—"
                        className="w-20 border border-black/15 rounded-md px-2 py-1 text-right text-sm"
                      />
                    </td>
                    <td className={`py-2 px-2 text-right tabular-nums ${sspVsLive != null && sspVsLive > 0 ? "text-red-600" : "text-black/60"}`}>
                      {sspVsLive == null ? "—" : `${sspVsLive >= 0 ? "+" : ""}$${sspVsLive.toFixed(0)}`}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-[#2e7d46]">
                      {realSpread == null ? "—" : `$${realSpread.toFixed(0)}`}
                    </td>
                    <td className="py-2 pl-2 whitespace-nowrap">
                      <a href={l.ours} target="_blank" rel="noopener noreferrer" className="text-accent font-semibold">Ours</a>
                      <span className="text-black/20"> · </span>
                      <a href={l.google} target="_blank" rel="noopener noreferrer" className="text-accent">Google</a>
                      <span className="text-black/20"> · </span>
                      <a href={l.expedia} target="_blank" rel="noopener noreferrer" className="text-accent">Expedia</a>
                      <span className="text-black/20"> · </span>
                      <a href={l.booking} target="_blank" rel="noopener noreferrer" className="text-accent">Booking</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
