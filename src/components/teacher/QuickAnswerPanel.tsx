"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useAnimation, useDragControls } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { answerSchema, AnswerFormData } from "@/lib/validations/query";
import { useSubmit } from "@/hooks/useSubmit";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useQueryInputHandlers } from "@/hooks/useQueryInputHandlers";
import { InputArea } from "@/components/student/new-query/components/InputArea";
import { cn } from "@/lib/utils";
import { PendingQuery } from "@/hooks/usePendingQueries";
import { formatDistanceToNow } from "date-fns";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  BookOpen,
  Lock,
  EyeOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AttachmentList } from "@/components/class-page/queries/AttachmentList";
import { featureQuery } from "../class-page/queries/AnswerPanel";
import { AnswerFeatureToggle } from "../class-page/queries/AnswerFeatureToggle";

interface QuickAnswerModalProps {
  queries: PendingQuery[];
  initialIndex?: number;
  onClose: () => void;
  onAnswered: (queryId: string) => void;
}

const MAX_BODY_LENGTH = 2000;

// Direction for the slide animation between queries
type SlideDirection = "left" | "right" | "none";

export function QuickAnswerPanel({
  queries,
  initialIndex = 0,
  onClose,
  onAnswered,
}: QuickAnswerModalProps) {
  const [featureForClass, setFeatureForClass] = useState(false);
  const [featuredNote, setFeaturedNote] = useState("");

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  // ── Modal open/close animation state ──────────────────────────────────────
  const [isVisible, setIsVisible] = useState(false); // drives CSS transition
  const [isClosing, setIsClosing] = useState(false);

  // ── Query slide animation state ────────────────────────────────────────────
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("none");
  const [isSliding, setIsSliding] = useState(false);
  // Separate "display" index so we can freeze the old content during the exit phase
  const [displayIndex, setDisplayIndex] = useState(initialIndex);

  // ── Form remount key ─────────────────────────────────────────────────────
  // InputArea registers its textarea as 'description', not 'bodyText', so
  // reset() alone won't clear the DOM. Bumping this key fully remounts the
  // form tree, wiping the textarea, voice recorder, and image state cleanly.
  const [formKey, setFormKey] = useState(0);

  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQuery = queries[displayIndex];
  const { submitAnswer } = useSubmit();

  // ── Form ──────────────────────────────────────────────────────────────────
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
    defaultValues: { bodyText: "", hasVoiceNote: false, images: [] },
  });

  const images = watch("images");
  const hasVoiceNote = watch("hasVoiceNote");
  const bodyText = watch("bodyText");
  const hasDraft =
    (bodyText?.trim().length ?? 0) > 0 ||
    hasVoiceNote ||
    (images && images.length > 0);

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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clearForm = useCallback(() => {
    // Bump the key to remount the entire form + InputArea subtree.
    // This is the only reliable way to clear the textarea DOM value and
    // all internal hook state (voice recorder, image upload) simultaneously.
    setFormKey((k) => k + 1);
    reset({ bodyText: "", hasVoiceNote: false, images: [] });
    voiceRecorder.deleteVoiceNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  // ── Mount: trigger slide-up open animation ────────────────────────────────
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    // Defer by one frame so the initial state (translated down) is painted first
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerClose();
      if (e.key === "ArrowLeft") navigate("prev");
      if (e.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, queries.length]);

  // ── Animated close ────────────────────────────────────────────────────────
  function triggerClose() {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    // Wait for CSS transition to finish before unmounting
    setTimeout(() => onClose(), 320);
  }

  // ── Animated query navigation ─────────────────────────────────────────────
  function navigate(dir: "prev" | "next") {
    if (isSliding) return;

    const nextIdx =
      dir === "prev"
        ? Math.max(0, currentIndex - 1)
        : Math.min(queries.length - 1, currentIndex + 1);

    if (nextIdx === currentIndex) return;

    const direction: SlideDirection = dir === "next" ? "left" : "right";

    setIsSliding(true);
    setSlideDirection(direction);

    // After exit animation (~200ms), swap content and clear the form
    setTimeout(() => {
      clearForm();
      setCurrentIndex(nextIdx);
      setDisplayIndex(nextIdx);
      scrollRef.current?.scrollTo({ top: 0 });
      // Trigger enter animation
      setSlideDirection("none");
      setTimeout(() => setIsSliding(false), 200);
    }, 180);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) triggerClose();
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<AnswerFormData> = async (data) => {
    const classId = currentQuery.class_id;
    const queryId = currentQuery.id;

    // Capture before state changes
    const isLastQuery = queries.length === 1;
    const nextIdx =
      currentIndex >= queries.length - 1 ? currentIndex - 1 : currentIndex;

    // Clear form immediately on submit
    clearForm();

    // Optimistic removal from parent
    onAnswered(queryId);

    if (isLastQuery) {
      triggerClose();
    } else {
      // Animate transition to next query
      setIsSliding(true);
      setSlideDirection("left");
      setTimeout(() => {
        setCurrentIndex(Math.max(0, nextIdx));
        setDisplayIndex(Math.max(0, nextIdx));
        scrollRef.current?.scrollTo({ top: 0 });
        setSlideDirection("none");
        setTimeout(() => setIsSliding(false), 200);
      }, 180);
    }

    // Background network call
    const success = await submitAnswer(
      classId,
      queryId,
      data,
      voiceRecorder.audioBlob,
    );

    if (success) {
      if (featureForClass) {
        await featureQuery(queryId, featuredNote);
      }
      toast.success("Answer sent!");
    }
  };

  if (!currentQuery) return null;

  const className = currentQuery.class?.name ?? "Unknown Class";
  const timeAgo = currentQuery.created_at
    ? formatDistanceToNow(new Date(currentQuery.created_at), {
        addSuffix: true,
      })
    : null;

  const tags =
    currentQuery.query_tags?.map((qt) => qt.tags).filter((t) => t !== null) ??
    [];

  // ── Slide-out CSS classes for the query content pane ─────────────────────
  const contentSlideClass =
    slideDirection === "left"
      ? "opacity-0 -translate-x-6"
      : slideDirection === "right"
        ? "opacity-0 translate-x-6"
        : "opacity-100 translate-x-0";

  const dragControls = useDragControls();

  const modalContent = (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Answer"
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        backgroundColor: isVisible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
        transition: "background-color 300ms ease",
      }}
    >
      {/* ── Modal panel ── */}
      <motion.div
        className={cn(
          "w-full h-[88vh] rounded-t-2xl overflow-hidden flex flex-col",
          "sm:max-w-4xl",
          "bg-card border border-border/60 shadow-2xl",
        )}
        initial={{ y: "100%" }}
        animate={{ y: isVisible ? "0%" : "100%" }}
        transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.y > 100 || velocity.y > 500) {
            triggerClose();
          }
        }}
      >
        {/* Pull handle - Draggable Area */}
        <div
          className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-10 h-1 rounded-full bg-border/60" />
        </div>

        {/* ── Header ── */}
        <div
          className="flex items-start justify-between gap-3 px-5 pt-3 pb-4 border-b border-border/50 shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex-1 min-w-0">
            {/* Class badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-full bg-ring/10 border border-ring/20">
              <BookOpen className="w-3 h-3 text-ring shrink-0" />
              <span className="text-[11px] font-semibold text-ring truncate max-w-[160px]">
                {className}
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={triggerClose}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Query body (scrollable, animated) ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          <div
            className={cn(
              "px-5 py-4 space-y-4",
              "transition-all duration-200 ease-in-out",
              contentSlideClass,
            )}
          >
            {/* Query title */}
            <h2 className="font-semibold text-base sm:text-lg leading-snug text-foreground">
              {currentQuery.title ?? "Untitled Query"}
            </h2>

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap -mt-1">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              {currentQuery.is_private && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/60">
                  <Lock className="w-2.5 h-2.5" />
                  Private
                </span>
              )}
              {currentQuery.is_anonymous && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/60">
                  <EyeOff className="w-2.5 h-2.5" />
                  Anonymous
                </span>
              )}
            </div>

            {/* Description */}
            {currentQuery.description && (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {currentQuery.description}
              </p>
            )}

            {/* Attachments */}
            {currentQuery.attachments?.length > 0 && (
              <AttachmentList attachments={currentQuery.attachments} />
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) =>
                  tag ? (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-ring/10 text-ring border border-ring/20"
                    >
                      {tag.name}
                    </span>
                  ) : null,
                )}
              </div>
            )}

            {/* ── Answer form ── */}
            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Answer
                </p>
                {hasDraft && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear draft
                  </button>
                )}
              </div>
              <form
                key={formKey}
                id="quick-answer-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
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

                <AnswerFeatureToggle
                  featureForClass={featureForClass}
                  setFeatureForClass={setFeatureForClass}
                  featuredNote={featuredNote}
                  setFeaturedNote={setFeaturedNote}
                />
              </form>
            </div>
          </div>
        </div>

        {/* ── Footer: navigation + submit ── */}
        <div className="shrink-0 px-5 py-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            {/* Gallery navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate("prev")}
                disabled={currentIndex === 0 || isSliding}
                aria-label="Previous query"
                className={cn(
                  "p-2 rounded-lg border transition-all duration-150",
                  currentIndex === 0 || isSliding
                    ? "opacity-30 cursor-not-allowed border-border/40 text-muted-foreground"
                    : "border-border/60 text-foreground hover:bg-muted/60 hover:border-border",
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-medium text-muted-foreground tabular-nums px-1">
                {currentIndex + 1} / {queries.length}
              </span>

              <button
                type="button"
                onClick={() => navigate("next")}
                disabled={currentIndex === queries.length - 1 || isSliding}
                aria-label="Next query"
                className={cn(
                  "p-2 rounded-lg border transition-all duration-150",
                  currentIndex === queries.length - 1 || isSliding
                    ? "opacity-30 cursor-not-allowed border-border/40 text-muted-foreground"
                    : "border-border/60 text-foreground hover:bg-muted/60 hover:border-border",
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("next")}
                disabled={currentIndex === queries.length - 1 || isSliding}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2"
              >
                Skip →
              </button>

              <button
                type="submit"
                form="quick-answer-form"
                disabled={
                  isSubmitting || voiceRecorder.isRecording || !hasDraft
                }
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold",
                  "bg-ring text-white shadow-md",
                  "hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200",
                  "active:translate-y-0 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Answer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
