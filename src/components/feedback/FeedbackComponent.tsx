"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bug,
  Lightbulb,
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Send,
  SendHorizonal,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import clsx from "clsx";
import { SubmitButton } from "../ui/SubmitButton";

type Category = "bug" | "feature" | "support" | "other";
type Role = "student" | "teacher";

const CATEGORIES: {
  id: Category;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "bug",
    label: "Bug Report",
    description: "Something isn't working correctly",
    icon: Bug,
  },
  {
    id: "feature",
    label: "Feature Request",
    description: "Suggest an improvement",
    icon: Lightbulb,
  },
  {
    id: "support",
    label: "Support",
    description: "Need help with something specific",
    icon: LifeBuoy,
  },
  {
    id: "other",
    label: "Other",
    description: "General feedback or anything else",
    icon: MessageSquare,
  },
];

const PLACEHOLDER_BY_CATEGORY: Record<Category, string> = {
  bug: "Describe what happened, what you expected, and any steps to reproduce it…",
  feature: "Tell us what you'd like to see and how it would help you…",
  support: "Describe the issue you're having and we'll do our best to help…",
  other: "Share anything on your mind — we read every message…",
};

const MAX_CHARS = 1000;

interface FeedbackComponentProps {
  role: Role;
}

export default function FeedbackComponent({ role }: FeedbackComponentProps) {
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = message.trim().length > 10 && !isOverLimit && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to submit feedback.");
        return;
      }

      const fullDescription = `[${category.toUpperCase()}] ${message.trim()}`;

      const { error: insertError } = await supabase.from("feedbacks").insert({
        author_id: user.id,
        author_role: role,
        description: fullDescription,
      });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage("");
    setCategory("bug");
    setError(null);
  };

  return (
    <div className="pb-12">
      <SectionHeader title="Feedback & Support" />

      {submitted ? (
        /* ── Success State ─────────────────────────────────────────────── */
        <div className="max-w-xl flex flex-col items-center text-center gap-5 pb-14 px-6 mx-auto">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-ring/10">
            <CheckCircle2 className="w-8 h-8 text-ring" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-primary">
              Thanks for your feedback!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've received your message and will review it shortly. Your input
              genuinely helps us improve querybase.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-2 px-5 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/70 text-primary transition-colors"
          >
            Submit another
          </button>
        </div>
      ) : (
        /* ── Form ──────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Context blurb */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Found a bug? Have an idea? Need help? Use this form to reach out to
            us.
          </p>

          {/* Category picker */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ id, label, description, icon: Icon }) => {
                const isSelected = category === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={clsx(
                      "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150",
                      isSelected
                        ? "border-ring/50 bg-ring/5 text-primary"
                        : "border-border/50 bg-card hover:bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <Icon
                      size={16}
                      className={clsx(
                        "mt-0.5 shrink-0",
                        isSelected ? "text-ring" : "text-muted-foreground",
                      )}
                    />
                    <div>
                      <p
                        className={clsx(
                          "text-xs font-semibold",
                          isSelected ? "text-primary" : "text-primary/70",
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5 hidden sm:block">
                        {description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message textarea */}
          <div className="space-y-2">
            <label
              htmlFor="feedback-message"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Message
            </label>
            <textarea
              id="feedback-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={PLACEHOLDER_BY_CATEGORY[category]}
              className={clsx(
                "w-full resize-none rounded-xl border bg-card px-4 py-3 text-sm text-primary placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow",
                isOverLimit ? "border-red-400/60" : "border-border/50",
              )}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters required.
              </p>
              <span
                className={clsx(
                  "text-xs tabular-nums",
                  isOverLimit
                    ? "text-red-500 font-medium"
                    : "text-muted-foreground",
                )}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          {/* Submit */}
          <SubmitButton
            icon={Send}
            iconLeft
            text="Submit Feedback"
            loadingText="Submitting..."
            disabled={!canSubmit}
            submitting={submitting}
            handleSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
