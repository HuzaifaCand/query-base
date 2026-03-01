"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Plus, User, Library, Reply } from "lucide-react";
import { TAB } from "./ClassPage";
import { Role } from "../profile/types";
import { useEffect, useRef } from "react";

export type Tab = {
  id: TAB;
  label: string;
  shortLabel?: string;
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeElement = scrollContainerRef.current?.querySelector(
      '[aria-selected="true"]',
    );
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  const getTabs = (): Tab[] => {
    const TeacherTabs: Tab[] = [
      { id: "queries", label: "Queries", icon: MessageSquare },
      { id: "answers", label: "Your Answers", icon: Reply },
      { id: "students", label: "Students", icon: Users },
      { id: "resources", label: "Resources", icon: Library },
    ];

    const StudentTabs: Tab[] = [
      { id: "queries", label: "Queries", icon: MessageSquare },
      { id: "new-query", label: "New Query", icon: Plus },
      { id: "your-queries", label: "My Queries", icon: User },
      { id: "resources", label: "Resources", icon: Library },
    ];

    if (role === "student") {
      return StudentTabs;
    }

    return TeacherTabs;
  };

  const tabs = getTabs();

  return (
    <div className="w-full max-w-[94vw] relative border-b border-border bg-card">
      <div className="absolute -right-1 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none z-10 sm:hidden" />

      {/* 3. INNER SCROLL CONTAINER: This is the part that actually scrolls */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto no-scrollbar w-full"
      >
        <div
          role="tablist"
          aria-label="Class sections"
          className="flex items-center gap-1 snap-x snap-mandatory w-max sm:w-full"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                // Added responsive padding, min-height for touch targets, and scroll snap
                className="relative py-3 px-6 sm:py-4 min-h-[48px] snap-start flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg select-none"
              >
                {/* Icon */}
                <Icon
                  aria-hidden="true"
                  className={`w-4 h-4 transition-colors shrink-0 ${
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
      </div>
    </div>
  );
}
