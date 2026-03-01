"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Centralized Supabase realtime listener for queries + answers.
 *
 * Mount once in a parent component (e.g. ClassPage) that wraps the tab system.
 * On any change, it invalidates the base `['queries']` key so React Query
 * silently re-fetches whichever tab is currently active.
 */
export function useQueriesRealtime(classId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!classId) return;

    const channel = supabase
      .channel(`queries-realtime-${classId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queries",
          filter: `class_id=eq.${classId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, queryClient]);
}
