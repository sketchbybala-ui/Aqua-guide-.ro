import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Razorpay calls this directly (no user session) whenever a payment's
// status changes. This is the authoritative source of truth for order
// status — it finalizes payment even if the buyer's browser tab closed
// right after paying, before the client-side /verify call could run.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const admin = createAdminClient();

  const razorpayOrderId =
    event.payload?.payment?.entity?.order_id ??
    event.payload?.order?.entity?.id;

  if (event.event === "payment.captured" && razorpayOrderId) {
    await admin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: event.payload.payment.entity.id,
      })
      .eq("razorpay_order_id", razorpayOrderId)
      .neq("status", "paid"); // idempotent: no-op if /verify already marked it paid
  } else if (event.event === "payment.failed" && razorpayOrderId) {
    await admin
      .from("orders")
      .update({ status: "failed" })
      .eq("razorpay_order_id", razorpayOrderId)
      .eq("status", "created");
  }

  return NextResponse.json({ received: true });
}
