"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/databasetypes";
import { LoadingSection } from "../ui/LoadingSection";

interface StudentWithDetails {
  id: string;
  student_id: string;
  class_id: string;
  joined_at: string | null;
  full_name: string | null;
  email: string;
}

interface ClassWithStudents {
  classData: Tables<"classes">;
  students: StudentWithDetails[];
}

export function AllStudentsList() {
  const [classesWithStudents, setClassesWithStudents] = useState<
    ClassWithStudents[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
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
        const { data: teacherClasses, error: teacherError } = await supabase
          .from("class_teachers")
          .select("class_id")
          .eq("teacher_id", user.id);

        if (teacherError) throw teacherError;

        if (!teacherClasses || teacherClasses.length === 0) {
          setClassesWithStudents([]);
          setLoading(false);
          return;
        }

        const classIds = teacherClasses.map((tc) => tc.class_id);

        // Fetch class details
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*")
          .in("id", classIds)
          .order("created_at", { ascending: false });

        if (classesError) throw classesError;

        // For each class, fetch students with their user details
        const classesWithStudentsData = await Promise.all(
          (classesData || []).map(async (classData) => {
            const { data: classStudents, error: studentsError } = await supabase
              .from("class_students")
              .select(
                `
                  id,
                  student_id,
                  class_id,
                  joined_at,
                  users!class_students_student_id_fkey (
                    full_name,
                    email
                  )
                `,
              )
              .eq("class_id", classData.id)
              .order("joined_at", { ascending: true });

            if (studentsError) {
              console.error("Error fetching students:", studentsError);
              return { classData, students: [] };
            }

            // Transform the data to flatten the users object
            const studentsWithDetails: StudentWithDetails[] = (
              classStudents || []
            ).map((cs: any) => ({
              id: cs.id,
              student_id: cs.student_id,
              class_id: cs.class_id,
              joined_at: cs.joined_at,
              full_name: cs.users?.full_name || null,
              email: cs.users?.email || "Unknown",
            }));

            return { classData, students: studentsWithDetails };
          }),
        );

        setClassesWithStudents(classesWithStudentsData);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load students",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  if (loading) {
    return <LoadingSection text="Loading Students" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Students
          </h3>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const totalStudents = classesWithStudents.reduce(
    (acc, cls) => acc + cls.students.length,
    0,
  );

  if (totalStudents === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Students Yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Students will appear here once they join your classes using the
            class code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {classesWithStudents.map(
        ({ classData, students }) =>
          students.length > 0 && (
            <div key={classData.id} className="space-y-4">
              {/* Class Heading */}
              <div className="pb-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {classData.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {students.length} student{students.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Students Table */}
              <div className="rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                        Student Name
                      </th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {student.full_name || "Unnamed Student"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {student.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* Empty actions column for future functionality */}
                          <div className="flex justify-end gap-2">
                            {/* Actions will go here */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ),
      )}
    </div>
  );
}
