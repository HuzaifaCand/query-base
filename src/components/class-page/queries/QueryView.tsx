"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Play, Pause, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";

type Query = Database["public"]["Tables"]["queries"]["Row"] & {
  student: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

interface QueryViewProps {
  query: Query;
}

export function QueryView({ query }: QueryViewProps) {
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {},
  );
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Record<string, HTMLAudioElement>
  >({});

  useEffect(() => {
    // Generate signed URLs for attachments
    const fetchSignedUrls = async () => {
      const urls: Record<string, string> = {};

      for (const attachment of query.attachments) {
        if (!attachment.file_path) continue;

        const { data, error } = await supabase.storage
          .from("attachments")
          .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

        if (data?.signedUrl) {
          urls[attachment.id] = data.signedUrl;
        }
      }
      setAttachmentUrls(urls);
    };

    if (query.attachments?.length > 0) {
      fetchSignedUrls();
    }
  }, [query.attachments]);

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
        audio.onended = () => setIsPlaying(null);
        setAudioElements((prev) => ({ ...prev, [attachmentId]: audio }));
      }

      audio.play();
      setIsPlaying(attachmentId);
    }
  };

  const images = query.attachments.filter((a) =>
    a.file_type.startsWith("image/"),
  );
  const voiceNotes = query.attachments.filter((a) =>
    a.file_type.startsWith("audio/"),
  );

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg uppercase shrink-0">
            {query.student?.full_name?.[0] || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {query.student?.full_name || "Unknown Student"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {query.created_at &&
                formatDistanceToNow(new Date(query.created_at), {
                  addSuffix: true,
                })}
            </p>
          </div>
        </div>
        {query.status && (
          <div
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium border",
              query.status === "resolved"
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                : "bg-ring/20 dark:bg-ring/10 text-ring border-ring/10",
            )}
          >
            {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {query.title && <h4 className="font-medium text-lg">{query.title}</h4>}
        {query.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {query.description}
          </p>
        )}
      </div>

      {/* Attachments */}
      {(images.length > 0 || voiceNotes.length > 0) && (
        <div className="space-y-3 pt-2">
          {/* Voice Notes */}
          {voiceNotes.map((vn) => (
            <div
              key={vn.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 max-w-md"
            >
              <button
                onClick={() =>
                  attachmentUrls[vn.id] &&
                  toggleAudio(vn.id, attachmentUrls[vn.id])
                }
                disabled={!attachmentUrls[vn.id]}
                className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {!attachmentUrls[vn.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying === vn.id ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="h-8 flex items-center gap-1">
                  {/* Visual representation of waveform - simplified */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 rounded-full transition-all duration-300",
                        isPlaying === vn.id
                          ? "bg-primary animate-pulse"
                          : "bg-muted-foreground/30",
                      )}
                      style={{
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                Voice Note
              </span>
            </div>
          ))}

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-video rounded-lg overflow-hidden bg-muted border border-border/50"
                >
                  {attachmentUrls[img.id] ? (
                    <img
                      src={attachmentUrls[img.id]}
                      alt="Attachment"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    </div>
                  )}
                  {attachmentUrls[img.id] && (
                    <a
                      href={attachmentUrls[img.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                      aria-label="View full size"
                    />
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
        </div>
      )}
    </div>
  );
}
