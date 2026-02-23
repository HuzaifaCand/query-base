import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CreateQueryFormData, AnswerFormData } from "@/lib/validations/query";

type UploadType = "query" | "answer";

export async function uploadAttachment(
  id: string,
  type: UploadType,
  file: Blob | File,
  path: string,
  contentType: string,
) {
  // A. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  // B. Save to Database
  const { error: dbError } = await supabase.from("attachments").insert({
    query_id: type === "query" ? id : null,
    answer_id: type === "answer" ? id : null,
    file_path: path,
    file_type: contentType,
  });

  if (dbError) throw dbError;
}

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuery = async (
    classId: string,
    data: CreateQueryFormData,
    voiceBlob: Blob | null,
  ) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      const { data: queryData, error: queryError } = await supabase
        .from("queries")
        .insert({
          class_id: classId,
          student_id: user.id,
          title:
            data.title?.trim() ||
            data.description?.slice(0, 60) ||
            "Untitled Query",
          description: data.description?.trim() || null,
          has_vn: data.hasVoiceNote,
          is_private: data.isPrivate,
          is_anonymous: data.isAnonymous,
          status: "open",
        })
        .select("id")
        .single();

      if (queryError) throw queryError;
      const queryId = queryData.id;

      const uploadPromises: Promise<void>[] = [];

      // Query Paths: queries/[class_id]/[query_id]/[type]/[filename]
      if (data.hasVoiceNote && voiceBlob) {
        const path = `queries/${classId}/${queryId}/voice/vn_${Date.now()}.webm`;
        uploadPromises.push(
          uploadAttachment(queryId, "query", voiceBlob, path, "audio/webm"),
        );
      }

      if (data.images && data.images.length > 0) {
        const { compressImages } = await import("@/lib/imageCompression");
        const compressedImages = await compressImages(data.images, {
          maxWidth: 1920,
          quality: 0.8,
        });

        compressedImages.forEach((file, idx) => {
          const path = `queries/${classId}/${queryId}/images/img_${idx}_${Date.now()}.jpg`;
          uploadPromises.push(
            uploadAttachment(queryId, "query", file, path, "image/jpeg"),
          );
        });
      }

      await Promise.all(uploadPromises);

      // notify teachers about the new query
      fetch("/api/notify-new-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId, classId }),
      }).catch((err) =>
        console.error("Failed to send new-query notification:", err),
      );

      // Insert query_tags rows for each selected tag
      if (data.tags && data.tags.length > 0) {
        const { error: tagsError } = await supabase.from("query_tags").insert(
          data.tags.map((tagId) => ({
            query_id: queryId,
            tag_id: tagId,
          })),
        );
        if (tagsError) throw tagsError;
      }

      return true;
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit query",
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // IMPORTANT: Added classId parameter here!
  const submitAnswer = async (
    classId: string,
    queryId: string,
    data: AnswerFormData,
    voiceBlob: Blob | null,
  ) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Could not identify user. Please log in again.");
      }

      const { data: answerData, error: answerError } = await supabase
        .from("answers")
        .insert({
          query_id: queryId,
          author_id: user.id,
          body_text: data.bodyText?.trim() || null,
          is_official: true,
        })
        .select("id")
        .single();

      if (answerError) throw answerError;
      const answerId = answerData.id;

      const uploadPromises: Promise<void>[] = [];

      // Answer Paths: queries/[class_id]/[query_id]/answer/[type]/[filename]
      if (data.hasVoiceNote && voiceBlob) {
        const path = `queries/${classId}/${queryId}/answer/voice/vn_${Date.now()}.webm`;
        uploadPromises.push(
          uploadAttachment(answerId, "answer", voiceBlob, path, "audio/webm"),
        );
      }

      if (data.images && data.images.length > 0) {
        const { compressImages } = await import("@/lib/imageCompression");
        const compressedImages = await compressImages(data.images, {
          maxWidth: 1920,
          quality: 0.8,
        });

        compressedImages.forEach((file, idx) => {
          const path = `queries/${classId}/${queryId}/answer/images/img_${idx}_${Date.now()}.jpg`;
          uploadPromises.push(
            uploadAttachment(answerId, "answer", file, path, "image/jpeg"),
          );
        });
      }

      await Promise.all(uploadPromises);

      const { error: updateQueryError } = await supabase
        .from("queries")
        .update({
          answered_at: new Date().toISOString(),
          answered_by: user.id,
          status: "answered",
        })
        .eq("id", queryId);

      if (updateQueryError) throw updateQueryError;

      // Fire-and-forget: notify the student their query has been answered
      fetch("/api/notify-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId, answerId }),
      }).catch((err) =>
        console.error("Failed to send answer notification:", err),
      );

      return true;
    } catch (error) {
      console.error(
        "Error submitting answer:",
        error instanceof Error ? error.message : error,
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit answer. Please try again.",
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitQuery, submitAnswer, isSubmitting };
}
