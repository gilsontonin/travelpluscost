"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

// Fires a GA4 event once on mount — for server-rendered pages (property view_item, /book begin_checkout,
// /booking-confirmed purchase) where there's no user click to hang the event on. Renders nothing.
// GA4 dedupes `purchase` by transaction_id, so a page refresh won't double-count revenue.
export default function TrackEvent({ event, params }: { event: string; params?: Record<string, unknown> }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
