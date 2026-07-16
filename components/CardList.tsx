import { formatCurrency } from "@/lib/format";
import type { Card } from "@/lib/types";

interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

export default function CardList({ cards, onEdit, onDelete }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="w-full rounded-lg border border-dashed border-black/15 p-8 text-center text-zinc-500 dark:border-white/20 dark:text-zinc-400">
        No cards yet. Add your first card above to get started.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 bg-zinc-50 text-zinc-500 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-400">
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 font-medium">Year</th>
            <th className="px-4 py-3 font-medium">Brand / Set</th>
            <th className="px-4 py-3 font-medium">Condition</th>
            <th className="px-4 py-3 font-medium">Cost</th>
            <th className="px-4 py-3 font-medium">Est. Value</th>
            <th className="px-4 py-3 font-medium">Gain / Loss</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => {
            const gainLoss = card.estimatedValue - card.cost;
            const isGain = gainLoss >= 0;

            return (
              <tr
                key={card.id}
                className="border-b border-black/5 last:border-b-0 dark:border-white/10"
              >
                <td className="px-4 py-3 text-black dark:text-zinc-50">
                  {card.playerName}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {card.year || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {card.brand || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {card.condition}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(card.cost)}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(card.estimatedValue)}
                </td>
                <td
                  className={`px-4 py-3 font-medium ${
                    isGain
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isGain ? "+" : ""}
                  {formatCurrency(gainLoss)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(card)}
                      className="text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(card)}
                      className="text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
