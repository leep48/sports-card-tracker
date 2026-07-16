import { formatCurrency } from "@/lib/format";

interface SummaryBarProps {
  totalValue: number;
  totalCost: number;
  gainLoss: number;
}

export default function SummaryBar({
  totalValue,
  totalCost,
  gainLoss,
}: SummaryBarProps) {
  const isGain = gainLoss >= 0;

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Total Estimated Value
        </p>
        <p className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
          {formatCurrency(totalValue)}
        </p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Cost</p>
        <p className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
          {formatCurrency(totalCost)}
        </p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gain / Loss</p>
        <p
          className={`mt-1 text-2xl font-semibold ${
            isGain
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isGain ? "+" : ""}
          {formatCurrency(gainLoss)}
        </p>
      </div>
    </div>
  );
}
