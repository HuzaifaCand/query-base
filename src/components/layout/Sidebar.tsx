"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  X,
  Users2,
  UserCircle,
  LogOut,
  MessageSquarePlus,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Lexend } from "next/font/google";
import SidebarClasses from "./SidebarClasses";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmationModal from "./ConfirmationModal";

export const logoFont = Lexend({ subsets: ["latin"] });

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const teacherRoutes: NavItem[] = [
  { label: "Overview", href: "/teacher", icon: LayoutDashboard },
  { label: "Students", href: "/teacher/students", icon: Users2 },
  { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
  { label: "Profile", href: "/teacher/profile", icon: UserCircle },
  { label: "Feedback", href: "/teacher/feedback", icon: MessageSquarePlus },
];

const studentRoutes: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquarePlus },
];

interface SidebarProps {
  role: "teacher" | "student";
  className?: string;
}

// ---------------------------------------------------------------------------
// Shared Sign-Out Button
// ---------------------------------------------------------------------------
function SignOutButton({ onSignOutRequest }: { onSignOutRequest: () => void }) {
  return (
    <button
      type="button"
      onClick={onSignOutRequest}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2 rounded-lg text-[13px] lg:text-sm font-semibold dark:font-medium",
        "text-muted-foreground hover:bg-muted/80 transition-colors duration-150",
      )}
    >
      <LogOut size={16} />
      <span>Sign Out</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Shared SidebarContent
// ---------------------------------------------------------------------------
const SidebarContent = ({
  role,
  onSignOutRequest,
}: {
  role: "teacher" | "student";
  onSignOutRequest: () => void;
}) => {
  const pathname = usePathname();
  const routes = role === "teacher" ? teacherRoutes : studentRoutes;

  return (
    <div className="flex flex-col h-full bg-background-alternative-faint-medium">
      {/* Desktop Logo + Theme Toggle */}
      <div className="pt-8 pb-6 flex items-center px-4 hidden lg:flex border-b border-primary/5 justify-between">
        <span
          className={`${logoFont.className} text-xl font-semibold text-primary tracking-tight`}
        >
          query<span className="text-ring">base</span>
        </span>
        <ThemeToggle />
      </div>

      {/* Navigation */}
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
                "flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-colors duration-150 text-[13px] lg:text-sm font-semibold dark:font-medium",
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

      {/* Sign Out — pinned to the bottom */}
      <div className="px-2 pb-4 border-t border-primary/5 pt-3">
        <SignOutButton onSignOutRequest={onSignOutRequest} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Desktop Sidebar
// ---------------------------------------------------------------------------
export const DesktopSidebar = ({ role, className }: SidebarProps) => {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex w-64 border-r border-primary/5 flex-col fixed inset-y-0 z-50",
          className,
        )}
      >
        <SidebarContent
          role={role}
          onSignOutRequest={() => setConfirmOpen(true)}
        />
      </aside>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        description="You'll be returned to the login screen."
        isDestructive={false}
        confirmLabel="Sign Out"
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Mobile Sidebar
// ---------------------------------------------------------------------------
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
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dragControls = useDragControls();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ willChange: "opacity" }} // PERF FIX: GPU acceleration
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              style={{ willChange: "transform", touchAction: "pan-y" }}
              // DRAG FIX: Enable swipe-to-close from anywhere in the drawer
              drag="x"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 1 }}
              dragDirectionLock={true}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x > 100 || velocity.x > 500) {
                  onClose();
                }
              }}
              onPointerDown={(e) => {
                dragControls.start(e);
              }}
              className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm bg-background lg:hidden border-l border-border/50 sm:shadow-2xl"
            >
              <div className="flex flex-col h-full relative">
                {/* Mobile header: logo + theme toggle + close */}
                <div className="flex items-center justify-between h-24 px-6 border-b border-primary/5 shrink-0">
                  <span
                    className={`${logoFont.className} text-xl font-semibold text-primary tracking-tight`}
                  >
                    query<span className="text-ring">base</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                      onClick={onClose}
                      className="rounded-md hover:bg-muted text-muted-foreground p-2 -mr-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 sm:pt-0 flex-1 overflow-y-auto overscroll-contain">
                  <SidebarContent
                    role={role}
                    onSignOutRequest={() => setConfirmOpen(true)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        description="You'll be returned to the login screen."
        isDestructive={false}
        confirmLabel="Sign Out"
      />
    </>
  );
};
