"use client";

import { HelpCircle, FileText } from "lucide-react";
import Link from "next/link";
import type { Role } from "./types";

interface SupportAndLegalSectionProps {
  role: Role;
}

export default function SupportAndLegalSection({
  role,
}: SupportAndLegalSectionProps) {
  const feedbackRoute =
    role === "student" ? "/dashboard/feedback" : "/teacher/feedback";

  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40">
        <h2 className="text-sm font-semibold text-primary">Support & Legal</h2>
      </div>
      <div className="divide-y divide-border/40">
        <Link
          href={feedbackRoute}
          className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-ring/10 text-ring group-hover:bg-ring/20 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">
              Support & Feedback
            </p>
            <p className="text-xs text-muted-foreground">
              Report issues or send us your thoughts
            </p>
          </div>
        </Link>

        <Link
          href="/terms"
          className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-muted/70 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">
              Terms of Service & Privacy Policy
            </p>
            <p className="text-xs text-muted-foreground">
              How we handle your data
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
