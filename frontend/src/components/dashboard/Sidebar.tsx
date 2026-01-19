"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaBuilding,
  FaDoorOpen,
  FaLayerGroup,
  FaImages,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "next-themes";
import { useCampus } from "@/hooks/useCampus";
import SidebarCampusSwitcher from "@/components/dashboard/SidebarCampusSwitcher";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username?: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { selectedCampus, setSelectedCampus } = useCampus();

  // Debug log
  useEffect(() => {
    console.log("📍 Sidebar: selectedCampus is now", selectedCampus.name);
  }, [selectedCampus]);

  useEffect(() => {
    // Check screen size
    const checkScreen = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    // Get user info
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user info", e);
      }
    }

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaHome },
    { name: "Manajemen Gedung", path: "/dashboard/bangunan", icon: FaBuilding },
    { name: "Manajemen Lantai", path: "/dashboard/lantai", icon: FaLayerGroup },
    { name: "Manajemen Ruangan", path: "/dashboard/ruangan", icon: FaDoorOpen },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-primary dark:text-primary-dark"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-bold text-primary dark:text-primary-dark flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              PointMap Admin
            </span>
          </div>

          {/* Campus Selector */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <SidebarCampusSwitcher
              selectedCampus={selectedCampus}
              onCampusChange={setSelectedCampus}
              isDark={theme === "dark"}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.path) ? "text-white" : ""
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {userInfo?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userInfo?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Konfirmasi Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-start mb-4">
              <i className="fas fa-sign-out-alt text-yellow-500 text-2xl mt-0.5 mr-3"></i>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Konfirmasi Logout
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apakah Anda yakin ingin keluar dari sistem?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaSignOutAlt />
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
