"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { friendlyAuthError } from "@/lib/auth-errors";

type Step = "details" | "otp";

export function SignupForm() {
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1: create the (unconfirmed) account — this emails a one-time code.
  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        setError(friendlyAuthError(error.message));
        return;
      }

      setStep("otp");
    } catch {
      // Network/config failures throw instead of returning a normal
      // `error` field — without this catch, the button would stay stuck
      // with no feedback at all.
      setError(
        "Could not reach the server. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Step 2: verify the code — this confirms the account and logs you in.
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) {
        setError(friendlyAuthError(error.message));
        return;
      }

      router.push("/?welcome=1");
      router.refresh();
    } catch {
      setError(
        "Could not reach the server. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setError(error ? friendlyAuthError(error.message) : "A new code has been sent.");
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-slate-600">
          We sent a one-time code to <strong>{email}</strong>. Enter it below
          to finish creating your account.
        </p>
        <div>
          <Label htmlFor="signup-otp">One-time code</Label>
          <Input
            id="signup-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Verifying…" : "Verify & Create Account"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          className="text-center text-sm font-medium text-brand-600"
        >
          Resend code
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Sending code…" : "Continue"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        OR
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Log in
        </Link>
      </p>
    </form>
  );
}
