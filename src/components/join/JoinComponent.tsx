"use client";

import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ClassCodeInput } from "./ClassCodeInput";
import { supabase } from "@/lib/supabase";
import { ContinueButton } from "./ContinueButton";
import { TextInput } from "./TextInput";

export default function JoinComponent() {
  const [displayName, setDisplayName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleJoinClass = async () => {
    if (!classCode) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (displayName) {
      const { error: userError } = await supabase
        .from("update")
        .update({ full_name: displayName })
        .eq("id", user.id)
        .single();
      if (userError) {
        console.error("Error updating user:", userError);
        return;
      }
    }

    setSubmitting(true);

    const { data: classId } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", classCode)
      .single();
    if (!classId) {
      console.error("Error fetching class:", classId);
      return;
    }

    const { error: joinError } = await supabase
      .from("class_students")
      .insert({ class_id: classId.id, student_id: user.id });
    if (joinError) {
      console.error("Error joining class:", joinError);
      return;
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl z-10"
      >
        <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 sm:p-10 shadow-xl ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="p-3 rounded-full bg-ring/10 text-ring mb-3 ring-4 ring-ring/5"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Join your Class
            </motion.h1>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {/* Display Name Input */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TextInput
                title="Display Name"
                text={displayName}
                setText={setDisplayName}
                placeholder="Enter your name"
                Icon={User}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ClassCodeInput
                classCode={classCode}
                setClassCode={setClassCode}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-2"
            >
              <ContinueButton
                disabled={!classCode}
                text="Join Class"
                loadingText="Joining..."
                submitting={submitting}
                handleSubmit={handleJoinClass}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 space-y-2"
        >
          <p className="text-xs text-muted-foreground">
            By joining, you agree to our{" "}
            <a
              href="#"
              className="hover:text-primary underline decoration-border transition-colors"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="hover:text-primary underline decoration-border transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
