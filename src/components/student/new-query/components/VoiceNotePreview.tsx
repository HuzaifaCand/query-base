import { Play, Pause, Trash2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceNotePreviewProps {
  duration: number;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onDelete: () => void;
  formatTime: (seconds: number) => string;
  className?: string;
}

/** Decorative static waveform bars */
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const heights = [3, 6, 10, 7, 12, 8, 5, 9, 11, 6, 4, 8, 10, 7, 5];
  return (
    <div className="flex items-center gap-[2px] h-5">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}px` }}
          className={cn(
            "w-[2px] rounded-full transition-all duration-300",
            isPlaying ? "bg-primary animate-pulse" : "bg-primary/40",
          )}
        />
      ))}
    </div>
  );
}

export function VoiceNotePreview({
  duration,
  isPlaying,
  onTogglePlayback,
  onDelete,
  formatTime,
  className,
}: VoiceNotePreviewProps) {
  return (
    <div className={cn("px-3 pb-2", className)}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
          "bg-primary/5 border-primary/20 hover:border-primary/30",
        )}
      >
        {/* Mic icon badge */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Mic className="w-3.5 h-3.5 text-primary" />
        </div>

        {/* Waveform + label */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Voice Note
            </span>
            <span
              className={cn(
                "text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full",
                isPlaying
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {formatTime(duration)}
            </span>
          </div>
          <WaveformBars isPlaying={isPlaying} />
        </div>

        {/* Play/Pause button */}
        <button
          type="button"
          onClick={onTogglePlayback}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            "bg-primary/10 hover:bg-primary/20 text-primary",
            "hover:scale-105 active:scale-95",
          )}
          aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            "hover:scale-105 active:scale-95",
          )}
          aria-label="Delete voice note"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
