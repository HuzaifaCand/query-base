"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QueryView } from "./QueryView";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";

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

  // Keep track of current query IDs to filter answer events locally
  const queryIdsRef = useRef<Set<string>>(new Set());

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
      {queries.map((query) => (
        <QueryView
          classId={classId}
          role={role}
          key={query.id}
          query={query}
          onAnswered={fetchQueries}
        />
      ))}
    </div>
  );
}
