import { TeacherStudentsList } from "@/components/teacher/TeacherStudentsList";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Students | Teacher Dashboard",
  description: "View your students",
};

export default function StudentsPage() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Your Students" />
      <TeacherStudentsList />
    </div>
  );
}
