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
    success: "bg-green-50 border-green-500",
    error: "bg-red-50 border-red-500",
    warning: "bg-yellow-50 border-yellow-500",
    info: "bg-blue-50 border-blue-500",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  };

  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
  };

  return (
    <div
      className={`rounded-lg shadow-lg border-l-4 p-4 flex items-center gap-3 ${bgColors[type]}`}
    >
      <div className={`text-xl ${iconColors[type]} animate-pulse`}>
        {icons[type]}
      </div>
      <div className={`flex-1 ${textColors[type]}`}>
        <div className="font-semibold text-sm">
          {type === "success"
            ? "Berhasil"
            : type === "error"
            ? "Gagal"
            : type === "warning"
            ? "Perhatian"
            : "Info"}
        </div>
        <div className="text-xs opacity-90">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-lg"
      >
        ×
      </button>
    </div>
  );
}
