import { useMemo, useState } from "react";
import { Database } from "@/lib/databasetypes";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export type SearchableQuery = Database["public"]["Tables"]["queries"]["Row"] & {
  student: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
  answers: Answer[];
  query_tags: QueryTag[];
};

/**
 * Client-side search + tag-filter hook for a list of queries.
 *
 * Matches:
 *  - query title (case-insensitive substring)
 *  - query description (case-insensitive substring)
 *  - tag names that the query has (case-insensitive substring)
 *
 * Tag filter: clicking a tag name narrows results to queries that have
 * ALL selected tags.  Clicking again deselects it.
 */
export function useQuerySearch<T extends SearchableQuery>(queries: T[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);

  // Derive the full set of tags that exist across all visible queries (for the
  // tag-filter chip row beneath the search bar).
  const allTags = useMemo(() => {
    const seen = new Map<string, string>(); // id → name
    queries.forEach((q) => {
      q.query_tags?.forEach((qt) => {
        if (qt.tags) seen.set(qt.tags.id, qt.tags.name);
      });
    });
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [queries]);

  const toggleTagFilter = (tagId: string) => {
    setActiveTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveTagIds([]);
  };

  const filteredQueries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return queries.filter((q) => {
      // ── Tag filter (all selected tags must be present) ──────────────────────
      if (activeTagIds.length > 0) {
        const queryTagIds = q.query_tags?.map((qt) => qt.tag_id) ?? [];
        const hasAll = activeTagIds.every((id) => queryTagIds.includes(id));
        if (!hasAll) return false;
      }

      // ── Text search ─────────────────────────────────────────────────────────
      if (term === "") return true;

      const inTitle = q.title?.toLowerCase().includes(term) ?? false;
      const inDescription =
        q.description?.toLowerCase().includes(term) ?? false;
      const inTags =
        q.query_tags?.some((qt) =>
          qt.tags?.name.toLowerCase().includes(term),
        ) ?? false;

      return inTitle || inDescription || inTags;
    });
  }, [queries, searchTerm, activeTagIds]);

  const hasActiveSearch = searchTerm.trim() !== "" || activeTagIds.length > 0;

  return {
    searchTerm,
    setSearchTerm,
    activeTagIds,
    toggleTagFilter,
    clearSearch,
    allTags,
    filteredQueries,
    hasActiveSearch,
  };
}
