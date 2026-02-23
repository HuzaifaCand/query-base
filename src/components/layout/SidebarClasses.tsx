"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/databasetypes";
import { cn } from "@/lib/utils";
import { useClasses } from "@/contexts/ClassesContext";
import { subjectConfig } from "@/components/teacher/ClassCard";

interface SidebarClassesProps {
  role: "teacher" | "student";
}

export default function SidebarClasses({ role }: SidebarClassesProps) {
  const [classes, setClasses] = useState<Tables<"classes">[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { refetchTrigger } = useClasses();

  useEffect(() => {
    async function fetchClasses() {
      const table = role === "student" ? "class_students" : "class_teachers";
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Not authenticated");

        // Fetch classes where the current user is a teacher/student
        const { data: userClasses, error: userClassesError } = await supabase
          .from(table)
          .select("class_id")
          .eq(role === "student" ? "student_id" : "teacher_id", user.id);

        if (userClassesError) throw userClassesError;

        if (!userClasses || userClasses.length === 0) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const classIds = userClasses.map((uc) => uc.class_id);

        // Fetch class details
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*")
          .in("id", classIds)
          .order("created_at", { ascending: false });

        if (classesError) throw classesError;

        setClasses(classesData || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [role, refetchTrigger]);

  if (!loading && classes.length === 0) {
    return null;
  }

  const baseRoute = role === "teacher" ? "/teacher" : "/dashboard";

  return (
    <div className="px-2 pb-4">
      {/* Section Heading */}
      <div className="px-2 py-2 mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          Classes
        </h3>
      </div>

      {/* Classes List */}
      {loading && (
        <div className="flex h-24 items-center justify-center">
          <Loader className="w-3 h-3 rounded-full text-ring animate-spin" />
        </div>
      )}
      {!loading && (
        <div className="space-y-2">
          {classes.map((classData) => {
            const classHref = `${baseRoute}/${classData.id}`;
            const isActive = pathname.startsWith(classHref);

            // Get subject configuration
            const subjectKey = classData.subject?.toLowerCase() || "default";
            const config = subjectConfig[subjectKey] || subjectConfig.default;
            const Icon = config.icon;

            return (
              <Link
                key={classData.id}
                href={classHref}
                className={cn(
                  "block rounded-lg overflow-hidden transition-all duration-200 hover:cursor-pointer group",
                )}
              >
                <div
                  className={`bg-gradient-to-br ${isActive ? config.gradient : "bg-muted dark:hover:bg-ring/40 hover:bg-ring/20"} transition-all duration-150 relative overflow-hidden`}
                >
                  <div className="flex items-center gap-2 px-2 py-2">
                    <div
                      className={`p-1.5 bg-white/20 ${!isActive ? "dark:group-hover:bg-ring text-white transition-all duration-150" : ""} backdrop-blur-sm rounded-md`}
                    >
                      <Icon
                        className={`w-3 h-3 ${isActive ? "text-white" : "text-primary"}`}
                      />
                    </div>
                    <div
                      className={`text-xs ${isActive ? "dark:text-primary text-white font-semibold" : "text-primary font-medium dark:font-light"} truncate drop-shadow-sm mt-0.5`}
                    >
                      {classData.name}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
