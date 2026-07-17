import "server-only";
import type { ValuationComp } from "./types";

const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

// Module-level singleton cache for the OAuth token, mirroring the
// cachedCards pattern in hooks/useCards.ts — avoids re-authenticating on
// every request within the token's lifetime.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing EBAY_CLIENT_ID / EBAY_CLIENT_SECRET environment variables."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
  });

  if (!response.ok) {
    throw new Error(`eBay OAuth token request failed: ${response.status}`);
  }

  const data = await response.json();
  const expiresInMs = (data.expires_in ?? 0) * 1000;

  cachedToken = {
    value: data.access_token,
    // Refresh a little early to avoid edge-of-expiry failures.
    expiresAt: Date.now() + expiresInMs - 60_000,
  };

  return cachedToken.value;
}

export interface EbaySearchOptions {
  limit?: number;
}

// Searches active eBay listings via the Browse API. Note: this returns
// current asking prices, not completed/sold prices — the Marketplace
// Insights API (true sold data) is restricted and unavailable to
// independent developers as of this writing.
export async function searchActiveListings(
  query: string,
  { limit = 50 }: EbaySearchOptions = {}
): Promise<ValuationComp[]> {
  const token = await getAccessToken();

  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("category_ids", "212"); // Sports Trading Cards

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!response.ok) {
    throw new Error(`eBay Browse search failed: ${response.status}`);
  }

  const data = await response.json();
  const itemSummaries: unknown[] = data.itemSummaries ?? [];

  return itemSummaries
    .map((item): ValuationComp | null => {
      const summary = item as Record<string, unknown>;
      const price = summary.price as { value?: string; currency?: string } | undefined;
      const value = price?.value ? Number(price.value) : NaN;
      if (Number.isNaN(value)) return null;

      const image = summary.image as { imageUrl?: string } | undefined;

      return {
        title: String(summary.title ?? ""),
        price: value,
        currency: price?.currency ?? "USD",
        url: String(summary.itemWebUrl ?? ""),
        imageUrl: image?.imageUrl,
      };
    })
    .filter((comp): comp is ValuationComp => comp !== null);
}
