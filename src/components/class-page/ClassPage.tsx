"use client";

import StudentTabs from "../student/StudentTabs";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ClassTabs from "./ClassTabs";
import { TeacherTabs } from "../teacher/TeacherTabs";

type TAB = "queries" | "new-query" | "your-queries" | "students";

const TABS: TAB[] = ["queries", "new-query", "your-queries", "students"];

export function ClassPage({ role }: { role: "student" | "teacher" | "ta" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const tabParam = searchParams.get("tab");
  const currentTabInUrl: TAB = TABS.includes(tabParam as TAB)
    ? (tabParam as TAB)
    : "queries";

  const [activeTab, setActiveTab] = useState<TAB>(currentTabInUrl);

  useEffect(() => {
    setActiveTab(currentTabInUrl);
  }, [currentTabInUrl]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId as TAB);

      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set("tab", tabId);
      router.replace(`?${current.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const classId = params.classId as string;

  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return;

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error) {
        console.error("Error fetching class:", error.message);
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
          <TeacherTabs activeTab={activeTab} classId={classId} />
        )}
      </div>
    </div>
  );
}
