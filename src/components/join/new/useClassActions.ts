import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useClasses } from "@/contexts/ClassesContext";

export function useClassActions(onSuccess: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const { triggerRefetch } = useClasses();

  // --- TEACHER: Create Class ---
  const createClass = async (name: string, subject: string, level: string) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const classCode = generateClassCode();

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .insert({
          class_code: classCode,
          name: name,
          subject: subject.toLowerCase(),
          level: level,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (classError) throw classError;
      if (!classData) throw new Error("Failed to create class record");

      const { error: teacherError } = await supabase
        .from("class_teachers")
        .insert({
          class_id: classData.id,
          teacher_id: user.id,
        });

      if (teacherError) throw teacherError;

      toast.success("Class created successfully!");
      triggerRefetch();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create class");
    } finally {
      setSubmitting(false);
    }
  };

  // --- STUDENT: Join Class ---
  const joinClass = async (code: string) => {
    setSubmitting(true);
    try {
      // 1. Call the single RPC
      const { error } = await supabase.rpc("join_class_via_code", {
        p_class_code: code,
      });

      // 2. Handle specific RPC errors
      if (error) {
        if (error.message.includes("Already enrolled")) {
          // REFRESH HERE: Just in case their token is stale
          await supabase.auth.refreshSession();
          toast.info("You are already in this class!");
          triggerRefetch();
          onSuccess();
          return;
        }

        if (error.message.includes("Invalid or inactive class code")) {
          throw new Error("Invalid class code. Please check and try again.");
        }

        // Fallback for any other database errors
        throw error;
      }

      // 3. Success state
      // REFRESH HERE: Get the new token with is_enrolled: true
      await supabase.auth.refreshSession();

      toast.success("Joined class successfully!");
      triggerRefetch();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to join class");
    } finally {
      setSubmitting(false);
    }
  };

  return { createClass, joinClass, submitting };
}

// Helper to generate code (change ts later)
const generateClassCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
