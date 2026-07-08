import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Places a Cash-on-Delivery order. Same authoritative-total logic as the
// Razorpay create-order route (the amount is always recomputed here from
// current DB prices — never trusted from the client), but no online
// payment: the order is recorded with payment_method 'cod', status
// 'created' (awaiting delivery & cash collection), and the cart is cleared.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { shippingName, shippingPhone, shippingAddress } = await request
    .json()
    .catch(() => ({}));

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

  const totalAmount = validLines.reduce(
    (sum, l) => sum + l.products!.price * l.quantity,
    0
  );

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      currency: "INR",
      payment_method: "cod",
      status: "created",
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

  // Clear the cart with the user's own session (RLS: cart_items_delete_own).
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  // "Order received, pay on delivery" confirmation email.
  await sendOrderConfirmationEmail(order.id);

  return NextResponse.json({ localOrderId: order.id });
}
