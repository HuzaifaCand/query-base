"use client";

import { useRef, useState, useEffect } from "react";
import { CheckCircle2, Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { AttachmentList } from "./AttachmentList";
import { EditableAttachmentList } from "./EditableAttachmentList";
import { EditAttachmentToolbar } from "./EditAttachmentToolbar";
import { UserHeader } from "./UserHeader";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { uploadAttachment } from "@/hooks/useSubmit";
import ConfirmationModal from "@/components/layout/ConfirmationModal";
import { ImagePreview } from "@/components/student/new-query/components/ImagePreview";
import { VoiceNotePreview } from "@/components/student/new-query/components/VoiceNotePreview";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

const MAX_IMAGES = 3;

interface AnswerViewProps {
  answer: Answer;
  userId?: string | null;
  queryId?: string;
  classId?: string;
  onUpdated?: () => void;
  onDraftChange?: (hasDraft: boolean) => void;
}

export function AnswerView({
  answer,
  userId,
  queryId,
  classId,
  onUpdated,
  onDraftChange,
}: AnswerViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(answer.body_text || "");
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── New attachments during editing ──
  const [newImages, setNewImages] = useState<File[]>([]);
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorder = useVoiceRecorder();

  useEffect(() => {
    onDraftChange?.(isEditing);
  }, [isEditing, onDraftChange]);

  const isOwner = !!userId && answer.author_id === userId;

  const visibleAttachments = answer.attachments.filter(
    (a) => !removedAttachmentIds.has(a.id),
  );

  // Count existing to respect limits
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

  const handleStartEdit = () => {
    setEditText(answer.body_text || "");
    setRemovedAttachmentIds(new Set());
    setNewImages([]);
    voiceRecorder.deleteVoiceNote();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(answer.body_text || "");
    setRemovedAttachmentIds(new Set());
    setNewImages([]);
    voiceRecorder.deleteVoiceNote();
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setRemovedAttachmentIds((prev) => new Set(prev).add(attachmentId));
  };

  const handleSaveEdit = async () => {
    const willHaveContent =
      editText.trim().length > 0 ||
      visibleAttachments.length > 0 ||
      newImages.length > 0 ||
      voiceRecorder.hasVoiceNote;

    if (!willHaveContent) {
      toast.error("Answer must have text or at least one attachment.");
      return;
    }

    setIsSaving(true);
    try {
      // Update answer text
      const hasNewVn = voiceRecorder.hasVoiceNote;
      const { error: updateError } = await supabase
        .from("answers")
        .update({
          body_text: editText.trim() || null,
          has_vn: hasAnyVoiceNote || hasNewVn,
          updated_at: new Date().toISOString(),
        })
        .eq("id", answer.id);

      if (updateError) throw updateError;

      // Delete removed attachments
      for (const attachmentId of removedAttachmentIds) {
        const attachment = answer.attachments.find(
          (a) => a.id === attachmentId,
        );
        if (attachment) {
          await supabase.storage
            .from("attachments")
            .remove([attachment.file_path]);
          await supabase.from("attachments").delete().eq("id", attachmentId);
        }
      }

      // Upload new voice note
      if (voiceRecorder.audioBlob && queryId && classId) {
        const path = `queries/${classId}/${queryId}/answer/voice/vn_${Date.now()}.webm`;
        await uploadAttachment(
          answer.id,
          "answer",
          voiceRecorder.audioBlob,
          path,
          "audio/webm",
        );
      }

      // Upload new images
      if (newImages.length > 0 && queryId && classId) {
        const { compressImages } = await import("@/lib/imageCompression");
        const compressedImages = await compressImages(newImages, {
          maxWidth: 1920,
          quality: 0.8,
        });
        for (let idx = 0; idx < compressedImages.length; idx++) {
          const path = `queries/${classId}/${queryId}/answer/images/img_${idx}_${Date.now()}.jpg`;
          await uploadAttachment(
            answer.id,
            "answer",
            compressedImages[idx],
            path,
            "image/jpeg",
          );
        }
      }

      toast.success("Answer updated successfully");
      setIsEditing(false);
      setNewImages([]);
      voiceRecorder.deleteVoiceNote();
      onUpdated?.();
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Failed to update answer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Delete all attachments from storage + DB
      for (const attachment of answer.attachments) {
        await supabase.storage
          .from("attachments")
          .remove([attachment.file_path]);
        await supabase.from("attachments").delete().eq("id", attachment.id);
      }

      // Delete the answer
      const { error: deleteError } = await supabase
        .from("answers")
        .delete()
        .eq("id", answer.id);

      if (deleteError) throw deleteError;

      // Reset the parent query status back to open
      if (queryId) {
        await supabase
          .from("queries")
          .update({
            answered_by: null,
            answered_at: null,
            status: "open",
          })
          .eq("id", queryId);
      }

      toast.success("Answer deleted successfully");
      onUpdated?.();
    } catch (error) {
      console.error("Error deleting answer:", error);
      toast.error("Failed to delete answer");
    }
  };

  return (
    <div className="bg-ring/5 rounded-xl p-4 sm:p-5 border border-ring/10">
      <div className="flex flex-col gap-3">
        {/* Answer header */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ring tracking-wider uppercase mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Answer</span>
            </div>

            {/* Edit/Delete actions — only for owner */}
            {isOwner && !isEditing && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className={cn(
                    "p-1.5 rounded-lg text-muted-foreground transition-colors duration-150",
                    "hover:text-foreground hover:bg-muted/60",
                  )}
                  aria-label="Edit answer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className={cn(
                    "p-1.5 rounded-lg text-muted-foreground transition-colors duration-150",
                    "hover:text-destructive hover:bg-destructive/10",
                  )}
                  aria-label="Delete answer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <UserHeader
            name={answer.author?.full_name || "Teacher"}
            createdAt={answer.created_at}
            role="teacher"
            size="sm"
            isOfficial={!!answer.is_official}
            isOwner={isOwner}
          />
        </div>

        {/* Answer body */}
        <div className="pl-[2.25rem]">
          {isEditing ? (
            <div className="space-y-3">
              {/* Editable text */}
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                maxLength={2000}
                className={cn(
                  "w-full bg-background rounded-lg border border-input px-3 py-2.5 text-sm outline-none resize-none",
                  "focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all",
                  "placeholder:text-muted-foreground/50",
                )}
                placeholder="Edit your answer..."
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
                  <ImagePreview images={newImages} onRemove={removeNewImage} />
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
                  onClick={handleCancelEdit}
                  disabled={isSaving}
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
                  onClick={handleSaveEdit}
                  disabled={isSaving || voiceRecorder.isRecording}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold",
                    "bg-ring text-white shadow-sm",
                    "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
                    "active:translate-y-0 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                  )}
                >
                  {isSaving ? (
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
            <>
              {answer.body_text && (
                <p className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {answer.body_text}
                </p>
              )}
              <div className="mt-3">
                <AttachmentList attachments={answer.attachments} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Answer"
        description="Are you sure you want to delete this answer? This action cannot be undone."
        isDestructive
        confirmLabel="Delete Answer"
      />
    </div>
  );
}
