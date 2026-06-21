"use client";

import { useEffect } from "react";
import { addRecent } from "@/lib/recentlyViewed";

// Records a property page view into the recently-viewed list (renders nothing).
export default function TrackView({ id }: { id: string }) {
  useEffect(() => {
    addRecent(id);
  }, [id]);
  return null;
}
