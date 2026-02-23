"use client";

import { useState } from "react";
import { User, Mail, Edit2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { UserProfile, Role } from "./types";

interface IdentitySectionProps {
  user: UserProfile | null;
  role: Role;
  onNameUpdate: (newName: string) => void;
}

const roleConfig: Record<
  Role,
  { label: string; color: string; bgColor: string }
> = {
  student: {
    label: "Student",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  teacher: {
    label: "Teacher",
    color: "text-ring",
    bgColor: "bg-ring/10",
  },
  ta: {
    label: "Teaching Assistant",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
  },
};

export default function IdentitySection({
  user,
  role,
  onNameUpdate,
}: IdentitySectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.full_name || "");
  const [savingName, setSavingName] = useState(false);

  async function handleSaveName() {
    if (!user || !editedName.trim()) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: editedName.trim() })
        .eq("id", user.id);

      if (error) throw error;
      onNameUpdate(editedName.trim());
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (err) {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  }

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "?";

  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
      {/* Header gradient strip */}
      <div className="h-24 bg-gradient-to-br from-ring/60 to-ring relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full translate-y-14 -translate-x-14" />
        </div>
      </div>

      {/* Avatar + Info */}
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4 flex items-end justify-between relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ring to-ring/70 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          {/* Role badge */}
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${roleConfig[role].bgColor} ${roleConfig[role].color} border border-current/20`}
          >
            {roleConfig[role].label}
          </span>
        </div>

        {/* Name (editable) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Full Name
          </label>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditedName(user?.full_name || "");
                    setIsEditingName(false);
                  }
                }}
                className="flex-1 bg-muted border border-input rounded-lg px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="p-2 rounded-lg bg-ring text-white hover:bg-ring/80 transition-colors"
              >
                {savingName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setEditedName(user?.full_name || "");
                  setIsEditingName(false);
                }}
                className="p-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-transparent">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-primary">
                  {user?.full_name || "No name set"}
                </span>
              </div>
              <button
                onClick={() => {
                  setEditedName(user?.full_name || "");
                  setIsEditingName(true);
                }}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Edit name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-transparent">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
