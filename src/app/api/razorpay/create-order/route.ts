import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayClient } from "@/lib/razorpay/client";

// Creates a Razorpay order for the current user's cart. The amount is
// always computed here from the DB's current product prices — the client
// never gets to say how much an order costs.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: cartRows } = await supabase
    .from("cart_items")
    .select("quantity, products(id, name, price)")
    .eq("user_id", user.id);

  const lines = (cartRows ?? []) as unknown as {
    quantity: number;
    products: { id: string; name: string; price: number } | null;
  }[];

  const validLines = lines.filter((l) => l.products);

  if (validLines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const totalAmount = validLines.reduce(
    (sum, l) => sum + l.products!.price * l.quantity,
    0
  );

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({ user_id: user.id, total_amount: totalAmount, currency: "INR" })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 }
    );
  }

  await admin.from("order_items").insert(
    validLines.map((l) => ({
      order_id: order.id,
      product_id: l.products!.id,
      product_name: l.products!.name,
      unit_price: l.products!.price,
      quantity: l.quantity,
    }))
  );

  const razorpay = createRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100), // Razorpay expects paise
    currency: "INR",
    receipt: order.id,
  });

  await admin
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", order.id);

  return NextResponse.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    localOrderId: order.id,
  });
}
