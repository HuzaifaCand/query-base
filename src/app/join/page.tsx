"use client";

import { motion } from "framer-motion";
import { ArrowRight, Hash, User, Sparkles } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function JoinPage() {
  const [displayName, setDisplayName] = useState("");
  const [classCode, setClassCode] = useState("");

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
              <label
                htmlFor="display-name"
                className="block text-xs font-semibold text-muted-foreground ml-1 mb-1.5 uppercase tracking-wider"
              >
                Display Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className={clsx(
                    "w-full rounded-xl border border-input bg-background/50 px-4 pl-10 py-3 text-sm outline-none transition-all",
                    "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
                    "placeholder:text-muted-foreground/40",
                    "hover:border-accent-foreground/20",
                  )}
                />
              </div>
            </motion.div>

            {/* Class Code Input (Emphasized) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label
                htmlFor="class-code"
                className="flex items-center gap-2 text-xs font-semibold text-primary ml-1 mb-1.5 uppercase tracking-wider"
              >
                Class Code{" "}
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary font-bold">
                  REQUIRED
                </span>
              </label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 transition-colors group-focus-within:text-primary" />
                <input
                  id="class-code"
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="XYZ-123"
                  className={clsx(
                    "w-full rounded-xl border-2 border-primary/15 bg-primary/5 px-4 pl-11 py-4 text-lg font-bold tracking-widest outline-none transition-all uppercase",
                    "focus:border-primary focus:ring-4 focus:ring-primary/15",
                    "placeholder:text-muted-foreground/30 placeholder:font-normal placeholder:tracking-normal",
                    "hover:border-primary/40",
                    "text-foreground",
                  )}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 ml-1 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
                Ask your teacher if you don't have a code
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-2"
            >
              <button
                type="button"
                disabled={!classCode || !displayName}
                className={clsx(
                  "w-full relative group overflow-hidden rounded-xl bg-ring px-4 py-3.5 text-sm font-semibold text-primary shadow-md transition-all",
                  "hover:-translate-y-0.5",
                  "active:translate-y-0 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="flex items-center justify-center gap-2 relative z-10">
                  Continue to Class{" "}
                  <ArrowRight className="w-4 h-4 transition-transform" />
                </span>
              </button>
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
