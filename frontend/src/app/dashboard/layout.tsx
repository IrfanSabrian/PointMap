"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { validateToken } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (checkAuth()) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Set up periodic token validation every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      if (!checkAuth()) {
        setIsAuthenticated(false);
      }
    }, 30000); // Check every 30 seconds

    // Listen for manual logout events
    const handleLogout = () => {
      setIsAuthenticated(false);
      router.push("/login");
    };

    window.addEventListener("login-status-changed", handleLogout);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener("login-status-changed", handleLogout);
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
