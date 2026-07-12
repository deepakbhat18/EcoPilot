import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Operational Error",
  message = "An failure occurred while retrieving data. Please check your credentials and try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-destructive/15 rounded-xl text-center max-w-md mx-auto my-6 bg-destructive/5 dark:bg-destructive/10 text-foreground">
      <div className="mb-3 p-3 bg-destructive/10 text-destructive rounded-full inline-flex">
        <AlertCircle size={36} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground/80 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          Retry Operation
        </Button>
      )}
    </div>
  );
};
