// Untuk menggunakan komponen ini, pastikan sudah install @arcgis/core
// npm install @arcgis/core
import React, { useEffect, useRef, useState } from "react";

const ARCGIS_CDN = "https://js.arcgis.com/4.29/";

interface EsriMapProps {
  isDark?: boolean;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  className?: string;
}

const BASEMAPS = [
  { id: "satellite", name: "Satellite" },
  { id: "streets", name: "Streets" },
  { id: "topo-vector", name: "Topographic" },
  { id: "dark-gray", name: "Dark Gray" },
  { id: "light-gray", name: "Light Gray" },
  { id: "navigation", name: "Navigation" },
];

const EsriMap: React.FC<EsriMapProps> = ({
  isDark,
  initialLat = -0.0,
  initialLng = 109.3333,
  initialZoom = 15,
  className = "",
}) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const viewRef = useRef<any>(null);
  // State: basemap
  const [basemap, setBasemap] = useState(isDark ? "dark-gray" : "topo-vector");
  // State: apakah sedang di satellite
  const [isSatellite, setIsSatellite] = useState(false);
  // State untuk search box
  const [searchText, setSearchText] = useState("");

  // Selalu update basemap dan reset tombol jika mode dark/light berubah
  useEffect(() => {
    console.log(
      "[EsriMap] isDark berubah:",
      isDark,
      "isSatellite:",
      isSatellite
    );
    if (!isSatellite) {
      setBasemap(isDark ? "dark-gray" : "topo-vector");
      if (viewRef.current && viewRef.current.map) {
        console.log(
          "[EsriMap] Update basemap karena mode:",
          isDark ? "dark-gray" : "topo-vector"
        );
        viewRef.current.map.basemap = isDark ? "dark-gray" : "topo-vector";
      }
    }
    // jika sedang satelit, jangan ubah apapun
  }, [isDark]);

  useEffect(() => {
    // Inject ArcGIS JS API CDN script jika belum ada
    if (!document.getElementById("arcgis-js-api")) {
      const script = document.createElement("script");
      script.src = ARCGIS_CDN;
      script.id = "arcgis-js-api";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        scriptLoaded.current = true;
        initMap();
      };
    } else {
      scriptLoaded.current = true;
      initMap();
    }
    function initMap() {
      if (!(window as any).require || !mapDiv.current) return;
      console.log(
        "[EsriMap] Inisialisasi MapView dengan basemap:",
        basemap,
        "center:",
        initialLng,
        initialLat,
        "zoom:",
        initialZoom
      );
      (window as any).require(
        ["esri/Map", "esri/views/MapView"],
        function (Map: any, MapView: any) {
          const map = new Map({ basemap });
          const view = new MapView({
            container: mapDiv.current,
            map,
            center: [initialLng, initialLat],
            zoom: initialZoom,
            ui: { components: [] },
          });
          viewRef.current = view;
        }
      );
    }
    // Cleanup: destroy map view jika perlu
    return () => {
      if (viewRef.current) viewRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update basemap jika berubah
  useEffect(() => {
    console.log("[EsriMap] basemap state berubah:", basemap);
    if (viewRef.current && viewRef.current.map) {
      viewRef.current.map.basemap = basemap;
    }
  }, [basemap]);

  // Toggle basemap: satellite <-> default (topo/dark-gray)
  const handleToggleBasemap = () => {
    console.log(
      "[EsriMap] Toggle basemap. isSatellite:",
      isSatellite,
      "isDark:",
      isDark
    );
    if (isSatellite) {
      setBasemap(isDark ? "dark-gray" : "topo-vector");
      setIsSatellite(false);
      if (viewRef.current && viewRef.current.map) {
        console.log(
          "[EsriMap] Kembali ke default:",
          isDark ? "dark-gray" : "topo-vector"
        );
        viewRef.current.map.basemap = isDark ? "dark-gray" : "topo-vector";
      }
    } else {
      setBasemap("satellite");
      setIsSatellite(true);
      if (viewRef.current && viewRef.current.map) {
        console.log("[EsriMap] Pindah ke satelit");
        viewRef.current.map.basemap = "satellite";
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      // Untuk demo, tampilkan di console
      console.log("Cari lokasi:", searchText);
      // TODO: Integrasi geocoding jika diinginkan
    }
  };

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: 350, cursor: undefined }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.cursor = "auto";
      }}
    >
      {/* Search Box ala Google Maps */}
      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-4 z-30 min-w-56 max-w-[80vw]"
        autoComplete="off"
        style={{ width: 240 }}
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
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Cari lokasi..."
            className={`pl-9 pr-2 py-1.5 w-full bg-transparent outline-none text-sm rounded-xl ${
              isDark
                ? "text-white placeholder:text-gray-400"
                : "text-gray-900 placeholder:text-gray-500"
            }`}
            style={{ minWidth: 120 }}
          />
        </div>
      </form>
      {/* Basemap toggle button kiri bawah */}
      <div className="absolute left-4 bottom-4 z-20">
        <button
          onClick={handleToggleBasemap}
          className={`flex flex-col items-center justify-center rounded-lg shadow-lg px-4 py-3 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-primary/30
            ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-white border-gray-200 hover:bg-gray-100"
            }
          `}
          style={{ width: 64, height: 64 }}
        >
          {isSatellite ? (
            <>
              {/* Ikon globe/peta */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? "#fff" : "#1e293b"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-1"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span
                className={`text-xs font-bold ${
                  isDark ? "text-white" : "text-gray-700"
                }`}
              >
                Peta
              </span>
            </>
          ) : (
            <>
              {/* Ikon satelit */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? "#fff" : "#1e293b"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-1"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <path d="M7 17l4-4 3 3 4-4" />
                <path d="M3 7V3h4" />
                <path d="M17 21h4v-4" />
              </svg>
              <span
                className={`text-xs font-bold ${
                  isDark ? "text-white" : "text-gray-700"
                }`}
              >
                Satelit
              </span>
            </>
          )}
        </button>
      </div>
      <div
        ref={mapDiv}
        style={{ width: "100%", height: "100%", minHeight: 350 }}
        className="w-full h-full"
      />
    </div>
  );
};

export default EsriMap;
