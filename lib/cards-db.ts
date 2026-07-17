import "server-only";
import { getSupabaseAdmin } from "./supabase";
import type { Card, CardInput } from "./types";

const TABLE = "cards";
const COLUMNS =
  "id, player_name, year, brand, card_number, condition, cost, estimated_value, " +
  "card_name, print_run, sport, parallel, is_rookie, is_autograph, is_relic";

interface CardRow {
  id: string;
  player_name: string;
  year: string;
  brand: string;
  card_number: string;
  condition: Card["condition"];
  cost: number | string;
  estimated_value: number | string;
  card_name: string | null;
  print_run: number | null;
  sport: Card["sport"] | null;
  parallel: string | null;
  is_rookie: boolean;
  is_autograph: boolean;
  is_relic: boolean;
}

function toCard(row: CardRow): Card {
  return {
    id: row.id,
    playerName: row.player_name,
    year: row.year,
    brand: row.brand,
    cardNumber: row.card_number,
    condition: row.condition,
    // Postgres numeric columns can come back as strings over PostgREST —
    // coerce defensively so the Card type's `number` contract always holds.
    cost: Number(row.cost),
    estimatedValue: Number(row.estimated_value),
    cardName: row.card_name ?? undefined,
    printRun: row.print_run ?? undefined,
    sport: row.sport ?? undefined,
    parallel: row.parallel ?? undefined,
    isRookie: row.is_rookie,
    isAutograph: row.is_autograph,
    isRelic: row.is_relic,
  };
}

function toRow(userId: string, input: CardInput) {
  return {
    user_id: userId,
    player_name: input.playerName,
    year: input.year,
    brand: input.brand,
    card_number: input.cardNumber,
    condition: input.condition,
    cost: input.cost,
    estimated_value: input.estimatedValue,
    card_name: input.cardName ?? null,
    print_run: input.printRun ?? null,
    sport: input.sport ?? null,
    parallel: input.parallel ?? null,
    is_rookie: input.isRookie ?? false,
    is_autograph: input.isAutograph ?? false,
    is_relic: input.isRelic ?? false,
  };
}

export async function listCards(userId: string): Promise<Card[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to list cards: ${error.message}`);
  return (data as unknown as CardRow[]).map(toCard);
}

export async function insertCard(
  userId: string,
  input: CardInput
): Promise<Card> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(userId, input))
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Failed to create card: ${error.message}`);
  return toCard(data as unknown as CardRow);
}

export async function updateCard(
  userId: string,
  id: string,
  input: CardInput
): Promise<Card | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...toRow(userId, input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`Failed to update card: ${error.message}`);
  return data ? toCard(data as unknown as CardRow) : null;
}

export async function deleteCard(
  userId: string,
  id: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) throw new Error(`Failed to delete card: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
