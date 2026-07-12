import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  hoverable = false, 
  glass = false,
  className = "", 
  ...props 
}) => {
  return (
    <div
      className={`
        rounded-xl p-5 transition-all duration-300
        ${glass ? "glass-panel" : "bg-card text-card-foreground border border-border/80 shadow-premium dark:shadow-premium-dark"}
        ${hoverable ? "hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-premium-dark hover:border-primary/20" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
