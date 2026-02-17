import { Play, Pause, Trash2 } from "lucide-react";

interface VoiceNotePreviewProps {
  duration: number;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onDelete: () => void;
  formatTime: (seconds: number) => string;
}

export function VoiceNotePreview({
  duration,
  isPlaying,
  onTogglePlayback,
  onDelete,
  formatTime,
}: VoiceNotePreviewProps) {
  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3 rounded-lg">
        <button
          type="button"
          onClick={onTogglePlayback}
          className="p-2 bg-background text-primary rounded-full hover:bg-muted transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
        <div className="flex-1 flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Voice Note
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
