import { useState, useCallback } from "react";

export const useAI = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});

  const execute = useCallback(async <T>(key: string, task: () => Promise<T>): Promise<T | null> => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError((prev) => ({ ...prev, [key]: null }));
    try {
      const result = await task();
      return result;
    } catch (err: any) {
      console.error(`AI Task [${key}] failed:`, err);
      const detail = err.response?.data?.detail || "AI service is temporarily unavailable.";
      setError((prev) => ({ ...prev, [key]: detail }));
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const clearError = useCallback((key: string) => {
    setError((prev) => ({ ...prev, [key]: null }));
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};
