import Link from "next/link";
import { formatINR } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";

export function CartSummary({
  subtotal,
  onNavigate,
}: {
  subtotal: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Subtotal</span>
        <span className="text-base font-semibold text-slate-900">
          {formatINR(subtotal)}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        Shipping and taxes calculated at checkout.
      </p>
      <LinkButton href="/checkout" className="w-full" onClick={onNavigate}>
        Proceed to Checkout
      </LinkButton>
      <Link
        href="/cart"
        onClick={onNavigate}
        className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        View Cart
      </Link>
    </div>
  );
}
