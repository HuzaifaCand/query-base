"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/databasetypes";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export type PendingQuery = Database["public"]["Tables"]["queries"]["Row"] & {
  student: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
  answers: Answer[];
  query_tags: QueryTag[];
  class: Pick<
    Database["public"]["Tables"]["classes"]["Row"],
    "id" | "name" | "subject"
  > | null;
};

export function usePendingQueries() {
  const [queries, setQueries] = useState<PendingQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [classIds, setClassIds] = useState<string[]>([]);

  const fetchPendingQueries = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setQueries([]);
      setLoading(false);
      return;
    }

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
        ),
        class:classes!class_id(id, name, subject)
      `,
      )
      .in("class_id", ids)
      .is("answered_at", null)
      .order("created_at", { ascending: true }); // oldest first = most urgent

    if (error) {
      console.error("Error fetching pending queries:", error);
      return;
    }

    setQueries((data as PendingQuery[]) ?? []);
    setLoading(false);
  }, []);

  // Initial load: get teacher's class IDs, then fetch pending queries
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const { data: teacherClasses } = await supabase
        .from("class_teachers")
        .select("class_id")
        .eq("teacher_id", user.id);

      if (cancelled) return;

      const ids = (teacherClasses ?? []).map((tc) => tc.class_id);
      setClassIds(ids);
      await fetchPendingQueries(ids);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [fetchPendingQueries]);

  // Optimistic removal — instantly removes a query from the local list
  const removeQuery = useCallback((queryId: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== queryId));
  }, []);

  return {
    queries,
    loading,
    classIds,
    removeQuery,
    refetch: () => fetchPendingQueries(classIds),
  };
}
