"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoFont } from "./Sidebar";

interface MobileHeaderProps {
  onMenuClick: () => void;
  className?: string;
}

export const MobileHeader = ({ onMenuClick, className }: MobileHeaderProps) => {
  return (
    <div className={cn("lg:hidden", className)}>
      <div className="flex items-center justify-between bg-background border-b border-primary/5 text-primary px-4 py-3">
        <span
          className={`${logoFont.className} text-xl font-semibold text-primary tracking-tight`}
        >
          query<span className="text-ring">base</span>
        </span>
        <button
          onClick={onMenuClick}
          className="p-2 -mr-2 rounded-md hover:bg-muted text-primary transition-colors"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </button>
      </div>
    </div>
  );
};
