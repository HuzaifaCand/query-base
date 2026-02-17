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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Find the Class ID based on the Code
      const { data: classRecord, error: findError } = await supabase
        .from("classes")
        .select("id")
        .eq("class_code", code)
        .single();

      if (findError || !classRecord) {
        throw new Error("Invalid class code. Please check and try again.");
      }

      // 2. Insert into Join Table (using class_id, NOT code)
      const { error: joinError } = await supabase
        .from("class_students")
        .insert({
          class_id: classRecord.id,
          student_id: user.id,
        });

      // Handle duplicate join gracefully (Postgres code 23505 is unique violation)
      if (joinError?.code === "23505") {
        toast.info("You are already in this class!");
        triggerRefetch();
        onSuccess();
        return;
      }

      if (joinError) throw joinError;

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
