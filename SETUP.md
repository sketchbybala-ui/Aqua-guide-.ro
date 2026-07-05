# Aqua Guide — Setup Guide

Follow these steps in order, from a fresh clone, to get Aqua Guide running
locally and deployed to production.

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project and run the schema

1. Go to [supabase.com](https://supabase.com) and create a new project (choose
   any region close to your users).
2. Once it's ready, open **SQL Editor** and run the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql). This creates all tables
   (`profiles`, `categories`, `products`, `cart_items`, `orders`,
   `order_items`), enables Row Level Security with the correct policies on
   every table, sets up the triggers, and seeds the two categories.
3. Go to **Storage** and create a new bucket named `product-images`, marked
   **Public**. (The seed script in step 6 will also try to create this bucket
   automatically if it doesn't exist yet.)
4. Go to **Project Settings -> API** and copy:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key -> `SUPABASE_SERVICE_ROLE_KEY` (keep this secret —
     never commit it or expose it to the browser)

## 3. Create a Razorpay account and get test keys

1. Sign up at [razorpay.com](https://razorpay.com) and complete the basic
   account setup.
2. Make sure you're in **Test Mode** (toggle in the dashboard).
3. Go to **Settings -> API Keys** and generate a test key pair:
   - **Key ID** -> `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** -> `RAZORPAY_KEY_SECRET`
4. You'll add the webhook secret (`RAZORPAY_WEBHOOK_SECRET`) in step 9, after
   you have a deployed URL to register the webhook against. For local testing
   only, you can leave it blank — the webhook route just won't receive calls
   until you deploy and register it.

## 4. Set up Resend for auth emails (signup verification, password reset)

Supabase's built-in email sending is rate-limited and unbranded, so route
auth emails through Resend instead:

1. Sign up at [resend.com](https://resend.com).
2. Since you already own a domain, verify it under **Domains** in Resend
   (add the DNS records Resend gives you — e.g. for a subdomain like
   `mail.yourdomain.com`) instead of using Resend's shared test domain, for
   better deliverability and branding.
3. Once verified, go to Resend's SMTP settings to get your SMTP host, port,
   username, and password/API key.
4. In your Supabase project, go to **Authentication -> Settings -> SMTP
   Settings**, enable custom SMTP, and enter Resend's SMTP credentials.

This is a dashboard-only configuration step — no code or `.env` changes are
needed for this.

### Enable the one-time login code in emails

Login works as: enter email + password, get a 6-digit code by email, enter
the code to finish logging in. Supabase's default "Magic Link" email
template only shows a clickable link, not the raw code, so you need to
add it:

1. In Supabase, go to **Authentication -> Email Templates -> Magic Link**.
2. Add `{{ .Token }}` somewhere in the template, e.g.:
   ```html
   <h2>Your Aqua Guide login code</h2>
   <p>Enter this code to finish logging in:</p>
   <h1>{{ .Token }}</h1>
   ```
3. Save. This template is used for both magic links and OTP codes, so this
   is a one-time change — no further configuration needed.

Signup uses the **same code-entry pattern** but a separate template — go to
**Authentication -> Email Templates -> Confirm signup** and add `{{ .Token }}`
there too, e.g.:
```html
<h2>Welcome to Aqua Guide</h2>
<p>Enter this code to finish creating your account:</p>
<h1>{{ .Token }}</h1>
```

> **Note on Resend's free sender**: until you verify your own domain in
> Resend, the shared `onboarding@resend.dev` sender can only deliver to
> the email address on your Resend account — codes to any other address
> will silently fail to send. Verify your own domain in Resend before
> real users need to sign up or log in.

### Enable "Continue with Google"

The login and signup pages both have a Google button already wired up in
the code — you just need to create Google OAuth credentials and add them
to Supabase (no code or `.env` changes needed):

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create a project if you don't have one.
2. Configure the **OAuth consent screen** (External, add your app name/email).
3. Create an **OAuth client ID** (Application type: **Web application**).
4. Add this **Authorized redirect URI** (get the exact value from Supabase
   Dashboard -> Authentication -> Sign In / Providers -> Google — it looks
   like `https://<project-ref>.supabase.co/auth/v1/callback`).
5. Copy the generated **Client ID** and **Client Secret**.
6. In Supabase Dashboard -> Authentication -> Sign In / Providers -> **Google**,
   toggle it on and paste in the Client ID and Client Secret. Save.

That's it — the "Continue with Google" button on `/login` and `/signup`
will work once this is saved.

## 5. Fill in your `.env.local`

```bash
cp .env.example .env.local
```

Then fill in every value from steps 2 and 3. `NEXT_PUBLIC_SITE_URL` should
stay `http://localhost:3000` for local development.

## 6. Seed the product catalog

This uploads the source images from `image/` to Supabase Storage and
inserts all 22 products (17 Home Use + 5 Commercial Use):

```bash
npm run seed
```

Re-running this script is safe — products are upserted by slug.

Alternative: skip this and add products manually later through `/admin`
once you've promoted yourself to admin (step 8).

## 7. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 8. Create your account and promote yourself to admin

1. Sign up through the site at `/signup` (check your email for the
   verification link — sent via Resend once step 4 is configured).
2. In the Supabase **SQL Editor**, run:

   ```sql
   update public.profiles set is_admin = true where id = '<your-user-uuid>';
   ```

   You can find your user's UUID under **Authentication -> Users** in the
   Supabase dashboard.
3. Visit `/admin` — you should now see the product management panel.

## 9. Test a payment (Razorpay test mode)

1. Add a product to your cart and go to `/checkout`.
2. Use one of Razorpay's published [test card numbers](https://razorpay.com/docs/payments/payments/test-card-details/)
   (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV, any OTP).
3. Confirm the order shows as **paid** on `/checkout/success` and appears
   under `/account/orders`.

## 10. Deploy to Vercel

1. Push this repo to GitHub (see below if you haven't yet).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Add all the same environment variables from `.env.local` in the Vercel
   project's **Settings -> Environment Variables**.
4. Deploy. Confirm the app works at the generated `*.vercel.app` URL first.

## 11. Point your custom domain at it

1. In Vercel, go to **Settings -> Domains** and add your domain. Follow
   Vercel's instructions to update your domain's DNS (A or CNAME record).
   Vercel automatically provisions HTTPS once DNS propagates.
2. Once the custom domain is live:
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel's environment variables to
     `https://yourdomain.com` and redeploy.
   - In Supabase, go to **Authentication -> URL Configuration** and set the
     Site URL and Redirect URLs to your custom domain (so signup/reset email
     links point to the right place).
   - In Razorpay, go to **Settings -> Webhooks**, add a webhook pointing to
     `https://yourdomain.com/api/razorpay/webhook`, subscribe to the
     `payment.captured` and `payment.failed` events, and copy the webhook's
     signing secret into `RAZORPAY_WEBHOOK_SECRET` in Vercel (then redeploy).

## Going live for real payments

Everything above uses Razorpay **test mode**. When you're ready to accept
real payments: complete Razorpay's KYC/activation process, switch to your
live API keys and webhook secret in Vercel's environment variables, and
redeploy.

## Push to GitHub

If this repo isn't pushed yet:

```bash
git init
git add .
git commit -m "Initial Aqua Guide build"
git branch -M main
git remote add origin https://github.com/sketchbybala-ui/Aqua-guide.git
git push -u origin main
```
