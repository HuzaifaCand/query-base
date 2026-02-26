import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  disabled: boolean;
  submitting: boolean;
  handleSubmit: () => void;
  text: string;
  loadingText: string;
  icon?: React.ElementType;
  iconLeft?: boolean;
}

export function SubmitButton({
  disabled,
  submitting,
  handleSubmit,
  text,
  loadingText,
  icon = ArrowRight,
  iconLeft,
}: Props) {
  const Icon = icon;
  return (
    <button
      type="button"
      disabled={submitting || disabled}
      onClick={handleSubmit}
      className={cn(
        "w-full",
        "relative group overflow-hidden rounded-xl bg-ring px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all",
        "hover:-translate-y-0.5",
        "active:translate-y-0 active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      <span className="flex items-center justify-center gap-2 relative z-10">
        {!submitting && iconLeft && (
          <Icon className="w-4 h-4 transition-transform" />
        )}

        <div className="flex items-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? loadingText : text}
        </div>
        {!submitting && !iconLeft && (
          <Icon className="w-4 h-4 transition-transform" />
        )}
      </span>
    </button>
  );
}
