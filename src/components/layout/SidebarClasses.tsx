"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Palette,
  Music,
  Code,
  Brain,
  Languages,
  GraduationCap,
  Loader,
  Apple,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/databasetypes";
import { cn } from "@/lib/utils";
import { useClasses } from "@/contexts/ClassesContext";

const subjectConfig: Record<
  string,
  { gradient: string; icon: React.ComponentType<{ className?: string }> }
> = {
  mathematics: {
    gradient: "from-blue-500/60 to-indigo-600/60",
    icon: Calculator,
  },
  math: {
    gradient: "from-blue-500/60 to-indigo-600/60",
    icon: Calculator,
  },
  science: {
    gradient: "from-green-500/60 to-emerald-600/60",
    icon: Beaker,
  },
  physics: {
    gradient: "from-purple-500/60 to-violet-600/60",
    icon: Apple,
  },
  chemistry: {
    gradient: "from-pink-500/60 to-rose-600/60",
    icon: Beaker,
  },
  biology: {
    gradient: "from-teal-500/60 to-cyan-600/60",
    icon: Beaker,
  },
  english: {
    gradient: "from-amber-500/60 to-orange-600/60",
    icon: BookOpen,
  },
  literature: {
    gradient: "from-amber-500/60 to-orange-600/60",
    icon: BookOpen,
  },
  history: {
    gradient: "from-yellow-500/60 to-amber-600/60",
    icon: Globe,
  },
  geography: {
    gradient: "from-emerald-500/60 to-green-600/60",
    icon: Globe,
  },
  art: {
    gradient: "from-fuchsia-500/60 to-pink-600/60",
    icon: Palette,
  },
  music: {
    gradient: "from-violet-500/60 to-purple-600/60",
    icon: Music,
  },
  "computer science": {
    gradient: "from-slate-500/60 to-gray-700/60",
    icon: Code,
  },
  programming: {
    gradient: "from-slate-500/60 to-gray-700/60",
    icon: Code,
  },
  psychology: {
    gradient: "from-indigo-500/60 to-blue-600/60",
    icon: Brain,
  },
  language: {
    gradient: "from-cyan-500/60 to-blue-600/60",
    icon: Languages,
  },
  default: {
    gradient: "from-gray-500/60 to-slate-600/60",
    icon: GraduationCap,
  },
};

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
                  {!isActive && (
                    <div
                      className={`absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-8 translate-x-8 bg-primary opacity-10 ${isActive ? "" : "group-hover:bg-ring dark:group-hover:opacity-100 group-hover:opacity-40 transition-all duration-150"}`}
                    />
                  )}
                  {isActive && (
                    <div className={`absolute inset-0 opacity-10`}>
                      <div
                        className={`absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-8 translate-x-8 bg-white`}
                      />
                      <div
                        className={`absolute bottom-0 left-0 w-12 h-12 rounded-full translate-y-6 -translate-x-6 bg-white`}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-2 py-2">
                    <div
                      className={`p-1.5 bg-white/20 ${!isActive ? "dark:group-hover:bg-ring group-hover:bg-ring/40 text-white transition-all duration-150" : ""} backdrop-blur-sm rounded-md`}
                    >
                      <Icon
                        className={`w-3 h-3 ${isActive ? "text-white" : "text-primary"}`}
                      />
                    </div>
                    <span
                      className={`text-xs ${isActive ? "dark:text-primary text-white font-semibold" : "text-primary font-medium dark:font-light"} truncate drop-shadow-sm`}
                    >
                      {classData.name}
                    </span>
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
