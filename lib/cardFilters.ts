import type { Card } from "@/lib/types";

export type SortField =
  | "default"
  | "playerName"
  | "year"
  | "estimatedValue"
  | "gain";
export type SortDirection = "asc" | "desc";

function matchesSearch(card: Card, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return (
    card.playerName.toLowerCase().includes(q) ||
    card.brand.toLowerCase().includes(q) ||
    (card.cardNumber ?? "").toLowerCase().includes(q)
  );
}

function compareCards(a: Card, b: Card, field: SortField): number {
  switch (field) {
    case "playerName":
      return a.playerName.localeCompare(b.playerName);
    case "year":
      return Number(a.year) - Number(b.year);
    case "estimatedValue":
      return a.estimatedValue - b.estimatedValue;
    case "gain":
      return a.estimatedValue - a.cost - (b.estimatedValue - b.cost);
    default:
      return 0;
  }
}

export function filterAndSortCards(
  cards: Card[],
  {
    searchQuery,
    sortField,
    sortDirection,
  }: {
    searchQuery: string;
    sortField: SortField;
    sortDirection: SortDirection;
  }
): Card[] {
  const filtered = cards.filter((card) => matchesSearch(card, searchQuery));
  if (sortField === "default") return filtered;

  const sorted = [...filtered].sort((a, b) => compareCards(a, b, sortField));
  return sortDirection === "asc" ? sorted : sorted.reverse();
}
