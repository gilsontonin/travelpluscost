// Transactional email — booking confirmation / receipt. Sent via Resend's REST API (no SDK
// dependency). Server-only. Gracefully no-ops when RESEND_API_KEY is unset, so the booking flow
// never breaks just because email isn't configured yet — it logs and moves on.
//
// Smoketest setup: create a free Resend key, set RESEND_API_KEY in Netlify (and .env.local). Until
// you verify a sending domain, leave BOOKING_FROM_EMAIL unset — it defaults to Resend's shared
// onboarding@resend.dev sender, which can only deliver to your own Resend account email (perfect for
// a sandbox test). Set BOOKING_FROM_EMAIL="travelpluscost <hello@travelpluscost.com>" once the domain
// is verified to send to anyone.
import { money } from "./format";
import { SITE_URL } from "./site";

const FROM = process.env.BOOKING_FROM_EMAIL || "travelpluscost <onboarding@resend.dev>";

export interface BookingEmailData {
  to: string;
  guestName: string;
  hotelName: string;
  hotelLocation: string; // "Honolulu, HI"
  ref: string; // confirmation code
  bookingId: string;
  room: string;
  checkin: string;
  checkout: string;
  online: number; // room + online taxes (charged now)
  feesAtProperty: number; // collected at the hotel
  total: number; // all-in
  currency: string;
  cancelLabel: string; // "Free cancellation before Jun 30" | "Non-refundable"
  directionsUrl: string;
  manageUrl: string;
  sandbox: boolean;
}

function fmtDate(d: string): string {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function buildHtml(d: BookingEmailData): string {
  const c = d.currency;
  const row = (label: string, value: string, strong = false) =>
    `<tr>
       <td style="padding:8px 0;color:#6b7280;font-size:14px;">${label}</td>
       <td style="padding:8px 0;text-align:right;font-size:14px;${strong ? "font-weight:600;color:#111;" : "color:#111;"}">${value}</td>
     </tr>`;

  return `<!doctype html><html><body style="margin:0;background:#f4f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="font-size:20px;font-weight:700;margin-bottom:16px;"><span style="color:#0066cc;">travel</span>pluscost</div>
    <div style="background:#fff;border:1px solid #eee;border-radius:16px;padding:28px;">
      ${
        d.sandbox
          ? `<div style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;letter-spacing:.04em;padding:4px 10px;border-radius:999px;margin-bottom:14px;">SANDBOX · TEST BOOKING · NO CHARGE</div>`
          : ""
      }
      <h1 style="font-size:22px;margin:0 0 6px;">Your booking is confirmed</h1>
      <p style="margin:0 0 18px;color:#6b7280;font-size:15px;">Thanks${d.guestName ? `, ${d.guestName}` : ""} — here's your receipt for <strong style="color:#111;">${d.hotelName}</strong>.</p>

      <div style="background:#faf7fb;border-radius:10px;padding:12px 14px;margin-bottom:20px;">
        <div style="font-size:12px;color:#6b7280;">Confirmation code</div>
        <div style="font-size:18px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${d.ref}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        ${row("Hotel", d.hotelName)}
        ${row("Location", d.hotelLocation)}
        ${row("Room", d.room)}
        ${row("Check-in", fmtDate(d.checkin))}
        ${row("Check-out", fmtDate(d.checkout))}
        ${row("Cancellation", d.cancelLabel)}
        ${d.bookingId ? row("Booking ID", d.bookingId) : ""}
      </table>

      <div style="border-top:1px solid #eee;margin-top:14px;padding-top:12px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Room &amp; taxes (paid now)", money(d.online, c))}
          ${d.feesAtProperty > 0 ? row("Fees · paid at the hotel", money(d.feesAtProperty, c)) : ""}
          ${row(`Total all-in (${c})`, money(d.total, c), true)}
        </table>
      </div>

      <div style="margin-top:24px;">
        <a href="${d.directionsUrl}" style="display:inline-block;background:#0066cc;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:10px;">Get directions to the hotel</a>
      </div>

      <div style="border-top:1px solid #eee;margin-top:24px;padding-top:18px;">
        <h2 style="font-size:15px;margin:0 0 6px;">Cancellation &amp; refunds</h2>
        <p style="margin:0 0 10px;color:#6b7280;font-size:14px;">${d.cancelLabel}. To view or cancel this reservation, use Manage your booking and enter your email and booking ID — any refund follows the room's policy above.</p>
        <a href="${d.manageUrl}" style="color:#0066cc;font-size:14px;font-weight:600;text-decoration:none;">Manage your booking →</a>
      </div>

      <div style="border-top:1px solid #eee;margin-top:18px;padding-top:18px;">
        <h2 style="font-size:15px;margin:0 0 6px;">Need help?</h2>
        <p style="margin:0;color:#6b7280;font-size:14px;">Reply to this email or contact us at <a href="mailto:hello@travelpluscost.com" style="color:#0066cc;text-decoration:none;">hello@travelpluscost.com</a>. The price you paid is the same price everyone sees — never based on your data.</p>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">${
      d.sandbox ? "This is a LiteAPI sandbox test reservation. No card was charged. " : ""
    }© ${new Date().getFullYear()} travelpluscost</p>
  </div></body></html>`;
}

export async function sendBookingConfirmation(d: BookingEmailData): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY unset — skipping booking email (booking still succeeded).");
    return { sent: false, reason: "no-key" };
  }
  if (!d.to) return { sent: false, reason: "no-recipient" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [d.to],
        subject: `Booking confirmed — ${d.hotelName} (${d.ref})`,
        html: buildHtml(d),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] Resend ${res.status}: ${body.slice(0, 300)}`);
      return { sent: false, reason: `resend-${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error("[email] send failed:", e);
    return { sent: false, reason: "exception" };
  }
}

/** Google Maps directions deep link — precise pin via lat/lng, else a name+place text search. */
export function directionsUrl(lat: number | null, lng: number | null, label: string): string {
  const dest = lat != null && lng != null ? `${lat},${lng}` : label;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

export const ABS = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
