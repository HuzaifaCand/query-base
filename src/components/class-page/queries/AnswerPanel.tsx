"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { answerSchema, AnswerFormData } from "@/lib/validations/query";

import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  MessageSquareReply,
  ChevronDown,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";

import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useSubmit } from "@/hooks/useSubmit";
import { useQueryInputHandlers } from "@/hooks/useQueryInputHandlers";

import { InputArea } from "@/components/student/new-query/components/InputArea";

const MAX_BODY_LENGTH = 2000;

interface AnswerPanelProps {
  classId: string;
  queryId: string;
  onAnswered: () => void;
}

export function AnswerPanel({
  classId,
  queryId,
  onAnswered,
}: AnswerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { submitAnswer } = useSubmit();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      bodyText: "",
      hasVoiceNote: false,
      images: [],
    },
  });

  const images = watch("images");
  const hasVoiceNote = watch("hasVoiceNote");
  const bodyText = watch("bodyText");

  const voiceRecorder = useVoiceRecorder();
  const imageUpload = useImageUpload(images, setValue);

  const {
    handleStartRecording,
    handleStopRecording,
    handleDeleteVoiceNote,
    handleTextChange,
    handlePaste,
    getPlaceholder,
  } = useQueryInputHandlers({
    type: "answer",
    voiceRecorder,
    imageUpload,
    hasVoiceNote,
    images,
    setValue,
    trigger,
  });

  const hasContent =
    bodyText.trim().length > 0 || hasVoiceNote || (images && images.length > 0);

  const onSubmit: SubmitHandler<AnswerFormData> = async (data) => {
    const success = await submitAnswer(
      classId,
      queryId,
      data,
      voiceRecorder.audioBlob,
    );
    if (success) {
      toast.success("Answer submitted successfully!");
      reset();
      voiceRecorder.deleteVoiceNote();
      setIsExpanded(false);
      onAnswered();
    }
  };

  // 1. Toggle purely controls visibility now, no data destruction
  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  // 2. Dedicated cancel handler with smart confirmation
  const handleCancel = () => {
    if (hasContent) {
      const confirmed = window.confirm(
        "Are you sure you want to discard your draft? This cannot be undone.",
      );
      if (!confirmed) return;
    }

    setIsExpanded(false);
    reset();
    voiceRecorder.deleteVoiceNote();
  };

  return (
    <div className="space-y-3">
      {/* Main Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border",
          isExpanded
            ? "bg-muted/50 border-transparent text-muted-foreground"
            : hasContent
              ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 shadow-sm" // Highlight state if there's a draft
              : "bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm",
        )}
      >
        <div className="flex items-center gap-2">
          {hasContent && !isExpanded ? (
            <PenLine className="w-4 h-4" />
          ) : (
            <MessageSquareReply className="w-4 h-4" />
          )}
          <span>
            {isExpanded
              ? "Hide Answer Panel"
              : hasContent
                ? "Resume Draft..."
                : "Write an Answer"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {/* Expandable Form Area */}
      {isExpanded && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <InputArea
            voiceRecorder={voiceRecorder}
            imageUpload={imageUpload}
            errors={errors}
            hasVoiceNote={hasVoiceNote}
            images={images}
            register={register}
            handleTextChange={handleTextChange}
            handlePaste={handlePaste}
            getPlaceholder={getPlaceholder}
            handleDeleteVoiceNote={handleDeleteVoiceNote}
            handleStartRecording={handleStartRecording}
            handleStopRecording={handleStopRecording}
            maxLength={MAX_BODY_LENGTH}
          />

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-xs font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
            >
              Cancel & Discard
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || voiceRecorder.isRecording || !hasContent
              }
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold",
                "bg-ring text-white shadow-sm",
                "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
                "active:translate-y-0 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm",
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
                  Answer
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
