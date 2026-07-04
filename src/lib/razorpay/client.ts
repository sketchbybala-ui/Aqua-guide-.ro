import "server-only";
import Razorpay from "razorpay";

// Server-only Razorpay SDK instance. Uses the key secret, so this must
// never be imported from a Client Component or anything bundled for the browser.
export function createRazorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}
