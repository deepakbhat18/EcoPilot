import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; 
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "environmental" | "social" | "governance" | "gamification" | "default";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel = "vs last quarter",
  icon,
  variant = "default",
}) => {
  const borders = {
    default: "border-l-4 border-l-border",
    environmental: "border-l-4 border-l-esg-environmental",
    social: "border-l-4 border-l-esg-social",
    governance: "border-l-4 border-l-esg-governance",
    gamification: "border-l-4 border-l-esg-gamification",
  };

  const textColors = {
    default: "text-muted-foreground/60",
    environmental: "text-esg-environmental",
    social: "text-esg-social",
    governance: "text-esg-governance",
    gamification: "text-esg-gamification",
  };

  const rendersTrend = () => {
    if (change === undefined) return null;
    if (change > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
          <ArrowUpRight size={12} />
          +{change}%
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
          <ArrowDownRight size={12} />
          {change}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
        <Minus size={12} />
        0%
      </span>
    );
  };

  return (
    <Card hoverable className={`${borders[variant]} flex flex-col justify-between min-h-[120px]`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        {icon && <div className={`${textColors[variant]}`}>{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between mt-3">
        <h2 className="text-2xl font-bold text-foreground">{value}</h2>
        {rendersTrend()}
      </div>
      {changeLabel && change !== undefined && (
        <span className="text-[11px] text-muted-foreground/75 mt-1">{changeLabel}</span>
      )}
    </Card>
  );
};
