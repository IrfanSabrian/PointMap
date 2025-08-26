import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDrawPolygon,
  faMinus,
  faCircle,
  faEdit,
  faArrowsAlt,
  faTrash,
  faRuler,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

interface DrawingSidebarProps {
  isDark: boolean;
  isDashboard?: boolean;
  onDrawingModeChange?: (mode: string | null) => void;
}

export default function DrawingSidebar({
  isDark,
  isDashboard = false,
  onDrawingModeChange,
}: DrawingSidebarProps) {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleDrawingModeChange = (mode: string | null) => {
    if (activeMode === mode) {
      // If clicking the same mode, disable it
      setActiveMode(null);
      onDrawingModeChange?.(null);
    } else {
      // Enable new mode
      setActiveMode(mode);
      onDrawingModeChange?.(mode);
    }
  };

  const handleToggleDrawing = () => {
    const newState = !isDrawingEnabled;
    setIsDrawingEnabled(newState);
    if (!newState) {
      setActiveMode(null);
      onDrawingModeChange?.(null);
      setIsSidebarOpen(false); // Tutup sidebar saat drawing dimatikan
    } else {
      setIsSidebarOpen(true); // Buka sidebar saat drawing diaktifkan
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Only show in dashboard mode
  if (!isDashboard) {
    return null;
  }

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={handleToggleDrawing}
        className={`absolute top-1/2 transform -translate-y-1/2 z-40 flex items-center justify-center w-8 h-12 bg-primary text-white rounded-r-lg shadow-lg transition-all duration-300 hover:bg-primary/90 ${
          isSidebarOpen ? "left-[280px]" : "left-2"
        }`}
        title={isDrawingEnabled ? "Nonaktifkan Drawing" : "Aktifkan Drawing"}
      >
        <FontAwesomeIcon
          icon={isSidebarOpen ? faChevronLeft : faChevronRight}
          className="w-4 h-4"
        />
      </button>

      {/* Drawing Sidebar */}
      <div
        className={`absolute left-0 top-0 h-full z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "280px" }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Drawing Tools
          </h3>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-full">
          {/* Drawing Tools Section */}
          {isDrawingEnabled && (
            <div className="space-y-3">
              <h4
                className={`text-sm font-semibold uppercase tracking-wide ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Drawing Tools
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Polygon Tool */}
                <button
                  onClick={() => handleDrawingModeChange("polygon")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    activeMode === "polygon"
                      ? "border-primary bg-primary/10 text-primary"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  title="Gambar Polygon"
                >
                  <FontAwesomeIcon icon={faDrawPolygon} className="w-5 h-5" />
                  <span className="text-xs font-medium">Polygon</span>
                </button>

                {/* Polyline Tool */}
                <button
                  onClick={() => handleDrawingModeChange("polyline")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    activeMode === "polyline"
                      ? "border-primary bg-primary/10 text-primary"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  title="Gambar Polyline"
                >
                  <FontAwesomeIcon icon={faMinus} className="w-5 h-5" />
                  <span className="text-xs font-medium">Polyline</span>
                </button>

                {/* Circle Tool */}
                <button
                  onClick={() => handleDrawingModeChange("circle")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    activeMode === "circle"
                      ? "border-primary bg-primary/10 text-primary"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  title="Gambar Circle"
                >
                  <FontAwesomeIcon icon={faCircle} className="w-5 h-5" />
                  <span className="text-xs font-medium">Circle</span>
                </button>
              </div>
            </div>
          )}

          {/* Edit Tools Section */}
          {isDrawingEnabled && (
            <div className="space-y-3">
              <h4
                className={`text-sm font-semibold uppercase tracking-wide ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Edit Tools
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Edit Tool */}
                <button
                  onClick={() => handleDrawingModeChange("edit")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    activeMode === "edit"
                      ? "border-primary bg-primary/10 text-primary"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  title="Edit Layers"
                >
                  <FontAwesomeIcon icon={faEdit} className="w-5 h-5" />
                  <span className="text-xs font-medium">Edit</span>
                </button>

                {/* Drag Tool */}
                <button
                  onClick={() => handleDrawingModeChange("drag")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    activeMode === "drag"
                      ? "border-primary bg-primary/10 text-primary"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  title="Drag Layers"
                >
                  <FontAwesomeIcon icon={faArrowsAlt} className="w-5 h-5" />
                  <span className="text-xs font-medium">Drag</span>
                </button>

                {/* Remove Tool */}
                <button
                  onClick={() => handleDrawingModeChange("remove")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 ${
                    activeMode === "remove"
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                      : "border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                  }`}
                  title="Remove Layers"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                  <span className="text-xs font-medium">Remove</span>
                </button>

                {/* Scale Tool */}
                <button
                  onClick={() => handleDrawingModeChange("scale")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    activeMode === "scale"
                      ? "border-primary bg-primary/10 text-primary"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  title="Scale Layers"
                >
                  <FontAwesomeIcon icon={faRuler} className="w-5 h-5" />
                  <span className="text-xs font-medium">Scale</span>
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {isDrawingEnabled && (
            <div
              className={`p-3 rounded-lg border ${
                isDark
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h5
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Cara Penggunaan:
              </h5>
              <ul
                className={`text-xs space-y-1 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <li>• Pilih tool yang diinginkan</li>
                <li>• Klik pada peta untuk menggambar</li>
                <li>• Double-click untuk menyelesaikan</li>
                <li>• Edit: klik layer untuk mengedit</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
