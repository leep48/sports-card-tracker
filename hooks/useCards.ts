"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { loadCards, saveCards } from "@/lib/storage";
import type { Card, CardInput } from "@/lib/types";

// A tiny external store backed by localStorage. Using useSyncExternalStore
// (rather than loading into state inside a useEffect) lets React handle the
// server/client hydration gap for us: the server (and the client's first
// hydration pass) render the empty getServerSnapshot(), and React
// automatically swaps in the real getSnapshot() right after hydrating —
// no manual "isLoaded" flag or effect-driven setState required.
let cachedCards: Card[] | null = null;
const listeners = new Set<() => void>();

// Must be a stable reference — a fresh [] on every call makes React think
// the store changed on every check, which logs "getServerSnapshot should
// be cached" and can loop.
const EMPTY_CARDS: Card[] = [];

function getSnapshot(): Card[] {
  if (cachedCards === null) {
    cachedCards = loadCards();
  }
  return cachedCards;
}

function getServerSnapshot(): Card[] {
  return EMPTY_CARDS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function mutate(updater: (prev: Card[]) => Card[]) {
  cachedCards = updater(cachedCards ?? loadCards());
  saveCards(cachedCards);
  listeners.forEach((listener) => listener());
}

export function useCards() {
  const cards = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addCard = useCallback((input: CardInput) => {
    const card: Card = { ...input, id: crypto.randomUUID() };
    mutate((prev) => [...prev, card]);
  }, []);

  const updateCard = useCallback((id: string, input: CardInput) => {
    mutate((prev) =>
      prev.map((card) => (card.id === id ? { ...input, id } : card))
    );
  }, []);

  const deleteCard = useCallback((id: string) => {
    mutate((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const { totalValue, totalCost, gainLoss } = useMemo(() => {
    const totalValue = cards.reduce((sum, card) => sum + card.estimatedValue, 0);
    const totalCost = cards.reduce((sum, card) => sum + card.cost, 0);
    return { totalValue, totalCost, gainLoss: totalValue - totalCost };
  }, [cards]);

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    totalValue,
    totalCost,
    gainLoss,
  };
}
