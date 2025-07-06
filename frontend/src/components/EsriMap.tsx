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
  initialLat = -0.0545, // Posisi tengah kampus Polnep (dihitung dari GeoJSON)
  initialLng = 109.3465, // Posisi tengah kampus Polnep (dihitung dari GeoJSON)
  initialZoom = 18, // Zoom yang lebih dekat untuk melihat detail kampus
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
  // State untuk visibility layer
  const [layerVisible, setLayerVisible] = useState(true);
  const [geojsonLayerRef, setGeojsonLayerRef] = useState<any>(null);
  // State untuk pencarian
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allFeatures, setAllFeatures] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  // State untuk hover effect
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

      // Hitung center point dari GeoJSON jika data sudah tersedia
      let centerLng = initialLng;
      let centerLat = initialLat;

      if (allFeatures.length > 0) {
        const center = calculateGeoJSONCenter(allFeatures);
        centerLng = center.lng;
        centerLat = center.lat;
        console.log("Menggunakan center point dari GeoJSON:", center);
      } else {
        console.log("Menggunakan center point default:", {
          lng: centerLng,
          lat: centerLat,
        });
      }

      console.log(
        "[EsriMap] Inisialisasi MapView dengan basemap:",
        basemap,
        "center:",
        centerLng,
        centerLat,
        "zoom:",
        initialZoom
      );
      (window as any).require(
        ["esri/Map", "esri/views/MapView", "esri/layers/GeoJSONLayer"],
        function (Map: any, MapView: any, GeoJSONLayer: any) {
          // Layer GeoJSON
          const geojsonUrl = "/geojson/Polnep WGS_1984.geojson";
          const geojsonLayer = new GeoJSONLayer({
            url: geojsonUrl,
            title: "Polnep GeoJSON",
            copyright: "Polnep",
            // Renderer untuk polygon dengan simple-fill
            renderer: {
              type: "unique-value",
              field: "kategori",
              uniqueValueInfos: [
                {
                  value: "Bangunan",
                  symbol: {
                    type: "simple-fill",
                    color: [58, 134, 255, 0.7], // Biru dengan transparansi
                    outline: {
                      color: [35, 41, 70],
                      width: 1,
                    },
                  },
                  label: "Bangunan",
                },
                {
                  value: "Kanopi",
                  symbol: {
                    type: "simple-fill",
                    color: [255, 190, 11, 0.6], // Kuning dengan transparansi
                    outline: {
                      color: [35, 41, 70],
                      width: 1,
                    },
                  },
                  label: "Kanopi",
                },
                {
                  value: "Jalan",
                  symbol: {
                    type: "simple-fill",
                    color: [67, 170, 139, 0.8], // Hijau dengan transparansi
                    outline: {
                      color: [35, 41, 70],
                      width: 1,
                    },
                  },
                  label: "Jalan",
                },
                {
                  value: "Parkir",
                  symbol: {
                    type: "simple-fill",
                    color: [128, 128, 128, 0.6], // Abu-abu dengan transparansi
                    outline: {
                      color: [35, 41, 70],
                      width: 1,
                    },
                  },
                  label: "Parkir",
                },
                {
                  value: "Lahan",
                  symbol: {
                    type: "simple-fill",
                    color: [34, 197, 94, 0.5], // Hijau muda dengan transparansi
                    outline: {
                      color: [35, 41, 70],
                      width: 1,
                    },
                  },
                  label: "Lahan",
                },
                {
                  value: "Kolam",
                  symbol: {
                    type: "simple-fill",
                    color: [59, 130, 246, 0.4], // Biru muda dengan transparansi
                    outline: {
                      color: [35, 41, 70],
                      width: 1,
                    },
                  },
                  label: "Kolam",
                },
              ],
              defaultSymbol: {
                type: "simple-fill",
                color: [173, 181, 189, 0.5], // Abu-abu dengan transparansi
                outline: {
                  color: [35, 41, 70],
                  width: 1,
                },
              },
            },
            popupTemplate: {
              title: "{nama}",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    { fieldName: "nama", label: "Nama" },
                    { fieldName: "kategori", label: "Kategori" },
                    { fieldName: "subtipe", label: "Sub Tipe" },
                    { fieldName: "luas", label: "Luas (m²)" },
                  ],
                },
              ],
            },
          });

          const map = new Map({
            basemap,
            layers: [geojsonLayer], // Layer default
          });
          const view = new MapView({
            container: mapDiv.current,
            map,
            center: [centerLng, centerLat],
            zoom: initialZoom,
            ui: { components: [] },
          });
          viewRef.current = view;
          setGeojsonLayerRef(geojsonLayer);

          // Event handlers untuk hover effect
          view.on("pointer-move", (event: any) => {
            view.hitTest(event).then((response: any) => {
              if (response.results.length > 0) {
                const result = response.results[0];
                if (result.graphic && result.graphic.layer === geojsonLayer) {
                  const feature = result.graphic;
                  const properties = feature.attributes;

                  if (properties && properties.nama) {
                    setHoveredFeature(feature);
                    setTooltipPosition({ x: event.x, y: event.y });

                    // Tambahkan efek hover pada feature
                    feature.symbol = {
                      ...feature.symbol,
                      color: feature.symbol.color.map((c: number, i: number) =>
                        i === 3 ? Math.min(c + 0.2, 1) : c
                      ),
                    };
                  } else {
                    setHoveredFeature(null);
                  }
                } else {
                  setHoveredFeature(null);
                }
              } else {
                setHoveredFeature(null);
              }
            });
          });

          // Event handler untuk pointer leave
          view.on("pointer-leave", () => {
            setHoveredFeature(null);
            // Reset semua feature ke warna asli
            geojsonLayer.queryFeatures().then((results: any) => {
              results.features.forEach((feature: any) => {
                if (feature.symbol && feature.symbol.color) {
                  // Reset ke warna asli berdasarkan kategori
                  const kategori = feature.attributes?.kategori;
                  let originalColor: number[];

                  switch (kategori) {
                    case "Bangunan":
                      originalColor = [58, 134, 255, 0.7];
                      break;
                    case "Kanopi":
                      originalColor = [255, 190, 11, 0.6];
                      break;
                    case "Jalan":
                      originalColor = [67, 170, 139, 0.8];
                      break;
                    case "Parkir":
                      originalColor = [128, 128, 128, 0.6];
                      break;
                    case "Lahan":
                      originalColor = [34, 197, 94, 0.5];
                      break;
                    case "Kolam":
                      originalColor = [59, 130, 246, 0.4];
                      break;
                    default:
                      originalColor = [173, 181, 189, 0.5];
                  }

                  feature.symbol = {
                    ...feature.symbol,
                    color: originalColor,
                  };
                }
              });
            });
          });

          // Setelah layer selesai dimuat, auto zoom ke extent GeoJSON
          geojsonLayer.when(() => {
            if (geojsonLayer.fullExtent) {
              view.goTo(geojsonLayer.fullExtent.expand(1.2));
            }
          });
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchText);
  };

  // Toggle layer visibility
  const handleToggleLayer = () => {
    if (geojsonLayerRef) {
      geojsonLayerRef.visible = !geojsonLayerRef.visible;
      setLayerVisible(geojsonLayerRef.visible);
    }
  };

  // Fungsi untuk memuat data GeoJSON
  const loadGeoJSONData = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch("/geojson/Polnep WGS_1984.geojson");
      const data = await response.json();
      const features = data.features || [];
      setAllFeatures(features);

      // Hitung center point dan update posisi default
      const center = calculateGeoJSONCenter(features);
      console.log("Center point GeoJSON:", center);

      // Update posisi default jika view sudah ada
      if (viewRef.current) {
        viewRef.current.goTo({
          center: [center.lng, center.lat],
          zoom: 16,
        });
      } else {
        // Jika view belum ada, tunggu sampai script dimuat
        console.log("View belum ada, menunggu script dimuat...");
      }
    } catch (error) {
      console.error("Error loading GeoJSON data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fungsi pencarian
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // Tampilkan semua lokasi jika search box kosong
      setSearchResults(allFeatures.slice(0, 10)); // Batasi 10 hasil pertama
      setShowSearchResults(true);
      return;
    }

    const filtered = allFeatures.filter((feature) => {
      const nama = feature.properties?.nama || "";
      const kategori = feature.properties?.kategori || "";
      const subtipe = feature.properties?.subtipe || "";

      const searchLower = searchTerm.toLowerCase();
      return (
        nama.toLowerCase().includes(searchLower) ||
        kategori.toLowerCase().includes(searchLower) ||
        subtipe.toLowerCase().includes(searchLower)
      );
    });

    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  // Fungsi untuk memilih hasil pencarian
  const handleSelectSearchResult = (feature: any) => {
    if (viewRef.current && feature.geometry) {
      let coordinates: number[][][] = [];

      if (feature.geometry.type === "Polygon") {
        coordinates = feature.geometry.coordinates;
      } else if (feature.geometry.type === "MultiPolygon") {
        coordinates = feature.geometry.coordinates.flat();
      }

      if (coordinates.length > 0) {
        const allCoords = coordinates.flat();
        const extent = {
          xmin: Math.min(...allCoords.map((coord: number[]) => coord[0])),
          ymin: Math.min(...allCoords.map((coord: number[]) => coord[1])),
          xmax: Math.max(...allCoords.map((coord: number[]) => coord[0])),
          ymax: Math.max(...allCoords.map((coord: number[]) => coord[1])),
        };

        viewRef.current.goTo({
          target: extent,
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
        });
      }
    }

    setSearchText(feature.properties?.nama || "");
    setShowSearchResults(false);
  };

  // Load GeoJSON data saat komponen mount
  useEffect(() => {
    loadGeoJSONData();
  }, []);

  // Re-inisialisasi map jika data GeoJSON berubah dan map belum ada
  useEffect(() => {
    if (allFeatures.length > 0 && !viewRef.current && scriptLoaded.current) {
      console.log("Data GeoJSON tersedia, inisialisasi map...");
      // Map akan diinisialisasi dengan center point yang benar di dalam initMap
    }
  }, [allFeatures]);

  // Update center point jika data GeoJSON berubah dan map sudah ada
  useEffect(() => {
    if (allFeatures.length > 0 && viewRef.current) {
      const center = calculateGeoJSONCenter(allFeatures);
      console.log("Update center point ke:", center);
      viewRef.current.goTo({
        center: [center.lng, center.lat],
        zoom: 16,
      });
    }
  }, [allFeatures]);

  // Fungsi untuk menghitung center point dari GeoJSON
  const calculateGeoJSONCenter = (features: any[]) => {
    if (features.length === 0) return { lat: -0.0545, lng: 109.3465 };

    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;

    features.forEach((feature) => {
      if (feature.geometry && feature.geometry.coordinates) {
        let coordinates: number[][][] = [];

        if (feature.geometry.type === "Polygon") {
          coordinates = feature.geometry.coordinates;
        } else if (feature.geometry.type === "MultiPolygon") {
          coordinates = feature.geometry.coordinates.flat();
        }

        coordinates.forEach((ring) => {
          ring.forEach((coord) => {
            const [lng, lat] = coord;
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          });
        });
      }
    });

    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  };

  // Event listener untuk menutup dropdown ketika mengklik di luar
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

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: 350 }}
    >
      {/* Search Box ala Google Maps */}
      <form
        onSubmit={handleSearchSubmit}
        className="search-container absolute top-4 left-4 z-30 min-w-56 max-w-[80vw]"
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
            onChange={(e) => {
              setSearchText(e.target.value);
              handleSearch(e.target.value);
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
          }}
        >
          {hoveredFeature.attributes?.nama || "Tanpa Nama"}
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              isDark ? "border-t-gray-800" : "border-t-white"
            }`}
          ></div>
        </div>
      )}

      {/* Basemap toggle button kiri bawah */}
      <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-1">
          {/* Zoom In Button */}
          <button
            onClick={() => {
              if (viewRef.current) {
                viewRef.current.goTo({
                  zoom: viewRef.current.zoom + 1,
                });
              }
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
              if (viewRef.current) {
                viewRef.current.goTo({
                  zoom: viewRef.current.zoom - 1,
                });
              }
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
            onClick={() => {
              if (viewRef.current && allFeatures.length > 0) {
                const center = calculateGeoJSONCenter(allFeatures);
                viewRef.current.goTo({
                  center: [center.lng, center.lat],
                  zoom: initialZoom,
                });
              }
            }}
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
        <div className="absolute right-4 bottom-4 z-20">
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
        ref={mapDiv}
        style={{ width: "100%", height: "100%", minHeight: 350 }}
        className="w-full h-full"
      />
    </div>
  );
};

export default EsriMap;
