"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FeatureToggleProps {
  queryId: string;
  isFeatured: boolean;
  featuredNote: string | null;
  /** Called after a successful mutation so the parent can refresh */
  onToggled: () => void;
}

export function FeatureToggle({
  queryId,
  isFeatured,
  featuredNote,
  onToggled,
}: FeatureToggleProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(featuredNote ?? "");
  const [saving, setSaving] = useState(false);

  const toggleFeatured = async (newState: boolean) => {
    setSaving(true);
    try {
      const payload = {
        is_featured: newState,
        featured_at: newState ? new Date().toISOString() : null,
        featured_note: newState && note.trim() ? note.trim() : null,
      };

      const { error } = await supabase
        .from("queries")
        .update(payload)
        .eq("id", queryId)
        .select()
        .single();

      if (error) throw error;

      toast.success(
        newState ? "Query featured for the class!" : "Query unfeatured",
      );
      setOpen(false);
      onToggled();
    } catch (err) {
      console.error("Failed to toggle featured state:", err);
      toast.error("Failed to update featured state");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
          isFeatured
            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-900/60"
            : "bg-muted/50 text-muted-foreground border-border/60 hover:border-amber-400/50 hover:text-amber-600 dark:hover:text-amber-400",
        )}
      >
        <Star
          className={cn(
            "w-3.5 h-3.5",
            isFeatured && "fill-amber-500 text-amber-500",
          )}
        />
        {isFeatured ? "Featured" : "Feature"}
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-card border border-border/60 rounded-xl shadow-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {isFeatured ? "Manage Feature" : "Feature this query"}
              </span>
              <Star
                className={cn(
                  "w-4 h-4",
                  isFeatured
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground",
                )}
              />
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a tip for the class (optional)"
              rows={2}
              className={cn(
                "w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm",
                "placeholder:text-muted-foreground/50 text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60",
                "resize-none transition-all duration-150",
              )}
            />

            <div className="flex items-center justify-end gap-2">
              {isFeatured && (
                <button
                  type="button"
                  onClick={() => {
                    setNote("");
                    toggleFeatured(false);
                  }}
                  disabled={saving}
                  className="text-xs font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-40 px-2 py-1"
                >
                  Unfeature
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleFeatured(true)}
                disabled={saving}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
                  "bg-amber-500 text-white shadow-sm",
                  "hover:bg-amber-600 transition-colors duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Star className="w-3 h-3 fill-current" />
                )}
                {isFeatured ? "Update" : "Feature"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
