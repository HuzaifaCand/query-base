"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

type Attachment = Database["public"]["Tables"]["attachments"]["Row"];

interface AttachmentListProps {
  attachments: Attachment[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {},
  );
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Record<string, HTMLAudioElement>
  >({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [currentTimes, setCurrentTimes] = useState<Record<string, number>>({});

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    // Generate signed URLs for attachments
    const fetchSignedUrls = async () => {
      const urls: Record<string, string> = {};

      for (const attachment of attachments) {
        if (!attachment.file_path) continue;

        const { data } = await supabase.storage
          .from("attachments")
          .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

        if (data?.signedUrl) {
          urls[attachment.id] = data.signedUrl;
        }
      }
      setAttachmentUrls((prev) => ({ ...prev, ...urls }));
    };

    if (attachments && attachments.length > 0) {
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
      // Stop currently playing audio if any
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

        audio.ontimeupdate = () => {
          setCurrentTimes((prev) => ({
            ...prev,
            [attachmentId]: audio.currentTime,
          }));
        };

        audio.onended = () => {
          setIsPlaying(null);
          setCurrentTimes((prev) => ({ ...prev, [attachmentId]: 0 }));
        };
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

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.file_type.startsWith("image/"));
  const voiceNotes = attachments.filter((a) =>
    a.file_type.startsWith("audio/"),
  );

  const slides = images
    .filter((img) => attachmentUrls[img.id])
    .map((img) => ({
      src: attachmentUrls[img.id],
    }));

  const openLightbox = (attachmentId: string) => {
    // Find the current index among resolved image URLs
    const resolvedImages = images.filter((img) => attachmentUrls[img.id]);
    const index = resolvedImages.findIndex((img) => img.id === attachmentId);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Voice Notes */}
      {voiceNotes.map((vn) => {
        const isCurrentlyPlaying = isPlaying === vn.id;
        return (
          <div
            key={vn.id}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-300 shadow-sm max-w-sm",
              isCurrentlyPlaying
                ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                : "bg-muted/40 border-border/60 hover:border-primary/30 hover:bg-muted/60 hover:shadow-md",
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                attachmentUrls[vn.id] &&
                  toggleAudio(vn.id, attachmentUrls[vn.id]);
              }}
              disabled={!attachmentUrls[vn.id]}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
                "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
              )}
            >
              {!attachmentUrls[vn.id] ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : isCurrentlyPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-1" />
              )}
            </button>
            <div className="flex items-center justify-between gap-2 w-full mb-1">
              <div className="flex-1 flex flex-col justify-center min-w-0 pl-1 pr-2">
                <span className="text-xs font-semibold tracking-wide text-foreground">
                  Voice Note
                </span>
                <div className="h-5 flex items-center gap-[3px]">
                  {/* Visual representation of waveform */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-[2px] rounded-full transition-all duration-300",
                        isCurrentlyPlaying
                          ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]"
                          : "bg-primary/40",
                      )}
                      style={{
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full",
                  isCurrentlyPlaying
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {(() => {
                  const duration = durations[vn.id] || 0;
                  const currentTime = currentTimes[vn.id] || 0;
                  const remaining = Math.max(0, duration - currentTime);
                  return duration > 0 ? formatTime(remaining) : "Audio";
                })()}
              </div>
            </div>
          </div>
        );
      })}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-video rounded-lg overflow-hidden bg-muted border border-border/50 cursor-pointer"
              onClick={(e) => {
                if (attachmentUrls[img.id]) {
                  e.stopPropagation();
                  openLightbox(img.id);
                }
              }}
            >
              {attachmentUrls[img.id] ? (
                <img
                  src={attachmentUrls[img.id]}
                  alt="Attachment"
                  className="w-full h-full object-cover transition-transform"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                </div>
              )}
              {attachmentUrls[img.id] && (
                <div className="absolute inset-0 bg-black/0 transition-colors" />
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 bg-black/50 rounded-full text-white backdrop-blur-sm">
                  <ImageIcon className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for viewing images inside the tab */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Lightbox
          open={lightboxOpen}
          close={() => {
            // A tiny delay ensures the browser's click event resolves on the
            // lightbox backdrop BEFORE it unmounts, preventing it from
            // falling through to the QueryCard underneath.
            setTimeout(() => setLightboxOpen(false), 10);
          }}
          index={lightboxIndex}
          slides={slides}
          carousel={{ finite: true }}
          controller={{ closeOnBackdropClick: true }}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, .8)" } }}
        />
      </div>
    </div>
  );
}
