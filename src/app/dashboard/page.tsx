import SectionHeader from "@/components/ui/SectionHeader";
import ClassesSection from "@/components/teacher/ClassesSection";
import { FeaturedQueriesSection } from "@/components/student/FeaturedQueriesSection";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export default function StudentPage() {
  return (
    <TransitionWrapper>
      <SectionHeader title="Overview" />

      <div className="space-y-8">
        <FeaturedQueriesSection />
        <ClassesSection role={"student"} />
      </div>
    </TransitionWrapper>
  );
}
