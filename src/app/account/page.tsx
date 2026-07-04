import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function AccountPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My Account</h1>
        <LogoutButton />
      </div>

      <div className="mt-8 space-y-3 rounded-2xl border border-slate-100 p-6 text-sm">
        <p>
          <span className="text-slate-500">Name: </span>
          {profile?.full_name || "—"}
        </p>
        <p>
          <span className="text-slate-500">Email: </span>
          {user.email}
        </p>
        <p>
          <span className="text-slate-500">Phone: </span>
          {profile?.phone || "—"}
        </p>
      </div>

      <Link
        href="/account/orders"
        className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        View Order History &rarr;
      </Link>
    </section>
  );
}
