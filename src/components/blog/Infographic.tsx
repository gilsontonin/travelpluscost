import { getInfographic } from "@/lib/infographics";

// Native, crawlable infographic blocks (no images = fast LCP). Rendered where a post writes
// `::infographic <key>`. Server component. Keep a prose sentence beside it in the body.
export default function Infographic({ id }: { id: string }) {
  const ig = getInfographic(id);
  if (!ig) return null;

  if (ig.kind === "stat") {
    return (
      <figure className="my-6 rounded-2xl border border-black/[0.08] bg-accent-tint/40 p-5">
        {ig.title ? <figcaption className="mb-3 text-sm font-bold text-black">{ig.title}</figcaption> : null}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ig.stats.map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-extrabold tracking-tight text-accent">{s.value}</div>
              <div className="mt-0.5 text-xs text-black/60">{s.label}</div>
            </div>
          ))}
        </div>
      </figure>
    );
  }

  if (ig.kind === "compare") {
    return (
      <figure className="my-6 overflow-hidden rounded-2xl border border-black/[0.08]">
        {ig.title ? <figcaption className="bg-black/[0.03] px-5 py-3 text-sm font-bold text-black">{ig.title}</figcaption> : null}
        <div className="grid grid-cols-[1fr_1fr] text-sm">
          <div className="border-b border-black/[0.08] bg-black/[0.02] px-4 py-2.5 font-semibold text-black/70">{ig.left}</div>
          <div className="border-b border-l border-black/[0.08] bg-accent-tint/50 px-4 py-2.5 font-semibold text-accent">{ig.right}</div>
          {ig.rows.map((r, i) => (
            <div key={i} className="contents">
              <div className="border-b border-black/[0.06] px-4 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-black/60">{r.label}</div>
                <div className="mt-0.5 text-black/75">{r.left}</div>
              </div>
              <div className="border-b border-l border-black/[0.06] bg-accent-tint/20 px-4 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-black/60">&nbsp;</div>
                <div className="mt-0.5 font-medium text-black/85">{r.right}</div>
              </div>
            </div>
          ))}
        </div>
      </figure>
    );
  }

  if (ig.kind === "steps") {
    return (
      <figure className="my-6 rounded-2xl border border-black/[0.08] p-5">
        {ig.title ? <figcaption className="mb-3 text-sm font-bold text-black">{ig.title}</figcaption> : null}
        <ol className="space-y-3">
          {ig.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-black">{s.title}</div>
                <div className="text-sm text-black/65">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </figure>
    );
  }

  // callout
  return (
    <figure className="my-6 rounded-2xl border-l-4 border-accent bg-accent-tint/40 p-5">
      <figcaption className="text-sm font-bold text-black">{ig.title}</figcaption>
      <p className="mt-1 text-sm text-black/75">{ig.body}</p>
    </figure>
  );
}
