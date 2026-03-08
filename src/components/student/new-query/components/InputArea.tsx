import { ImagePreview } from "./ImagePreview";
import { QueryInputToolbar } from "./QueryInputToolbar";
import { VoiceNotePreview } from "./VoiceNotePreview";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  voiceRecorder: ReturnType<typeof useVoiceRecorder>;
  imageUpload: ReturnType<typeof useImageUpload>;
  errors: any;
  hasVoiceNote: boolean;
  images: File[];
  register: any;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  getPlaceholder: () => string;
  handleDeleteVoiceNote: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  maxLength: number;
  queryPanel?: boolean;
}

export function InputArea({
  voiceRecorder,
  imageUpload,
  errors,
  hasVoiceNote,
  images,
  register,
  handleTextChange,
  handlePaste,
  getPlaceholder,
  handleDeleteVoiceNote,
  handleStartRecording,
  handleStopRecording,
  maxLength,
  queryPanel,
}: InputAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl + Right Arrow or Ctrl + Left Arrow
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "ArrowRight" || e.key === "ArrowLeft")
    ) {
      // Stop the browser from navigating or the app from seeing the shortcut
      e.preventDefault();
      e.stopPropagation();
      console.log("Blocked history shortcut in InputArea");
    }
  };
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card transition-all shadow-sm",
        errors.description && !hasVoiceNote
          ? "border-destructive/50"
          : "border-input",
      )}
    >
      {/* Image Preview - Above Textarea */}
      <ImagePreview images={images || []} onRemove={imageUpload.removeImage} />

      {/* Text Area */}
      <textarea
        {...register("description")}
        onChange={handleTextChange}
        onPaste={handlePaste}
        rows={4}
        placeholder={getPlaceholder()}
        className={cn(
          "w-full bg-transparent px-4 py-3.5 text-sm outline-none resize-none placeholder:text-muted-foreground/50",
          errors.description && !hasVoiceNote && "border-destructive/50",
          queryPanel && "lg:text-base",
        )}
        maxLength={maxLength}
        onKeyDown={handleKeyDown}
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
  );
}
