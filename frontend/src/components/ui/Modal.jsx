// frontend/src/components/ui/Modal.jsx - Reusable Modal component
import React from "react";
import { Button } from "./Button";

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-[#0f0f11] border border-white/10 rounded-2xl p-8 w-full ${sizes[size]} shadow-2xl`}
      >
        {title && (
          <h2 className="font-serif text-2xl tracking-tight text-stone-100 mb-6">
            {title}
          </h2>
        )}

        <div className="mb-8">{children}</div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant="primary"
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
