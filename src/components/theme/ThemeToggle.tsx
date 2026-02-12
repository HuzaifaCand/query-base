"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-6 w-11 rounded-full bg-muted animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        "bg-muted",
      )}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <motion.div
        className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm"
        animate={{
          x: isDark ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-2.5 w-2.5 text-ring fill-ring" />
        </motion.div>
        <motion.div
          animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="h-2.5 w-2.5 text-ring fill-ring" />
        </motion.div>
      </motion.div>
    </button>
  );
}
