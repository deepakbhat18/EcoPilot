import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-start">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg inline-flex mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm text-muted-foreground/90 leading-relaxed pt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-2.5 mt-2">
          <Button onClick={onClose} variant="outline" size="sm" disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
