import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log In | Aqua Guide" };

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">Log In</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </section>
  );
}
