import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface UserHeaderProps {
  name: string | null;
  createdAt?: string | null;
  role?: "student" | "teacher" | "ta";
  isOfficial?: boolean;
  size?: "sm" | "md";
}

export function UserHeader({
  name,
  createdAt,
  role = "student",
  isOfficial = false,
  size = "md",
}: UserHeaderProps) {
  const isTeacher = role === "teacher" || role === "ta" || isOfficial;
  const initial = name?.[0]?.toUpperCase() || "?";

  return (
    <div className={cn("flex items-center", size === "md" ? "gap-3" : "gap-2")}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold shrink-0",
          size === "md"
            ? "h-10 w-10 text-lg uppercase"
            : "h-6 w-6 text-xs uppercase",
          isTeacher ? "bg-ring/15 text-ring" : "bg-primary/10 text-primary",
        )}
      >
        {initial}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-foreground",
              size === "md" ? "font-semibold" : "font-medium text-sm",
            )}
          >
            {name || "Unknown User"}
          </span>
        </div>
        {createdAt && (
          <span className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}
