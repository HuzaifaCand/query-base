"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";

export default function StudentPage() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Overview" />
      <ClassesSection role={"student"} />
    </div>
  );
}
