# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # start dev server (Turbopack) at http://localhost:3000
npm run build   # production build; also runs the TypeScript check
npm run lint    # ESLint (flat config, eslint-config-next)
npm run start   # serve the production build
```

There is no test suite configured in this repo (no Jest/Vitest/Playwright in `package.json`). Do not assume one exists.

## Architecture

Single-page Next.js App Router app. Everything renders under `app/page.tsx`, which is a Client Component (`"use client"`) composing three presentational/interactive pieces from `components/`: `SummaryBar`, `CardForm`, `CardList`. `app/layout.tsx` stays a Server Component (fonts, `<html>/<body>`, metadata) and does no data work.

**Data model** (`lib/types.ts`): `Card` is the single source of truth; `CardInput = Omit<Card, "id">` is derived from it for the add/edit form, so adding a field to `Card` doesn't require a second manual definition.

**State/persistence** (`hooks/useCards.ts`): cards are held in a module-level singleton store (`cachedCards`, `listeners`), not component state, and exposed via `useSyncExternalStore`. This is deliberate, not incidental — it's what lets the server-rendered pass and the client's first hydration pass both render an empty snapshot (`getServerSnapshot`) while React swaps in the real `localStorage`-backed snapshot immediately after hydrating, with no `isLoaded` flag or loading flicker. `getServerSnapshot` must keep returning the *same* cached empty array reference (`EMPTY_CARDS`), not a new `[]` literal, or React logs an infinite-loop warning. All mutations (`addCard`/`updateCard`/`deleteCard`) go through the single `mutate()` helper, which updates the cache, persists via `lib/storage.ts` (`loadCards`/`saveCards`, both SSR-safe via `typeof window` guards), and notifies subscribers.

**Form reset pattern** (`components/CardForm.tsx` + `app/page.tsx`): switching between "add" and "edit `<card>`" does not use an effect to resync form state with the `editingCard` prop. Instead `app/page.tsx` renders `<CardForm key={editingCard?.id ?? "new"}>` — changing the `key` forces a full remount, and `CardForm` computes its initial state once via a lazy `useState(() => toFormState(editingCard))` initializer.

**Why not `useEffect` for the above two**: this repo's ESLint config (`eslint-config-next`'s `core-web-vitals`, which pulls in the React Compiler-era `eslint-plugin-react-hooks` v7) enables `react-hooks/set-state-in-effect` and `react-hooks/set-state-in-render` as hard errors. Calling `setState` synchronously inside a `useEffect` body — including the common "load from localStorage on mount" or "resync form when a prop changes" patterns — fails lint. Prefer `useSyncExternalStore` for external-store reads and the `key`-remount trick for prop-driven state resets over reaching for `useEffect` + `setState`.

**Path alias**: `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/lib/types`, `@/components/CardForm`.

**Styling**: Tailwind CSS v4, configured via `@import "tailwindcss"` in `app/globals.css` (no `tailwind.config.js` — v4 is CSS-first). Dark mode uses the `dark:` variant driven by `prefers-color-scheme`.

## Important

`AGENTS.md` (imported above) flags that this project pins **Next.js 16.2.10**, newer than most training data — check `node_modules/next/dist/docs/` before assuming an API or convention from an older Next.js version still applies.
