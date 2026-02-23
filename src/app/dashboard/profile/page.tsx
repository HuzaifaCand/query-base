import ProfileComponent from "@/components/profile/ProfileComponent";

export const metadata = {
  title: "Profile | QueryBase",
  description: "Manage your student profile.",
};

export default function StudentProfilePage() {
  return <ProfileComponent role="student" />;
}
