import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";
import { PendingQueriesSection } from "@/components/teacher/PendingQueriesSection";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export default function TeacherPage() {
  return (
    <TransitionWrapper>
      <SectionHeader title="Overview" />

      <div className="space-y-8">
        <PendingQueriesSection />
        <ClassesSection role="teacher" />
      </div>
    </TransitionWrapper>
  );
}
