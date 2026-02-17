"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { FocusTrap } from "focus-trap-react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export default function ModalBase({
  isOpen,
  onClose,
  children,
  className,
  hideCloseButton = false,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 will-change-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
            <motion.div
              role="dialog"
              aria-modal="true"
              className={clsx(
                "relative flex flex-col w-full max-h-full bg-background rounded-2xl shadow-xl focus:outline-none overflow-hidden",
                className || "max-w-2xl",
              )}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {/* Refined Close Button */}
              {!hideCloseButton && (
                <button
                  type="button"
                  aria-label="Close modal"
                  className="absolute top-4 right-4 z-10 p-2 rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
              )}

              <div className="p-6 overflow-y-auto modal-scroll">{children}</div>
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
