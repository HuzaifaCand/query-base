"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePendingQueries } from "@/hooks/usePendingQueries";
import { QuickAnswerPanel } from "@/components/teacher/QuickAnswerPanel";
import {
  CheckCircle2,
  Inbox,
  Zap,
  Loader2,
  BookOpen,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function PendingQueriesSection() {
  const { queries, loading, removeQuery } = usePendingQueries();
  const [modalOpen, setModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  function openModal(index = 0) {
    setStartIndex(index);
    setModalOpen(true);
  }

  function handleAnswered(queryId: string) {
    removeQuery(queryId);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 justify-center h-50 rounded-2xl border border-border/50 bg-muted/30">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">Loading inbox…</span>
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────────────────────────
  if (queries.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center",
          "px-6 py-8 rounded-2xl border border-dashed border-border/50",
          "bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5",
        )}
      >
        <div className="relative mb-3">
          <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2
              className="w-7 h-7 text-green-500"
              strokeWidth={1.75}
            />
          </div>
        </div>
        <h3 className="font-semibold text-base text-foreground mb-1">
          All caught up!
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No pending queries across your classes. Your students are all set.
        </p>
      </div>
    );
  }

  // ── Active State ─────────────────────────────────────────────────────────
  const oldestQuery = queries[0];
  const classCounts: Record<string, { name: string; count: number }> = {};
  queries.forEach((q) => {
    const id = q.class_id;
    const name = q.class?.name ?? "Unknown";
    if (!classCounts[id]) classCounts[id] = { name, count: 0 };
    classCounts[id].count++;
  });
  const classBreakdown = Object.values(classCounts);

  const oldestTimeAgo = oldestQuery.created_at
    ? formatDistanceToNow(new Date(oldestQuery.created_at), { addSuffix: true })
    : null;

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border border-border/60 overflow-hidden",
          "bg-card shadow-sm",
        )}
      >
        <div className="p-5 sm:p-6">
          {/* ── Header row ── */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Inbox className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base text-foreground leading-tight">
                    Pending Queries
                  </h2>
                  {/* Count pill */}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold tabular-nums",
                      "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {queries.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unanswered across {classBreakdown.length}{" "}
                  {classBreakdown.length === 1 ? "class" : "classes"}
                </p>
              </div>
            </div>

            {/* CTA button */}
            <button
              type="button"
              onClick={() => openModal(0)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold",
                "bg-ring text-white shadow-sm",
                "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
                "active:translate-y-0 active:scale-[0.98]",
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Answer</span>
              <span className="sm:hidden">Answer</span>
            </button>
          </div>

          {/* ── Class breakdown chips ── */}
          <div className="flex flex-wrap gap-2 mb-5">
            {classBreakdown.map((cls) => (
              <div
                key={cls.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-muted/40 text-xs"
              >
                <BookOpen className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{cls.name}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-ring">{cls.count}</span>
              </div>
            ))}
          </div>

          {/* ── Query preview cards (first 3) ── */}
          <div className="space-y-2">
            {queries.slice(0, 3).map((query, idx) => (
              <button
                key={query.id}
                type="button"
                onClick={() => openModal(idx)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border border-border/40 bg-muted/30",
                  "hover:bg-muted/60 hover:border-border/70 hover:shadow-sm",
                  "transition-all duration-150 group",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {query.title ?? "Untitled Query"}
                    </p>
                    {query.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {query.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {query.class && (
                      <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                        {query.class.name}
                      </span>
                    )}
                    {query.created_at && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(query.created_at), {
                          addSuffix: false,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* "See more" if > 3 */}
            {queries.length > 3 && (
              <button
                type="button"
                onClick={() => openModal(3)}
                className="w-full py-2.5 text-xs font-medium text-ring hover:text-ring/80 hover:underline transition-colors text-center"
              >
                +{queries.length - 3} more quer
                {queries.length - 3 === 1 ? "y" : "ies"} waiting…
              </button>
            )}
          </div>

          {/* ── Oldest query nudge ── */}
          {oldestTimeAgo && (
            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border/40">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Oldest query waiting{" "}
                <span className="font-medium text-foreground">
                  {oldestTimeAgo}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && queries.length > 0 && (
        <QuickAnswerPanel
          queries={queries}
          initialIndex={startIndex}
          onClose={() => setModalOpen(false)}
          onAnswered={handleAnswered}
        />
      )}
    </>
  );
}
