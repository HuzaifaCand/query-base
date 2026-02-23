"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/databasetypes";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Users,
  LogOut,
  HelpCircle,
  FileText,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { subjectConfig } from "@/components/teacher/ClassCard";
import { LoadingSection } from "../ui/LoadingSection";

type Role = "student" | "teacher" | "ta";

interface ProfileComponentProps {
  role: Role;
}

interface UserProfile extends Tables<"users"> {}

interface ClassInfo {
  id: string;
  name: string;
  subject: string | null;
  level: string | null;
}

interface StudentStats {
  queries_asked: number | null;
  answers_received: number | null;
}

interface TeacherStats {
  queries_resolved: number | null;
  total_unique_students: number | null;
}

const roleConfig: Record<
  Role,
  { label: string; color: string; bgColor: string }
> = {
  student: {
    label: "Student",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  teacher: {
    label: "Teacher",
    color: "text-ring",
    bgColor: "bg-ring/10",
  },
  ta: {
    label: "Teaching Assistant",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
  },
};

export default function ProfileComponent({ role }: ProfileComponentProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) return;

        // Fetch user profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profile) {
          setUser(profile);
          setEditedName(profile.full_name || "");
        }

        // Fetch class memberships
        const table = role === "student" ? "class_students" : "class_teachers";
        const idColumn = role === "student" ? "student_id" : "teacher_id";

        const { data: memberships } = await supabase
          .from(table)
          .select("class_id")
          .eq(idColumn, authUser.id);

        if (memberships && memberships.length > 0) {
          const classIds = memberships.map((m) => m.class_id);
          const { data: classData } = await supabase
            .from("classes")
            .select("id, name, subject, level")
            .in("id", classIds)
            .order("created_at", { ascending: false });

          setClasses(classData || []);
        }

        // Fetch stats
        if (role === "student") {
          const { data: stats } = await supabase
            .from("student_stats")
            .select("queries_asked, answers_received")
            .eq("student_id", authUser.id)
            .maybeSingle();
          setStudentStats(stats || { queries_asked: 0, answers_received: 0 });
        } else {
          const { data: stats } = await supabase
            .from("teacher_stats")
            .select("queries_resolved, total_unique_students")
            .eq("teacher_id", authUser.id)
            .maybeSingle();
          setTeacherStats(
            stats || { queries_resolved: 0, total_unique_students: 0 },
          );
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [role]);

  async function handleSaveName() {
    if (!user || !editedName.trim()) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: editedName.trim() })
        .eq("id", user.id);

      if (error) throw error;
      setUser({ ...user, full_name: editedName.trim() });
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (err) {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "?";

  const feedbackRoute =
    role === "student" ? "/dashboard/feedback" : "/teacher/feedback";

  if (loading) {
    return <LoadingSection text="Loading profile" />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Identity ─────────────────────────────────────── */}
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        {/* Header gradient strip */}
        <div className="h-24 bg-gradient-to-br from-ring/60 to-ring relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full translate-y-14 -translate-x-14" />
          </div>
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          {/* FIX: Added 'relative z-10' here to prevent the avatar from hiding behind the header */}
          <div className="-mt-10 mb-4 flex items-end justify-between relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ring to-ring/70 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            {/* Role badge */}
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${roleConfig[role].bgColor} ${roleConfig[role].color} border border-current/20`}
            >
              {roleConfig[role].label}
            </span>
          </div>

          {/* Name (editable) */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditedName(user?.full_name || "");
                      setIsEditingName(false);
                    }
                  }}
                  className="flex-1 bg-muted border border-input rounded-lg px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-ring/40"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="p-2 rounded-lg bg-ring text-white hover:bg-ring/80 transition-colors"
                >
                  {savingName ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditedName(user?.full_name || "");
                    setIsEditingName(false);
                  }}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-transparent">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-primary">
                    {user?.full_name || "No name set"}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  title="Edit name"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-transparent">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Class Memberships ─────────────────────────────── */}
      <div className="bg-card border border-border/40 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-ring" />
          <h2 className="text-sm font-semibold text-primary">Your Classes</h2>
        </div>

        {classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not enrolled in any classes yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {classes.map((cls) => {
              const subjectKey = cls.subject?.toLowerCase() || "default";
              const config = subjectConfig[subjectKey] || subjectConfig.default;
              const Icon = config.icon;
              return (
                <div
                  key={cls.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
                >
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {cls.name}
                    </p>
                    {(cls.subject || cls.level) && (
                      <p className="text-xs text-muted-foreground">
                        {[cls.subject, cls.level]
                          .filter(Boolean)
                          .map((s) => s!.charAt(0).toUpperCase() + s!.slice(1))
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. Activity Summary ──────────────────────────────── */}
      <div className="bg-card border border-border/40 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4 text-ring" />
          <h2 className="text-sm font-semibold text-primary">
            Activity Summary
          </h2>
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

      {/* ── 4. Support & Legal ──────────────────────────────── */}
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="text-sm font-semibold text-primary">
            Support & Legal
          </h2>
        </div>
        <div className="divide-y divide-border/40">
          <Link
            href={feedbackRoute}
            className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-ring/10 text-ring group-hover:bg-ring/20 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                Support & Feedback
              </p>
              <p className="text-xs text-muted-foreground">
                Report issues or send us your thoughts
              </p>
            </div>
          </Link>

          <Link
            href="/terms"
            className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-muted/70 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                Terms of Service & Privacy Policy
              </p>
              <p className="text-xs text-muted-foreground">
                How we handle your data
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
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
