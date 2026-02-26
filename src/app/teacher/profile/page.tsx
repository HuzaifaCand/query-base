import TransitionWrapper from "@/components/layout/TransitionWrapper";
import ProfileComponent from "@/components/profile/ProfileComponent";

export const metadata = {
  title: "Profile | QueryBase",
  description: "Manage your teacher profile.",
};

export default function TeacherProfilePage() {
  return (
    <TransitionWrapper>
      <ProfileComponent role="teacher" />
    </TransitionWrapper>
  );
}
