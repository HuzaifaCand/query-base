import SectionHeader from "@/components/ui/SectionHeader";
import { AllStudentsList } from "@/components/teacher/AllStudentsList";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export const metadata = {
  title: "Students | Teacher Dashboard",
  description: "View your students",
};

export default function StudentsPage() {
  return (
    <TransitionWrapper>
      <div className="flex flex-col">
        <SectionHeader title="Your Students" />
        <AllStudentsList />
      </div>
    </TransitionWrapper>
  );
}
