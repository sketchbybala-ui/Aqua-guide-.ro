import { requireUser } from "@/lib/auth";
import { AddressBook } from "@/components/account/AddressBook";
import { BackButton } from "@/components/ui/BackButton";

// Reads the logged-in user's session — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  await requireUser();

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref="/account" />
      <h1 className="font-heading mb-8 text-2xl font-semibold text-slate-900">
        Saved Addresses
      </h1>
      <AddressBook />
    </section>
  );
}
