"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ThemeToggle } from "./theme/ThemeToggle";

export const bg = "bg-gradient-to-br bg-background";

export function LoginComponent({
  handleSignIn,
  loading,
}: {
  handleSignIn: () => void;
  loading: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex min-h-screen items-center justify-center px-4 sm:px-6 relative",
        bg,
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2" />
      </div>
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Glass-style card */}
        <div className="relative rounded-2xl border border-gray-200/70 bg-card/70 shadow-xl backdrop-blur-xl dark:border-white/5 backdrop-blur-sm p-10 text-center transition-colors duration-300">
          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gray-200/10 dark:bg-gray-800/20" />
              <Image
                src="/android-chrome-512x512.png"
                alt="QueryBase Logo"
                width={80}
                height={80}
                priority
                className="relative rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-zinc-900 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                QueryBase
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                For teachers and students:{" "}
                <span className="text-ring font-medium">QueryBase</span>
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-zinc-800 to-transparent" />

          {/* Sign-in Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="group w-full rounded-xl border border-gray-300/80 bg-white dark:bg-zinc-900 dark:border-white/10 px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <span className="flex items-center justify-center gap-3">
                <Image
                  src="/google-icon.svg"
                  alt="Google"
                  width={18}
                  height={18}
                />
                <span className="font-medium text-sm text-gray-800 dark:text-zinc-200 tracking-tight">
                  {loading ? "Signing in…" : "Sign in with Google"}
                </span>
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
