import DashboardLayout from "@/components/layout/DashboardLayout";

export const metadata = {
  title: "Student Dashboard | Query",
  description: "View your classes and queries.",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="student">{children}</DashboardLayout>;
}
