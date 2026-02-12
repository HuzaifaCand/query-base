import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-primary animate-spin opacity-80" />
    </div>
  );
}
