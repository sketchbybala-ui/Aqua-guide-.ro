import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// A customer requests a refund on their own paid order. This does NOT move
// any money — it just flags the order so an admin can review and approve
// (the admin's "Issue Full Refund" action is what actually calls Razorpay).
// Customers have no update policy on orders, so after verifying ownership
// with the user's session we write the flag via the service-role client.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // orders_select_own RLS means this only returns the order if it's theirs.
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, payment_method, refund_requested_at")
    .eq("id", id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Only paid orders can be refunded." },
      { status: 400 }
    );
  }

  if (order.refund_requested_at) {
    return NextResponse.json(
      { error: "A refund has already been requested for this order." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ refund_requested_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
