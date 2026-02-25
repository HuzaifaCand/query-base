"use client";

import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";
import {
  Sparkles,
  Star,
  ArrowRight,
  Image as ImageIcon,
  Mic,
} from "lucide-react";

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

type FeaturedQuery = Database["public"]["Tables"]["queries"]["Row"] & {
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
  query_tags: QueryTag[];
  class: { name: string } | null;
};

interface FeaturedQueryCardProps {
  query: FeaturedQuery;
  onClick: () => void;
}

export function FeaturedQueryCard({ query, onClick }: FeaturedQueryCardProps) {
  const firstTag =
    query.query_tags
      ?.map((qt) => qt.tags)
      .find(
        (t): t is Database["public"]["Tables"]["tags"]["Row"] => t !== null,
      ) ?? null;

  // Attachment metadata
  const imageCount =
    query.attachments?.filter((a) => a.file_type.startsWith("image/")).length ??
    0;
  const voiceCount =
    query.attachments?.filter((a) => a.file_type.startsWith("audio/")).length ??
    0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group flex flex-col bg-card border rounded-2xl overflow-hidden cursor-pointer",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200",
        "active:scale-[0.985] select-none",
        // Featured amber styling from QueryCard
        "border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/20",
        "hover:border-amber-400/80 dark:hover:border-amber-500/80",
        // Snap + fixed width for mobile horizontal scroll
        "snap-start shrink-0 w-[280px] sm:w-auto",
      )}
    >
      {/* Featured note callout */}
      {query.featured_note && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 px-4 py-2.5 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed line-clamp-2">
            {query.featured_note}
          </p>
        </div>
      )}

      <div className="flex flex-col flex-1 px-4 pt-4 pb-3.5 space-y-2.5">
        {/* Top badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/50">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
            Featured
          </span>
          {query.class && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/40 truncate max-w-[140px]">
              {query.class.name}
            </span>
          )}
        </div>

        {/* Title */}
        {query.title && (
          <h4 className="font-semibold text-sm sm:text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-2">
            {query.title}
          </h4>
        )}

        {/* Attachment metadata (compact text, not full previews) */}
        {(imageCount > 0 || voiceCount > 0) && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {voiceCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Mic className="w-3 h-3" />
                {voiceCount} voice {voiceCount === 1 ? "note" : "notes"}
              </span>
            )}
            {voiceCount > 0 && imageCount > 0 && (
              <span className="text-border">|</span>
            )}
            {imageCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {imageCount} {imageCount === 1 ? "image" : "images"}
              </span>
            )}
          </div>
        )}

        {/* Spacer pushes footer to bottom */}
        <div className="flex-1" />

        {/* Footer: first tag + "Read Answer" affordance */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {firstTag ? (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full",
                "text-[11px] font-medium",
                "bg-ring/10 text-ring border border-ring/20",
                "dark:bg-ring/15 dark:border-ring/30",
                "truncate max-w-[120px]",
              )}
            >
              {firstTag.name}
            </span>
          ) : (
            <div />
          )}

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform duration-200">
            Read Answer
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
