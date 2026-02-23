"use client";

import { BookOpen } from "lucide-react";
import { subjectConfig } from "@/components/teacher/ClassCard";
import type { ClassInfo } from "./types";

interface ClassMembershipsSectionProps {
  classes: ClassInfo[];
}

export default function ClassMembershipsSection({
  classes,
}: ClassMembershipsSectionProps) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-ring" />
        <h2 className="text-sm font-semibold text-primary">Your Classes</h2>
      </div>

      {classes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Not enrolled in any classes yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {classes.map((cls) => {
            const subjectKey = cls.subject?.toLowerCase() || "default";
            const config = subjectConfig[subjectKey] || subjectConfig.default;
            const Icon = config.icon;
            return (
              <div
                key={cls.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
              >
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {cls.name}
                  </p>
                  {(cls.subject || cls.level) && (
                    <p className="text-xs text-muted-foreground">
                      {[cls.subject, cls.level]
                        .filter(Boolean)
                        .map((s) => s!.charAt(0).toUpperCase() + s!.slice(1))
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
