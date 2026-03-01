"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryWithRelations } from "@/components/class-page/queries/AllQueriesList";

/**
 * Fetches queries the current teacher has answered in a class —
 * used by the "Your Answers" tab.
 *
 * Two-step fetch:
 *   1. Find query IDs where the teacher authored an answer (filtered by class).
 *   2. Fetch full query data for those IDs.
 */
export function useYourAnswers(classId: string, userId: string | null) {
  return useQuery({
    queryKey: queryKeys.answeredQueries(classId, userId ?? ""),
    enabled: !!classId && !!userId,
    queryFn: async (): Promise<QueryWithRelations[]> => {
      // Step 1: Find query IDs where the teacher has an answer in this class
      const { data: answeredQueryRows, error: answerError } = await supabase
        .from("answers")
        .select("query_id, queries!inner(class_id)")
        .eq("author_id", userId!)
        .eq("queries.class_id", classId);

      if (answerError) throw answerError;

      const answeredQueryIds = [
        ...new Set((answeredQueryRows ?? []).map((r) => r.query_id)),
      ];

      if (answeredQueryIds.length === 0) return [];

      // Step 2: Fetch full query data with all relations
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
      return (data as QueryWithRelations[]) ?? [];
    },
  });
}
