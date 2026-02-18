"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export function TeacherStudentsList() {
  const params = useParams();
  const classId = params.classId as string;
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) return;

      const { data, error } = await supabase
        .from("class_students")
        .select(
          `
          *,
          users:student_id (*)
        `,
        )
        .eq("class_id", classId);

      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    };

    fetchStudents();
  }, [classId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading students...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No students enrolled in this class yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Enrolled Students ({students.length})
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((record) => {
          const student = record.users;
          return (
            <div
              key={record.id}
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {student?.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium">
                    {student?.display_name || "Unknown Student"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student?.email}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
