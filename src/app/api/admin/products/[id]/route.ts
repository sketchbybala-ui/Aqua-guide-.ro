import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("products")
    .update({
      name: body.name,
      slug: body.slug,
      category_id: body.category_id,
      price: body.price,
      description: body.description || null,
      image_url: body.image_url || null,
      is_active: body.is_active ?? true,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  // Note: we intentionally never delete the underlying Storage image here —
  // several seeded products share the same placeholder image file, so
  // deleting it would break every other product still referencing it.
  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
