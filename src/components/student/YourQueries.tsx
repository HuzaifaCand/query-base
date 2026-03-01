"use client";

import { useEffect, useState, useRef } from "react";
import { QueryCard } from "../class-page/queries/QueryCard";
import { QueryDetailPanel } from "../class-page/queries/QueryDetailPanel";
import { SearchBar } from "../class-page/queries/SearchBar";
import { Loader2, MessageSquarePlus, Search } from "lucide-react";
import { useQuerySearch } from "@/hooks/useQuerySearch";
import { useQueryDeepLink } from "@/hooks/useQueryDeepLink";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useYourQueries } from "@/hooks/queries/useYourQueries";
import { useInvalidateQueries } from "@/hooks/queries/useInvalidateQueries";

export function YourQueries({ classId }: { classId: string }) {
  const userId = useCurrentUser();

  // ── TanStack Query (replaces useState + fetchQueries + useEffect channel) ──
  const { data: queries = [], isLoading: loading } = useYourQueries(
    classId,
    userId,
  );
  const invalidate = useInvalidateQueries();

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "answered">(
    "all",
  );
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const {
    selectedQueryId: deepLinkId,
    openQuery,
    closeQuery,
  } = useQueryDeepLink();

  // Once queries load, honour any deep-link ID that arrived in the URL.
  const pendingDeepLinkRef = useRef<string | null>(deepLinkId);

  const {
    searchTerm,
    setSearchTerm,
    activeTagIds,
    toggleTagFilter,
    clearSearch,
    allTags,
    filteredQueries: searchFiltered,
    hasActiveSearch,
    featuredOnly,
    toggleFeatured,
  } = useQuerySearch(queries);

  // Apply status filter on top of search results
  const filteredQueries = searchFiltered.filter((q) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "open") return !q.answered_at;
    if (statusFilter === "answered") return !!q.answered_at;
    return true;
  });

  // Prefer URL-driven deep-link ID; fall back to locally-set ID.
  const activeId = deepLinkId ?? selectedQueryId;
  const selectedQuery = queries.find((q) => q.id === activeId) ?? null;

  // Auto-open deep-linked query once the list has loaded.
  useEffect(() => {
    if (!loading && pendingDeepLinkRef.current && queries.length > 0) {
      const id = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      if (queries.some((q) => q.id === id)) {
        setSelectedQueryId(id);
      }
    }
  }, [loading, queries]);

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Search bar + status filter (via SearchBar) ── */}
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
        featuredOnly={featuredOnly}
        onToggleFeatured={toggleFeatured}
      />

      {/* ── Results ── */}
      {filteredQueries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
          <div className="bg-muted p-4 rounded-full mb-3">
            {hasActiveSearch ? (
              <Search className="h-7 w-7 text-muted-foreground" />
            ) : (
              <MessageSquarePlus className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {hasActiveSearch ? "No matching queries" : "No queries found"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
            {hasActiveSearch
              ? "Try different keywords or remove a tag filter."
              : statusFilter === "all"
                ? "You haven't asked any questions yet."
                : `You have no ${statusFilter} queries.`}
          </p>
          {hasActiveSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-xs font-medium text-ring hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        filteredQueries.map((query) => (
          <QueryCard
            key={query.id}
            query={query}
            userId={userId}
            onClick={() => {
              setSelectedQueryId(query.id);
              openQuery(query.id);
            }}
          />
        ))
      )}

      {/* ── Detail slide-over panel ── */}
      <QueryDetailPanel
        query={selectedQuery}
        classId={classId}
        role="student"
        onClose={() => {
          setSelectedQueryId(null);
          closeQuery();
        }}
        onAnswered={invalidate}
      />
    </div>
  );
}
