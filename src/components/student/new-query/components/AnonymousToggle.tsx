import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonymousToggleProps {
  isAnonymous: boolean;
  onToggle: () => void;
}

export function AnonymousToggle({
  isAnonymous,
  onToggle,
}: AnonymousToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle()}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isAnonymous
          ? "bg-muted/50 text-muted-foreground hover:bg-muted"
          : "bg-ring/10 text-ring hover:bg-ring/20",
      )}
    >
      {isAnonymous ? (
        <EyeOff className="w-3 h-3" />
      ) : (
        <Eye className="w-3 h-3" />
      )}
      {isAnonymous ? (
        <span className="mt-0.5">Anonymous</span>
      ) : (
        <span className="mt-0.5">Visible</span>
      )}
    </button>
  );
}
