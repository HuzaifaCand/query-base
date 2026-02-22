"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QueryView } from "../class-page/queries/QueryView";
import { Loader2, MessageSquarePlus, Filter } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [filter, setFilter] = useState<"all" | "open" | "answered">("all");

  const queryIdsRef = useRef<Set<string>>(new Set());

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
        () => {
          fetchQueries();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
        },
        (payload) => {
          const newRecord = payload.new as { query_id?: string };
          const oldRecord = payload.old as { query_id?: string };
          const queryId = newRecord?.query_id || oldRecord?.query_id;

          if (queryId && queryIdsRef.current.has(queryId)) {
            fetchQueries();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, fetchQueries]);

  const filteredQueries = queries.filter((q) => {
    if (filter === "all") return true;
    if (filter === "open") return !q.answered_at;
    if (filter === "answered") return !!q.answered_at;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-2 mb-4 bg-muted/30 p-1.5 rounded-lg border border-border/50 max-w-fit">
        <Filter className="w-4 h-4 ml-2 mr-1 text-muted-foreground" />
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter("open")}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            filter === "open"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          Open
        </button>
        <button
          onClick={() => setFilter("answered")}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            filter === "answered"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          Answered
        </button>
      </div>

      {filteredQueries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
          <div className="bg-muted p-4 rounded-full mb-3">
            <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No queries found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            {filter === "all"
              ? "You haven't asked any questions yet."
              : `You have no ${filter} queries.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredQueries.map((query) => (
            <QueryView
              classId={classId}
              role="student"
              key={query.id}
              query={query}
              onAnswered={fetchQueries}
            />
          ))}
        </div>
      )}
    </div>
  );
}
