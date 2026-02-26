import TransitionWrapper from "@/components/layout/TransitionWrapper";
import ProfileComponent from "@/components/profile/ProfileComponent";

export const metadata = {
  title: "Profile | QueryBase",
  description: "Manage your student profile.",
};

export default function StudentProfilePage() {
  return (
    <TransitionWrapper>
      <ProfileComponent role="student" />
    </TransitionWrapper>
  );
}
