"use client";

import { cn } from "@/lib/utils";
import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";

type StatusFilter = "all" | "open" | "answered";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  allTags: { id: string; name: string }[];
  activeTagIds: string[];
  onToggleTag: (id: string) => void;
  onClear: () => void;
  hasActiveSearch: boolean;
  statusFilter: StatusFilter;
  onStatusChange: (f: StatusFilter) => void;
  // Featured filter
  featuredOnly: boolean;
  onToggleFeatured: () => void;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  allTags,
  activeTagIds,
  onToggleTag,
  onClear,
  hasActiveSearch,
  statusFilter,
  onStatusChange,
  featuredOnly,
  onToggleFeatured,
}: SearchBarProps) {
  return (
    <div className="space-y-2.5">
      {/* ── Row 1: Search input (full width) ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, description or tag…"
          className={cn(
            "w-full pl-9 pr-9 py-2.5 rounded-xl text-sm",
            "bg-background border border-border/60",
            "placeholder:text-muted-foreground/50 text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-muted/40 focus:border-muted/80 focus:bg-muted/20",
            "transition-all duration-150",
          )}
        />
        {hasActiveSearch && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Row 2: Status filter + Featured toggle ── */}
      <div className="flex items-center gap-2 justify-between flex-wrap">
        {/* Status segment control */}
        <div className="flex items-center gap-px bg-muted/40 border border-border/60 rounded-lg p-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mx-1 shrink-0" />
          {(["all", "open", "answered"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onStatusChange(f)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all duration-150",
                statusFilter === f
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Featured toggle — amber-tinted pill, visually distinct */}
        <button
          type="button"
          onClick={onToggleFeatured}
          aria-pressed={featuredOnly}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 shrink-0 group",
            featuredOnly
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/70 dark:border-amber-700/50 shadow-sm"
              : "bg-muted/40 text-muted-foreground border-border/60 hover:border-amber-300/60 hover:text-amber-600 dark:hover:text-amber-400",
          )}
        >
          <Sparkles
            className={cn(
              "w-3 h-3 transition-colors group-hover:text-amber-500 dark:group-hover:text-amber-400",
              featuredOnly
                ? "text-amber-500 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          />
          Featured
        </button>
      </div>

      {/* ── Row 3: Tag chips ── */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const isActive = activeTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.id)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-ring text-white border-ring shadow-sm"
                    : "bg-transparent text-muted-foreground border-border/60 hover:border-ring/50 hover:text-foreground",
                )}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
