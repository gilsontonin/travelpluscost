export function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

/** LiteAPI rating is out of 10 → Expedia-style score + label. */
export function reviewLabel(r?: number): { score: string; label: string } | undefined {
  if (!r) return undefined;
  const label =
    r >= 9 ? "Exceptional" : r >= 8 ? "Very good" : r >= 7 ? "Good" : r >= 6 ? "Pleasant" : "OK";
  return { score: r.toFixed(1), label };
}
