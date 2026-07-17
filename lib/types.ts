export type Condition = "Raw" | "PSA 10" | "PSA 9" | "BGS 9.5" | "Other";

export const CONDITIONS: Condition[] = [
  "Raw",
  "PSA 10",
  "PSA 9",
  "BGS 9.5",
  "Other",
];

export type Sport =
  | "Baseball"
  | "Basketball"
  | "Football"
  | "Hockey"
  | "Soccer"
  | "Other";

export const SPORTS: Sport[] = [
  "Baseball",
  "Basketball",
  "Football",
  "Hockey",
  "Soccer",
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
  // Insert/subset name distinct from the player, e.g. "Roundball Remnants".
  cardName?: string;
  // Denominator of a numbered card, e.g. 10 for a card numbered "/10".
  // Undefined/absent means the card isn't numbered.
  printRun?: number;
  sport?: Sport;
  // e.g. "Silver Prizm".
  parallel?: string;
  isRookie?: boolean;
  isAutograph?: boolean;
  isRelic?: boolean;
}

export type CardInput = Omit<Card, "id">;

export interface ValuationComp {
  title: string;
  price: number;
  currency: string;
  url: string;
  imageUrl?: string;
}

export interface Valuation {
  estimate: number;
  low: number;
  high: number;
  count: number;
  confidence: "high" | "low";
  samples: ValuationComp[];
}

export interface ValuationResult {
  exact: Valuation | null;
  similar: Valuation | null;
}
