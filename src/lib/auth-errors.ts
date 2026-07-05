// Supabase's auth-js sometimes surfaces the raw underlying error as the
// `.message` (e.g. a literal "{}" when the configured SMTP provider fails
// to send — see SETUP.md's note on Resend's sender restrictions). Showing
// that directly to a user is meaningless, so replace anything
// unhelpful/empty with a clear, actionable message.
export function friendlyAuthError(message: string | undefined): string {
  if (!message || message.trim() === "" || message.trim() === "{}") {
    return "We couldn't send the email right now. This usually means the email service isn't fully set up yet — please try again shortly, or contact support if it keeps happening.";
  }
  return message;
}
