// frontend/src/components/ui/Form.jsx - Reusable form inputs
import React from "react";

export const FormField = ({
  label,
  error,
  touched,
  required = false,
  children,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-stone-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && touched && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
};

export const Input = React.forwardRef(
  ({ label, error, touched, className = "", ...props }, ref) => {
    const baseClass =
      "w-full px-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all";

    return (
      <FormField label={label} error={error} touched={touched}>
        <input
          ref={ref}
          className={`${baseClass} ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

Input.displayName = "Input";

export const Select = React.forwardRef(
  ({ label, error, touched, children, className = "", ...props }, ref) => {
    const baseClass =
      "w-full px-4 py-2.5 bg-[#0f0f11] border border-white/10 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all";

    return (
      <FormField label={label} error={error} touched={touched}>
        <select ref={ref} className={`${baseClass} ${className}`} {...props}>
          {children}
        </select>
      </FormField>
    );
  }
);

Select.displayName = "Select";

export const Textarea = React.forwardRef(
  ({ label, error, touched, className = "", ...props }, ref) => {
    const baseClass =
      "w-full px-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none";

    return (
      <FormField label={label} error={error} touched={touched}>
        <textarea
          ref={ref}
          className={`${baseClass} ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

Textarea.displayName = "Textarea";
