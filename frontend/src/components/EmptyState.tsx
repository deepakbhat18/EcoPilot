import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There is currently no data loaded in this section.",
  actionLabel,
  onAction,
  icon = <FolderOpen size={48} className="text-muted-foreground/50" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 border border-dashed border-border/80 rounded-xl text-center max-w-md mx-auto my-6 bg-card/20 backdrop-blur-xs">
      <div className="mb-4 p-3 bg-secondary rounded-full inline-flex text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground/80 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
