"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";
import { FeaturedQueriesSection } from "@/components/student/FeaturedQueriesSection";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export default function StudentPage() {
  return (
    <TransitionWrapper>
      <div className="flex flex-col">
        <SectionHeader title="Overview" />
        <FeaturedQueriesSection />
        <ClassesSection role={"student"} />
      </div>
    </TransitionWrapper>
  );
}
