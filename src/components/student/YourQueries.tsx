"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QueryView } from "../class-page/queries/QueryView";
import { SearchBar } from "../class-page/queries/AllQueriesList";
import { Loader2, MessageSquarePlus, Search } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";
import { useQuerySearch } from "@/hooks/useQuerySearch";

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

export function YourQueries({ classId }: { classId: string }) {
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

  // Apply status filter on top of search results
  const filteredQueries = searchFiltered.filter((q) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "open") return !q.answered_at;
    if (statusFilter === "answered") return !!q.answered_at;
    return true;
  });

  const fetchQueries = useCallback(async () => {
    if (!classId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

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
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "answers", ascending: true });

      if (error) throw error;

      if (data) {
        setQueries(data as QueryWithRelations[]);
        queryIdsRef.current = new Set(data.map((q) => q.id));
      }
    } catch (error) {
      console.error("Error fetching your queries:", error);
      toast.error("Failed to load your queries");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    fetchQueries();

    const channel = supabase
      .channel(`your-queries-changes-${classId}`)
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
          <QueryView
            classId={classId}
            role="student"
            key={query.id}
            query={query}
            onAnswered={fetchQueries}
          />
        ))
      )}
    </div>
  );
}
