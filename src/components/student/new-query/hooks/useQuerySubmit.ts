import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CreateQueryFormData } from "@/lib/validations/query";

export function useQuerySubmit(classId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuery = async (
    data: CreateQueryFormData,
    voiceBlob: Blob | null,
  ) => {
    setIsSubmitting(true);
    try {
      // 1. Auth Check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      // 2. Create Query Record
      const { data: queryData, error: queryError } = await supabase
        .from("queries")
        .insert({
          class_id: classId,
          student_id: user.id,
          title: data.description?.slice(0, 60) || "Voice Note Query",
          description: data.description || null,
          has_vn: data.hasVoiceNote,
          is_private: data.isPrivate,
          status: "open",
        })
        .select("id")
        .single();

      if (queryError) throw queryError;
      const queryId = queryData.id;

      // 3. Prepare Uploads
      const uploadPromises: Promise<any>[] = [];

      // --- Voice Note Handler ---
      if (data.hasVoiceNote && voiceBlob) {
        const path = `queries/${classId}/${queryId}/voice/vn_${Date.now()}.webm`;
        const promise = uploadAttachment(
          queryId,
          voiceBlob,
          path,
          "audio/webm",
        );
        uploadPromises.push(promise);
      }

      // --- Image Handler (with Compression) ---
      if (data.images && data.images.length > 0) {
        // Dynamic import for performance
        const { compressImages } = await import("@/lib/imageCompression");
        const compressedImages = await compressImages(data.images, {
          maxWidth: 1920,
          quality: 0.8,
        });

        compressedImages.forEach((file, idx) => {
          const path = `queries/${classId}/${queryId}/images/img_${idx}_${Date.now()}.jpg`;
          const promise = uploadAttachment(queryId, file, path, "image/jpeg");
          uploadPromises.push(promise);
        });
      }

      // 4. Execute all uploads parallelly
      await Promise.all(uploadPromises);

      return true; // Success
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit query");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitQuery, isSubmitting };
}

// Helper to handle Storage Upload + DB Insert atomically
async function uploadAttachment(
  queryId: string,
  file: Blob | File,
  path: string,
  type: string,
) {
  // A. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file, { contentType: type, upsert: false });

  if (uploadError) throw uploadError;

  // B. Insert into DB (The Fix: Explicitly checking error)
  const { error: dbError } = await supabase.from("attachments").insert({
    query_id: queryId,
    file_path: path,
    file_type: type,
  });

  // C. Throw if DB failed, so Promise.all catches it
  if (dbError) throw dbError;
}
