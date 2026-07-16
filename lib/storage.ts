import type { Card } from "./types";

const STORAGE_KEY = "sports-card-tracker:cards";

export function loadCards(): Card[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function saveCards(cards: Card[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Storage may be unavailable (e.g. private browsing quota exceeded).
    // Fail silently — the in-memory state still works for this session.
  }
}
