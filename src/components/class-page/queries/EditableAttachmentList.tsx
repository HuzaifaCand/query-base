"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Image as ImageIcon, Loader2, X, Mic } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";

type Attachment = Database["public"]["Tables"]["attachments"]["Row"];

interface EditableAttachmentListProps {
  attachments: Attachment[];
  onRemove: (attachmentId: string) => void;
}

/**
 * Renders existing attachments (images + voice notes) with a remove (X) button
 * on each one. Used during edit mode for queries and answers.
 */
export function EditableAttachmentList({
  attachments,
  onRemove,
}: EditableAttachmentListProps) {
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {},
  );
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Record<string, HTMLAudioElement>
  >({});
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchSignedUrls = async () => {
      const urls: Record<string, string> = {};
      for (const attachment of attachments) {
        if (!attachment.file_path) continue;
        const { data } = await supabase.storage
          .from("attachments")
          .createSignedUrl(attachment.file_path, 3600);
        if (data?.signedUrl) {
          urls[attachment.id] = data.signedUrl;
        }
      }
      setAttachmentUrls((prev) => ({ ...prev, ...urls }));
    };

    if (attachments.length > 0) {
      fetchSignedUrls();
    }
  }, [attachments]);

  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach((audio) => audio.pause());
    };
  }, [audioElements]);

  const toggleAudio = (attachmentId: string, url: string) => {
    if (isPlaying === attachmentId) {
      audioElements[attachmentId]?.pause();
      setIsPlaying(null);
    } else {
      if (isPlaying && audioElements[isPlaying]) {
        audioElements[isPlaying].pause();
      }
      const audio = audioElements[attachmentId] || new Audio(url);
      if (!audioElements[attachmentId]) {
        audio.onloadedmetadata = () => {
          setDurations((prev) => ({
            ...prev,
            [attachmentId]: audio.duration,
          }));
        };
        audio.onended = () => setIsPlaying(null);
        setAudioElements((prev) => ({ ...prev, [attachmentId]: audio }));
      }
      audio.play();
      setIsPlaying(attachmentId);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => a.file_type.startsWith("image/"));
  const voiceNotes = attachments.filter((a) =>
    a.file_type.startsWith("audio/"),
  );

  return (
    <div className="space-y-3 pt-1">
      {/* Voice Notes */}
      {voiceNotes.map((vn) => {
        const isCurrentlyPlaying = isPlaying === vn.id;
        return (
          <div
            key={vn.id}
            className={cn(
              "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
              "bg-primary/5 border-primary/20 hover:border-primary/30",
            )}
          >
            {/* Mic icon badge */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-primary" />
            </div>

            {/* Label + waveform */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Voice Note
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full",
                    isCurrentlyPlaying
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {durations[vn.id] ? formatTime(durations[vn.id]) : "Audio"}
                </span>
              </div>
              {/* Mini waveform */}
              <div className="flex items-center gap-[2px] h-4">
                {[3, 6, 10, 7, 12, 8, 5, 9, 11, 6, 4, 8, 10, 7, 5].map(
                  (h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className={cn(
                        "w-[2px] rounded-full transition-all duration-300",
                        isCurrentlyPlaying
                          ? "bg-primary animate-pulse"
                          : "bg-primary/40",
                      )}
                    />
                  ),
                )}
              </div>
            </div>

            {/* Play/Pause */}
            <button
              type="button"
              onClick={() =>
                attachmentUrls[vn.id] &&
                toggleAudio(vn.id, attachmentUrls[vn.id])
              }
              disabled={!attachmentUrls[vn.id]}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-primary/10 hover:bg-primary/20 text-primary",
                "hover:scale-105 active:scale-95",
              )}
              aria-label={
                isCurrentlyPlaying ? "Pause voice note" : "Play voice note"
              }
            >
              {!attachmentUrls[vn.id] ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isCurrentlyPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(vn.id)}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                "hover:scale-105 active:scale-95",
              )}
              aria-label="Remove voice note"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:scale-[1.02]"
            >
              {attachmentUrls[img.id] ? (
                <img
                  src={attachmentUrls[img.id]}
                  alt="Attachment"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none" />

              {/* Image badge */}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                <ImageIcon className="w-2.5 h-2.5 text-white/80" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className={cn(
                  "absolute top-1 right-1 p-1 rounded-full z-10 transition-all duration-200",
                  "bg-black/60 hover:bg-red-500 text-white",
                  "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
                  "hover:scale-110 active:scale-95",
                )}
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
