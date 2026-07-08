-- ============================================================================
-- Aqua Guide — Supabase schema
-- Run this once in the Supabase SQL Editor on a fresh project.
-- Tables: profiles, categories, products, cart_items, orders, order_items
-- Every table has Row Level Security enabled.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- PROFILES
-- One row per auth user. Created automatically by the handle_new_user trigger
-- below — never created directly by client code.
-- ============================================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- Note: is_admin escalation from a client update is blocked by the
-- block_admin_escalation trigger further down, not by this policy.

-- ============================================================================
-- CATEGORIES
-- ============================================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_all"
  on public.categories for select
  using (true);

create policy "categories_admin_write"
  on public.categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug        text not null unique,
  name        text not null,
  description text,
  price       numeric(12,2) not null check (price >= 0),
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);

alter table public.products enable row level security;

create policy "products_select_active_or_admin"
  on public.products for select
  using (
    is_active
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "products_admin_write"
  on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ============================================================================
-- CART_ITEMS
-- Fully owner-scoped: a user can only ever see/write their own cart rows.
-- ============================================================================
create table public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "cart_items_select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "cart_items_update_own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- ORDERS
-- Deliberately NO insert/update/delete policy for the 'authenticated' role.
-- All writes happen server-side via the service-role client inside the
-- Razorpay route handlers, which recompute the total from current product
-- prices — a client can never insert an order with a self-chosen amount.
-- ============================================================================
create type public.order_status as enum ('created', 'paid', 'failed', 'cancelled', 'refunded');

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete restrict,
  status              public.order_status not null default 'created',
  -- 'online' = paid via Razorpay; 'cod' = cash on delivery (no online payment).
  payment_method      text not null default 'online' check (payment_method in ('online', 'cod')),
  total_amount        numeric(12,2) not null check (total_amount >= 0),
  currency            text not null default 'INR',
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  razorpay_signature  text,
  razorpay_refund_id  text,
  refunded_at         timestamptz,
  -- set when the customer requests a refund; the admin then approves it,
  -- which issues the actual Razorpay refund and sets refunded_at.
  refund_requested_at timestamptz,
  -- claimed atomically before sending the order confirmation email, so the
  -- email goes out exactly once even though both the Razorpay /verify call
  -- and the webhook can mark an order paid.
  confirmation_email_sent_at timestamptz,
  -- coupon applied at order creation, if any (see coupons/coupon_redemptions
  -- below); total_amount above is already the post-discount amount charged.
  coupon_code         text,
  discount_amount     numeric(12,2) not null default 0,
  shipping_name       text,
  shipping_phone      text,
  shipping_address    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_user_id_idx on public.orders(user_id);

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders_admin_select_all"
  on public.orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ============================================================================
-- ORDER_ITEMS
-- Snapshots product name/price at purchase time so later catalog edits
-- never rewrite order history. No client write policies — inserted only by
-- the create-order route handler via the service-role client.
-- ============================================================================
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price   numeric(12,2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  created_at   timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items_admin_select_all"
  on public.order_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ============================================================================
-- ADDRESSES
-- Multiple saved shipping addresses per user. Fully owner-scoped, same
-- pattern as cart_items — a user can only ever see/write their own rows.
-- ============================================================================
create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  label         text not null default 'Home',
  full_name     text not null,
  phone         text not null,
  address_line  text not null,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

-- Only one default address per user.
create unique index addresses_one_default_per_user
  on public.addresses(user_id)
  where is_default;

alter table public.addresses enable row level security;

create policy "addresses_select_own"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "addresses_insert_own"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "addresses_update_own"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses_delete_own"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- REVIEWS
-- One review per user per product. Publicly readable so anyone browsing
-- can see ratings; writable only by the review's own author. reviewer_name
-- is a snapshot (same pattern as order_items snapshotting product_name) so
-- showing a review never needs to read another user's profile row, which
-- profiles' RLS doesn't allow anyway.
-- ============================================================================
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  image_urls    text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_product_id_idx on public.reviews(product_id);

alter table public.reviews enable row level security;

create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Cheap per-product aggregate, exposed automatically via PostgREST like any
-- other table/view. Queried separately (one query for many product ids)
-- rather than embedded, since PostgREST embedding needs a declared FK
-- relationship, which a view doesn't have.
create view public.product_rating_summary as
  select
    product_id,
    round(avg(rating)::numeric, 1) as avg_rating,
    count(*)::int as review_count
  from public.reviews
  group by product_id;

-- ============================================================================
-- COUPONS
-- Percent-off discount codes, redeemable up to max_uses_per_user times per
-- customer (a one-time "welcome" code is the default use case). Coupons
-- themselves are publicly readable (so the checkout UI can look one up),
-- but every write (creating coupons, recording a redemption) happens
-- server-side via the service-role client — customers have no write policy
-- on either table, so they can never grant themselves a discount or fake a
-- redemption record.
-- ============================================================================
create table public.coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  discount_percent  numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 100),
  is_active         boolean not null default true,
  max_uses_per_user integer not null default 1,
  created_at        timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "coupons_select_active"
  on public.coupons for select
  using (is_active);

create policy "coupons_admin_write"
  on public.coupons for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- One row per (coupon, user) redemption — the unique constraint is what
-- actually enforces "one welcome bonus per customer" at the database level.
create table public.coupon_redemptions (
  id         uuid primary key default gen_random_uuid(),
  coupon_id  uuid not null references public.coupons(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  order_id   uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (coupon_id, user_id)
);

alter table public.coupon_redemptions enable row level security;

create policy "coupon_redemptions_select_own"
  on public.coupon_redemptions for select
  using (auth.uid() = user_id);

create policy "coupon_redemptions_admin_select_all"
  on public.coupon_redemptions for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Seed a 10%-off, one-time-per-customer welcome coupon.
insert into public.coupons (code, discount_percent, is_active, max_uses_per_user)
values ('WELCOME10', 10, true, 1)
on conflict (code) do nothing;

-- ============================================================================
-- PAGE_VIEWS
-- Lightweight visit log — one row per page load, written by a client-side
-- beacon via a service-role API route (no client insert policy needed, or
-- possible, since customers never write here directly). Only admins can
-- read it.
-- ============================================================================
create table public.page_views (
  id         uuid primary key default gen_random_uuid(),
  path       text not null,
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views(created_at);
create index page_views_path_idx on public.page_views(path);

alter table public.page_views enable row level security;

create policy "page_views_admin_select_all"
  on public.page_views for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Generic updated_at maintenance, reused across tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cart_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth.users row appears.
-- security definer is required: at signup time the new user has no
-- session yet, so this must run with the function owner's privileges.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent a user from granting themselves admin via a client-side
-- profile update (RLS alone can't cleanly block this without recursion,
-- so a trigger enforces it instead).
create or replace function public.prevent_admin_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() = 'authenticated' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger block_admin_escalation before update on public.profiles
  for each row execute function public.prevent_admin_self_escalation();

-- ============================================================================
-- SEED CATEGORIES
-- Product rows themselves are inserted by scripts/seed-products.ts
-- (they need Storage image URLs, which don't exist until that script runs).
-- ============================================================================
insert into public.categories (slug, name, description) values
  ('home-use', 'Home Use', 'Water purifiers designed for homes and apartments.'),
  ('commercial', 'Commercial Use', 'High-capacity RO plants and systems for commercial and industrial use.');

-- ============================================================================
-- MANUAL STEP (documented in SETUP.md): promote your first admin after
-- you've signed up once through the app:
--   update public.profiles set is_admin = true where id = '<your-user-uuid>';
-- ============================================================================
