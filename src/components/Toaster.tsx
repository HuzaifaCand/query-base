"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      duration={4000}
      style={{ fontFamily: "inherit" }}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast rounded-xl border bg-background text-foreground shadow-xl backdrop-blur-md border-border/50 p-4 flex gap-3 w-full transition-all duration-300",
          title: "text-[14px] font-semibold tracking-tight",
          description: "text-[13px] text-muted-foreground leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          success:
            "group-[.success]:border-green-500/20 group-[.success]:bg-green-50/50 dark:group-[.success]:bg-green-500/10",
          error:
            "group-[.error]:border-destructive/20 group-[.error]:bg-destructive/5 dark:group-[.error]:bg-destructive/10",
          warning:
            "group-[.warning]:border-yellow-500/20 group-[.warning]:bg-yellow-50/50 dark:group-[.warning]:bg-yellow-500/10",
          info: "group-[.info]:border-blue-500/20 group-[.info]:bg-blue-50/50 dark:group-[.info]:bg-blue-500/10",
        },
      }}
    />
  );
}
