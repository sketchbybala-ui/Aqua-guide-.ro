import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Step 1 of OTP login: verify the password server-side using a throwaway
// client (never touches this app's session cookies), then — only if the
// password is correct — email the user a one-time code via Supabase Auth's
// built-in OTP flow (sent through Resend, since that's configured as the
// project's SMTP provider). Step 2 (verifying the code) happens client-side
// via supabase.auth.verifyOtp, which is what actually creates the session.
export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const ephemeral = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error: passwordError } = await ephemeral.auth.signInWithPassword({
    email,
    password,
  });

  if (passwordError) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Password confirmed — drop that session immediately, we only needed to
  // check the credentials, not actually log in yet.
  await ephemeral.auth.signOut();

  const { error: otpError } = await ephemeral.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (otpError) {
    return NextResponse.json({ error: otpError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
