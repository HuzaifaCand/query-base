export function ComingSoon({
  text,
  icon,
}: {
  text: string;
  icon: React.ElementType;
}) {
  const Icon = icon;
  return (
    <div className="border-1 border-border/40 text-muted-foreground flex items-center justify-center ">
      <div className="py-12 px-4 flex flex-col gap-4 items-center">
        <Icon className="w-8 h-8 text-textMuted" />
        <p className="text-xs sm:text-sm">{text}</p>
      </div>
    </div>
  );
}
