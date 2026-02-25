import { Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacyToggleProps {
  isPrivate: boolean;
  onToggle: () => void;
}

export function PrivacyToggle({ isPrivate, onToggle }: PrivacyToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle()}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isPrivate
          ? "bg-warning-medium/10 text-warning-medium hover:bg-warning-medium/20"
          : "bg-ring/10 text-ring hover:bg-ring/20",
      )}
    >
      {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
      {isPrivate ? <span>Private</span> : <span>Public</span>}
    </button>
  );
}
