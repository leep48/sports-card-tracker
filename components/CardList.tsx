"use client";

import { Fragment, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Card, ValuationResult } from "@/lib/types";

interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  onUseValue: (card: Card, value: number) => void;
}

type ValuationState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: ValuationResult };

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-black/10 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-400">
      {children}
    </span>
  );
}

function ValuationCard({
  title,
  description,
  valuation,
  onUseValue,
}: {
  title: string;
  description: string;
  valuation: ValuationResult["exact"];
  onUseValue: () => void;
}) {
  if (!valuation) {
    return (
      <div className="rounded border border-black/10 p-3 text-sm text-zinc-500 dark:border-white/15 dark:text-zinc-400">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
        <p className="mt-1">Not enough matching listings found.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-black/10 p-3 text-sm dark:border-white/15">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
        {valuation.confidence === "low" && <Badge>Low confidence</Badge>}
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      <p className="mt-2 text-lg font-semibold text-black dark:text-zinc-50">
        {formatCurrency(valuation.estimate)}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Range {formatCurrency(valuation.low)}–{formatCurrency(valuation.high)} ·{" "}
        {valuation.count} listing{valuation.count === 1 ? "" : "s"}
      </p>
      <button
        type="button"
        onClick={onUseValue}
        className="mt-2 rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Use this value
      </button>
      {valuation.samples.length > 0 && (
        <ul className="mt-2 space-y-1">
          {valuation.samples.slice(0, 3).map((sample) => (
            <li key={sample.url} className="truncate text-xs">
              <a
                href={sample.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
              >
                {formatCurrency(sample.price)} — {sample.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CardList({ cards, onEdit, onDelete, onUseValue }: CardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [valuations, setValuations] = useState<Record<string, ValuationState>>({});

  async function handleGetValue(card: Card) {
    setExpandedId((current) => (current === card.id ? null : card.id));
    if (valuations[card.id]?.status === "done") return;

    setValuations((prev) => ({ ...prev, [card.id]: { status: "loading" } }));

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const result: ValuationResult = await response.json();
      setValuations((prev) => ({ ...prev, [card.id]: { status: "done", result } }));
    } catch {
      setValuations((prev) => ({
        ...prev,
        [card.id]: { status: "error", message: "Couldn't fetch a value right now." },
      }));
    }
  }

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
            <th className="px-4 py-3 font-medium">Card #</th>
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
            const valuationState = valuations[card.id];
            const isExpanded = expandedId === card.id;

            return (
              <Fragment key={card.id}>
                <tr className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                  <td className="px-4 py-3 text-black dark:text-zinc-50">
                    {card.playerName}
                    {(card.cardName || card.parallel || card.printRun || card.isRookie || card.isAutograph || card.isRelic) && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {card.cardName && <Badge>{card.cardName}</Badge>}
                        {card.parallel && <Badge>{card.parallel}</Badge>}
                        {card.printRun && <Badge>/{card.printRun}</Badge>}
                        {card.isRookie && <Badge>RC</Badge>}
                        {card.isAutograph && <Badge>Auto</Badge>}
                        {card.isRelic && <Badge>Relic</Badge>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {card.year || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {card.brand || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {card.cardNumber || "—"}
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
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleGetValue(card)}
                        className="text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
                      >
                        {isExpanded ? "Hide Value" : "Get Value"}
                      </button>
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
                {isExpanded && (
                  <tr className="border-b border-black/5 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900/50">
                    <td colSpan={9} className="px-4 py-4">
                      {valuationState?.status === "loading" && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Looking up eBay listings…
                        </p>
                      )}
                      {valuationState?.status === "error" && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {valuationState.message}
                        </p>
                      )}
                      {valuationState?.status === "done" && (
                        <>
                          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                            Estimates are based on active eBay listings (asking
                            prices), not confirmed sales.
                          </p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ValuationCard
                              title="This card"
                              description="Based on active listings matching this exact card."
                              valuation={valuationState.result.exact}
                              onUseValue={() =>
                                valuationState.result.exact &&
                                onUseValue(card, valuationState.result.exact.estimate)
                              }
                            />
                            <ValuationCard
                              title="Similar (same scarcity)"
                              description={
                                card.printRun
                                  ? `Based on other ${card.playerName} /${card.printRun} cards near ${card.year || "this year"}.`
                                  : "Set a print run (e.g. /50) to see a same-scarcity comparison."
                              }
                              valuation={valuationState.result.similar}
                              onUseValue={() =>
                                valuationState.result.similar &&
                                onUseValue(card, valuationState.result.similar.estimate)
                              }
                            />
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
