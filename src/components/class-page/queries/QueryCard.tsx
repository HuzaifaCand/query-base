"use client";

import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";
import { AttachmentList } from "./AttachmentList";
import { UserHeader } from "./UserHeader";
import { Lock, EyeOff, ChevronRight, Star, Sparkles } from "lucide-react";
type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export type QueryWithRelations =
  Database["public"]["Tables"]["queries"]["Row"] & {
    student: Database["public"]["Tables"]["users"]["Row"] | null;
    attachments: Database["public"]["Tables"]["attachments"]["Row"][];
    answers: Answer[];
    query_tags: QueryTag[];
  };

// ── Status badge config ─────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  open: "bg-warning-medium/10 text-warning-medium border-warning-medium/30",
  answered: "bg-ring/10 text-ring border-ring/20",
  closed: "bg-muted text-muted-foreground border-border",
};

interface QueryCardProps {
  query: QueryWithRelations;
  onClick: () => void;
  /** Optional: current user id — when matches query.student_id, shows "You" in the header */
  userId?: string | null;
}

export function QueryCard({ query, onClick, userId }: QueryCardProps) {
  const isFeatured = !!query.is_featured;

  const tags =
    query.query_tags
      ?.map((qt) => qt.tags)
      .filter(
        (t): t is Database["public"]["Tables"]["tags"]["Row"] => t !== null,
      ) ?? [];

  const statusKey = query.status ?? "open";
  const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["open"];

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
        "group w-full text-left bg-card border rounded-2xl overflow-hidden cursor-pointer",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200",
        "hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
        "active:scale-[0.985] select-none",
        isFeatured
          ? "border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/20 hover:border-amber-400/80 dark:hover:border-amber-500/80"
          : "border-border/40",
      )}
    >
      {/* Featured note callout */}
      {isFeatured && query.featured_note && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 px-5 py-2.5 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            {query.featured_note}
          </p>
        </div>
      )}

      <div className="pl-5 pr-5 pt-5 pb-4 sm:pl-6 sm:pr-6 sm:pt-5 space-y-3">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <UserHeader
            name={
              query.is_anonymous
                ? "Anonymous"
                : query.student?.full_name || null
            }
            createdAt={query.created_at}
            role="student"
            size="md"
            isOwner={
              !query.is_anonymous && !!userId && query.student_id === userId
            }
          />

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Featured badge */}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/50">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                Featured
              </span>
            )}

            {/* Privacy / anon badges */}
            {query.is_private && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/40">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            )}
            {query.is_anonymous && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/40">
                <EyeOff className="w-2.5 h-2.5" />
                Anonymous
              </span>
            )}

            {/* Status badge */}
            {query.status && (
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border",
                  statusStyle,
                )}
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        {/* ── Body (truncated) ── */}
        <div className="space-y-1.5">
          {query.title && (
            <h4 className="font-semibold text-base sm:text-[17px] leading-snug text-foreground group-hover:text-primary transition-colors duration-150">
              {query.title}
            </h4>
          )}
          {query.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-3">
              {query.description}
            </p>
          )}
        </div>

        {/* ── Attachments ── */}
        <AttachmentList attachments={query.attachments} />

        {/* ── Tags + chevron row ── */}
        <div className="flex items-center justify-between gap-3">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full",
                    "text-[11px] font-medium",
                    "bg-ring/10 text-ring border border-ring/20",
                    "dark:bg-ring/15 dark:border-ring/30",
                  )}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* View chevron affordance */}
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
        </div>
      </div>
    </div>
  );
}
