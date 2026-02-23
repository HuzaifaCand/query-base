"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";
import { AnswerPanel } from "./AnswerPanel";
import { AnswerView } from "./AnswerView";
import { AttachmentList } from "./AttachmentList";
import { UserHeader } from "./UserHeader";
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

interface QueryViewProps {
  query: Query;
  classId: string;
  role: "student" | "teacher" | "ta";
  onAnswered: () => void;
}

// ── Status badge config ────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  open: "bg-warning-medium/10 text-warning-medium border-warning-medium/30",
  answered: "bg-ring/10 text-ring border-ring/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export function QueryView({
  role,
  classId,
  query,
  onAnswered,
}: QueryViewProps) {
  const isAnswered = !!query.answered_at;
  const officialAnswer =
    query.answers?.find((a) => a.is_official) ?? query.answers?.[0] ?? null;

  const tags =
    query.query_tags
      ?.map((qt) => qt.tags)
      .filter(
        (t): t is Database["public"]["Tables"]["tags"]["Row"] => t !== null,
      ) ?? [];

  const statusKey = query.status ?? "open";
  const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["open"];

  // Relative time
  const timeAgo = query.created_at
    ? formatDistanceToNow(new Date(query.created_at), { addSuffix: true })
    : null;

  return (
    <div
      className={cn(
        "group bg-card border border-border/60 rounded-2xl overflow-hidden",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200",
      )}
    >
      <div className="pl-5 pr-5 pt-5 pb-4 sm:pl-6 sm:pr-6 sm:pt-5 space-y-4">
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
          />

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Privacy / anon badges */}
            {query.is_private && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/60">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            )}
            {query.is_anonymous && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/60">
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

        {/* ── Body ── */}
        <div className="space-y-1.5">
          {query.title && (
            <h4 className="font-semibold text-base sm:text-[17px] leading-snug text-foreground group-hover:text-primary transition-colors duration-150">
              {query.title}
            </h4>
          )}
          {query.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-5">
              {query.description}
            </p>
          )}
        </div>

        {/* ── Attachments ── */}
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

      {/* ── Answer divider ── */}
      {(isAnswered || role !== "student") && (
        <div className="mx-5 sm:mx-6 border-t border-border/50" />
      )}

      {/* ── Official answer ── */}
      {isAnswered && officialAnswer && (
        <div className="px-5 sm:px-6 pb-5 pt-4">
          <AnswerView answer={officialAnswer} />
        </div>
      )}

      {/* ── Answer panel (teacher/TA only, unanswered) ── */}
      {!isAnswered && role !== "student" && (
        <div className="px-5 sm:px-6 pb-5 pt-4">
          <AnswerPanel
            classId={classId}
            queryId={query.id}
            onAnswered={onAnswered}
          />
        </div>
      )}
    </div>
  );
}
