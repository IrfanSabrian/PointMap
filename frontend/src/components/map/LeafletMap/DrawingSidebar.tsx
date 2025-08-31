import React, { useState, useEffect } from "react";
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
  externalActiveMode?: string | null;
}

export default function DrawingSidebar({
  isDark,
  isDashboard = false,
  onDrawingModeChange,
  externalActiveMode = null,
}: DrawingSidebarProps) {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to disable marker dragging and vertex addition
  const disableMarkerInteractions = () => {
    // Find only middle marker elements (not end markers)
    const middleMarkers = document.querySelectorAll(
      ".leaflet-marker-icon.marker-icon.marker-icon-middle"
    );

    middleMarkers.forEach((marker) => {
      // Check if this marker belongs to a polyline (not polygon)
      const markerElement = marker as HTMLElement;

      // Try to find the parent polyline layer to determine if this is a polyline marker
      // We'll look for the closest polyline element in the DOM
      let isPolylineMarker = false;

      // Look for the parent polyline by checking if there's a polyline element nearby
      // This is a heuristic approach - middle markers for polylines are the ones we want to disable
      const parentContainer = markerElement.closest(".leaflet-overlay-pane");
      if (parentContainer) {
        // Check if there are polyline elements in the same container
        const polylines = parentContainer.querySelectorAll(
          "path.leaflet-interactive"
        );
        polylines.forEach((path) => {
          // If this path is part of a polyline (not polygon), we can identify it
          // For now, let's assume all middle markers are for polylines since that's the main use case
          // You can refine this logic later if needed
          isPolylineMarker = true;
        });
      }

      // IMPORTANT: Only disable middle markers for POLYLINES, not POLYGONS
      // We need to be more specific about which markers to disable

      // For now, let's try a different approach - only disable markers that are clearly polyline markers
      // We'll check if the marker is positioned on a polyline path

      // Get the marker position
      const markerRect = markerElement.getBoundingClientRect();
      const markerCenterX = markerRect.left + markerRect.width / 2;
      const markerCenterY = markerRect.top + markerRect.height / 2;

      // Look for nearby polyline paths
      const nearbyPaths = document.querySelectorAll("path.leaflet-interactive");
      let isNearPolyline = false;

      nearbyPaths.forEach((path) => {
        const pathElement = path as SVGPathElement;
        const pathRect = pathElement.getBoundingClientRect();

        // Check if marker is near this path
        if (
          Math.abs(markerCenterX - (pathRect.left + pathRect.width / 2)) < 50 &&
          Math.abs(markerCenterY - (pathRect.top + pathRect.height / 2)) < 50
        ) {
          // Check if this path is a polyline (not polygon)
          // Polygons typically have fill, polylines don't
          const computedStyle = window.getComputedStyle(pathElement);
          const fill = computedStyle.fill;

          // If fill is 'none' or transparent, it's likely a polyline
          if (
            fill === "none" ||
            fill === "transparent" ||
            fill === "rgba(0, 0, 0, 0)"
          ) {
            isNearPolyline = true;
          }
        }
      });

      // Only disable if it's a polyline marker
      if (isNearPolyline) {
        console.log("🚫 Disabling polyline middle marker");

        // Remove draggable attribute
        marker.removeAttribute("draggable");

        // Remove tabindex to prevent focus
        marker.removeAttribute("tabindex");

        // Remove role
        marker.removeAttribute("role");

        // Add event listeners to prevent drag
        marker.addEventListener(
          "mousedown",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          },
          { passive: false }
        );

        marker.addEventListener(
          "dragstart",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          },
          { passive: false }
        );

        marker.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          },
          { passive: false }
        );

        // Prevent any click events that might add vertices
        marker.addEventListener(
          "click",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          },
          { passive: false }
        );

        marker.addEventListener(
          "dblclick",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          },
          { passive: false }
        );

        // Add CSS to make it non-interactive and hide it completely
        (marker as HTMLElement).style.pointerEvents = "none";
        (marker as HTMLElement).style.userSelect = "none";
        (marker as HTMLElement).style.cursor = "default";
        (marker as HTMLElement).style.display = "none";
        (marker as HTMLElement).style.visibility = "hidden";
        (marker as HTMLElement).style.opacity = "0";
        (marker as HTMLElement).style.width = "0";
        (marker as HTMLElement).style.height = "0";
        (marker as HTMLElement).style.overflow = "hidden";
      } else {
        console.log("✅ Keeping polygon middle marker enabled");
        // Don't disable polygon middle markers - let them work normally
      }
    });
  };

  // Run the disable function periodically to catch new markers
  useEffect(() => {
    const interval = setInterval(() => {
      disableMarkerInteractions();
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Also run when drawing mode changes
  useEffect(() => {
    if (activeMode) {
      // Small delay to ensure markers are rendered
      setTimeout(() => {
        disableMarkerInteractions();
      }, 200);
    }
  }, [activeMode]);

  // Sinkronkan state aktif dengan state eksternal dari map
  React.useEffect(() => {
    if (externalActiveMode !== activeMode) {
      setActiveMode(externalActiveMode ?? null);
    }
    // Jangan otomatis tutup sidebar ketika externalActiveMode null
    // Sidebar hanya akan tertutup jika user secara manual menekan tombol toggle
    if (externalActiveMode) {
      setIsDrawingEnabled(true);
      setIsSidebarOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalActiveMode]);

  const handleDrawingModeChange = (mode: string | null) => {
    if (activeMode === mode) {
      // Jika user klik tool yang sudah aktif, reset drawing mode
      setActiveMode(null);
      onDrawingModeChange?.(null);
      // Untuk circle marker, reset mode agar tidak bisa tambah marker lagi
      if (mode === "circle") {
        console.log(
          "Circle marker mode deactivated - no more markers can be added"
        );
      }
    } else {
      // Jika user pilih tool baru, aktifkan tool tersebut
      setActiveMode(mode);
      onDrawingModeChange?.(mode);
    }
    // Pastikan drawing mode tetap aktif agar sidebar tetap terbuka
    if (mode) {
      setIsDrawingEnabled(true);
      setIsSidebarOpen(true);
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Drawing Tools
          </h3>
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title="Tutup Sidebar"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
          </button>
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
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    activeMode === "polygon"
                      ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/40 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-primary hover:bg-primary/10 hover:text-white/90"
                      : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/10"
                  }`}
                  title="Gambar Polygon"
                >
                  <FontAwesomeIcon icon={faDrawPolygon} className="w-5 h-5" />
                  <span className="text-xs font-medium">Polygon</span>
                </button>

                {/* Polyline Tool */}
                <button
                  onClick={() => handleDrawingModeChange("polyline")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    activeMode === "polyline"
                      ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/40 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-primary hover:bg-primary/10 hover:text-white/90"
                      : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/10"
                  }`}
                  title="Gambar Polyline"
                >
                  <FontAwesomeIcon icon={faMinus} className="w-5 h-5" />
                  <span className="text-xs font-medium">Polyline</span>
                </button>

                {/* Circle Marker Tool */}
                <button
                  onClick={() => handleDrawingModeChange("circle")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    activeMode === "circle"
                      ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/40 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
                      : isDark
                      ? "border-gray-600 bg-gray-700 text-white hover:border-primary hover:bg-primary/10 hover:text-white/90"
                      : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/10"
                  }`}
                  title="Tambah Circle Marker"
                >
                  <FontAwesomeIcon icon={faCircle} className="w-5 h-5" />
                  <span className="text-xs font-medium">Marker</span>
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
                  title="Rotate Layers"
                >
                  <FontAwesomeIcon icon={faRuler} className="w-5 h-5" />
                  <span className="text-xs font-medium">Rotate</span>
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
                <li>
                  • Polygon/Line: klik untuk menggambar, double-click untuk
                  selesai
                </li>
                <li>
                  • Marker: klik pada peta untuk menambah marker, klik tool lagi
                  untuk selesai
                </li>
                <li>• Setelah selesai, pilih tool lain atau tutup sidebar</li>
                <li>
                  • Edit: klik tombol edit → klik layer untuk resize
                  polygon/polyline
                </li>
                <li>
                  • Scale: klik tombol rotate → klik layer untuk memutar
                  polygon/polyline
                </li>
                <li>
                  • Drag: klik tombol drag → klik layer untuk menggeser
                  polygon/polyline
                </li>
                <li>
                  • Remove: klik tombol remove → klik layer untuk menghapus
                  (akan ada konfirmasi)
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
