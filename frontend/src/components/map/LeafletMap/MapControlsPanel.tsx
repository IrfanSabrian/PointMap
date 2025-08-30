import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faSyncAlt,
  faGlobe,
  faLayerGroup,
  faChevronLeft,
  faLocation,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { kategoriStyle } from "../../../lib/map/styles";

type SearchFeature = {
  properties?: Record<string, any>;
};

type Props = {
  isDark: boolean;
  isSatellite: boolean;
  layerVisible: boolean;
  isDashboard?: boolean; // Tambahan prop untuk dashboard admin
  // zoom/reset/gps
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onLocateMe: () => void;
  // layer & basemap
  onToggleLayer: () => void;
  onToggleBasemap: () => void;
  // layer control props
  jalurVisible: boolean;
  titikVisible: boolean;
  bangunanVisible: boolean;
  onToggleJalur: (visible: boolean) => void;
  onToggleTitik: (visible: boolean) => void;
  onToggleBangunan: (visible: boolean) => void;
  // search
  searchText: string;
  onSearchTextChange: (v: string) => void;
  showSearchResults: boolean;
  onToggleSearchResults: (show: boolean) => void;
  isLoadingData: boolean;
  searchResults: SearchFeature[];
  onSelectSearchResult: (feature: SearchFeature) => void;
  isHighlightActive: boolean;
};

export default function MapControlsPanel(props: Props) {
  const [showLegend, setShowLegend] = React.useState(false);
  const [showLayerControl, setShowLayerControl] = React.useState(false);
  const legendRef = useRef<HTMLDivElement>(null);
  const legendToggleRef = useRef<HTMLButtonElement>(null);
  const layerControlRef = useRef<HTMLDivElement>(null);
  const layerControlToggleRef = useRef<HTMLButtonElement>(null);

  const {
    isDark,
    isSatellite,
    layerVisible,
    isDashboard = false, // Default false jika tidak ada
    onZoomIn,
    onZoomOut,
    onReset,
    onLocateMe,
    onToggleLayer,
    onToggleBasemap,
    jalurVisible,
    titikVisible,
    bangunanVisible,
    onToggleJalur,
    onToggleTitik,
    onToggleBangunan,
    searchText,
    onSearchTextChange,
    showSearchResults,
    onToggleSearchResults,
    isLoadingData,
    searchResults,
    onSelectSearchResult,
    isHighlightActive,
  } = props;

  // Handle clicking outside legend to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showLegend &&
        legendRef.current &&
        !legendRef.current.contains(event.target as Node) &&
        legendToggleRef.current &&
        !legendToggleRef.current.contains(event.target as Node)
      ) {
        setShowLegend(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLegend]);

  // Handle clicking outside layer control to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showLayerControl &&
        layerControlRef.current &&
        !layerControlRef.current.contains(event.target as Node) &&
        layerControlToggleRef.current &&
        !layerControlToggleRef.current.contains(event.target as Node)
      ) {
        setShowLayerControl(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLayerControl]);

  return (
    <>
      {/* Search Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (searchResults.length > 0) onSelectSearchResult(searchResults[0]);
        }}
        className="search-container absolute top-2 left-2 sm:top-4 sm:left-4 z-20 w-[calc(100vw-16px)] max-w-[280px] sm:min-w-56 sm:max-w-[80vw] sm:w-[240px]"
        autoComplete="off"
      >
        <div
          className={`relative flex items-center border rounded-xl shadow-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 transition-all ${
            isDark
              ? "bg-[#232946] border-[#232946] text-white placeholder:text-gray-400"
              : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
          }`}
        >
          <span className="absolute left-3 text-gray-400">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              onSearchTextChange(e.target.value);
              onToggleSearchResults(true);
            }}
            onFocus={() => onToggleSearchResults(true)}
            placeholder="Cari bangunan..."
            className={`pl-9 pr-2 py-1.5 w-full bg-transparent outline-none text-sm rounded-xl ${
              isDark
                ? "text-white placeholder:text-gray-400"
                : "text-gray-900 placeholder:text-gray-500"
            } ${isHighlightActive ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ minWidth: 120 }}
            disabled={isHighlightActive}
          />
        </div>
        {showSearchResults && (
          <div
            className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border max-h-60 overflow-y-auto z-20 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {isLoadingData ? (
              <div
                className={`px-3 py-4 text-center text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Memuat data...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div
                  className={`px-3 py-2 text-xs border-b ${
                    isDark
                      ? "text-gray-400 border-gray-700"
                      : "text-gray-600 border-gray-200"
                  }`}
                >
                  {searchText.trim()
                    ? `${searchResults.length} hasil ditemukan`
                    : `Menampilkan ${Math.min(
                        searchResults.length,
                        10
                      )} bangunan`}
                </div>
                {searchResults.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => onSelectSearchResult(feature)}
                    className={`px-3 py-2 transition-colors ${
                      isHighlightActive
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-opacity-80"
                    } ${
                      isDark
                        ? "hover:bg-gray-700 text-white border-b border-gray-700"
                        : "hover:bg-gray-100 text-gray-900 border-b border-gray-200"
                    } ${
                      index === searchResults.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {feature.properties?.nama || "Tanpa Nama"}
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {feature.properties?.displayType === "ruangan" ? (
                        <>🏢 Ruangan</>
                      ) : (
                        <>
                          🏛️ Bangunan{" "}
                          {feature.properties?.displayInfo
                            ? `• ${feature.properties.displayInfo}`
                            : ""}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div
                className={`px-3 py-4 text-center text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tidak ada hasil ditemukan
              </div>
            )}
          </div>
        )}
      </form>

      {/* Kontrol kanan bawah */}
      <div className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4 z-20 flex flex-col gap-2">
        {/* Tombol Layer Peta & Satelit - Hanya muncul di dashboard admin, posisi di atas legend */}
        {isDashboard && (
          <>
            <button
              ref={layerControlToggleRef}
              data-control="toggle-layer"
              onClick={() => setShowLayerControl(!showLayerControl)}
              aria-label={
                showLayerControl
                  ? "Sembunyikan layer control"
                  : "Tampilkan layer control"
              }
              title={
                showLayerControl
                  ? "Sembunyikan layer control"
                  : "Tampilkan layer control"
              }
              className={`flex flex-col items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="w-3 h-3 sm:w-4 sm:h-4"
              />
            </button>
            <button
              data-control="toggle-basemap"
              onClick={onToggleBasemap}
              aria-label={
                isSatellite
                  ? "Ganti ke tampilan peta"
                  : "Ganti ke tampilan satelit"
              }
              title={
                isSatellite
                  ? "Ganti ke tampilan peta"
                  : "Ganti ke tampilan satelit"
              }
              className={`flex flex-col items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FontAwesomeIcon
                icon={faGlobe}
                className="w-3 h-3 sm:w-4 sm:h-4"
              />
            </button>
          </>
        )}

        {/* Legend Toggle Button - Posisi di bawah tombol layer (jika ada) atau di atas tombol + */}
        <button
          ref={legendToggleRef}
          data-control="legend-toggle"
          onClick={() => setShowLegend(!showLegend)}
          className={`flex items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
          }`}
          title={showLegend ? "Sembunyikan Legend" : "Tampilkan Legend"}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${
              showLegend ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className="flex flex-col gap-1 mb-2">
          <button
            data-control="zoom-in"
            onClick={onZoomIn}
            className={`flex items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
            title="Zoom In"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            data-control="zoom-out"
            onClick={onZoomOut}
            className={`flex items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
            title="Zoom Out"
          >
            <FontAwesomeIcon icon={faMinus} className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          <button
            data-control="reset-zoom"
            onClick={onReset}
            className={`flex items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
            title="Reset ke Posisi Awal"
          >
            <FontAwesomeIcon
              icon={faSyncAlt}
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </button>
          <button
            data-control="locate-me"
            onClick={onLocateMe}
            aria-label="Lokasi Saya"
            title="Lokasi Saya"
            className={`flex items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-12 sm:h-12 sm:px-3 sm:py-2 ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FontAwesomeIcon
              icon={faLocation}
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </button>
        </div>

        {/* Legend Box */}
        {showLegend && (
          <div
            ref={legendRef}
            className={`absolute right-full top-0 mr-2 p-2 sm:p-4 rounded-lg shadow-lg border min-w-[220px] sm:min-w-[240px] ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 border-b pb-1.5 sm:pb-2">
              Legend Peta
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2 text-xs sm:text-sm">
              {Object.entries(kategoriStyle).map(([kategori, style]) => (
                <div
                  key={kategori}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border border-gray-300 flex-shrink-0"
                    style={{
                      backgroundColor: style.fillColor as string,
                      opacity: style.fillOpacity,
                    }}
                  ></div>
                  <span className="text-xs truncate">{kategori}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer Control Box */}
        {showLayerControl && (
          <div
            ref={layerControlRef}
            className={`absolute right-full top-0 mr-2 p-2 sm:p-4 rounded-lg shadow-lg border min-w-[200px] sm:min-w-[220px] ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 border-b pb-1.5 sm:pb-2">
              Layer Control
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              {/* Titik Layer Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-sm"></div>
                  <span>Titik</span>
                </div>
                <button
                  onClick={() => onToggleTitik(!titikVisible)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded transition-colors flex items-center justify-center ${
                    titikVisible
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                  }`}
                  title={titikVisible ? "Sembunyikan Titik" : "Tampilkan Titik"}
                >
                  <FontAwesomeIcon
                    icon={titikVisible ? faEye : faEyeSlash}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  />
                </button>
              </div>

              {/* Jalur Layer Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-sm"></div>
                  <span>Jalur</span>
                </div>
                <button
                  onClick={() => onToggleJalur(!jalurVisible)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded transition-colors flex items-center justify-center ${
                    jalurVisible
                      ? "bg-black hover:bg-gray-800 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                  }`}
                  title={jalurVisible ? "Sembunyikan Jalur" : "Tampilkan Jalur"}
                >
                  <FontAwesomeIcon
                    icon={jalurVisible ? faEye : faEyeSlash}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  />
                </button>
              </div>

              {/* Building Layer Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-sm"></div>
                  <span>Bangunan</span>
                </div>
                <button
                  onClick={() => onToggleBangunan(!bangunanVisible)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded transition-colors flex items-center justify-center ${
                    bangunanVisible
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                  }`}
                  title={
                    bangunanVisible
                      ? "Sembunyikan Bangunan"
                      : "Tampilkan Bangunan"
                  }
                >
                  <FontAwesomeIcon
                    icon={bangunanVisible ? faEye : faEyeSlash}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kontrol kiri bawah - Kosong karena tombol layer dipindah ke kanan untuk dashboard admin */}
      {!isDashboard && (
        <div className="absolute left-2 bottom-2 sm:left-4 sm:left-4 z-20 flex flex-col gap-2">
          <button
            data-control="toggle-layer"
            onClick={onToggleLayer}
            aria-label={
              layerVisible ? "Sembunyikan layer peta" : "Tampilkan layer peta"
            }
            title={
              layerVisible ? "Sembunyikan layer peta" : "Tampilkan layer peta"
            }
            className={`flex flex-col items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-16 sm:h-16 sm:px-4 sm:py-3 ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FontAwesomeIcon
              icon={faLayerGroup}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
          <button
            data-control="toggle-basemap"
            onClick={onToggleBasemap}
            aria-label={
              isSatellite
                ? "Ganti ke tampilan peta"
                : "Ganti ke tampilan satelit"
            }
            title={
              isSatellite
                ? "Ganti ke tampilan peta"
                : "Ganti ke tampilan satelit"
            }
            className={`flex flex-col items-center justify-center rounded-lg shadow-lg text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer touch-manipulation w-11 h-11 sm:w-16 sm:h-16 sm:px-4 sm:py-3 ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FontAwesomeIcon
              icon={faGlobe}
              className="w-3 h-3 sm:w-4 sm:h-4 mb-0 sm:mb-0.5"
            />
            <span
              className={`text-xs font-bold hidden sm:block ${
                isDark ? "text-white" : "text-gray-700"
              }`}
            >
              {isSatellite ? "Peta" : "Satelit"}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
