"use client";

import { useRef } from "react";
import { Mic, Image as ImageIcon, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditAttachmentToolbarProps {
  /** Voice recorder state */
  isRecording: boolean;
  recordingDuration: number;
  hasVoiceNote: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  formatTime: (seconds: number) => string;
  /** Image state */
  canAddMoreImages: boolean;
  onImageClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Compact toolbar for adding new attachments (images + voice notes) during
 * query/answer editing. Follows the same logic as QueryInputToolbar but uses
 * a slightly different, more compact design suited for the edit context.
 */
export function EditAttachmentToolbar({
  isRecording,
  recordingDuration,
  hasVoiceNote,
  onStartRecording,
  onStopRecording,
  formatTime,
  canAddMoreImages,
  onImageClick,
  fileInputRef,
  onImageChange,
}: EditAttachmentToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 pt-1">
      {isRecording ? (
        /* Recording indicator */
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-left-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium tabular-nums text-red-600 dark:text-red-400">
            {formatTime(recordingDuration)}
          </span>
          <button
            type="button"
            onClick={onStopRecording}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-medium rounded-md transition-colors"
          >
            <StopCircle className="w-3 h-3" /> Stop
          </button>
        </div>
      ) : (
        /* Standard add buttons */
        <>
          {/* Voice note button */}
          <button
            type="button"
            onClick={onStartRecording}
            disabled={hasVoiceNote}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
              hasVoiceNote
                ? "text-muted-foreground/40 border-border/30 cursor-not-allowed"
                : "text-muted-foreground border-border/60 hover:bg-muted/60 hover:text-foreground hover:border-border",
            )}
            title={
              hasVoiceNote ? "Voice note already added" : "Record a voice note"
            }
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Note
          </button>

          {/* Image button */}
          <button
            type="button"
            onClick={onImageClick}
            disabled={!canAddMoreImages}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
              !canAddMoreImages
                ? "text-muted-foreground/40 border-border/30 cursor-not-allowed"
                : "text-muted-foreground border-border/60 hover:bg-muted/60 hover:text-foreground hover:border-border",
            )}
            title={
              !canAddMoreImages ? "Maximum images reached" : "Attach images"
            }
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Image
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageChange}
          />
        </>
      )}
    </div>
  );
}
