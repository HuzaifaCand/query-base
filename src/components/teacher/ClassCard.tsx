"use client";

import { motion } from "framer-motion";
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
  Users,
  GraduationCap,
  Copy,
  Apple,
} from "lucide-react";
import type { Tables } from "@/lib/databasetypes";
import { toast } from "sonner";
import Link from "next/link";
import { on } from "events";

// Subject to color and icon mapping
export const subjectConfig: Record<
  string,
  { gradient: string; icon: React.ComponentType<{ className?: string }> }
> = {
  mathematics: {
    gradient: "from-blue-500 to-indigo-600",
    icon: Calculator,
  },
  math: {
    gradient: "from-blue-500 to-indigo-600",
    icon: Calculator,
  },
  science: {
    gradient: "from-green-500 to-emerald-600",
    icon: Beaker,
  },
  physics: {
    gradient: "from-purple-500 to-violet-600",
    icon: Apple,
  },
  chemistry: {
    gradient: "from-pink-500 to-rose-600",
    icon: Beaker,
  },
  biology: {
    gradient: "from-teal-500 to-cyan-600",
    icon: Beaker,
  },
  english: {
    gradient: "from-amber-500 to-orange-600",
    icon: BookOpen,
  },
  literature: {
    gradient: "from-amber-500 to-orange-600",
    icon: BookOpen,
  },
  history: {
    gradient: "from-yellow-500 to-amber-600",
    icon: Globe,
  },
  geography: {
    gradient: "from-emerald-500 to-green-600",
    icon: Globe,
  },
  art: {
    gradient: "from-fuchsia-500 to-pink-600",
    icon: Palette,
  },
  music: {
    gradient: "from-violet-500 to-purple-600",
    icon: Music,
  },
  "computer science": {
    gradient: "from-slate-500 to-gray-700",
    icon: Code,
  },
  programming: {
    gradient: "from-slate-500 to-gray-700",
    icon: Code,
  },
  psychology: {
    gradient: "from-indigo-500 to-blue-600",
    icon: Brain,
  },
  language: {
    gradient: "from-cyan-500 to-blue-600",
    icon: Languages,
  },

  default: {
    gradient: "from-gray-500 to-slate-600",
    icon: GraduationCap,
  },
};

interface ClassCardProps {
  classData: Tables<"classes">;
  studentCount?: number;
  teacher?: string;
  role: "teacher" | "student" | "ta";
}

export default function ClassCard({
  classData,
  studentCount = 0,
  teacher,
  role,
}: ClassCardProps) {
  const subjectKey = classData.subject?.toLowerCase() || "default";
  const config = subjectConfig[subjectKey] || subjectConfig.default;
  const Icon = config.icon;

  return (
    <Link
      href={
        role === "student"
          ? `/dashboard/${classData.id}`
          : `/teacher/${classData.id}`
      }
    >
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative h-full overflow-hidden rounded-xl bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        {/* Gradient Header */}
        <div
          className={`h-32 bg-gradient-to-br ${config.gradient} relative overflow-hidden`}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
          </div>

          {/* Icon */}
          <div className="absolute top-4 right-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Active status indicator */}
          {classData.is_active && (
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-white">Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Class Name */}
          <div className="space-y-0.5 mb-3">
            <h3 className="text-xl text-left font-bold text-primary line-clamp-2 group-hover:text-primary transition-colors">
              {classData.name}
            </h3>
            {teacher && (
              <p className="text-left text-xs text-muted-foreground">
                {teacher}
              </p>
            )}
          </div>

          {/* Subject & Level */}
          <div className="flex items-center gap-2 mb-4">
            {classData.subject && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
                {classData.subject.charAt(0).toUpperCase() +
                  classData.subject.slice(1)}
              </span>
            )}
            {/* remove dash in between */}
            {classData.level && (
              <span className="px-2.5 py-1 bg-ring/10 text-ring text-xs font-medium rounded-md">
                {classData.level.charAt(0).toUpperCase() +
                  classData.level.slice(1).replace("-", " ")}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {studentCount} {studentCount === 1 ? "student" : "students"}
              </span>
            </div>

            {/* Class Code */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Code:</span>
              <code className="px-2 py-1 bg-muted text-foreground text-xs font-mono rounded">
                {classData.class_code}
              </code>
              <div title="Copy code">
                <Copy
                  className="w-4 h-4 text-muted-foreground hover:scale-107"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(classData.class_code);
                    toast.success("Class code copied to clipboard");
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
    </Link>
  );
}
