import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";

// Uploads go through this server route (using the service-role client)
// rather than directly from the browser to Supabase Storage — this avoids
// needing separate storage.objects RLS policies, and lets us re-check
// is_admin here as a second gate before writing anything.
export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `products/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${extension}`;

  const { error } = await admin.storage
    .from("product-images")
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("product-images").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
