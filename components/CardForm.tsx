"use client";

import { useState } from "react";
import { CONDITIONS, type Card, type CardInput, type Condition } from "@/lib/types";

interface CardFormProps {
  editingCard: Card | null;
  onSubmit: (input: CardInput) => void;
  onCancel: () => void;
}

const emptyFormState = {
  playerName: "",
  year: "",
  brand: "",
  condition: CONDITIONS[0],
  cost: "",
  estimatedValue: "",
};

function toFormState(editingCard: Card | null) {
  if (!editingCard) return emptyFormState;

  return {
    playerName: editingCard.playerName,
    year: editingCard.year,
    brand: editingCard.brand,
    condition: editingCard.condition,
    cost: String(editingCard.cost),
    estimatedValue: String(editingCard.estimatedValue),
  };
}

// The parent renders this with a `key` derived from editingCard's id (see
// app/page.tsx), so switching between "add" and "edit <card>" fully remounts
// the form instead of needing an effect to resync state with the prop.
export default function CardForm({
  editingCard,
  onSubmit,
  onCancel,
}: CardFormProps) {
  const [formState, setFormState] = useState(() => toFormState(editingCard));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const playerName = formState.playerName.trim();
    if (!playerName) {
      setError("Player name is required.");
      return;
    }

    const cost = Number(formState.cost);
    const estimatedValue = Number(formState.estimatedValue);

    if (formState.cost !== "" && (Number.isNaN(cost) || cost < 0)) {
      setError("Cost must be a non-negative number.");
      return;
    }

    if (
      formState.estimatedValue !== "" &&
      (Number.isNaN(estimatedValue) || estimatedValue < 0)
    ) {
      setError("Estimated value must be a non-negative number.");
      return;
    }

    setError(null);
    onSubmit({
      playerName,
      year: formState.year.trim(),
      brand: formState.brand.trim(),
      condition: formState.condition as Condition,
      cost: formState.cost === "" ? 0 : cost,
      estimatedValue: formState.estimatedValue === "" ? 0 : estimatedValue,
    });

    if (!editingCard) {
      setFormState(emptyFormState);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
        {editingCard ? "Edit Card" : "Add Card"}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Player Name
          <input
            type="text"
            value={formState.playerName}
            onChange={(e) =>
              setFormState((s) => ({ ...s, playerName: e.target.value }))
            }
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
            placeholder="e.g. Mike Trout"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Year
          <input
            type="text"
            value={formState.year}
            onChange={(e) =>
              setFormState((s) => ({ ...s, year: e.target.value }))
            }
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
            placeholder="e.g. 2011"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Brand / Set
          <input
            type="text"
            value={formState.brand}
            onChange={(e) =>
              setFormState((s) => ({ ...s, brand: e.target.value }))
            }
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
            placeholder="e.g. Topps Update"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Condition
          <select
            value={formState.condition}
            onChange={(e) =>
              setFormState((s) => ({
                ...s,
                condition: e.target.value as Condition,
              }))
            }
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
          >
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Cost ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={formState.cost}
            onChange={(e) =>
              setFormState((s) => ({ ...s, cost: e.target.value }))
            }
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Estimated Value ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={formState.estimatedValue}
            onChange={(e) =>
              setFormState((s) => ({ ...s, estimatedValue: e.target.value }))
            }
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
            placeholder="0.00"
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          {editingCard ? "Save Changes" : "Add Card"}
        </button>

        {editingCard && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
