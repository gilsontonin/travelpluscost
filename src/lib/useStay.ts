"use client";

import { useCallback, useEffect, useState } from "react";

// Property-page "stay" params (dates + guests) shared by the date bar, quick-pick pills, rooms panel, and
// price CTA. Updates go through window.history.replaceState — NOT a router navigation — so changing dates
// does NOT refetch the page RSC. That means: (1) no scroll-jump back to the top, and (2) an instant
// re-render, so the UI reacts immediately (the pill highlights + "Updating prices…" shows at once). A
// custom event keeps every consumer in sync. The URL still carries the params (shareable; /book reads them).
export type Stay = { checkin: string; checkout: string; adults: string };
const EVT = "stayparamschange";
const DEFAULT: Stay = { checkin: "", checkout: "", adults: "2" };

function read(): Stay {
  if (typeof window === "undefined") return DEFAULT;
  const p = new URLSearchParams(window.location.search);
  return { checkin: p.get("checkin") ?? "", checkout: p.get("checkout") ?? "", adults: p.get("adults") ?? "2" };
}

export function useStay() {
  // Start from DEFAULT on the server AND the first client render (no hydration mismatch), then sync from
  // the URL on mount.
  const [stay, setStay] = useState<Stay>(DEFAULT);
  useEffect(() => {
    const sync = () => setStay(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  const update = useCallback((patch: Partial<Stay>) => {
    const p = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    window.dispatchEvent(new Event(EVT));
  }, []);
  return { ...stay, update };
}
