"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";
import { AttachmentList } from "./AttachmentList";
import { UserHeader } from "./UserHeader";
import { AnswerPanel } from "./AnswerPanel";
import { AnswerView } from "./AnswerView";
import { FeatureToggle } from "./FeatureToggle";
import { Lock, EyeOff } from "lucide-react";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

type Query = Database["public"]["Tables"]["queries"]["Row"] & {
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

interface QueryDetailPanelProps {
  query: Query | null;
  classId: string;
  role: "student" | "teacher" | "ta";
  onClose: () => void;
  onAnswered: () => void;
}

export function QueryDetailPanel({
  query,
  classId,
  role,
  onClose,
  onAnswered,
}: QueryDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (query) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isAnswered = !!query?.answered_at;
  const officialAnswer =
    query?.answers?.find((a) => a.is_official) ?? query?.answers?.[0] ?? null;

  const tags =
    query?.query_tags
      ?.map((qt) => qt.tags)
      .filter(
        (t): t is Database["public"]["Tables"]["tags"]["Row"] => t !== null,
      ) ?? [];

  const statusKey = query?.status ?? "open";
  const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["open"];

  const isTeacherLike = role === "teacher" || role === "ta";

  return (
    <AnimatePresence>
      {query && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 h-screen"
            onClick={onClose}
          />

          {/* Slide-over panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex flex-col",
              "w-full sm:w-[560px] md:w-[620px] lg:w-[680px]",
              "bg-background shadow-2xl",
            )}
          >
            {/* ── Panel Header ── */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Status badge */}
                {query.status && (
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0",
                      statusStyle,
                    )}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Feature toggle for teacher (post-answer) */}
                {isTeacherLike && isAnswered && (
                  <FeatureToggle
                    queryId={query.id}
                    isFeatured={!!query.is_featured}
                    featuredNote={query.featured_note}
                    onToggled={onAnswered}
                  />
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-150"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Featured note callout */}
              {query.is_featured && query.featured_note && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 px-5 sm:px-6 py-3 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {query.featured_note}
                  </p>
                </div>
              )}

              <div className="px-5 sm:px-6 py-5 space-y-5">
                {/* ── Author ── */}
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
                  />

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
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
                  </div>
                </div>

                {/* ── Full body ── */}
                <div className="space-y-2">
                  {query.title && (
                    <h3 className="font-semibold text-lg leading-snug text-foreground">
                      {query.title}
                    </h3>
                  )}
                  {query.description && (
                    <p className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {query.description}
                    </p>
                  )}
                </div>

                {/* ── Full attachments ── */}
                <AttachmentList attachments={query.attachments} />

                {/* ── Tags ── */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
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
                )}
              </div>

              {/* ── Answer section ── */}
              {(isAnswered || isTeacherLike) && (
                <div className="mx-5 sm:mx-6 border-t border-border/50" />
              )}

              {/* Official answer */}
              {isAnswered && officialAnswer && (
                <div className="px-5 sm:px-6 pb-5 pt-4">
                  <AnswerView answer={officialAnswer} />
                </div>
              )}

              {/* Answer panel (teacher/TA only, unanswered) */}
              {!isAnswered && isTeacherLike && (
                <div className="px-5 sm:px-6 pb-5 pt-4">
                  <AnswerPanel
                    classId={classId}
                    queryId={query.id}
                    onAnswered={onAnswered}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
