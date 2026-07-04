import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign Up | Aqua Guide" };

export default function SignupPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Create an Account
      </h1>
      <SignupForm />
    </section>
  );
}
