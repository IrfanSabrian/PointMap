import React from "react";

/**
 * Navigation
 *
 * Panel kontrol navigasi langkah demi langkah (stepper) untuk rute aktif.
 */
import { getStepInstruction } from "@/lib/routeSteps";

type TransportMode = "jalan_kaki" | "kendaraan";

type Props = {
  isDark: boolean;
  isMobile: boolean;
  routeSteps: any[];
  activeStepIndex: number;
  hasReachedDestination: boolean;
  routeDistance: number | null;
  totalWalkingTime: number | null;
  totalVehicleTime: number | null;
  transportMode: TransportMode;
  showStartButton: boolean;
  onStart: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Navigation(props: Props) {
  const {
    isDark,
    isMobile,
    routeSteps,
    activeStepIndex,
    hasReachedDestination,
    routeDistance,
    totalWalkingTime,
    totalVehicleTime,
    transportMode,
    showStartButton,
    onStart,
    onClose,
    onPrev,
    onNext,
  } = props;

  return (
    <>
      {showStartButton && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[20]">
          <button
            onClick={onStart}
            aria-label="Mulai navigasi ke tujuan"
            title="Mulai navigasi ke tujuan"
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            🧭 Mulai Navigasi
          </button>
        </div>
      )}

      {routeSteps.length > 0 && (
        <div
          className={`absolute bottom-2 left-16 right-16 sm:bottom-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-[20] w-auto sm:w-96 max-w-none sm:max-w-[90vw] ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          } border rounded-xl shadow-lg`}
        >
          <div className="p-1.5 sm:p-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
              <div className="flex flex-col">
                <h3 className="font-semibold text-xs sm:text-sm">Navigasi</h3>
                {routeDistance !== null && (
                  <div className="text-xs text-primary dark:text-primary-dark font-bold">
                    <span className="sm:hidden">
                      {Math.round(routeDistance)}m
                    </span>
                    <span className="hidden sm:inline">
                      Total Jarak: {Math.round(routeDistance)} meter
                    </span>
                  </div>
                )}
                {totalWalkingTime !== null && totalVehicleTime !== null && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                    {transportMode === "jalan_kaki" ? (
                      <span className="flex items-center gap-1">
                        <span className="sm:hidden">
                          {Math.floor(totalWalkingTime / 60)}:
                          {String(Math.round(totalWalkingTime % 60)).padStart(
                            2,
                            "0"
                          )}
                        </span>
                        <span className="hidden sm:inline">
                          {Math.floor(totalWalkingTime / 60)} menit{" "}
                          {Math.round(totalWalkingTime % 60)} detik
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="sm:hidden">
                          {Math.floor(totalVehicleTime / 60)}:
                          {String(Math.round(totalVehicleTime % 60)).padStart(
                            2,
                            "0"
                          )}
                        </span>
                        <span className="hidden sm:inline">
                          {Math.floor(totalVehicleTime / 60)} menit{" "}
                          {Math.round(totalVehicleTime % 60)} detik
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-primary dark:hover:text-primary-dark text-xl font-bold focus:outline-none"
                title="Tutup Navigasi"
              >
                ×
              </button>
            </div>

            <div className="mb-2 sm:mb-4">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {hasReachedDestination
                    ? routeSteps.length + 1
                    : activeStepIndex + 1}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="sm:hidden">
                    {activeStepIndex + 1}/{routeSteps.length + 1}
                  </span>
                  <span className="hidden sm:inline">
                    dari {routeSteps.length + 1} langkah
                  </span>
                </div>
                {activeStepIndex < routeSteps.length - 1 &&
                  !hasReachedDestination && (
                    <div className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 sm:py-1 rounded">
                      <span className="sm:hidden">
                        {Math.round(routeSteps[activeStepIndex]?.distance || 0)}
                        m
                      </span>
                      <span className="hidden sm:inline">
                        {Math.round(routeSteps[activeStepIndex]?.distance || 0)}
                        m
                      </span>
                    </div>
                  )}
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                {hasReachedDestination
                  ? "Sampai tujuan"
                  : activeStepIndex === routeSteps.length - 1
                  ? "Jalan ke tujuan"
                  : getStepInstruction(
                      activeStepIndex,
                      routeSteps,
                      transportMode
                    )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onPrev}
                disabled={activeStepIndex === 0 && !hasReachedDestination}
                className={`flex-1 py-3 px-4 sm:py-2 sm:px-3 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                  activeStepIndex === 0 && !hasReachedDestination
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                    : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                }`}
              >
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">← Prev</span>
              </button>
              <button
                onClick={onNext}
                disabled={
                  activeStepIndex === routeSteps.length - 1 &&
                  hasReachedDestination
                }
                className={`flex-1 py-3 px-4 sm:py-2 sm:px-3 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                  activeStepIndex === routeSteps.length - 1 &&
                  hasReachedDestination
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                    : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                }`}
              >
                <span className="sm:hidden">→</span>
                <span className="hidden sm:inline">Next →</span>
              </button>
            </div>

            <div className="mt-1.5 sm:mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-2">
                <div
                  className="bg-blue-500 h-1 sm:h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      hasReachedDestination
                        ? 100
                        : ((activeStepIndex + 1) / (routeSteps.length + 1)) *
                          100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
