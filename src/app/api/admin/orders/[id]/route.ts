import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayClient } from "@/lib/razorpay/client";

// Admin-only order actions. requireAdmin redirects non-admins server-side;
// the service-role client is used for the write since regular users have no
// update policy on orders at all.
//
//   action: "refund"    -> refund an online-paid order via Razorpay, mark 'refunded'
//   action: "mark_paid" -> mark a COD order paid once cash is collected
//   action: "cancel"    -> cancel an order that hasn't been paid yet
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const { action } = await request.json().catch(() => ({}));

  const admin = createAdminClient();
  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (action === "refund") {
    if (order.status !== "paid" || order.payment_method !== "online") {
      return NextResponse.json(
        { error: "Only online-paid orders can be refunded." },
        { status: 400 }
      );
    }
    if (!order.razorpay_payment_id) {
      return NextResponse.json(
        { error: "This order has no Razorpay payment to refund." },
        { status: 400 }
      );
    }

    try {
      const razorpay = createRazorpayClient();
      const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
        amount: Math.round(Number(order.total_amount) * 100), // full refund, in paise
      });

      await admin
        .from("orders")
        .update({
          status: "refunded",
          razorpay_refund_id: refund.id,
          refunded_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json({ ok: true, refundId: refund.id });
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? `Refund failed: ${err.message}`
              : "Refund failed.",
        },
        { status: 502 }
      );
    }
  }

  if (action === "mark_paid") {
    if (order.payment_method !== "cod") {
      return NextResponse.json(
        { error: "Only COD orders are marked paid manually." },
        { status: 400 }
      );
    }
    await admin.from("orders").update({ status: "paid" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "cancel") {
    if (order.status === "paid" || order.status === "refunded") {
      return NextResponse.json(
        { error: "Paid orders must be refunded, not cancelled." },
        { status: 400 }
      );
    }
    await admin.from("orders").update({ status: "cancelled" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
