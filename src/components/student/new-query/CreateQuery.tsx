"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createQuerySchema,
  CreateQueryFormData,
} from "@/lib/validations/query";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InputInfo } from "@/components/join/ClassCodeInput";

// Hooks
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useImageUpload } from "./hooks/useImageUpload";
import { useQuerySubmit } from "./hooks/useQuerySubmit";

// Components
import { ImagePreview } from "./components/ImagePreview";
import { VoiceNotePreview } from "./components/VoiceNotePreview";
import { QueryInputToolbar } from "./components/QueryInputToolbar";
import { PrivacyToggle } from "./components/PrivacyToggle";

const MAX_DESCRIPTION_LENGTH = 1500;

export function CreateQuery({ classId }: { classId: string }) {
  const { submitQuery, isSubmitting } = useQuerySubmit(classId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateQueryFormData>({
    resolver: zodResolver(createQuerySchema),
    defaultValues: {
      description: "",
      hasVoiceNote: false,
      isPrivate: false,
      images: [],
    },
  });

  const isPrivate = watch("isPrivate");
  const images = watch("images");
  const hasVoiceNote = watch("hasVoiceNote");

  // Voice recording hook
  const voiceRecorder = useVoiceRecorder();

  // Image upload hook
  const imageUpload = useImageUpload(images, setValue);

  const onSubmit: SubmitHandler<CreateQueryFormData> = async (data) => {
    const success = await submitQuery(data, voiceRecorder.audioBlob);

    if (success) {
      toast.success("Query submitted successfully!");

      // Reset everything
      reset();
      voiceRecorder.deleteVoiceNote();

      // Optional: Navigation
      // router.push(`/dashboard/${classId}`);
    }
  };

  // Handle voice recording start with form update
  const handleStartRecording = async () => {
    await voiceRecorder.startRecording();
  };

  // Handle voice recording stop with form update
  const handleStopRecording = () => {
    voiceRecorder.stopRecording();
    setValue("hasVoiceNote", true, { shouldValidate: true });
    trigger("description");
  };

  // Handle voice note deletion with form update
  const handleDeleteVoiceNote = () => {
    voiceRecorder.deleteVoiceNote();
    setValue("hasVoiceNote", false, { shouldValidate: true });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      );
      return;
    }
    setValue("description", value, { shouldValidate: true });
  };

  const getPlaceholder = () => {
    if (hasVoiceNote) {
      return "Add more context to your voice note (optional)...";
    }
    if (images && images.length > 0) {
      return "Describe what you need help with...";
    }
    return "Describe your question, attach images (Ctrl+V to paste), or record a voice note...";
  };

  // Handle paste event for images
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    // Extract image files from clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length === 0) return;

    // Prevent default paste behavior for images
    e.preventDefault();

    const currentImages = images || [];
    const maxImages = imageUpload.maxImages;

    if (currentImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const availableSlots = maxImages - currentImages.length;
    const filesToAdd = imageFiles.slice(0, availableSlots);

    if (imageFiles.length > availableSlots) {
      toast.error(`Only ${availableSlots} more image(s) can be added`);
    }

    setValue("images", [...currentImages, ...filesToAdd], {
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="hidden sm:flex" />
        <div className="sm:hidden">
          <InputInfo
            text={
              isPrivate
                ? "Only you and your teacher can see this question"
                : "All students in the class can see and learn from this"
            }
          />
        </div>

        <div className="flex items-center justify-end">
          <PrivacyToggle
            isPrivate={isPrivate}
            onToggle={() => setValue("isPrivate", !isPrivate)}
          />
        </div>
      </div>

      {/* UNIFIED INPUT AREA */}
      <div
        className={cn(
          "relative rounded-xl border bg-card transition-all shadow-sm",
          errors.description && !hasVoiceNote
            ? "border-destructive/50"
            : "border-input",
        )}
      >
        {/* Image Preview - Above Textarea */}
        <ImagePreview
          images={images || []}
          onRemove={imageUpload.removeImage}
        />

        {/* Text Area */}
        <textarea
          {...register("description")}
          onChange={handleDescriptionChange}
          onPaste={handlePaste}
          rows={5}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm lg:text-base outline-none resize-none placeholder:text-muted-foreground/50"
          maxLength={MAX_DESCRIPTION_LENGTH}
        />

        {/* Voice Note Preview - Below Textarea */}
        {hasVoiceNote && (
          <VoiceNotePreview
            duration={voiceRecorder.displayTime}
            isPlaying={voiceRecorder.isPlaying}
            onTogglePlayback={voiceRecorder.togglePlayback}
            onDelete={handleDeleteVoiceNote}
            formatTime={voiceRecorder.formatTime}
          />
        )}

        {/* Toolbar / Recording State */}
        <QueryInputToolbar
          isRecording={voiceRecorder.isRecording}
          recordingDuration={voiceRecorder.recordingDuration}
          hasVoiceNote={hasVoiceNote}
          canAddMoreImages={imageUpload.canAddMore}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onImageClick={imageUpload.triggerFileInput}
          formatTime={voiceRecorder.formatTime}
          fileInputRef={imageUpload.fileInputRef}
          onImageChange={imageUpload.handleImageSelect}
        />
      </div>

      {/* Validation Error */}
      {errors.description && !hasVoiceNote && (
        <p className="text-xs text-destructive flex items-center gap-1 px-1">
          Please provide a description or record a voice note
        </p>
      )}

      {/* Footer */}
      <div className="flex items-start justify-between gap-4">
        <div className="sm:hidden" />

        <div className="hidden sm:flex">
          <InputInfo
            text={
              isPrivate
                ? "Only you and your teacher can see this question"
                : "All students in the class can see and learn from this"
            }
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || voiceRecorder.isRecording}
          className={cn(
            "px-6 py-2.5 relative group rounded-lg bg-ring text-xs sm:text-sm font-semibold text-white shadow-md transition-all",
            "hover:-translate-y-0.5",
            "flex items-center gap-2",
            "active:translate-y-0 active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0",
            "whitespace-nowrap",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Submit Query
            </>
          )}
        </button>
      </div>
    </form>
  );
}
