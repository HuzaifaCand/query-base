import DashboardLayout from "@/components/layout/DashboardLayout";

export const metadata = {
  title: "Teacher Dashboard | Query",
  description: "Manage your classes and view analytics.",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="teacher">{children}</DashboardLayout>;
}
