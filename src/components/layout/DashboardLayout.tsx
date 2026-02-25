"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DesktopSidebar, MobileSidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { ClassesProvider } from "@/contexts/ClassesContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "teacher" | "student";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <ClassesProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar - hidden on mobile */}
        <DesktopSidebar
          role={role}
          className="w-64 hidden lg:flex fixed h-full"
        />

        <div className="flex-1 flex-col lg:pl-64 transition-all duration-300">
          {/* Mobile Header - only visible on mobile */}
          <MobileHeader
            onMenuClick={() => setSidebarOpen(true)}
            className="pb-4"
          />

          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full">{children}</main>
        </div>

        {/* Mobile Sidebar (Drawer) */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={role}
        />
      </div>
    </ClassesProvider>
  );
}
