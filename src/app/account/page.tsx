import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BackButton } from "@/components/ui/BackButton";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";

// Reads the logged-in user's session — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <BackButton fallbackHref="/" />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">My Account</h1>
          <LogoutButton />
        </div>

        <div className="mt-8 space-y-3 rounded-2xl border border-slate-100 bg-white p-6 text-sm">
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

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/account/orders"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View Order History &rarr;
          </Link>
          <Link
            href="/account/addresses"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Manage Saved Addresses &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
