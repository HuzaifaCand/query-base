"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Plus, Search, User } from "lucide-react";

type Role = "student" | "teacher" | "ta";

export type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface ClassTabsProps {
  role: Role;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function ClassTabs({
  role,
  activeTab,
  onTabChange,
}: ClassTabsProps) {
  const getTabs = (): Tab[] => {
    const TeacherTabs: Tab[] = [
      { id: "queries", label: "Queries", icon: MessageSquare },
      { id: "students", label: "Students", icon: Users },
    ];

    const StudentTabs: Tab[] = [
      { id: "queries", label: "Class Queries", icon: MessageSquare },
      { id: "new-query", label: "New Query", icon: Plus },
      { id: "your-queries", label: "Your Queries", icon: User },
    ];

    if (role === "student") {
      return StudentTabs;
    }

    return TeacherTabs;
  };

  const tabs = getTabs();

  return (
    <div className="w-full border-b border-border bg-card max-w-[100vw] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Desktop Tabs (Untouched) */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-6 py-4 flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg"
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ring"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs - Segmented Control Design */}
        <div className="sm:hidden py-3 w-full">
          <div className="flex w-full items-center bg-muted/40 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex-1 flex flex-col items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring z-10 ${
                    isActive
                      ? "text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Animated Background for Active State */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute inset-0 bg-background rounded-lg z-[-1]"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-primary" : ""}`}
                  />
                  <span className="truncate w-full text-center tracking-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
