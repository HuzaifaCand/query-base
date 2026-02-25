"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QueryCard } from "./QueryCard";
import { QueryDetailPanel } from "./QueryDetailPanel";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus, Search } from "lucide-react";
import { useQuerySearch } from "@/hooks/useQuerySearch";
import { useQueryDeepLink } from "@/hooks/useQueryDeepLink";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";

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
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const {
    selectedQueryId: deepLinkId,
    openQuery,
    closeQuery,
  } = useQueryDeepLink();
  const queryIdsRef = useRef<Set<string>>(new Set());

  // Once queries load, honour any deep-link ID that arrived in the URL.
  // We store it separately so we only auto-open once per URL param visit.
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
  // Prefer the URL-driven deep-link ID; fall back to locally-set ID.
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
        onAnswered={fetchQueries}
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
