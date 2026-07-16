import type { SortDirection, SortField } from "@/lib/cardFilters";

interface CardControlsProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
  onReset: () => void;
  visibleCount: number;
  totalCount: number;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "default", label: "Default Order" },
  { value: "playerName", label: "Player Name" },
  { value: "year", label: "Year" },
  { value: "estimatedValue", label: "Value" },
  { value: "gain", label: "Gain" },
];

export default function CardControls({
  searchQuery,
  onSearchQueryChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  onReset,
  visibleCount,
  totalCount,
}: CardControlsProps) {
  const isDefaultSort = sortField === "default";

  return (
    <div className="w-full rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Search
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
            placeholder="Search by player, set, or card #…"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sort By
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value as SortField)}
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-black dark:border-white/20 dark:text-zinc-50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() =>
            onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
          }
          disabled={isDefaultSort}
          className="rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          Reset
        </button>
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Showing {visibleCount} of {totalCount} cards
      </p>
    </div>
  );
}
