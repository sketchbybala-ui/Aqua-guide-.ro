import { formatINR } from "@/lib/format";

export function PriceTag({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  return (
    <span className={`font-semibold text-slate-900 ${className}`}>
      {formatINR(amount)}
    </span>
  );
}
