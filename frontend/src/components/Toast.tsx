"use client";

import { useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 4000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: "bg-white dark:bg-gray-800 border-l-green-500",
    error: "bg-white dark:bg-gray-800 border-l-red-500",
    warning: "bg-white dark:bg-gray-800 border-l-yellow-500",
    info: "bg-white dark:bg-gray-800 border-l-blue-500",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
  };

  return (
    <div
      className={`rounded-lg shadow-2xl border-l-[6px] p-4 flex items-center gap-4 min-w-[300px] pointer-events-auto backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 ${bgColors[type]} ring-1 ring-black/5 dark:ring-white/10`}
    >
      <div className={`text-2xl ${iconColors[type]}`}>{icons[type]}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg transition-colors"
      >
        ×
      </button>
    </div>
  );
}
