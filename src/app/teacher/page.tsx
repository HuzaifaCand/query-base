import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";
import { PendingQueriesSection } from "@/components/teacher/PendingQueriesSection";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export default function TeacherPage() {
  return (
    <TransitionWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <SectionHeader title="Overview" />
          <PendingQueriesSection />
        </div>
        <ClassesSection role="teacher" />
      </div>
    </TransitionWrapper>
  );
}
