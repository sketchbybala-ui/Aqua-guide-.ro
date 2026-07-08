import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/format";

// Sends the order confirmation email exactly once, via Resend's HTTP API.
//
// Called from both the Razorpay /verify route and the webhook (either can be
// the one that marks an order paid), and from the COD route. To avoid a
// double-send we first *atomically claim* the send by setting
// confirmation_email_sent_at only if it's still null — whichever caller wins
// that conditional update is the one that actually sends.
//
// Failures never throw to the caller: a payment/order must succeed even if
// the email provider is momentarily down.
const FROM = "Aqua Guide <orders@aquaguide.in>";

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // email not configured — skip silently

  const admin = createAdminClient();

  // Atomic claim: only the caller that flips null -> now() gets a row back.
  const { data: claimed } = await admin
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("confirmation_email_sent_at", null)
    .select("*")
    .maybeSingle();

  if (!claimed) return; // already sent (or claimed) by the other path

  try {
    const [{ data: items }, { data: userData }] = await Promise.all([
      admin.from("order_items").select("*").eq("order_id", orderId),
      admin.auth.admin.getUserById(claimed.user_id),
    ]);

    const email = userData?.user?.email;
    if (!email) return;

    const html = renderOrderEmail(claimed, items ?? []);
    const subject =
      claimed.payment_method === "cod"
        ? `Order received — Aqua Guide (#${orderId.slice(0, 8)})`
        : `Payment received — Aqua Guide (#${orderId.slice(0, 8)})`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: email, subject, html }),
    });

    if (!res.ok) {
      // Un-claim so a later retry (e.g. the webhook after a failed /verify
      // send) can try again.
      await admin
        .from("orders")
        .update({ confirmation_email_sent_at: null })
        .eq("id", orderId);
    }
  } catch {
    await admin
      .from("orders")
      .update({ confirmation_email_sent_at: null })
      .eq("id", orderId);
  }
}

type EmailOrder = {
  id: string;
  total_amount: number;
  payment_method: string;
  shipping_name: string | null;
  shipping_address: string | null;
};
type EmailItem = { product_name: string; unit_price: number; quantity: number };

function renderOrderEmail(order: EmailOrder, items: EmailItem[]): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#334155;font-size:14px;">${escapeHtml(i.product_name)} &times; ${i.quantity}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:right;font-weight:600;">${formatINR(i.unit_price * i.quantity)}</td>
      </tr>`
    )
    .join("");

  const paymentLine =
    order.payment_method === "cod"
      ? `Please keep <strong>${formatINR(order.total_amount)}</strong> ready — you can pay in cash when your purifier is delivered.`
      : `We've received your payment of <strong>${formatINR(order.total_amount)}</strong>. Thank you!`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="color:#1d4ed8;font-size:22px;margin:0 0 4px;">Aqua Guide</h1>
    <p style="color:#64748b;font-size:13px;margin:0 0 24px;">Pure Water. Better Life.</p>

    <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px;">Thank you for your order!</h2>
    <p style="color:#475569;font-size:14px;line-height:1.5;margin:0 0 20px;">
      Hi ${escapeHtml(order.shipping_name || "there")}, your order
      <strong>#${order.id.slice(0, 8)}</strong> is confirmed. ${paymentLine}
    </p>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;">
      ${rows}
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">Total</td>
        <td style="padding:12px 0 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;text-align:right;">${formatINR(order.total_amount)}</td>
      </tr>
    </table>

    ${
      order.shipping_address
        ? `<div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:12px;">
             <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Delivery Address</p>
             <p style="color:#334155;font-size:14px;margin:0;white-space:pre-line;">${escapeHtml(order.shipping_address)}</p>
           </div>`
        : ""
    }

    <p style="color:#94a3b8;font-size:12px;margin-top:28px;line-height:1.5;">
      Questions about your order? Reply to this email or reach us on WhatsApp at +91 94893 68104.<br/>
      Aqua Guide, Komarapalayam, Namakkal.
    </p>
  </div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
