import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";
import { PendingQueriesSection } from "@/components/teacher/PendingQueriesSection";

export default function TeacherPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionHeader title="Overview" />
        <PendingQueriesSection />
      </div>
      <ClassesSection role="teacher" />
    </div>
  );
}
