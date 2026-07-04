import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// RLS already rejects product writes from non-admins, but we re-check here
// too (defense in depth) so we can return clean error responses and keep
// validation/shaping in one place instead of relying on a raw Postgres error.
export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("products")
    .insert({
      name: body.name,
      slug: body.slug,
      category_id: body.category_id,
      price: body.price,
      description: body.description || null,
      image_url: body.image_url || null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
