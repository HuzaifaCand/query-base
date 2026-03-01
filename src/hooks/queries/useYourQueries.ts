"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryWithRelations } from "@/components/class-page/queries/AllQueriesList";

/**
 * Fetches queries created by the current student in a class —
 * used by the "Your Queries" tab.
 */
export function useYourQueries(classId: string, userId: string | null) {
  return useQuery({
    queryKey: queryKeys.studentQueries(classId, userId ?? ""),
    enabled: !!classId && !!userId,
    queryFn: async (): Promise<QueryWithRelations[]> => {
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
        .eq("student_id", userId!)
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "answers", ascending: true });

      if (error) throw error;
      return (data as QueryWithRelations[]) ?? [];
    },
  });
}
