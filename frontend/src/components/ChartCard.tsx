import React from "react";
import { Card } from "./Card";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  isLoading = false,
  isEmpty = false,
  height = 300,
}) => {
  return (
    <Card className="flex flex-col gap-2 shadow-sm w-full">
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <span className="text-xs text-muted-foreground/80">{subtitle}</span>}
      </div>
      <div className="relative w-full mt-3" style={{ height: `${height}px` }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-xs">
            <LoadingSpinner size="sm" message="" />
          </div>
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EmptyState 
              title="No chart data available" 
              description="No logs resolved for this calendar period." 
            />
          </div>
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </Card>
  );
};
