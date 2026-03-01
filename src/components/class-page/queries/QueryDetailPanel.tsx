"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  Lock,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/databasetypes";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AttachmentList } from "./AttachmentList";
import { EditableAttachmentList } from "./EditableAttachmentList";
import { EditAttachmentToolbar } from "./EditAttachmentToolbar";
import { UserHeader } from "./UserHeader";
import { AnswerPanel } from "./AnswerPanel";
import { AnswerView } from "./AnswerView";
import { FeatureToggle } from "./FeatureToggle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { uploadAttachment } from "@/hooks/useSubmit";
import ConfirmationModal from "@/components/layout/ConfirmationModal";
import { ImagePreview } from "@/components/student/new-query/components/ImagePreview";
import { VoiceNotePreview } from "@/components/student/new-query/components/VoiceNotePreview";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

type QueryTag = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

type Query = Database["public"]["Tables"]["queries"]["Row"] & {
  student: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
  answers: Answer[];
  query_tags: QueryTag[];
};

// ── Status badge config ─────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  open: "bg-warning-medium/10 text-warning-medium border-warning-medium/30",
  answered: "bg-ring/10 text-ring border-ring/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const MAX_IMAGES = 3;

interface QueryDetailPanelProps {
  query: Query | null;
  classId: string;
  role: "student" | "teacher" | "ta";
  onClose: () => void;
  onAnswered: () => void;
}

export function QueryDetailPanel({
  query,
  classId,
  role,
  onClose,
  onAnswered,
}: QueryDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const userId = useCurrentUser();

  // ── Query editing state ──
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSavingQuery, setIsSavingQuery] = useState(false);
  const [showDeleteQueryModal, setShowDeleteQueryModal] = useState(false);

  // ── New attachments during editing ──
  const [newImages, setNewImages] = useState<File[]>([]);
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorder = useVoiceRecorder();

  // Reset edit state when query changes
  useEffect(() => {
    setIsEditingQuery(false);
    setEditTitle("");
    setEditDescription("");
    setRemovedAttachmentIds(new Set());
    setNewImages([]);
    voiceRecorder.deleteVoiceNote();
  }, [query?.id]);

  // Lock body scroll when open
  useEffect(() => {
    if (query) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditingQuery) {
          setIsEditingQuery(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, isEditingQuery]);

  const isAnswered = !!query?.answered_at;
  const officialAnswer =
    query?.answers?.find((a) => a.is_official) ?? query?.answers?.[0] ?? null;

  const tags =
    query?.query_tags
      ?.map((qt) => qt.tags)
      .filter(
        (t): t is Database["public"]["Tables"]["tags"]["Row"] => t !== null,
      ) ?? [];

  const statusKey = query?.status ?? "open";
  const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["open"];

  const isTeacherLike = role === "teacher" || role === "ta";

  // Ownership + unanswered check for query editing
  const canEditQuery =
    !!userId && query?.student_id === userId && !query?.answered_by;

  const visibleAttachments =
    query?.attachments.filter((a) => !removedAttachmentIds.has(a.id)) ?? [];

  // Count existing voice notes to know if one is already present
  const existingVoiceNotes = visibleAttachments.filter((a) =>
    a.file_type.startsWith("audio/"),
  );
  const existingImages = visibleAttachments.filter((a) =>
    a.file_type.startsWith("image/"),
  );
  const hasAnyVoiceNote =
    existingVoiceNotes.length > 0 || voiceRecorder.hasVoiceNote;
  const totalImageCount = existingImages.length + newImages.length;
  const canAddMoreImages = totalImageCount < MAX_IMAGES;

  // ── New image handlers ──
  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const availableSlots = MAX_IMAGES - totalImageCount;
      const filesToAdd = files.slice(0, availableSlots);
      if (files.length > availableSlots) {
        toast.error(`Only ${availableSlots} more image(s) can be added`);
      }
      setNewImages((prev) => [...prev, ...filesToAdd]);
    }
    if (newImageInputRef.current) newImageInputRef.current.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Query edit handlers ──
  const handleStartEditQuery = () => {
    if (!query) return;
    setEditTitle(query.title || "");
    setEditDescription(query.description || "");
    setRemovedAttachmentIds(new Set());
    setNewImages([]);
    voiceRecorder.deleteVoiceNote();
    setIsEditingQuery(true);
  };

  const handleCancelEditQuery = () => {
    setIsEditingQuery(false);
    setEditTitle("");
    setEditDescription("");
    setRemovedAttachmentIds(new Set());
    setNewImages([]);
    voiceRecorder.deleteVoiceNote();
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setRemovedAttachmentIds((prev) => new Set(prev).add(attachmentId));
  };

  const handleSaveQuery = async () => {
    if (!query) return;

    const willHaveContent =
      editDescription.trim().length > 0 ||
      visibleAttachments.length > 0 ||
      newImages.length > 0 ||
      voiceRecorder.hasVoiceNote;

    if (!willHaveContent) {
      toast.error("Query must have a description or at least one attachment.");
      return;
    }

    setIsSavingQuery(true);
    try {
      // Update query text
      const hasNewVn = voiceRecorder.hasVoiceNote;
      const { error: updateError } = await supabase
        .from("queries")
        .update({
          title:
            editTitle.trim() ||
            editDescription.trim().slice(0, 60) ||
            "Untitled Query",
          description: editDescription.trim() || null,
          has_vn: hasAnyVoiceNote || hasNewVn,
          updated_at: new Date().toISOString(),
        })
        .eq("id", query.id);

      if (updateError) throw updateError;

      // Delete removed attachments
      for (const attachmentId of removedAttachmentIds) {
        const attachment = query.attachments.find((a) => a.id === attachmentId);
        if (attachment) {
          await supabase.storage
            .from("attachments")
            .remove([attachment.file_path]);
          await supabase.from("attachments").delete().eq("id", attachmentId);
        }
      }

      // Upload new voice note
      if (voiceRecorder.audioBlob) {
        const path = `queries/${classId}/${query.id}/voice/vn_${Date.now()}.webm`;
        await uploadAttachment(
          query.id,
          "query",
          voiceRecorder.audioBlob,
          path,
          "audio/webm",
        );
      }

      // Upload new images
      if (newImages.length > 0) {
        const { compressImages } = await import("@/lib/imageCompression");
        const compressedImages = await compressImages(newImages, {
          maxWidth: 1920,
          quality: 0.8,
        });
        for (let idx = 0; idx < compressedImages.length; idx++) {
          const path = `queries/${classId}/${query.id}/images/img_${idx}_${Date.now()}.jpg`;
          await uploadAttachment(
            query.id,
            "query",
            compressedImages[idx],
            path,
            "image/jpeg",
          );
        }
      }

      toast.success("Query updated successfully");
      setIsEditingQuery(false);
      setNewImages([]);
      voiceRecorder.deleteVoiceNote();
      onAnswered(); // re-fetch
    } catch (error) {
      console.error("Error updating query:", error);
      toast.error("Failed to update query");
    } finally {
      setIsSavingQuery(false);
    }
  };

  const handleDeleteQuery = async () => {
    if (!query) return;
    try {
      // Delete all attachments from storage + DB
      for (const attachment of query.attachments) {
        await supabase.storage
          .from("attachments")
          .remove([attachment.file_path]);
        await supabase.from("attachments").delete().eq("id", attachment.id);
      }

      // Delete query_tags
      await supabase.from("query_tags").delete().eq("query_id", query.id);

      // Delete the query
      const { error } = await supabase
        .from("queries")
        .delete()
        .eq("id", query.id);

      if (error) throw error;

      toast.success("Query deleted successfully");
      onClose();
      onAnswered(); // re-fetch
    } catch (error) {
      console.error("Error deleting query:", error);
      toast.error("Failed to delete query");
    }
  };

  return (
    <AnimatePresence>
      {query && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 h-screen"
            onClick={onClose}
          />

          {/* Slide-over panel */}
          {/* Slide-over panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="x"
            // FIX: Added left: 0 so the panel snaps back to the edge if the user aborts the swipe
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ right: 0, left: 1 }} // Linear drag feeling to the left
            // FIX: Locks the axis so dragging diagonally doesn't freeze the interaction
            dragDirectionLock={true}
            // FIX: Forces GPU acceleration and allows vertical scrolling inside the drag container
            style={{ willChange: "transform", touchAction: "pan-y" }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -100 || velocity.x < -500) {
                onClose();
              }
            }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex flex-col",
              "w-full sm:w-[560px] md:w-[620px] lg:w-[680px]",
              "bg-background",
            )}
          >
            {/* ── Panel Header ── */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border/40 bg-background/80 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Status badge */}
                {query.status && (
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0",
                      statusStyle,
                    )}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Feature toggle for teacher (post-answer) */}
                {isTeacherLike && isAnswered && (
                  <FeatureToggle
                    queryId={query.id}
                    isFeatured={!!query.is_featured}
                    featuredNote={query.featured_note}
                    onToggled={onAnswered}
                  />
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-150"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Featured note callout */}
              {query.is_featured && query.featured_note && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 px-5 sm:px-6 py-3 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {query.featured_note}
                  </p>
                </div>
              )}

              <div className="px-5 sm:px-6 py-5 space-y-5">
                {/* ── Author + edit/delete actions ── */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <UserHeader
                    name={
                      query.is_anonymous
                        ? "Anonymous"
                        : query.student?.full_name || null
                    }
                    createdAt={query.created_at}
                    role="student"
                    size="md"
                    isOwner={
                      !query.is_anonymous &&
                      !!userId &&
                      query.student_id === userId
                    }
                  />

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {query.is_private && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/40">
                        <Lock className="w-2.5 h-2.5" />
                        Private
                      </span>
                    )}
                    {query.is_anonymous && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/40">
                        <EyeOff className="w-2.5 h-2.5" />
                        Anonymous
                      </span>
                    )}

                    {/* Edit / Delete buttons — owner of unanswered query only */}
                    {canEditQuery && !isEditingQuery && (
                      <>
                        <button
                          type="button"
                          onClick={handleStartEditQuery}
                          className={cn(
                            "p-1.5 rounded-lg text-muted-foreground transition-colors duration-150",
                            "hover:text-foreground hover:bg-muted/60",
                          )}
                          aria-label="Edit query"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteQueryModal(true)}
                          className={cn(
                            "p-1.5 rounded-lg text-muted-foreground transition-colors duration-150",
                            "hover:text-destructive hover:bg-destructive/10",
                          )}
                          aria-label="Delete query"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Full body (view or edit mode) ── */}
                {isEditingQuery ? (
                  <div className="space-y-3">
                    {/* Title input */}
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Query title (optional)"
                      className={cn(
                        "w-full bg-background rounded-lg border border-input px-3 py-2.5 text-sm font-semibold outline-none",
                        "focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all",
                        "placeholder:text-muted-foreground/50",
                      )}
                    />

                    {/* Description textarea */}
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      maxLength={5000}
                      placeholder="Describe your question..."
                      className={cn(
                        "w-full bg-background rounded-lg border border-input px-3 py-2.5 text-sm outline-none resize-none",
                        "focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all",
                        "placeholder:text-muted-foreground/50",
                      )}
                    />

                    {/* Existing attachments (removable) */}
                    <EditableAttachmentList
                      attachments={visibleAttachments}
                      onRemove={handleRemoveAttachment}
                    />

                    {/* New image previews */}
                    {newImages.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                          New images
                        </p>
                        <ImagePreview
                          images={newImages}
                          onRemove={removeNewImage}
                        />
                      </div>
                    )}

                    {/* New voice note preview */}
                    {voiceRecorder.hasVoiceNote && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                          New voice note
                        </p>
                        <VoiceNotePreview
                          duration={voiceRecorder.displayTime}
                          isPlaying={voiceRecorder.isPlaying}
                          onTogglePlayback={voiceRecorder.togglePlayback}
                          onDelete={voiceRecorder.deleteVoiceNote}
                          formatTime={voiceRecorder.formatTime}
                        />
                      </div>
                    )}

                    {/* Toolbar for adding new attachments */}
                    <EditAttachmentToolbar
                      isRecording={voiceRecorder.isRecording}
                      recordingDuration={voiceRecorder.recordingDuration}
                      hasVoiceNote={hasAnyVoiceNote}
                      onStartRecording={voiceRecorder.startRecording}
                      onStopRecording={voiceRecorder.stopRecording}
                      formatTime={voiceRecorder.formatTime}
                      canAddMoreImages={canAddMoreImages}
                      onImageClick={() => newImageInputRef.current?.click()}
                      fileInputRef={newImageInputRef}
                      onImageChange={handleNewImageSelect}
                    />

                    {/* Save / Cancel actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEditQuery}
                        disabled={isSavingQuery}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                          "text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
                          "disabled:opacity-40 disabled:cursor-not-allowed",
                        )}
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveQuery}
                        disabled={isSavingQuery || voiceRecorder.isRecording}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold",
                          "bg-ring text-white shadow-sm",
                          "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
                          "active:translate-y-0 active:scale-[0.98]",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                        )}
                      >
                        {isSavingQuery ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {query.title && (
                      <h3 className="font-semibold text-lg leading-snug text-foreground">
                        {query.title}
                      </h3>
                    )}
                    {query.description && (
                      <p className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {query.description}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Full attachments (view mode only) ── */}
                {!isEditingQuery && (
                  <AttachmentList attachments={query.attachments} />
                )}

                {/* ── Tags ── */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full",
                          "text-[11px] font-medium",
                          "bg-ring/10 text-ring border border-ring/20",
                          "dark:bg-ring/15 dark:border-ring/30",
                        )}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Answer section ── */}
              {(isAnswered || isTeacherLike) && (
                <div className="mx-5 sm:mx-6 border-t border-border/50" />
              )}

              {/* Official answer */}
              {isAnswered && officialAnswer && (
                <div className="px-5 sm:px-6 pb-5 pt-4">
                  <AnswerView
                    answer={officialAnswer}
                    userId={userId}
                    queryId={query.id}
                    classId={classId}
                    onUpdated={onAnswered}
                  />
                </div>
              )}

              {/* Answer panel (teacher/TA only, unanswered) */}
              {!isAnswered && isTeacherLike && (
                <div className="px-5 sm:px-6 pb-5 pt-4">
                  <AnswerPanel
                    classId={classId}
                    queryId={query.id}
                    onAnswered={onAnswered}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Delete query confirmation modal */}
          <ConfirmationModal
            isOpen={showDeleteQueryModal}
            onClose={() => setShowDeleteQueryModal(false)}
            onConfirm={handleDeleteQuery}
            title="Delete Query"
            description="Are you sure you want to delete this query? This action cannot be undone."
            isDestructive
            confirmLabel="Delete Query"
          />
        </>
      )}
    </AnimatePresence>
  );
}
