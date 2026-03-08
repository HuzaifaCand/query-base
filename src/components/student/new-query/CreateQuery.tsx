"use client";

import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createQuerySchema,
  CreateQueryFormData,
} from "@/lib/validations/query";
import { Send, Loader2, Tag, Lightbulb, Eye, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InputInfo } from "@/components/join/ClassCodeInput";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/databasetypes";
import ModalBase from "@/components/layout/ModalBase";

// Hooks
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useSubmit } from "@/hooks/useSubmit";
import { useQueryInputHandlers } from "@/hooks/useQueryInputHandlers";
import { useInvalidateQueries } from "@/hooks/queries/useInvalidateQueries";

// Components
import { PrivacyToggle } from "./components/PrivacyToggle";
import { AnonymousToggle } from "./components/AnonymousToggle";
import { InputArea } from "./components/InputArea";

type Tag = Tables<"tags">;

const MAX_DESCRIPTION_LENGTH = 1500;

const TITLE_PLACEHOLDERS = [
  "e.g. Query about lecture 17",
  "e.g. Past paper question on integration",
  "e.g. Confused about the chain rule example",
  "e.g. Practice problem from chapter 5",
  "e.g. Derivation from yesterday's class",
  "e.g. Unsure about the last step in proof 3",
  "e.g. Question on the May 2022 past paper",
];

export function CreateQuery({ classId }: { classId: string }) {
  // Pick a random title placeholder once per mount
  const titlePlaceholder = useMemo(
    () =>
      TITLE_PLACEHOLDERS[Math.floor(Math.random() * TITLE_PLACEHOLDERS.length)],
    [],
  );
  const { submitQuery, isSubmitting } = useSubmit();
  const invalidate = useInvalidateQueries();

  // Tag state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    async function fetchTags() {
      setTagsLoading(true);
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("class_id", classId)
        .order("name");

      if (error) {
        console.error("Failed to load tags:", error);
        toast.error("Could not load tags. Please refresh and try again.");
      } else {
        setAvailableTags(data ?? []);
      }
      setTagsLoading(false);
    }
    fetchTags();
  }, [classId]);

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
      isAnonymous: false,
      tags: [],
    },
  });

  const isPrivate = watch("isPrivate");
  const isAnonymous = watch("isAnonymous");
  const images = watch("images");
  const hasVoiceNote = watch("hasVoiceNote");
  const selectedTags = watch("tags");

  const voiceRecorder = useVoiceRecorder();
  const imageUpload = useImageUpload(images, setValue);

  const toggleTag = (tagId: string) => {
    const current = selectedTags ?? [];
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setValue("tags", updated, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<CreateQueryFormData> = async (data) => {
    const success = await submitQuery(classId, data, voiceRecorder.audioBlob);

    if (success) {
      toast.success("Query submitted successfully!");
      invalidate();

      // Reset everything
      reset();
      voiceRecorder.deleteVoiceNote();
    }
  };

  const {
    handleStartRecording,
    handleStopRecording,
    handleDeleteVoiceNote,
    handleTextChange,
    handlePaste,
    getPlaceholder,
  } = useQueryInputHandlers({
    type: "query",
    voiceRecorder,
    imageUpload,
    hasVoiceNote,
    images,
    setValue,
    trigger,
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-24">
        {/* Header — Toggles + privacy context */}
        <div className="mb-2">
          <div className="flex items-center justify-end gap-2">
            {/* <button
              type="button"
              onClick={() => setShowInstructions(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <InfoIcon className="w-4 h-4" />
            </button> */}
            <div className="flex items-center justify-end gap-2">
              {!isPrivate && (
                <AnonymousToggle
                  isAnonymous={isAnonymous}
                  onToggle={() => setValue("isAnonymous", !isAnonymous)}
                />
              )}
              <PrivacyToggle
                isPrivate={isPrivate}
                onToggle={() => setValue("isPrivate", !isPrivate)}
              />
            </div>
          </div>
        </div>

        {/* ── Optional Title ── */}
        <div className="space-y-1">
          <input
            {...register("title")}
            type="text"
            id="query-title"
            placeholder={titlePlaceholder}
            maxLength={120}
            className={cn(
              "w-full bg-transparent text-sm sm:text-sm font-medium placeholder:text-muted-foreground/50",
              "border-0 border-b border-border/50 focus:border-ring/50 pb-2 pt-1",
              "outline-none transition-colors duration-150",
              "text-foreground",
            )}
          />
          <p className="flex items-center justify-end gap-1 mt-1 text-[11px] text-muted-foreground/70">
            <Lightbulb className="w-3 h-3 shrink-0" />
            Optional — a clear title helps your teacher respond faster
          </p>
        </div>

        {/* UNIFIED INPUT AREA */}
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
          maxLength={MAX_DESCRIPTION_LENGTH}
          queryPanel={true}
        />

        {/* Validation Error – description */}
        {errors.description && !hasVoiceNote && (
          <p className="text-xs text-destructive flex items-center gap-1 px-1">
            Please provide a description or record a voice note
          </p>
        )}

        {/* ── TAG PICKER ── */}
        <div className="pt-1 pb-0.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span>Select topic tags </span>
          </div>

          {tagsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading tags…
            </div>
          ) : availableTags.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No tags have been set up for this class yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = (selectedTags ?? []).includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "min-h-[36px]",
                      isSelected
                        ? "bg-ring text-white border-ring shadow-sm"
                        : "bg-transparent text-muted-foreground border-border hover:border-ring/60 hover:text-foreground",
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tag validation error */}
          {errors.tags && (
            <p className="text-xs text-destructive flex items-center gap-1">
              {errors.tags.message ?? "Please select at least one tag"}
            </p>
          )}
        </div>

        {/* ── Footer: desktop inline / mobile sticky ── */}

        {/* Desktop footer */}
        <div className="hidden sm:flex w-full justify-end gap-4">
          <div className="mt-2">
            <button
              type="submit"
              disabled={isSubmitting || voiceRecorder.isRecording}
              className={cn(
                "px-6 py-2.5 relative group rounded-lg bg-ring text-sm font-semibold text-white shadow-md transition-all",
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
        </div>

        {/* Mobile sticky submit bar */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-sm px-4 py-3 safe-area-pb">
          <button
            type="submit"
            disabled={isSubmitting || voiceRecorder.isRecording}
            className={cn(
              "w-full py-3 rounded-xl bg-ring text-sm font-semibold text-white shadow-lg transition-all",
              "flex items-center justify-center gap-2",
              "active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Query
              </>
            )}
          </button>
        </div>
      </form>

      {/* <ModalBase
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        className="max-w-sm sm:max-w-md"
        hideCloseButton={false}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-ring/10 text-ring rounded-full flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-6">
            Asking is simple.
          </h2>
          <div className="text-muted-foreground text-sm space-y-4 w-full">
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-ring/10 text-ring flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                1
              </div>
              <p className="pt-1">
                <strong className="text-foreground font-semibold">
                  Snap or Paste:
                </strong>{" "}
                Add a photo or just type out your question.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-ring/10 text-ring flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                2
              </div>
              <p className="pt-1">
                <strong className="text-foreground font-semibold">
                  Add a Title:
                </strong>{" "}
                A quick summary helps your teacher respond faster.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-ring/10 text-ring flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                3
              </div>
              <p className="pt-1">
                <strong className="text-foreground font-semibold">
                  Tag & Submit:
                </strong>{" "}
                Select the relevant chapter tags and you're done!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="w-full mt-8 py-3 rounded-xl bg-ring text-white font-medium hover:bg-ring/90 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </ModalBase> */}
    </>
  );
}
