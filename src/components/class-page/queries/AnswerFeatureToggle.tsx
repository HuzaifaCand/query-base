import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";

interface AnswerFeatureToggleProps {
  featureForClass: boolean;
  setFeatureForClass: (value: boolean) => void;
  featuredNote: string;
  setFeaturedNote: (value: string) => void;
}

export function AnswerFeatureToggle({
  featureForClass,
  setFeatureForClass,
  featuredNote,
  setFeaturedNote,
}: AnswerFeatureToggleProps) {
  return (
    <div className="space-y-2 pt-1">
      <label className="flex items-center gap-2 cursor-pointer group/feature">
        <input
          type="checkbox"
          checked={featureForClass}
          onChange={(e) => setFeatureForClass(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            "relative w-8 h-[18px] rounded-full border transition-all duration-200 flex items-center",
            featureForClass
              ? "bg-amber-500 border-amber-500"
              : "bg-muted border-border/60 group-hover/feature:border-amber-400/50",
          )}
        >
          <div
            className={cn(
              "absolute w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
              featureForClass ? "translate-x-[15px]" : "translate-x-[2px]",
            )}
          />
        </div>
        <Star
          className={cn(
            "w-3.5 h-3.5 transition-colors duration-150",
            featureForClass
              ? "text-amber-500 fill-amber-500"
              : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "text-xs font-medium transition-colors duration-150",
            featureForClass
              ? "text-amber-700 dark:text-amber-300"
              : "text-muted-foreground",
          )}
        >
          Feature for the class
        </span>
      </label>

      <AnimatePresence>
        {featureForClass && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <textarea
              value={featuredNote}
              onChange={(e) => setFeaturedNote(e.target.value)}
              placeholder="Add a tip for the class (optional)"
              rows={2}
              className={cn(
                "w-full rounded-lg border border-amber-300/60 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 text-sm",
                "placeholder:text-muted-foreground/50 text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60",
                "resize-none transition-all duration-150",
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
