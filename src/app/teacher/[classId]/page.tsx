import { ClassPage } from "@/components/class-page/ClassPage";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export default function TeacherClassPage() {
  return (
    <TransitionWrapper>
      <ClassPage role="teacher" />
    </TransitionWrapper>
  );
}
