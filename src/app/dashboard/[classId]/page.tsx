import { ClassPage } from "@/components/class-page/ClassPage";
import TransitionWrapper from "@/components/layout/TransitionWrapper";

export default function StudentClassPage() {
  return (
    <TransitionWrapper>
      <ClassPage role="student" />
    </TransitionWrapper>
  );
}
