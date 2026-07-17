"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import type { Card, CardInput } from "@/lib/types";

// A tiny external store, auth-aware:
//
// - Logged out: cards live purely in memory for the session (no network, no
//   persistence — they're gone on refresh).
// - Logged in: cards are loaded from and mutated through /api/cards, which is
//   backed by Supabase and scoped to the signed-in Auth0 user server-side.
//
// Using useSyncExternalStore (rather than loading into React state inside a
// useEffect) lets React handle the server/client hydration gap for us: the
// server (and the client's first hydration pass) render the empty
// getServerSnapshot(), and React automatically swaps in the real
// getSnapshot() right after hydrating — no manual "isLoaded" flag needed.
//
// The one effect this hook does have (below) only ever calls setState(), a
// plain module function that reassigns a module variable and notifies
// external-store listeners — it is not a React `useState` setter, so
// react-hooks/set-state-in-effect does not apply to it. Its actual data-set
// work for a login happens inside an async fetch().then() callback, which
// isn't "synchronous in the effect body" either.
type Status = "loading" | "ready" | "error";
interface StoreState {
  cards: Card[];
  status: Status;
}

// Stable reference — a fresh object on every call would make React think the
// store changed on every check, which logs "getServerSnapshot should be
// cached" and can loop.
const EMPTY_STATE: StoreState = { cards: [], status: "ready" };

let state: StoreState = EMPTY_STATE;
let currentUserId: string | null = null;
// Guards against a stale fetch() resolving after the user has since logged
// out or switched accounts.
let loadToken = 0;
const listeners = new Set<() => void>();

function getSnapshot(): StoreState {
  return state;
}

function getServerSnapshot(): StoreState {
  return EMPTY_STATE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Not a React state setter — a plain module-level notify.
function setState(next: StoreState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function syncAuthState(userId: string | null) {
  if (userId === currentUserId) return;
  currentUserId = userId;
  const token = ++loadToken;

  if (userId === null) {
    setState({ cards: [], status: "ready" });
    return;
  }

  setState({ cards: [], status: "loading" });
  fetch("/api/cards")
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<Card[]>;
    })
    .then((cards) => {
      if (token === loadToken) setState({ cards, status: "ready" });
    })
    .catch(() => {
      if (token === loadToken) setState({ cards: [], status: "error" });
    });
}

function addCardLocal(input: CardInput) {
  const card: Card = { ...input, id: crypto.randomUUID() };
  setState({ ...state, cards: [...state.cards, card] });
}

async function addCardRemote(input: CardInput) {
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    setState({ ...state, status: "error" });
    return;
  }
  const created: Card = await response.json();
  setState({ ...state, cards: [...state.cards, created], status: "ready" });
}

function updateCardLocal(id: string, input: CardInput) {
  setState({
    ...state,
    cards: state.cards.map((card) =>
      card.id === id ? { ...input, id } : card
    ),
  });
}

async function updateCardRemote(id: string, input: CardInput) {
  const response = await fetch(`/api/cards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    setState({ ...state, status: "error" });
    return;
  }
  const updated: Card = await response.json();
  setState({
    ...state,
    cards: state.cards.map((card) => (card.id === id ? updated : card)),
    status: "ready",
  });
}

function deleteCardLocal(id: string) {
  setState({ ...state, cards: state.cards.filter((card) => card.id !== id) });
}

async function deleteCardRemote(id: string) {
  const response = await fetch(`/api/cards/${id}`, { method: "DELETE" });
  if (!response.ok) {
    setState({ ...state, status: "error" });
    return;
  }
  setState({
    ...state,
    cards: state.cards.filter((card) => card.id !== id),
    status: "ready",
  });
}

export function useCards() {
  const { user, isLoading } = useUser();
  const userId = user?.sub ?? null;
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (isLoading) return;
    syncAuthState(userId);
  }, [userId, isLoading]);

  const addCard = useCallback((input: CardInput) => {
    if (currentUserId === null) {
      addCardLocal(input);
    } else {
      void addCardRemote(input);
    }
  }, []);

  const updateCard = useCallback((id: string, input: CardInput) => {
    if (currentUserId === null) {
      updateCardLocal(id, input);
    } else {
      void updateCardRemote(id, input);
    }
  }, []);

  const deleteCard = useCallback((id: string) => {
    if (currentUserId === null) {
      deleteCardLocal(id);
    } else {
      void deleteCardRemote(id);
    }
  }, []);

  const { totalValue, totalCost, gainLoss } = useMemo(() => {
    const totalValue = snapshot.cards.reduce(
      (sum, card) => sum + card.estimatedValue,
      0
    );
    const totalCost = snapshot.cards.reduce((sum, card) => sum + card.cost, 0);
    return { totalValue, totalCost, gainLoss: totalValue - totalCost };
  }, [snapshot.cards]);

  return {
    cards: snapshot.cards,
    status: snapshot.status,
    isAuthenticated: userId !== null,
    addCard,
    updateCard,
    deleteCard,
    totalValue,
    totalCost,
    gainLoss,
  };
}
