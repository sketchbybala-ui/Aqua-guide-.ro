import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";

export const metadata: Metadata = { title: "Log In | Aqua Guide" };

export default function LoginPage() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Log In</h1>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
