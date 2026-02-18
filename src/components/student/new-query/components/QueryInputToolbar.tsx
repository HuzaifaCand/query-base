import { Mic, Image as ImageIcon, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryInputToolbarProps {
  isRecording: boolean;
  recordingDuration: number;
  hasVoiceNote: boolean;
  canAddMoreImages: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onImageClick: () => void;
  formatTime: (seconds: number) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function QueryInputToolbar({
  isRecording,
  recordingDuration,
  hasVoiceNote,
  canAddMoreImages,
  onStartRecording,
  onStopRecording,
  onImageClick,
  formatTime,
  fileInputRef,
  onImageChange,
}: QueryInputToolbarProps) {
  return (
    <div className="border-t border-border p-2.5 flex items-center justify-between bg-muted/20 rounded-b-xl">
      {isRecording ? (
        /* Recording UI */
        <div className="flex-1 flex items-center gap-3 px-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
            {formatTime(recordingDuration)}
          </span>
          <span className="text-xs text-muted-foreground">Recording...</span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onStopRecording}
            className="flex items-center gap-1 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <StopCircle className="w-3.5 h-3.5" /> Stop
          </button>
        </div>
      ) : (
        /* Standard Toolbar */
        <div className="flex items-center gap-1 w-full">
          {/* File Input Hidden */}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageChange}
          />

          {/* Image Button */}
          <button
            type="button"
            onClick={onImageClick}
            disabled={!canAddMoreImages}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-colors",
              !canAddMoreImages
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={
              !canAddMoreImages ? "Maximum images reached" : "Attach images"
            }
          >
            <ImageIcon className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          {/* Voice Button */}
          <button
            type="button"
            onClick={onStartRecording}
            disabled={hasVoiceNote}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-colors",
              hasVoiceNote
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={
              hasVoiceNote ? "Voice note already recorded" : "Record voice note"
            }
          >
            <Mic className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
