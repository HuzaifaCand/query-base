"use client";

import ModalBase from "./ModalBase";
import { AlertTriangle } from "lucide-react";
import clsx from "clsx";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDestructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDestructive = false,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmationModalProps) {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-sm"
      hideCloseButton
    >
      <div className="flex flex-col gap-5">
        {/* Icon row */}
        {isDestructive && (
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-500/10">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
        )}

        {/* Text */}
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-primary">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              isDestructive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-ring hover:bg-ring/90 text-white",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
