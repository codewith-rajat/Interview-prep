// frontend/src/components/ui/Alert.jsx - Reusable Alert component
import React from "react";

export const Alert = ({ type = "info", message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };

  return (
    <div className={`p-4 border rounded-lg ${styles[type]}`}>
      <div className="flex items-start justify-between">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-lg leading-none hover:opacity-70"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
