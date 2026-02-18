"use client";

import StudentTabs from "../student/StudentTabs";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ClassTabs from "./ClassTabs";
import { TeacherTabs } from "../teacher/TeacherTabs";

export function ClassPage({ role }: { role: "student" | "teacher" | "ta" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const activeTab = searchParams.get("tab") || "queries";
  const classId = params.classId as string;

  const [className, setClassName] = useState("");

  const handleTabChange = (tabId: string) => {
    router.replace(`?tab=${tabId}`);
  };

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return;

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error) {
        console.error("Error fetching class:", error);
        return;
      }

      if (data) {
        setClassName(data.name);
      }
    };

    fetchClass();
  }, [classId]);

  return (
    <div className="flex flex-col">
      <ClassTabs
        role={role}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="py-6 px-4">
        {role === "student" ? (
          <StudentTabs activeTab={activeTab} classId={classId} />
        ) : (
          <TeacherTabs activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}
