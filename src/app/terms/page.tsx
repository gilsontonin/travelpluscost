import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

const UPDATED = "June 22, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using travelpluscost — a transparent hotel search where the price is the supplier's rate plus one flat fee, the same for everyone.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated={UPDATED}
      intro={
        <>
          <strong>The short version.</strong> We help you find and book hotels at one honest price — the
          supplier&apos;s rate plus one small flat fee, the same for everyone. We&apos;re the search and comparison
          layer, not the hotel; your reservation is with the hotel or our travel partner under their terms.
        </>
      }
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of travelpluscost.com (the &quot;Service&quot;),
        operated by travelpluscost (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By using the Service, you agree
        to these Terms. If you don&apos;t agree, please don&apos;t use the Service.
      </p>

      <h2>What we do</h2>
      <p>
        travelpluscost is a hotel search and price-comparison service. We help you discover hotels and, where
        available, connect you to book them. <strong>We are an intermediary, not the hotel operator</strong> and not
        the party that provides your accommodation. We don&apos;t own, run, or control the hotels listed.
      </p>

      <h2>Our pricing</h2>
      <p>
        The price we show is the supplier&apos;s rate plus one flat service fee, presented as an all-in figure that
        includes taxes and known fees. <strong>That price is the same for every visitor</strong> — it is never based
        on your device, location, or browsing history. Rates and availability come from third-party suppliers and can
        change at any time until a booking is confirmed. We work to keep prices and details accurate but don&apos;t
        guarantee they are error-free.
      </p>

      <h2>Bookings</h2>
      <p>
        When you book a hotel, your reservation is made with the hotel or our travel partner, and is subject to{" "}
        <strong>their</strong> rates, rules, and cancellation and refund policies, which are presented before you
        confirm. Those supplier terms govern your reservation. We are not a party to the contract between you and the
        hotel or partner, and we don&apos;t provide the travel services themselves.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Use the Service only for lawful, personal, non-commercial trip planning and booking.</li>
        <li>
          Don&apos;t scrape, copy, or harvest content or data, overload or interfere with the Service, or attempt to
          access it in unauthorized ways.
        </li>
        <li>Don&apos;t misrepresent your identity or use the Service to defraud anyone.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The Service, including its design, text, and branding, is owned by us or our licensors and protected by law.
        Hotel content, photos, and ratings belong to their respective owners and suppliers. You may not reuse them
        except as the Service allows.
      </p>

      <h2>Third-party content and links</h2>
      <p>
        The Service shows content from and links to third parties (hotels, suppliers, and partners). We don&apos;t
        control and aren&apos;t responsible for third-party content, sites, or services, and including them is not an
        endorsement.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, whether
        express or implied, including fitness for a particular purpose and non-infringement. We don&apos;t warrant that
        the Service will be uninterrupted, error-free, or that listings, prices, or availability are accurate or
        current.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, travelpluscost will not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or for any loss arising from your use of (or inability to use) the
        Service or from any booking, hotel stay, or dealing with a supplier or partner. Nothing in these Terms limits
        liability that cannot be limited under applicable law.
      </p>

      <h2>Indemnity</h2>
      <p>
        You agree to indemnify and hold travelpluscost harmless from claims and expenses arising out of your misuse of
        the Service or your breach of these Terms.
      </p>

      <h2>Changes</h2>
      <p>
        We may update the Service and these Terms from time to time. We&apos;ll update the &quot;Last updated&quot;
        date above; continued use after a change means you accept the updated Terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the United States and the state in which the operator is established,
        without regard to conflict-of-laws rules.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:legal@travelpluscost.com">legal@travelpluscost.com</a>.
      </p>
    </LegalLayout>
  );
}
