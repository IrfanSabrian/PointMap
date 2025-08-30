import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface LayerControlPanelProps {
  isDark: boolean;
  jalurVisible: boolean;
  titikVisible: boolean;
  bangunanVisible: boolean;
  onToggleJalur: (visible: boolean) => void;
  onToggleTitik: (visible: boolean) => void;
  onToggleBangunan: (visible: boolean) => void;
}

export default function LayerControlPanel({
  isDark,
  jalurVisible,
  titikVisible,
  bangunanVisible,
  onToggleJalur,
  onToggleTitik,
  onToggleBangunan,
}: LayerControlPanelProps) {
  return (
    <div
      className={`absolute right-24 bottom-2 sm:right-28 sm:bottom-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-3 min-w-[180px]`}
    >
      <div className="space-y-2">
        {/* Titik Layer Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <span
              className={`text-sm font-medium ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Titik
            </span>
          </div>
          <button
            onClick={() => onToggleTitik(!titikVisible)}
            className={`w-6 h-6 rounded transition-colors flex items-center justify-center ${
              titikVisible
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-400 hover:bg-gray-500 text-white"
            }`}
            title={titikVisible ? "Sembunyikan Titik" : "Tampilkan Titik"}
          >
            <FontAwesomeIcon
              icon={titikVisible ? faEye : faEyeSlash}
              className="w-3 h-3"
            />
          </button>
        </div>

        {/* Jalur Layer Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-black rounded-sm"></div>
            <span
              className={`text-sm font-medium ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Jalur
            </span>
          </div>
          <button
            onClick={() => onToggleJalur(!jalurVisible)}
            className={`w-6 h-6 rounded transition-colors flex items-center justify-center ${
              jalurVisible
                ? "bg-black hover:bg-gray-800 text-white"
                : "bg-gray-400 hover:bg-gray-500 text-white"
            }`}
            title={jalurVisible ? "Sembunyikan Jalur" : "Tampilkan Jalur"}
          >
            <FontAwesomeIcon
              icon={jalurVisible ? faEye : faEyeSlash}
              className="w-3 h-3"
            />
          </button>
        </div>

        {/* Building Layer Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <span
              className={`text-sm font-medium ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Bangunan
            </span>
          </div>
          <button
            onClick={() => onToggleBangunan(!bangunanVisible)}
            className={`w-6 h-6 rounded transition-colors flex items-center justify-center ${
              bangunanVisible
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-400 hover:bg-gray-500 text-white"
            }`}
            title={
              bangunanVisible ? "Sembunyikan Bangunan" : "Tampilkan Bangunan"
            }
          >
            <FontAwesomeIcon
              icon={bangunanVisible ? faEye : faEyeSlash}
              className="w-3 h-3"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
