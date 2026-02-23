"use client";

import { GraduationCap, MessageSquare, CheckCircle, Users } from "lucide-react";
import type { Role, StudentStats, TeacherStats } from "./types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}

export function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br border border-border/40">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}
      />
      <div className="relative">
        <div
          className={`inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-br ${gradient} text-white mb-3`}
        >
          {icon}
        </div>
        <p className="text-2xl font-bold text-primary tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

interface ActivitySummarySectionProps {
  role: Role;
  studentStats: StudentStats | null;
  teacherStats: TeacherStats | null;
}

export default function ActivitySummarySection({
  role,
  studentStats,
  teacherStats,
}: ActivitySummarySectionProps) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-4 h-4 text-ring" />
        <h2 className="text-sm font-semibold text-primary">Activity Summary</h2>
      </div>

      {role === "student" && studentStats && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            label="Queries Asked"
            value={studentStats.queries_asked ?? 0}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Answers Received"
            value={studentStats.answers_received ?? 0}
            gradient="from-emerald-500 to-teal-600"
          />
        </div>
      )}

      {(role === "teacher" || role === "ta") && teacherStats && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Queries Resolved"
            value={teacherStats.queries_resolved ?? 0}
            gradient="from-ring to-ring/60"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Active Students"
            value={teacherStats.total_unique_students ?? 0}
            gradient="from-violet-500 to-purple-600"
          />
        </div>
      )}
    </div>
  );
}
