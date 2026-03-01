"use client";

import StudentTabs from "../student/StudentTabs";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import ClassTabs from "./ClassTabs";
import { TeacherTabs } from "../teacher/TeacherTabs";
import { useQueriesRealtime } from "@/hooks/queries/useQueriesRealtime";

type TeacherTabs = "answers" | "students";
type StudentTabs = "new-query" | "your-queries";
type SharedTabs = "queries" | "resources";

export type TAB = SharedTabs | StudentTabs | TeacherTabs;

const TABS: TAB[] = [
  "queries",
  "new-query",
  "your-queries",
  "students",
  "resources",
  "answers",
];

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

  // Single realtime channel for all query/answer tabs (CACHING.md §4)
  useQueriesRealtime(classId);

  return (
    <div className="space-y-8 pb-4">
      <ClassTabs
        role={role}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="px-2 sm:px-4">
        {role === "student" ? (
          <StudentTabs tab={activeTab} classId={classId} />
        ) : (
          <TeacherTabs tab={activeTab} classId={classId} />
        )}
      </div>
    </div>
  );
}
