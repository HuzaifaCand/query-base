"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QueryView } from "./QueryView";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { toast } from "sonner";

// Define the type for the query with included relations
type QueryWithRelations = Database["public"]["Tables"]["queries"]["Row"] & {
  student: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

export function AllQueriesList() {
  const pathname = usePathname();
  const classId = pathname?.split("/")[2]; // e.g. /dashboard/[classId] -> [classId]

  const [queries, setQueries] = useState<QueryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    const fetchQueries = async () => {
      try {
        const { data, error } = await supabase
          .from("queries")
          .select(
            `
            *,
            student:users!student_id(*),
            attachments(*)
          `,
          )
          .eq("class_id", classId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setQueries(data as QueryWithRelations[]);
        }
      } catch (error) {
        console.error("Error fetching queries:", error);
        toast.error("Failed to load queries");
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();

    // Subscribe to realtime changes (optional but good for UX)
    const channel = supabase
      .channel("queries-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queries",
          filter: `class_id=eq.${classId}`,
        },
        () => {
          // Reload on changes
          fetchQueries();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

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
    <div className="space-y-4">
      {queries.map((query) => (
        <QueryView key={query.id} query={query} />
      ))}
    </div>
  );
}
