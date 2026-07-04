"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

const GUEST_CART_KEY = "aqua-guide-guest-cart";

export type CartLine = {
  product: Pick<Product, "id" | "slug" | "name" | "price" | "image_url">;
  quantity: number;
};

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  addItem: (product: CartLine["product"], quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readGuestCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartLine[]) {
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadCartForUser = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("cart_items")
        .select("quantity, products(id, slug, name, price, image_url)")
        .eq("user_id", userId);

      const rows = (data ?? []) as unknown as {
        quantity: number;
        products: CartLine["product"];
      }[];

      setItems(
        rows
          .filter((row) => row.products)
          .map((row) => ({ product: row.products, quantity: row.quantity }))
      );
    },
    [supabase]
  );

  // On first load: merge any guest cart into the DB cart if the user is
  // already logged in, otherwise fall back to the guest (localStorage) cart.
  useEffect(() => {
    let active = true;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (user) {
        const guestItems = readGuestCart();
        if (guestItems.length > 0) {
          await Promise.all(
            guestItems.map((line) =>
              supabase.from("cart_items").upsert(
                {
                  user_id: user.id,
                  product_id: line.product.id,
                  quantity: line.quantity,
                },
                { onConflict: "user_id,product_id", ignoreDuplicates: false }
              )
            )
          );
          window.localStorage.removeItem(GUEST_CART_KEY);
        }
        await loadCartForUser(user.id);
      } else {
        setItems(readGuestCart());
      }

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [supabase, loadCartForUser]);

  const addItem: CartContextValue["addItem"] = useCallback(
    async (product, quantity = 1) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const existing = items.find((i) => i.product.id === product.id);
        const nextQuantity = (existing?.quantity ?? 0) + quantity;
        await supabase.from("cart_items").upsert(
          { user_id: user.id, product_id: product.id, quantity: nextQuantity },
          { onConflict: "user_id,product_id" }
        );
        await loadCartForUser(user.id);
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          const next = existing
            ? prev.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [...prev, { product, quantity }];
          writeGuestCart(next);
          return next;
        });
      }
    },
    [items, supabase, loadCartForUser]
  );

  const updateQuantity: CartContextValue["updateQuantity"] = useCallback(
    async (productId, quantity) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (quantity <= 0) {
          await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);
        } else {
          await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("user_id", user.id)
            .eq("product_id", productId);
        }
        await loadCartForUser(user.id);
      } else {
        setItems((prev) => {
          const next =
            quantity <= 0
              ? prev.filter((i) => i.product.id !== productId)
              : prev.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i
                );
          writeGuestCart(next);
          return next;
        });
      }
    },
    [supabase, loadCartForUser]
  );

  const removeItem = useCallback(
    (productId: string) => updateQuantity(productId, 0),
    [updateQuantity]
  );

  const clearCart = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      window.localStorage.removeItem(GUEST_CART_KEY);
    }
    setItems([]);
  }, [supabase]);

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
