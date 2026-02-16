"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/databasetypes";
import ClassCard from "@/components/teacher/ClassCard";
import AddClassCard from "@/components/teacher/AddClassCard";
import { Loader2 } from "lucide-react";

interface ClassWithStudentCount extends Tables<"classes"> {
  studentCount: number;
}

export default function ClassesSection({
  role,
}: {
  role: "student" | "teacher" | "ta";
}) {
  const [classes, setClasses] = useState<ClassWithStudentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      const table = role === "student" ? "class_students" : "class_teachers";
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Not authenticated");

        // Fetch classes where the current user is a teacher
        const { data: classes, error: teacherError } = await supabase
          .from(table)
          .select("class_id")
          .eq(role === "student" ? "student_id" : "teacher_id", user.id);

        if (teacherError) throw teacherError;

        if (!classes || classes.length === 0) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const classIds = classes.map((tc) => tc.class_id);

        // Fetch class details
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*")
          .in("id", classIds)
          .order("created_at", { ascending: false });

        if (classesError) throw classesError;

        // Fetch student counts for each class
        const classesWithCounts = await Promise.all(
          (classesData || []).map(async (classData) => {
            const { count, error: countError } = await supabase
              .from("class_students")
              .select("*", { count: "exact", head: true })
              .eq("class_id", classData.id);

            if (countError) {
              console.error("Error fetching student count:", countError);
              return { ...classData, studentCount: 0 };
            }

            return { ...classData, studentCount: count || 0 };
          }),
        );

        setClasses(classesWithCounts);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err instanceof Error ? err.message : "Failed to load classes");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Classes
          </h3>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="max-w-md text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Classes Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Get started by creating your first class. You can add students and
            start managing your teaching materials.
          </p>
          <div className="max-w-xs mx-auto">
            <AddClassCard role={role} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classData) => (
        <ClassCard
          key={classData.id}
          classData={classData}
          studentCount={classData.studentCount}
        />
      ))}
      <AddClassCard role={role} />
    </div>
  );
}
