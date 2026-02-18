"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, X, Users2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Lexend } from "next/font/google";
import SidebarClasses from "./SidebarClasses";

export const logoFont = Lexend({ subsets: ["latin"] });
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const teacherRoutes: NavItem[] = [
  { label: "Overview", href: "/teacher", icon: LayoutDashboard },
  { label: "Students", href: "/teacher/students", icon: Users2 },
];

const studentRoutes: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
];

interface SidebarProps {
  role: "teacher" | "student";
  className?: string;
}

const SidebarContent = ({ role }: { role: "teacher" | "student" }) => {
  const pathname = usePathname();
  const routes = role === "teacher" ? teacherRoutes : studentRoutes;

  return (
    <div className="flex flex-col h-full bg-background-alternative-faint-medium">
      <div className="pt-8 pb-6 flex items-center px-4 hidden lg:flex border-b border-primary/5 justify-between">
        <span
          className={`${logoFont.className} text-xl font-semibold text-primary tracking-tight`}
        >
          query<span className="text-ring">base</span>
        </span>
        <ThemeToggle />
      </div>
      <nav className="flex-1 pl-2 pr-3 py-4 space-y-1 overflow-y-auto">
        {routes.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (pathname.startsWith(href + "/") &&
              !["/dashboard", "/teacher"].includes(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-colors duration-150 text-xs lg:text-sm font-semibold dark:font-medium",
                isActive
                  ? "bg-muted/80 text-primary"
                  : "text-muted-foreground hover:bg-muted/80",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}

        {/* Classes Section */}
        <div className="pt-4">
          <SidebarClasses role={role} />
        </div>
      </nav>
      {/* Optional User Profile Section at bottom could go here */}
    </div>
  );
};

export const DesktopSidebar = ({ role, className }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 border-r border-primary/5 flex-col fixed inset-y-0 z-50",
        className,
      )}
    >
      <SidebarContent role={role} />
    </aside>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: "teacher" | "student";
}

export const MobileSidebar = ({
  isOpen,
  onClose,
  role,
}: MobileSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm bg-background lg:hidden shadow-xl"
          >
            <div className="flex flex-col h-full relative">
              <div className="flex items-center justify-between h-24 px-6 border-b border-primary/5">
                <span
                  className={`${logoFont.className} text-xl font-semibold text-primary tracking-tight`}
                >
                  query<span className="text-ring">base</span>
                </span>
                <button
                  onClick={onClose}
                  className="rounded-md hover:bg-muted text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="pt-4 sm:pt-0 h-full">
                <SidebarContent role={role} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
