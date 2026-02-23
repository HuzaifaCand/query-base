"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingSection } from "../ui/LoadingSection";
import IdentitySection from "./IdentitySection";
import ClassMembershipsSection from "./ClassMembershipsSection";
import ActivitySummarySection from "./ActivitySummarySection";
import SupportAndLegalSection from "./SupportAndLegalSection";
import type {
  Role,
  UserProfile,
  ClassInfo,
  StudentStats,
  TeacherStats,
} from "./types";
import SectionHeader from "../ui/SectionHeader";

interface ProfileComponentProps {
  role: Role;
}

export default function ProfileComponent({ role }: ProfileComponentProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleNameUpdate = (newName: string) => {
    if (user) {
      setUser({ ...user, full_name: newName });
    }
  };

  if (loading) {
    return <LoadingSection text="Loading profile" />;
  }

  return (
    <>
      <SectionHeader title="Profile" />
      <div className="space-y-6 pb-12">
        <IdentitySection
          user={user}
          role={role}
          onNameUpdate={handleNameUpdate}
        />
        <ClassMembershipsSection classes={classes} />
        <ActivitySummarySection
          role={role}
          studentStats={studentStats}
          teacherStats={teacherStats}
        />
        <SupportAndLegalSection role={role} />
      </div>
    </>
  );
}
