import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  fullPage = false,
  message = "Loading EcoPilot ESG Engine..."
}) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`
          animate-spin rounded-full border-muted/30 border-t-primary
          ${sizeClasses[size]}
        `} 
      />
      {message && (
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-6">{spinner}</div>;
};
