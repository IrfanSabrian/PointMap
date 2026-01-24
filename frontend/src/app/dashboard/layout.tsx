"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { validateToken, setupAutoLogout } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoLogoutSetupRef = useRef<boolean>(false); // Track if auto-logout is already setup
  const { showToast } = useToast();

  // Function to check token validity
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return false;
    }

    // Validate token expiry
    if (!validateToken(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return false;
    }

    return true;
  };

  useEffect(() => {
    // Initial check
    const token = localStorage.getItem("token");
    if (checkAuth()) {
      setIsAuthenticated(true);

      // Setup auto-logout timer (only once per token)
      if (token && !autoLogoutSetupRef.current) {
        autoLogoutSetupRef.current = true;
        setupAutoLogout(token, () => {
          setIsAuthenticated(false);
          router.push("/login");
        });
      }
    }
    setIsLoading(false);

    // Set up periodic token validation every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      if (!checkAuth()) {
        setIsAuthenticated(false);
      }
    }, 300000); // Check every 5 minutes (fallback only, setupAutoLogout handles exact expiry)

    // Listen for manual logout events
    const handleLogout = () => {
      setIsAuthenticated(false);
      router.push("/login");
    };

    window.addEventListener("login-status-changed", handleLogout);

    // Listen for token expiry events to show notification
    const handleTokenExpired = (e: Event) => {
      const customEvent = e as CustomEvent;
      const message = customEvent.detail?.message || "Sesi Anda telah habis";

      // Show toast using existing toast component
      showToast(message, "warning");
    };

    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener("login-status-changed", handleLogout);
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-4 lg:p-4 pt-20 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
