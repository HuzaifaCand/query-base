"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryWithRelations } from "@/components/class-page/queries/AllQueriesList";

/**
 * Fetches every query for a class — used by the "All Queries" tab.
 */
export function useAllQueries(classId: string) {
  return useQuery({
    queryKey: queryKeys.allQueries(classId),
    enabled: !!classId,
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
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "answers", ascending: true });

      if (error) throw error;
      return (data as QueryWithRelations[]) ?? [];
    },
  });
}
