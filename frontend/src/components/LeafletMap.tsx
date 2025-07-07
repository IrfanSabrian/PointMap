import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  isDark?: boolean;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  className?: string;
}

const geojsonUrl = "/geojson/Polnep WGS_1984.geojson";

const kategoriStyle: Record<string, L.PathOptions> = {
  Bangunan: {
    color: "#3a86ff",
    weight: 1,
    fillColor: "#3a86ff",
    fillOpacity: 0.7,
  },
  Kanopi: {
    color: "#ffbe0b",
    weight: 1,
    fillColor: "#ffbe0b",
    fillOpacity: 0.6,
  },
  Jalan: {
    color: "#43aa8b",
    weight: 1,
    fillColor: "#43aa8b",
    fillOpacity: 0.8,
  },
  Parkir: {
    color: "#808080",
    weight: 1,
    fillColor: "#808080",
    fillOpacity: 0.6,
  },
  Lahan: {
    color: "#22c55e",
    weight: 1,
    fillColor: "#22c55e",
    fillOpacity: 0.5,
  },
  Kolam: {
    color: "#3b82f6",
    weight: 1,
    fillColor: "#3b82f6",
    fillOpacity: 0.4,
  },
};

const defaultStyle: L.PathOptions = {
  color: "#adb5bd",
  weight: 1,
  fillColor: "#adb5bd",
  fillOpacity: 0.5,
};

const BASEMAPS = [
  {
    key: "esri_satellite",
    label: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  {
    key: "esri_topo",
    label: "Esri Topographic",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  },
  {
    key: "alidade_smooth_dark",
    label: "Stadia (Dark Mode)",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>',
  },
];

const LeafletMap: React.FC<LeafletMapProps> = ({
  isDark = false,
  initialLat = -0.0545,
  initialLng = 109.3465,
  initialZoom = 18,
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON<any> | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const [allFeatures, setAllFeatures] = useState<any[]>([]);
  const [basemap, setBasemap] = useState<string>(
    isDark ? "alidade_smooth_dark" : "esri_topo"
  );
  const [layerVisible, setLayerVisible] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isSatellite, setIsSatellite] = useState(basemap === "esri_satellite");
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Inisialisasi map hanya sekali
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });
    leafletMapRef.current = map;

    // Basemap awal
    const bm = BASEMAPS.find((b) => b.key === basemap) || BASEMAPS[1];
    const tileLayer = L.tileLayer(bm.url, {
      attribution: bm.attribution,
      maxZoom: 20,
    });
    tileLayer.addTo(map);
    basemapLayerRef.current = tileLayer;

    // GeoJSON Layer
    const geoJsonLayer = L.geoJSON(undefined, {
      style: (feature: any) => {
        const kategori = feature?.properties?.kategori;
        return kategoriStyle[kategori] || defaultStyle;
      },
      onEachFeature: (feature, layer) => {
        const nama = feature.properties?.nama || "Tanpa Nama";
        const kategori = feature.properties?.kategori || "-";
        const subtipe = feature.properties?.subtipe || "-";
        layer.on("mouseover", function (e: any) {
          setHoveredFeature(feature);
          setTooltipPosition({
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY,
          });
        });
        layer.on("mouseout", function () {
          setHoveredFeature(null);
        });
      },
    });
    geoJsonLayer.addTo(map);
    geoJsonLayerRef.current = geoJsonLayer;

    // Zoom control kiri bawah
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    // Cleanup
    return () => {
      try {
        map.eachLayer((layer) => {
          try {
            map.removeLayer(layer);
          } catch {}
        });
        map.remove();
      } catch {}
      leafletMapRef.current = null;
      geoJsonLayerRef.current = null;
      basemapLayerRef.current = null;
    };
  }, []); // hanya sekali

  // Update basemap layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (basemapLayerRef.current) {
      try {
        if (map.hasLayer(basemapLayerRef.current)) {
          map.removeLayer(basemapLayerRef.current);
        }
      } catch {}
      basemapLayerRef.current = null;
    }
    const bm = BASEMAPS.find((b) => b.key === basemap) || BASEMAPS[1];
    const tileLayer = L.tileLayer(bm.url, {
      attribution: bm.attribution,
      maxZoom: 20,
    });
    tileLayer.addTo(map);
    basemapLayerRef.current = tileLayer;
  }, [basemap]);

  // Load GeoJSON data
  useEffect(() => {
    setIsLoadingData(true);
    fetch(geojsonUrl)
      .then((res) => res.json())
      .then((data) => {
        setAllFeatures(data.features || []);
      })
      .finally(() => setIsLoadingData(false));
  }, []);

  // Update GeoJSON layer jika data berubah
  useEffect(() => {
    const geoJsonLayer = geoJsonLayerRef.current;
    const map = leafletMapRef.current;
    if (!geoJsonLayer || !map) return;
    geoJsonLayer.clearLayers();
    if (layerVisible) {
      geoJsonLayer.addData({
        type: "FeatureCollection",
        features: allFeatures,
      });
      if (allFeatures.length > 0) {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { maxZoom: 19, padding: [20, 20] });
        }
      }
    }
  }, [allFeatures, layerVisible]);

  // Search logic
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults(allFeatures.slice(0, 10));
      return;
    }
    const filtered = allFeatures.filter((feature) => {
      const nama = feature.properties?.nama || "";
      const kategori = feature.properties?.kategori || "";
      const subtipe = feature.properties?.subtipe || "";
      const searchLower = searchText.toLowerCase();
      return (
        nama.toLowerCase().includes(searchLower) ||
        kategori.toLowerCase().includes(searchLower) ||
        subtipe.toLowerCase().includes(searchLower)
      );
    });
    setSearchResults(filtered);
  }, [searchText, allFeatures]);

  // Event listener untuk menutup dropdown search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector(".search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle select search result
  const handleSelectSearchResult = (feature: any) => {
    const map = leafletMapRef.current;
    if (!map || !feature.geometry) return;
    let coordinates: number[][][] = [];
    if (feature.geometry.type === "Polygon") {
      coordinates = feature.geometry.coordinates;
    } else if (feature.geometry.type === "MultiPolygon") {
      coordinates = feature.geometry.coordinates.flat();
    }
    if (coordinates.length > 0) {
      const allCoords = coordinates.flat();
      const lats = allCoords.map((c) => c[1]);
      const lngs = allCoords.map((c) => c[0]);
      const bounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    setSearchText(feature.properties?.nama || "");
    setShowSearchResults(false);
  };

  // Toggle basemap
  const handleToggleBasemap = () => {
    if (isSatellite) {
      setBasemap(isDark ? "alidade_smooth_dark" : "esri_topo");
      setIsSatellite(false);
    } else {
      setBasemap("esri_satellite");
      setIsSatellite(true);
    }
  };

  // Toggle layer
  const handleToggleLayer = () => {
    setLayerVisible((v) => !v);
  };

  // Reset zoom/center
  const handleResetZoom = () => {
    const map = leafletMapRef.current;
    if (!map || allFeatures.length === 0) return;
    const geoJsonLayer = geoJsonLayerRef.current;
    if (geoJsonLayer) {
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 19, padding: [20, 20] });
      }
    }
  };

  // [REFRACTOR START]
  // 1. Tambahkan efek sinkronisasi dark mode otomatis pada basemap kecuali sedang satelit
  useEffect(() => {
    if (!isSatellite) {
      setBasemap(isDark ? "alidade_smooth_dark" : "esri_topo");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  // 2. Refactor tombol toggle basemap agar identik EsriMap (ikon + label)
  // 3. Refactor search box dan hasil search agar identik EsriMap
  // 4. Pastikan semua styling tombol, legend, dsb, identik EsriMap
  // [REFRACTOR END]

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: 350 }}
    >
      {/* Search Box ala Google Maps */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (searchResults.length > 0)
            handleSelectSearchResult(searchResults[0]);
        }}
        className="search-container absolute top-4 left-4 z-50 min-w-56 max-w-[80vw]"
        autoComplete="off"
        style={{ width: 240, zIndex: 1000 }}
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
              setSearchText(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => {
              if (searchText.trim()) {
                setShowSearchResults(true);
              }
            }}
            placeholder="Cari gedung, ruangan, atau fasilitas..."
            className={`pl-9 pr-2 py-1.5 w-full bg-transparent outline-none text-sm rounded-xl ${
              isDark
                ? "text-white placeholder:text-gray-400"
                : "text-gray-900 placeholder:text-gray-500"
            }`}
            style={{ minWidth: 120 }}
          />
        </div>
        {/* Dropdown hasil pencarian */}
        {showSearchResults && (
          <div
            className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border max-h-60 overflow-y-auto z-40 ${
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
                    : `Menampilkan ${Math.min(searchResults.length, 10)} dari ${
                        allFeatures.length
                      } lokasi`}
                </div>
                {searchResults.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSearchResult(feature)}
                    className={`px-3 py-2 cursor-pointer hover:bg-opacity-80 transition-colors ${
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
                      {feature.properties?.kategori}
                      {feature.properties?.subtipe &&
                        ` • ${feature.properties.subtipe}`}
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

      {/* Tooltip untuk hover effect */}
      {hoveredFeature && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-lg shadow-lg border text-sm font-medium pointer-events-none transition-all ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
            transform: "translateY(-100%)",
            zIndex: 1100,
          }}
        >
          {hoveredFeature.properties?.nama || "Tanpa Nama"}
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              isDark ? "border-t-gray-800" : "border-t-white"
            }`}
          ></div>
        </div>
      )}

      {/* Basemap toggle button kiri bawah, identik EsriMap */}
      <div
        className="absolute left-4 bottom-4 z-50 flex flex-col gap-2"
        style={{ zIndex: 1050 }}
      >
        {/* Zoom Controls */}
        <div className="flex flex-col gap-1">
          {/* Zoom In Button */}
          <button
            onClick={() => {
              const map = leafletMapRef.current;
              if (map) map.setZoom(map.getZoom() + 1);
            }}
            className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-primary/30
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }
            `}
            style={{ width: 48, height: 48 }}
            title="Zoom In"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? "#fff" : "#1e293b"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6" />
              <path d="M8 11h6" />
            </svg>
          </button>
          {/* Zoom Out Button */}
          <button
            onClick={() => {
              const map = leafletMapRef.current;
              if (map) map.setZoom(map.getZoom() - 1);
            }}
            className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-primary/30
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }
            `}
            style={{ width: 48, height: 48 }}
            title="Zoom Out"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? "#fff" : "#1e293b"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
          </button>
          {/* Reset Zoom Button */}
          <button
            onClick={handleResetZoom}
            className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-primary/30
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }
            `}
            style={{ width: 48, height: 48 }}
            title="Reset ke Posisi Awal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? "#fff" : "#1e293b"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 21v-5h5" />
            </svg>
          </button>
        </div>
        {/* Basemap Toggle Button identik EsriMap */}
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
        {/* Toggle Layer Button */}
        <button
          onClick={handleToggleLayer}
          className={`flex flex-col items-center justify-center rounded-lg shadow-lg px-4 py-3 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-primary/30
            ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-white border-gray-200 hover:bg-gray-100"
            }
          `}
          style={{ width: 64, height: 64 }}
        >
          {layerVisible ? (
            <>
              {/* Ikon layer visible */}
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
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span
                className={`text-xs font-bold ${
                  isDark ? "text-white" : "text-gray-700"
                }`}
              >
                Sembunyikan
              </span>
            </>
          ) : (
            <>
              {/* Ikon layer hidden */}
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
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <span
                className={`text-xs font-bold ${
                  isDark ? "text-white" : "text-gray-700"
                }`}
              >
                Tampilkan
              </span>
            </>
          )}
        </button>
      </div>

      {/* Legend */}
      {layerVisible && (
        <div
          className="absolute right-4 bottom-4 z-50"
          style={{ zIndex: 1050 }}
        >
          <div
            className={`rounded-lg shadow-lg p-4 border transition-all ${
              isDark
                ? "bg-gray-800/90 border-gray-700 text-white"
                : "bg-white/90 border-gray-200 text-gray-900"
            }`}
          >
            <h3 className="text-sm font-bold mb-3">Kategori</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(58, 134, 255, 0.7)",
                    borderColor: "rgb(35, 41, 70)",
                  }}
                ></div>
                <span>Bangunan</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(255, 190, 11, 0.6)",
                    borderColor: "rgb(35, 41, 70)",
                  }}
                ></div>
                <span>Kanopi</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(67, 170, 139, 0.8)",
                    borderColor: "rgb(35, 41, 70)",
                  }}
                ></div>
                <span>Jalan</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(128, 128, 128, 0.6)",
                    borderColor: "rgb(35, 41, 70)",
                  }}
                ></div>
                <span>Parkir</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.5)",
                    borderColor: "rgb(35, 41, 70)",
                  }}
                ></div>
                <span>Lahan</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.4)",
                    borderColor: "rgb(35, 41, 70)",
                  }}
                ></div>
                <span>Kolam</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", minHeight: 350, zIndex: 1 }}
        className="w-full h-full"
      />
    </div>
  );
};

export default LeafletMap;
