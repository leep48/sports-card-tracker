import { searchActiveListings } from "@/lib/ebay";
import { buildExactQuery, buildSimilarQuery, summarizeComps } from "@/lib/valuation";
import type { Card, ValuationResult } from "@/lib/types";

export async function POST(request: Request) {
  let card: Card;
  try {
    card = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!card.playerName) {
    return Response.json({ error: "playerName is required." }, { status: 400 });
  }

  try {
    const exactQuery = buildExactQuery(card);
    const similarQuery = buildSimilarQuery(card);

    const [exactComps, similarComps] = await Promise.all([
      exactQuery ? searchActiveListings(exactQuery) : Promise.resolve([]),
      similarQuery ? searchActiveListings(similarQuery) : Promise.resolve([]),
    ]);

    const targetYear = card.year ? Number(card.year) : undefined;

    const result: ValuationResult = {
      exact: summarizeComps(exactComps, {
        targetYear: Number.isFinite(targetYear) ? targetYear : undefined,
        confidence: "high",
      }),
      similar: similarQuery
        ? summarizeComps(similarComps, {
            targetYear: Number.isFinite(targetYear) ? targetYear : undefined,
            printRun: card.printRun,
            confidence: "low",
          })
        : null,
    };

    return Response.json(result);
  } catch (error) {
    console.error("Valuation lookup failed:", error);
    return Response.json(
      { error: "Valuation lookup failed. Please try again later." },
      { status: 502 }
    );
  }
}
