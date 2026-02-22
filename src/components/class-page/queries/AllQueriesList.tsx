"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QueryView } from "./QueryView";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";
import {
  Loader2,
  MessageSquarePlus,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuerySearch } from "@/hooks/useQuerySearch";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export type QueryWithRelations =
  Database["public"]["Tables"]["queries"]["Row"] & {
    student: Database["public"]["Tables"]["users"]["Row"] | null;
    attachments: Database["public"]["Tables"]["attachments"]["Row"][];
    answers: Answer[];
    query_tags: QueryTag[];
  };

export function AllQueriesList({
  role,
  classId,
}: {
  role: "student" | "teacher" | "ta";
  classId: string;
}) {
  const [queries, setQueries] = useState<QueryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "answered">(
    "all",
  );
  const queryIdsRef = useRef<Set<string>>(new Set());

  const {
    searchTerm,
    setSearchTerm,
    activeTagIds,
    toggleTagFilter,
    clearSearch,
    allTags,
    filteredQueries: searchFiltered,
    hasActiveSearch,
  } = useQuerySearch(queries);

  // Apply status filter on top of search results (only active for teacher/ta)
  const filteredQueries = searchFiltered.filter((q) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "open") return !q.answered_at;
    if (statusFilter === "answered") return !!q.answered_at;
    return true;
  });

  const fetchQueries = useCallback(async () => {
    if (!classId) return;
    try {
      const { data, error } = await supabase
        .from("queries")
        .select(
          `
          *,
          student:users!student_id(*),
          attachments(*),
          answers(
            *,
            author:users!author_id(*),
            attachments(*)
          ),
          query_tags(
            tag_id,
            tags(*)
          )
        `,
        )
        .eq("class_id", classId)
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "answers", ascending: true });

      if (error) throw error;

      if (data) {
        setQueries(data as QueryWithRelations[]);
        queryIdsRef.current = new Set(data.map((q) => q.id));
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
      toast.error("Failed to load queries");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    fetchQueries();

    const channel = supabase
      .channel(`queries-changes-${classId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queries",
          filter: `class_id=eq.${classId}`,
        },
        () => fetchQueries(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "answers" },
        (payload) => {
          const newRecord = payload.new as { query_id?: string };
          const oldRecord = payload.old as { query_id?: string };
          const queryId = newRecord?.query_id || oldRecord?.query_id;
          if (queryId && queryIdsRef.current.has(queryId)) fetchQueries();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, fetchQueries]);

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
        <div className="bg-muted p-4 rounded-full mb-3">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No queries yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
          Be the first to ask a question in this class!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Search bar + optional status filter ── */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        allTags={allTags}
        activeTagIds={activeTagIds}
        onToggleTag={toggleTagFilter}
        onClear={clearSearch}
        hasActiveSearch={hasActiveSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* ── Results ── */}
      {filteredQueries.length === 0 ? (
        <EmptySearch onClear={clearSearch} />
      ) : (
        filteredQueries.map((query) => (
          <QueryView
            classId={classId}
            role={role}
            key={query.id}
            query={query}
            onAnswered={fetchQueries}
          />
        ))
      )}
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

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
}: SearchBarProps) {
  return (
    <div className="space-y-2.5">
      {/* ── Search input row (+ inline status toggle for teacher/ta) ── */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, description or tag…"
            className={cn(
              "w-full pl-9 pr-9 py-2 rounded-lg text-sm",
              "bg-background border border-border/60",
              "placeholder:text-muted-foreground/50 text-foreground",
              "focus:outline-none focus:ring-2 focus:bg-muted/50 focus:ring-muted/40 focus:border-muted/80",
              "transition-all duration-150",
            )}
          />
          {hasActiveSearch && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-px bg-muted/40 border border-border/60 rounded-lg p-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mx-1.5 shrink-0" />
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
      </div>

      {/* Tag chips */}
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

function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
      <div className="bg-muted p-4 rounded-full mb-3">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No matching queries
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
        Try different keywords or remove a tag filter.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-medium text-ring hover:underline"
      >
        Clear search
      </button>
    </div>
  );
}
