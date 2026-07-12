import React, { useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface FilterPanelProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ children, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border border-border/60 rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300">
      {}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <span className="text-sm font-semibold">Filter & Configuration Controls</span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw size={12} />
              Reset Filters
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Hide Options" : "Show Options"}
          </Button>
        </div>
      </div>

      {}
      {isOpen && (
        <div className="p-4 border-t border-border/50 bg-muted/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideIn">
          {children}
        </div>
      )}
    </div>
  );
};
