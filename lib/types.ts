export type Condition = "Raw" | "PSA 10" | "PSA 9" | "BGS 9.5" | "Other";

export const CONDITIONS: Condition[] = [
  "Raw",
  "PSA 10",
  "PSA 9",
  "BGS 9.5",
  "Other",
];

export interface Card {
  id: string;
  playerName: string;
  year: string;
  brand: string;
  cardNumber: string;
  condition: Condition;
  cost: number;
  estimatedValue: number;
}

export type CardInput = Omit<Card, "id">;
