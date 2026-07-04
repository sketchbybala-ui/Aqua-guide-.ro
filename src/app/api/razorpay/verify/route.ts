import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Verifies the Razorpay checkout signature server-side before ever marking
// an order as paid. The client-side "success" callback alone is never
// trusted — see also the webhook route, which is the authoritative backstop.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    localOrderId,
  } = await request.json();

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid =
    expectedSignature.length === razorpay_signature?.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

  const admin = createAdminClient();

  if (!isValid) {
    await admin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", localOrderId)
      .eq("user_id", user.id);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq("id", localOrderId)
    .eq("user_id", user.id)
    .eq("razorpay_order_id", razorpay_order_id);

  // Clear the cart with the user's own session (RLS: cart_items_delete_own).
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
