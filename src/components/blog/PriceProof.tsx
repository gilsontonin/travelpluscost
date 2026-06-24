import Link from "next/link";

// `::priceproof` — the brand's signature trust widget. Static, crawlable, no data fetch.
// The one conversion play no surveillance-pricing OTA can run: the SAME price on every device.
export default function PriceProof() {
  return (
    <aside className="my-6 overflow-hidden rounded-2xl border border-accent/25 bg-accent-tint/40">
      <div className="px-5 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-accent">Prove it yourself</p>
        <p className="mt-1.5 text-base font-bold text-black">The same price on every device</p>
        <p className="mt-1 text-sm leading-relaxed text-black/75">
          Open any stay here on your laptop, then on your phone on another network. It&apos;s the identical
          number. We price from the hotel&apos;s rate plus one small flat fee — never your device, location,
          or browsing history.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-px bg-black/[0.06]">
        {[
          { label: "On your laptop", sub: "Logged out, fresh browser" },
          { label: "On your phone", sub: "Different network, signed in" },
        ].map((d, i) => (
          <div key={d.label} className={`bg-white px-4 py-3 ${i === 1 ? "order-3" : ""}`}>
            <div className="text-xs font-semibold text-black">{d.label}</div>
            <div className="mt-0.5 text-[11px] text-black/50">{d.sub}</div>
            <div className="mt-1.5 text-lg font-extrabold tracking-tight text-accent">Same price</div>
          </div>
        ))}
        <div className="order-2 grid place-items-center bg-white px-3 text-xl font-bold text-black/40">=</div>
      </div>
      <div className="px-5 py-3">
        <Link href="/#how" className="text-sm font-semibold text-accent hover:underline">
          How our honest pricing works →
        </Link>
      </div>
    </aside>
  );
}
