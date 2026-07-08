import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayClient } from "@/lib/razorpay/client";
import { validateCoupon, applyDiscount } from "@/lib/coupons";

// Creates a Razorpay order for the current user's cart. The amount is
// always computed here from the DB's current product prices — the client
// never gets to say how much an order costs. A coupon code, if given, is
// re-validated here too (never trust a client-sent discount).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { shippingName, shippingPhone, shippingAddress, couponCode } =
    await request.json().catch(() => ({}));

  if (!shippingName || !shippingPhone || !shippingAddress) {
    return NextResponse.json(
      { error: "Shipping name, phone, and address are required" },
      { status: 400 }
    );
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

  const subtotal = validLines.reduce(
    (sum, l) => sum + l.products!.price * l.quantity,
    0
  );

  const admin = createAdminClient();

  let totalAmount = subtotal;
  let discountAmount = 0;
  let appliedCouponCode: string | null = null;

  if (couponCode) {
    const result = await validateCoupon(admin, couponCode, user.id);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    totalAmount = applyDiscount(subtotal, result.discountPercent);
    discountAmount = Math.round((subtotal - totalAmount) * 100) / 100;
    appliedCouponCode = couponCode.trim().toUpperCase();
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      currency: "INR",
      coupon_code: appliedCouponCode,
      discount_amount: discountAmount,
      shipping_name: shippingName,
      shipping_phone: shippingPhone,
      shipping_address: shippingAddress,
    })
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
