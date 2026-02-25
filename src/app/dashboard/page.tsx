"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";
import { FeaturedQueriesSection } from "@/components/student/FeaturedQueriesSection";

export default function StudentPage() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Overview" />
      <FeaturedQueriesSection />
      <ClassesSection role={"student"} />
    </div>
  );
}
