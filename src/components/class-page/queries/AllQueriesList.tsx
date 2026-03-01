"use client";

import { useEffect, useState, useRef } from "react";
import { QueryCard } from "./QueryCard";
import { QueryDetailPanel } from "./QueryDetailPanel";
import { Database } from "@/lib/databasetypes";
import { Loader2, MessageSquarePlus, Search } from "lucide-react";
import { useQuerySearch } from "@/hooks/useQuerySearch";
import { useQueryDeepLink } from "@/hooks/useQueryDeepLink";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAllQueries } from "@/hooks/queries/useAllQueries";
import { useInvalidateQueries } from "@/hooks/queries/useInvalidateQueries";

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
  const userId = useCurrentUser();

  // ── TanStack Query (replaces useState + fetchQueries + useEffect channel) ──
  const { data: queries = [], isLoading: loading } = useAllQueries(classId);
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

  // Find the full query object for the detail panel.
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

  const router = useRouter();

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
          No queries in this class yet
        </h3>
        {role === "student" && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              Be the first to ask a question in this class!
            </p>
            <button
              type="button"
              onClick={() => router.replace(`?tab=new-query`)}
              className="text-xs font-medium text-ring hover:underline"
            >
              Ask a Question
            </button>
          </div>
        )}
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
        featuredOnly={featuredOnly}
        onToggleFeatured={toggleFeatured}
      />

      {/* ── Results ── */}
      {filteredQueries.length === 0 ? (
        <EmptySearch onClear={clearSearch} />
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
        role={role}
        onClose={() => {
          setSelectedQueryId(null);
          closeQuery();
        }}
        onAnswered={invalidate}
      />
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
