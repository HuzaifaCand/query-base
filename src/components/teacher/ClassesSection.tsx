"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/databasetypes";
import ClassCard from "@/components/teacher/ClassCard";
import AddClassCard from "@/components/teacher/AddClassCard";
import { useClasses } from "@/contexts/ClassesContext";

interface ClassWithTeacherAndStudentCount extends Tables<"classes"> {
  teacher: string;
  studentCount: number;
}

export default function ClassesSection({
  role,
}: {
  role: "student" | "teacher" | "ta";
}) {
  const [classes, setClasses] = useState<ClassWithTeacherAndStudentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refetchTrigger } = useClasses();

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
        const { data: classes, error: fetchError } = await supabase
          .from(table)
          .select("class_id")
          .eq(role === "student" ? "student_id" : "teacher_id", user.id);

        if (fetchError) throw fetchError;

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

        const classesWithTeachers = await Promise.all(
          (classesData || []).map(async (classData) => {
            if (!classData.created_by) {
              return { ...classData, teacher: "Unknown Teacher" };
            }

            const { data: teacherUser, error: teacherUserError } =
              await supabase
                .from("users")
                .select("full_name")
                .eq("id", classData.created_by)
                .maybeSingle();

            if (teacherUserError) {
              console.error(
                "Error fetching teacher details:",
                teacherUserError,
              );
              return { ...classData, teacher: "Unknown Teacher" };
            }

            return {
              ...classData,
              teacher: teacherUser?.full_name || "Unknown Teacher",
            };
          }),
        );
        // Fetch student counts for each class
        const classesWithCounts = await Promise.all(
          (classesWithTeachers || []).map(async (classData) => {
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
        console.error(
          "Error fetching classes:",
          err instanceof Error ? err.message : "Failed to load classes",
        );
        setError(err instanceof Error ? err.message : "Failed to load classes");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [refetchTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="group relative h-[280px] overflow-hidden rounded-xl bg-card border border-border shadow-md flex flex-col"
          >
            {/* Gradient Header Skeleton */}
            <div className="h-32 bg-muted/30 animate-pulse relative overflow-hidden" />

            {/* Content Skeleton */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="space-y-2 mb-4">
                <div className="h-6 w-3/4 bg-muted/40 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted/40 animate-pulse rounded" />
              </div>

              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-muted/40 animate-pulse rounded-md" />
                <div className="h-6 w-20 bg-muted/40 animate-pulse rounded-md" />
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted/40 animate-pulse" />
                  <div className="h-4 w-20 bg-muted/40 animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-12 bg-muted/40 animate-pulse rounded" />
                  <div className="h-5 w-16 bg-muted/40 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
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
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Classes Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Get started by creating your first class. You can add students and
            start managing your teaching materials.
          </p>
        </div>
        {role !== "ta" && <AddClassCard role={role} />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((classData) => (
        <ClassCard
          key={classData.id}
          classData={classData}
          studentCount={classData.studentCount}
          teacher={classData.teacher}
          role={role}
        />
      ))}
      {role !== "ta" && <AddClassCard role={role} />}
    </div>
  );
}
