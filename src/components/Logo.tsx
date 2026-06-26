// The travelplus wordmark: "travel [+]". The accent "+" squircle badge IS the "plus" — so the mark reads
// "travelplus" — and it encodes the cost-plus pricing model (the hotel's rate PLUS one small flat fee).
// Sizes in em, so the badge scales with whatever font-size it's dropped into (header, footer, hero).
// Callers wrap this in <Link href="/"> with an aria-label (a screen reader won't read the "+" as "plus").
// The legal name / domain stays travelpluscost.com.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.18em] font-semibold tracking-tight ${className}`}>
      <span>travel</span>
      <span
        aria-hidden
        className="inline-flex h-[1em] w-[1em] items-center justify-center rounded-[0.3em] bg-gradient-to-br from-[#0a84ff] to-[#0066cc] text-white shadow-[0_1px_3px_rgba(0,102,204,0.45)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" className="h-[0.6em] w-[0.6em]">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
    </span>
  );
}
