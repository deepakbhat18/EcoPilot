import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      addToast(customEvent.detail.message, "error");
    };

    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: "success" | "error" | "info" }>;
      addToast(customEvent.detail.message, customEvent.detail.type);
    };

    window.addEventListener("api-error", handleApiError);
    window.addEventListener("show-toast", handleCustomToast);

    return () => {
      window.removeEventListener("api-error", handleApiError);
      window.removeEventListener("show-toast", handleCustomToast);
    };
  }, []);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  const borders = {
    success: "border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200",
    error: "border-rose-500/20 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200",
    info: "border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-start gap-3 p-3.5 border rounded-xl shadow-lg backdrop-blur-md ${borders[toast.type]}`}
          >
            <div className="pt-0.5">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-lg hover:bg-secondary"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
  const event = new CustomEvent("show-toast", { detail: { message, type } });
  window.dispatchEvent(event);
};
