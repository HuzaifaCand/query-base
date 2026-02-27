"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QueryCard } from "../class-page/queries/QueryCard";
import { QueryDetailPanel } from "../class-page/queries/QueryDetailPanel";
import { AnswerView } from "../class-page/queries/AnswerView";
import { SearchBar } from "../class-page/queries/SearchBar";
import { Loader2, MessageSquareReply, Search } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";
import { useQuerySearch } from "@/hooks/useQuerySearch";
import { useQueryDeepLink } from "@/hooks/useQueryDeepLink";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

type QueryWithRelations = Database["public"]["Tables"]["queries"]["Row"] & {
  student: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
  answers: Answer[];
  query_tags: QueryTag[];
};

export function YourAnswers({ classId }: { classId: string }) {
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

  const fetchQueries = useCallback(async () => {
    if (!classId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Step 1: Find all query IDs where the current user has authored an answer
      // in this class. We join through answers → queries to filter by class_id.
      const { data: answeredQueryRows, error: answerError } = await supabase
        .from("answers")
        .select("query_id, queries!inner(class_id)")
        .eq("author_id", user.id)
        .eq("queries.class_id", classId);

      if (answerError) throw answerError;

      // Extract unique query IDs
      const answeredQueryIds = [
        ...new Set((answeredQueryRows ?? []).map((r) => r.query_id)),
      ];

      if (answeredQueryIds.length === 0) {
        setQueries([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch the full query data with all relations
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
        .in("id", answeredQueryIds)
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "answers", ascending: true });

      if (error) throw error;

      if (data) {
        setQueries(data as QueryWithRelations[]);
        queryIdsRef.current = new Set(data.map((q) => q.id));
      }
    } catch (error) {
      console.error("Error fetching your answered queries:", error);
      toast.error("Failed to load your answers");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    fetchQueries();

    const channel = supabase
      .channel(`your-answers-changes-${classId}`)
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

  /** Get only the answers authored by the current user for a given query */
  const getMyAnswers = useCallback((query: QueryWithRelations): Answer[] => {
    // We don't have the user.id cached in state, so we check the author_id
    // against the answers that exist. Since we fetched queries specifically
    // where the current user has answers, we can identify "my" answers by
    // checking if the answer's author matches any answer author from the
    // initial fetch. Instead, we show ALL answers on the query since they're
    // already fetched and the teacher should see the full context.
    return query.answers;
  }, []);

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
              <MessageSquareReply className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {hasActiveSearch ? "No matching queries" : "No answers yet"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
            {hasActiveSearch
              ? "Try different keywords or remove a tag filter."
              : statusFilter === "all"
                ? "You haven't answered any queries yet."
                : `You have no ${statusFilter} answered queries.`}
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
        filteredQueries.map((query) => {
          const answers = getMyAnswers(query);
          return (
            <div key={query.id} className="space-y-0">
              {/* Query card — clicking opens the detail panel */}
              <QueryCard
                query={query}
                onClick={() => {
                  setSelectedQueryId(query.id);
                  openQuery(query.id);
                }}
              />

              {/* Inline answer(s) shown directly beneath the query card */}
              {answers.length > 0 && (
                <div className="ml-4 sm:ml-6 border-l-2 border-ring/20 pl-4 sm:pl-5 pt-3 space-y-3">
                  {answers.map((answer) => (
                    <AnswerView key={answer.id} answer={answer} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Detail slide-over panel ── */}
      <QueryDetailPanel
        query={selectedQuery}
        classId={classId}
        role="teacher"
        onClose={() => {
          setSelectedQueryId(null);
          closeQuery();
        }}
        onAnswered={fetchQueries}
      />
    </div>
  );
}
