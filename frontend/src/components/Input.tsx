import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-muted-foreground/90">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 ${
            error ? "border-destructive focus:ring-destructive" : "border-border hover:border-muted-foreground/30"
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs text-destructive animate-fadeIn">{error}</span>
        ) : (
          helperText && <span className="text-xs text-muted-foreground/75">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
