"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Toast, { ToastProps } from "./Toast";

interface ToastContextType {
  showToast: (message: string, type?: ToastProps["type"]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

interface ToastItem extends Omit<ToastProps, "onClose"> {
  id: string;
  visible: boolean;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastProps["type"] = "info") => {
      const id = Math.random().toString(36).substring(7);
      const newToast = { id, message, type, visible: false };

      setToasts((prev) => [...prev, newToast]);

      // Trigger visible animation
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
        );
      }, 10);

      // Auto hide
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
      }, 4000);

      // Remove from DOM
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Gunakan Portal hanya jika sudah mounted di client - Mencegah Hydration Mismatch */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed top-5 right-5 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
            style={{ zIndex: 99999999 }} // Force z-index via style
          >
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`transition-all duration-300 ease-in-out pointer-events-auto transform ${
                  toast.visible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-4 scale-95"
                }`}
              >
                <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => removeToast(toast.id)}
                />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
