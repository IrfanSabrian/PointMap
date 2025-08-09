import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faRoute } from "@fortawesome/free-solid-svg-icons";

type Props = {
  isDark: boolean;
  isDashboard: boolean;
  isLoggedIn: boolean;
  selectedFeature: any;
  isContainerShaking: boolean;
  onClose: () => void;
  onOpenDetail: () => void;
  onEditThumbnail: () => void;
  onEditLantai: () => void;
  onSetRouteToBuilding: () => void;
};

export default function BuildingDetailModal(props: Props) {
  const {
    isDark,
    isDashboard,
    isLoggedIn,
    selectedFeature,
    isContainerShaking,
    onClose,
    onOpenDetail,
    onEditThumbnail,
    onEditLantai,
    onSetRouteToBuilding,
  } = props;

  if (!selectedFeature) return null;

  return (
    <div
      data-container="building-detail"
      className={`absolute top-14 right-2 sm:right-4 sm:top-4 z-[201] w-44 sm:w-64 max-w-xs bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-out ${
        isContainerShaking ? "animate-shake" : ""
      }`}
      style={{ boxShadow: "0 8px 32px 0 rgba(30,41,59,0.18)" }}
    >
      <div className={`rounded-xl ${isDark ? "bg-[#232946]" : "bg-white"}`}>
        <div className="px-2 py-1.5 sm:px-4 sm:py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-base font-bold text-primary dark:text-primary-dark break-words whitespace-pre-line pr-4 sm:pr-8 leading-tight">
              {selectedFeature.properties?.nama || "Tanpa Nama"}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-primary dark:hover:text-primary-dark text-xl font-bold focus:outline-none transition-all duration-200"
              aria-label="Tutup detail bangunan"
              title="Tutup"
            >
              ×
            </button>
          </div>
          {isDashboard && isLoggedIn && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interaksi:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {selectedFeature.properties?.interaksi || "Noninteraktif"}
                </span>
              </div>
              <button
                onClick={onEditThumbnail}
                className="text-gray-400 hover:text-primary dark:hover:text-primary-dark transition-colors"
                aria-label="Edit nama dan interaksi bangunan"
                title="Edit nama dan interaksi bangunan"
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            </div>
          )}
        </div>

        <div className="px-2 pt-1.5 sm:px-4 sm:pt-2">
          <div className="relative">
            <img
              src={
                selectedFeature.properties?.thumbnail
                  ? `/${selectedFeature.properties.thumbnail}?v=${Date.now()}`
                  : selectedFeature.properties?.id
                  ? `/img/${
                      selectedFeature.properties.id
                    }/thumbnail.jpg?v=${Date.now()}`
                  : "/img/default/thumbnail.jpg"
              }
              alt={selectedFeature.properties?.nama || "Bangunan"}
              className="w-full h-20 sm:h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/img/default/thumbnail.jpg";
              }}
            />
            {isDashboard && isLoggedIn && (
              <button
                onClick={onEditThumbnail}
                className="absolute top-2 right-2 text-white hover:text-primary dark:hover:text-primary-dark transition-colors z-20 p-1"
                title="Edit thumbnail"
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 sm:gap-3 px-2 py-2 sm:px-4 sm:py-4">
          <div className="flex gap-2 mb-1">
            {selectedFeature.properties?.interaksi?.toLowerCase() ===
              "interaktif" && (
              <button
                className="flex-1 py-2 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow bg-primary text-white hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-accent-dark touch-manipulation"
                onClick={onOpenDetail}
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="sm:hidden">Detail</span>
                <span className="hidden sm:inline">Detail Bangunan</span>
              </button>
            )}
            {isDashboard && isLoggedIn && (
              <button
                className="px-2 sm:px-3 py-2 rounded-lg font-bold text-xs sm:text-sm shadow bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 touch-manipulation"
                onClick={onEditLantai}
                title="Edit Lantai"
              >
                <i className="fas fa-layer-group text-xs sm:text-sm"></i>
              </button>
            )}
          </div>

          {selectedFeature?.properties?.id && (
            <button
              className="w-full py-2 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow bg-accent text-white hover:bg-accent/90 dark:bg-accent-dark dark:hover:bg-accent-dark/80 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-primary-dark touch-manipulation"
              onClick={onSetRouteToBuilding}
            >
              <FontAwesomeIcon
                icon={faRoute}
                className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4"
              />
              Rute
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
