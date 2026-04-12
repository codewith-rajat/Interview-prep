// frontend/src/components/ui/Card.jsx - Reusable card component
import React from "react";

export const Card = ({ children, className = "", hover = true }) => {
  const baseClass =
    "relative bg-[#0f0f11] border border-white/10 rounded-2xl p-6 overflow-hidden";
  const hoverClass = hover ? "hover:border-amber-400/20 transition duration-300" : "";

  return (
    <div className={`${baseClass} ${hoverClass} ${className}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent pointer-events-none" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const SectionLabel = ({ children }) => (
  <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-[0.14em] uppercase mb-4">
    <span className="w-4 h-px bg-amber-400" />
    {children}
  </p>
);

export const PageHeader = ({ label, title, subtitle, action }) => (
  <div className="border-b border-white/10 px-8 py-10">
    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
      <div>
        {label && <SectionLabel>{label}</SectionLabel>}
        <h1 className="font-serif text-5xl tracking-tight text-stone-100 mt-1 mb-2">
          {title}
        </h1>
        {subtitle && <p className="text-stone-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);

export const Container = ({ children, className = "" }) => (
  <div className={`max-w-6xl mx-auto px-8 py-12 ${className}`}>
    {children}
  </div>
);
