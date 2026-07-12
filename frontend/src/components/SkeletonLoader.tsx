import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return <div className={`animate-pulse rounded-md bg-muted/65 ${className}`} />;
};

interface SkeletonLoaderProps {
  variant?: "card" | "list" | "chart" | "stat";
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = "card", 
  count = 1 
}) => {
  const items = Array.from({ length: count });

  const renderSingle = (index: number) => {
    switch (variant) {
      case "stat":
        return (
          <div key={index} className="border border-border/50 rounded-xl p-5 bg-card flex flex-col gap-2 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        );
      case "chart":
        return (
          <div key={index} className="border border-border/50 rounded-xl p-5 bg-card flex flex-col gap-4 w-full h-[300px] shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex-1 flex items-end gap-3 pt-6">
              <Skeleton className="h-[20%] flex-1" />
              <Skeleton className="h-[60%] flex-1" />
              <Skeleton className="h-[45%] flex-1" />
              <Skeleton className="h-[90%] flex-1" />
              <Skeleton className="h-[30%] flex-1" />
              <Skeleton className="h-[75%] flex-1" />
            </div>
          </div>
        );
      case "list":
        return (
          <div key={index} className="flex flex-col gap-3 w-full">
            {items.map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-border/40 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-[40%]" />
                  <Skeleton className="h-3 w-[60%]" />
                </div>
              </div>
            ))}
          </div>
        );
      case "card":
      default:
        return (
          <div key={index} className="border border-border/50 rounded-xl p-5 bg-card flex flex-col gap-3 shadow-sm">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        );
    }
  };

  
  if (variant === "list" || variant === "chart") {
    return <div className="w-full">{renderSingle(0)}</div>;
  }

  return (
    <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((_, idx) => renderSingle(idx))}
    </div>
  );
};
