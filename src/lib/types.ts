// Hand-written types mirroring supabase/schema.sql. Once you have a live
// Supabase project you can optionally replace these with generated types via
// `npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts`
// — see SETUP.md.

export type OrderStatus =
  | "created"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "online" | "cod";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  total_amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_refund_id: string | null;
  refunded_at: string | null;
  refund_requested_at: string | null;
  coupon_code: string | null;
  discount_amount: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  created_at: string;
}

// Convenience shape used across product listing/detail components.
export interface ProductWithCategory extends Product {
  category: Pick<Category, "slug" | "name">;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface RatingSummary {
  avg_rating: number;
  review_count: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses_per_user: number;
}
