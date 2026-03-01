"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Returns a stable callback that invalidates all queries-related cache.
 *
 * Use this wherever the old code passed `fetchQueries` / `onAnswered`
 * as a prop so that child components can trigger a refetch without
 * needing a direct reference to the query client.
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.all });
  }, [queryClient]);
}
