import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

const UPDATED = "June 22, 2026";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How travelpluscost makes money — and why it never changes the price you pay or the order we show hotels in.",
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <LegalLayout
      title="Affiliate Disclosure"
      updated={UPDATED}
      intro={
        <>
          <strong>The short version.</strong> Some links on travelpluscost are affiliate links — if you book through
          them, we may earn a commission from the partner. <strong>It never changes the price you pay</strong>, and it
          never changes the order we show hotels in. Same price for everyone; ranking by guest rating, not commission.
        </>
      }
    >
      <p>
        We believe in being upfront about how we make money — it&apos;s the whole point of travelpluscost. This page
        explains our affiliate relationships, in plain language and in line with the U.S. Federal Trade
        Commission&apos;s guidance on endorsements and disclosures.
      </p>

      <h2>What affiliate links are</h2>
      <p>
        Some links on this site — for example, links to book a hotel or an activity with a partner such as Expedia,
        Booking.com, or Viator — are &quot;affiliate links.&quot; If you click one and complete a booking, the partner
        may pay us a commission. This is one of the ways the Service is funded.
      </p>

      <h2>It doesn&apos;t change your price</h2>
      <p>
        An affiliate commission is paid by the <strong>partner</strong>, out of their own margin — not added to your
        bill. The price you see is the supplier&apos;s rate plus our one flat fee, and it&apos;s{" "}
        <strong>the same for every visitor</strong>, whether or not a link earns us anything. We never raise a price
        because a booking is commissionable.
      </p>

      <h2>It doesn&apos;t change what we show you</h2>
      <p>
        Commission never buys placement here. We rank and recommend hotels by guest rating and relevance to your
        search — not by which partner pays us most. There is no pay-to-rank, and we don&apos;t hide better options
        because they earn us less.
      </p>

      <h2>Why we tell you this</h2>
      <p>
        Most travel sites quietly mark up your room and sometimes adjust the price based on your data. We don&apos;t —
        and we&apos;d rather show you exactly how the lights stay on than pretend we&apos;re a charity. Transparent
        pricing only means something if we&apos;re transparent about our own incentives too.
      </p>

      <h2>Questions</h2>
      <p>
        Anything unclear about how we earn? Email{" "}
        <a href="mailto:hello@travelpluscost.com">hello@travelpluscost.com</a>.
      </p>
    </LegalLayout>
  );
}
