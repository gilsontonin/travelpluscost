import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

const UPDATED = "June 22, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How travelpluscost handles your data — and the one promise that defines us: we never use your data to set your price. The price is the same for everyone.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <>
          <strong>The short version.</strong> We collect the minimum needed to run a hotel search and improve the
          site. <strong>We never use your data to set or personalize your price</strong> — the price you see is the
          same one everyone else sees. No surveillance pricing, ever. We don&apos;t sell your personal information.
        </>
      }
    >
      <p>
        This Privacy Policy explains what information travelpluscost (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
        collects when you use travelpluscost.com (the &quot;Service&quot;), how we use it, and the choices you have. By
        using the Service, you agree to this policy.
      </p>

      <h2>Information we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li>
          <strong>Search details</strong> — the destination, dates, and number of travelers/rooms you enter to find
          hotels.
        </li>
        <li>
          <strong>Contact and account details</strong> — if you create an account, save a hotel, or contact us, we
          collect your email address and anything you choose to send us.
        </li>
      </ul>
      <h3>Information we collect automatically</h3>
      <ul>
        <li>
          <strong>Usage and device data</strong> — pages viewed, links clicked, referring page, browser and device
          type, and an approximate location derived from your IP address. We use this to understand what&apos;s useful
          and to keep the Service secure.
        </li>
        <li>
          <strong>Cookies and analytics</strong> — we use Google Analytics 4 and similar technologies. See
          &quot;Cookies and analytics&quot; below.
        </li>
      </ul>
      <h3>What we do not collect</h3>
      <p>
        We do <strong>not</strong> collect or store your payment card details. When you choose to book, payment and
        the reservation are handled by the hotel or our travel partner under their own terms — not by us.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To run the Service — search, show results, and (where offered) pass your booking to a partner.</li>
        <li>To measure and improve the Service using aggregated analytics.</li>
        <li>To keep the Service secure and prevent abuse.</li>
        <li>To respond to you when you get in touch.</li>
        <li>
          To send you service messages and, where you&apos;ve agreed or we&apos;re otherwise permitted, relevant
          travel offers. You can opt out of marketing at any time.
        </li>
      </ul>
      <p>
        <strong>We never use any of this to set, raise, or personalize the price you pay.</strong> Our pricing is a
        fixed formula — the supplier&apos;s rate plus one flat fee — and it&apos;s identical for every visitor.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We use a small number of cookies and Google Analytics 4 to understand how the Service is used (for example,
        which destinations are popular). Google processes this data under its own{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          privacy policy
        </a>
        . You can block cookies in your browser settings or opt out of Google Analytics with Google&apos;s{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          opt-out add-on
        </a>
        . Blocking cookies won&apos;t change your price.
      </p>

      <h2>How we share information</h2>
      <p>We don&apos;t sell your personal information. We share it only with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> that run the Service for us — hosting and database (Supabase, Netlify),
          hotel content and rates (LiteAPI), analytics (Google), and email delivery — bound to use it only on our
          instructions.
        </li>
        <li>
          <strong>Travel partners</strong> — when you choose to book or follow a booking link, the details needed to
          complete that booking pass to the relevant hotel or partner.
        </li>
        <li>
          <strong>Legal and safety reasons</strong> — if required by law, or to protect our rights, users, or the
          public.
        </li>
      </ul>

      <h2>Third-party sites</h2>
      <p>
        When you proceed to book, you may be taken to a hotel or partner website. Those sites are governed by their
        own privacy policies and terms, not this one.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, delete, or limit the use of your
        personal information, and to opt out of marketing or the &quot;sale&quot;/&quot;sharing&quot; of personal
        information (we don&apos;t sell it). To make a request, email{" "}
        <a href="mailto:privacy@travelpluscost.com">privacy@travelpluscost.com</a>. We&apos;ll respond as required by
        applicable law.
      </p>

      <h2>Data retention and security</h2>
      <p>
        We keep personal information only as long as needed for the purposes above or as the law requires, and we use
        reasonable technical and organizational measures to protect it. No method of transmission or storage is 100%
        secure.
      </p>

      <h2>Children</h2>
      <p>
        The Service isn&apos;t directed to children under 16, and we don&apos;t knowingly collect their personal
        information. If you believe a child has given us data, contact us and we&apos;ll delete it.
      </p>

      <h2>International users</h2>
      <p>
        We operate from the United States, and your information may be processed there. By using the Service you
        understand your information may be transferred to and processed in the U.S.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We&apos;ll change the &quot;Last updated&quot; date above and, for
        significant changes, provide a more prominent notice.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about privacy? Email <a href="mailto:privacy@travelpluscost.com">privacy@travelpluscost.com</a>.
      </p>
    </LegalLayout>
  );
}
