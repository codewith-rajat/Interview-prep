// frontend/src/components/ui/Button.jsx - Reusable Button component
import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 text-black font-semibold",
    secondary: "bg-stone-700 hover:bg-stone-600 text-stone-100",
    ghost: "text-stone-400 hover:text-stone-200",
    outline: "border border-white/10 hover:border-amber-400/20 text-stone-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseClasses =
    "rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2";

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <span className="animate-spin">⟳</span>}
      {children}
    </button>
  );
};
