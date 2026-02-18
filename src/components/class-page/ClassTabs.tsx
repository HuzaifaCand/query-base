"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Plus, Search } from "lucide-react";

type Role = "student" | "teacher" | "ta";

type Tab = {
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
  // Define tabs based on role
  const getTabs = (): Tab[] => {
    const baseTabs: Tab[] = [
      { id: "queries", label: "Queries", icon: MessageSquare },
    ];

    if (role === "teacher" || role === "ta") {
      baseTabs.push({ id: "students", label: "Students", icon: Users });
    }

    if (role === "student") {
      baseTabs.push(
        { id: "new-query", label: "New Query", icon: Plus },
        { id: "browse", label: "Browse", icon: Search },
      );
    }

    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <div className="w-full border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Tabs */}
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
                {/* Icon */}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />

                {/* Label */}
                <span
                  className={`transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ring"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-ring text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted active:scale-95"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
