import type { Card, Valuation, ValuationComp } from "./types";

const MIN_COMPS_FOR_ESTIMATE = 3;
const YEAR_PROXIMITY = 2; // years on either side counted as "close"

// Builds the eBay Browse search keywords for the *exact* card: every
// identifying detail we have, so results should be this specific card.
export function buildExactQuery(card: Card): string {
  const parts = [
    card.year,
    card.brand,
    card.parallel,
    card.cardName,
    card.playerName,
    card.cardNumber && `#${card.cardNumber}`,
    card.printRun && `/${card.printRun}`,
    card.isRookie && "RC",
    card.isAutograph && "auto",
    card.isRelic && "relic",
  ];

  return parts.filter(Boolean).join(" ");
}

// Builds the "similar" search: same player, same scarcity (print run), but
// deliberately drops the set/insert name and card number so cards from
// *different* products at the same scarcity tier are found too. Year is not
// included as a hard keyword (eBay's `q` param has no numeric range
// support) — comps are filtered by year proximity afterwards instead.
export function buildSimilarQuery(card: Card): string | null {
  if (!card.printRun) return null;

  const parts = [
    card.playerName,
    card.sport,
    `/${card.printRun}`,
    card.isRookie && "RC",
    card.isAutograph && "auto",
    card.isRelic && "relic",
  ];

  return parts.filter(Boolean).join(" ");
}

function extractYear(title: string): number | null {
  const match = title.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function extractPrintRun(title: string): number | null {
  // Matches "/50", "#/50", "/ 50" style serial notations.
  const match = title.match(/#?\/\s*(\d+)\b/);
  return match ? Number(match[1]) : null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Summarizes a set of active-listing comps into a single valuation. When
// targetYear/printRun are given, comps are first filtered to those that
// plausibly match (title mentions a close year / the same print run) before
// the estimate is computed — this is what makes the "similar" mode
// trustworthy despite the query itself being broad.
export function summarizeComps(
  comps: ValuationComp[],
  options: {
    targetYear?: number;
    printRun?: number;
    confidence: "high" | "low";
  }
): Valuation | null {
  let filtered = comps;

  if (options.targetYear) {
    filtered = filtered.filter((comp) => {
      const year = extractYear(comp.title);
      return year === null || Math.abs(year - options.targetYear!) <= YEAR_PROXIMITY;
    });
  }

  if (options.printRun) {
    filtered = filtered.filter((comp) => {
      const printRun = extractPrintRun(comp.title);
      return printRun === null || printRun === options.printRun;
    });
  }

  if (filtered.length < MIN_COMPS_FOR_ESTIMATE) return null;

  const prices = filtered.map((comp) => comp.price);
  const estimate = median(prices);

  return {
    estimate,
    low: Math.min(...prices),
    high: Math.max(...prices),
    count: filtered.length,
    confidence: options.confidence,
    samples: filtered.slice(0, 5),
  };
}
