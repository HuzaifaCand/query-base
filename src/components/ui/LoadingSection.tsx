import { Loader2 } from "lucide-react";

export function LoadingSection({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{text}...</p>
      </div>
    </div>
  );
}
