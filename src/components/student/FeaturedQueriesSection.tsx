"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/databasetypes";
import { FeaturedQueryCard } from "./FeaturedQueryCard";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { LoadingSection } from "../ui/LoadingSection";

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

type FeaturedQuery = Database["public"]["Tables"]["queries"]["Row"] & {
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
  query_tags: QueryTag[];
  class: { name: string } | null;
};

export function FeaturedQueriesSection() {
  const [queries, setQueries] = useState<FeaturedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get all class IDs the student belongs to
        const { data: memberships } = await supabase
          .from("class_students")
          .select("class_id")
          .eq("student_id", user.id);

        if (!memberships || memberships.length === 0) {
          setQueries([]);
          setLoading(false);
          return;
        }

        const classIds = memberships.map((m) => m.class_id);

        // Fetch top 3 featured queries across all student classes
        const { data, error } = await supabase
          .from("queries")
          .select(
            `
            *,
            attachments(id, file_type),
            query_tags(
              tag_id,
              tags(*)
            ),
            class:classes!class_id(name)
          `,
          )
          .eq("is_featured", true)
          .in("class_id", classIds)
          .order("featured_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setQueries((data as FeaturedQuery[]) ?? []);
      } catch (err) {
        console.error("Error fetching featured queries:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  // Per spec: if no featured queries, hide section entirely (no placeholder)
  if (!loading && queries.length === 0) return null;

  // Still loading — show a slim loader
  if (loading) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 justify-center h-50 rounded-2xl border border-border/50 bg-muted/30">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">
          Loading featured queries...
        </span>
      </div>
    );
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Featured Queries
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            // Navigate to first class's queries tab with featured filter
            // The SearchBar will pick up the featured filter from here
            if (queries.length > 0) {
              router.push(`/dashboard/${queries[0].class_id}?tab=queries`);
            }
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
        >
          View More
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Cards: horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:overflow-visible sm:snap-none sm:pb-0">
        {queries.map((query) => (
          <FeaturedQueryCard
            key={query.id}
            query={query}
            onClick={() => {
              // Navigate to the class page with the query deep-linked
              router.push(
                `/dashboard/${query.class_id}?tab=queries&query=${query.id}`,
              );
            }}
          />
        ))}
      </div>
    </section>
  );
}
