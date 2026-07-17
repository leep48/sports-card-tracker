"use client";

import { useMemo, useState } from "react";
import SummaryBar from "@/components/SummaryBar";
import CardForm from "@/components/CardForm";
import CardControls from "@/components/CardControls";
import CardList from "@/components/CardList";
import { useCards } from "@/hooks/useCards";
import { filterAndSortCards, type SortDirection, type SortField } from "@/lib/cardFilters";
import type { Card, CardInput } from "@/lib/types";

export default function Home() {
  const {
    cards,
    addCard,
    updateCard,
    deleteCard,
    totalValue,
    totalCost,
    gainLoss,
  } = useCards();

  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("default");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const visibleCards = useMemo(
    () => filterAndSortCards(cards, { searchQuery, sortField, sortDirection }),
    [cards, searchQuery, sortField, sortDirection]
  );

  function handleReset() {
    setSearchQuery("");
    setSortField("default");
    setSortDirection("asc");
  }

  function handleSubmit(input: CardInput) {
    if (editingCard) {
      updateCard(editingCard.id, input);
      setEditingCard(null);
    } else {
      addCard(input);
    }
  }

  function handleEdit(card: Card) {
    setEditingCard(card);
  }

  function handleCancelEdit() {
    setEditingCard(null);
  }

  function handleDelete(card: Card) {
    const confirmed = window.confirm(
      `Delete ${card.playerName || "this card"}? This cannot be undone.`
    );
    if (!confirmed) return;

    deleteCard(card.id);
    if (editingCard?.id === card.id) {
      setEditingCard(null);
    }
  }

  function handleUseValue(card: Card, value: number) {
    const input: CardInput = {
      playerName: card.playerName,
      year: card.year,
      brand: card.brand,
      cardNumber: card.cardNumber,
      condition: card.condition,
      cost: card.cost,
      estimatedValue: value,
      cardName: card.cardName,
      printRun: card.printRun,
      sport: card.sport,
      parallel: card.parallel,
      isRookie: card.isRookie,
      isAutograph: card.isAutograph,
      isRelic: card.isRelic,
    };
    updateCard(card.id, input);
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12 sm:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Sports Card Tracker
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Track your collection&apos;s cost, value, and gain or loss.
          </p>
        </div>

        <SummaryBar
          totalValue={totalValue}
          totalCost={totalCost}
          gainLoss={gainLoss}
        />

        <CardForm
          key={editingCard?.id ?? "new"}
          editingCard={editingCard}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
        />

        <CardControls
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          onReset={handleReset}
          visibleCount={visibleCards.length}
          totalCount={cards.length}
        />

        <CardList
          cards={visibleCards}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUseValue={handleUseValue}
        />
      </main>
    </div>
  );
}
