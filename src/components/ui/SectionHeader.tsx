import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  rightSlot?: React.ReactNode;
  becomesCol?: boolean;
}

export default function SectionHeader({
  title,
  rightSlot,
  becomesCol = true,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "pb-4 lg:border-b border-primary/5 flex text-primary mb-8",
        becomesCol === true
          ? "flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-end"
          : "justify-between items-end",
      )}
    >
      <h1 className="text-[1.6875rem] sm:text-3xl font-bold dark:font-semibold">
        {title}
      </h1>
      {rightSlot && (
        <div className="text-xs [@media(min-width:360px)]:text-sm text-muted">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
