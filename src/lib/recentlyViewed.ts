// Recently-viewed hotel ids, kept in localStorage (client-only).
const KEY = "tpc_recent";
const MAX = 12;

export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecent(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const next = [id, ...getRecent().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — ignore */
  }
}
