import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faRoute,
  faPlus,
  faMinus,
  faCrosshairs,
  faSyncAlt,
  faLayerGroup,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

interface LeafletMapProps {
  isDark?: boolean;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  className?: string;
}

const geojsonBangunanUrl = "http://localhost:3001/api/bangunan/geojson";
const geojsonStatisUrl = "/geojson/Polnep WGS_1984.geojson";

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
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  // Tambahkan state untuk sidebar gedung
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  // State animasi card
  const [cardVisible, setCardVisible] = useState(false);
  // State untuk menampilkan canvas 3D Mall Map di area peta
  const [showBuildingDetailCanvas, setShowBuildingDetailCanvas] =
    useState(false);
  const nonBangunanLayerRef = useRef<L.GeoJSON<any> | null>(null);
  const bangunanLayerRef = useRef<L.GeoJSON<any> | null>(null);
  const [nonBangunanFeatures, setNonBangunanFeatures] = useState<any[]>([]);
  const [bangunanFeatures, setBangunanFeatures] = useState<any[]>([]);
  // State animasi fade-out untuk modal Building Detail
  const [isBuildingDetailFadingOut, setIsBuildingDetailFadingOut] =
    useState(false);
  // State animasi fade-in untuk modal Building Detail
  const [isBuildingDetailFadingIn, setIsBuildingDetailFadingIn] =
    useState(false);
  // State untuk highlight bangunan hasil pencarian
  const [highlightedFeatureId, setHighlightedFeatureId] = useState<
    string | number | null
  >(null);

  // Fungsi untuk membuka modal dengan animasi fade-in
  const openBuildingDetailModal = () => {
    setIsBuildingDetailFadingIn(true);
    setShowBuildingDetailCanvas(true);
    setTimeout(() => {
      setIsBuildingDetailFadingIn(false);
    }, 300); // durasi animasi fade
  };

  // Load data non-bangunan dari file statis
  useEffect(() => {
    fetch(geojsonStatisUrl)
      .then((res) => res.json())
      .then((data) => {
        const nonBangunan = (data.features || []).filter(
          (f: any) => f.properties?.kategori !== "Bangunan"
        );
        setNonBangunanFeatures(nonBangunan);
      });
  }, []);

  // Load data bangunan dari API
  useEffect(() => {
    setIsLoadingData(true);
    fetch(geojsonBangunanUrl)
      .then((res) => res.json())
      .then((data) => {
        setBangunanFeatures(data.features || []);
      })
      .finally(() => setIsLoadingData(false));
  }, []);

  // Gabungkan data bangunan dan non-bangunan untuk pencarian
  useEffect(() => {
    setAllFeatures([...bangunanFeatures, ...nonBangunanFeatures]);
  }, [bangunanFeatures, nonBangunanFeatures]);

  // Inisialisasi map hanya sekali
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 19,
      minZoom: 2,
    });
    leafletMapRef.current = map;

    // Basemap awal
    const bm = BASEMAPS.find((b) => b.key === basemap) || BASEMAPS[1];
    const tileLayer = L.tileLayer(bm.url, {
      attribution: bm.attribution,
      maxZoom: 19,
    });
    tileLayer.addTo(map);
    basemapLayerRef.current = tileLayer;

    // Layer non-bangunan (ditambahkan lebih dulu)
    const nonBangunanLayer = L.geoJSON(undefined, {
      style: (feature: any) => {
        const kategori = feature?.properties?.kategori;
        return kategoriStyle[kategori] || defaultStyle;
      },
      onEachFeature: (feature: any, layer: any) => {
        // Pastikan cursor menjadi 'grab' untuk semua tipe geometry
        const setGrabCursor = () => {
          if (layer._path) layer._path.style.cursor = "grab";
          if (layer._container) layer._container.style.cursor = "grab";
        };
        layer.on("mouseover", setGrabCursor);
        layer.on("mousemove", setGrabCursor);
        layer.on("mouseout", setGrabCursor);
      },
    });
    nonBangunanLayer.addTo(map);
    nonBangunanLayerRef.current = nonBangunanLayer;

    // Layer bangunan (di atas non-bangunan)
    const bangunanLayer = L.geoJSON(undefined, {
      style: (feature: any) => {
        const kategori = feature?.properties?.kategori || "Bangunan";
        return kategoriStyle[kategori] || defaultStyle;
      },
      onEachFeature: (feature: any, layer: any) => {
        const nama = feature.properties?.nama || "Tanpa Nama";
        const kategori = feature.properties?.kategori || "Bangunan";
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
        // Hanya kategori Bangunan yang bisa diklik
        if (kategori === "Bangunan") {
          layer.on("click", function (e: any) {
            setSelectedFeature(feature);
            setCardVisible(true);
          });
          // Ubah cursor pointer untuk interaktif
          layer.on("mouseover", function () {
            if (layer._path) layer._path.style.cursor = "pointer";
          });
          layer.on("mouseout", function () {
            if (layer._path) layer._path.style.cursor = "";
          });
        } else {
          // Pastikan cursor default untuk non-bangunan
          layer.on("mouseover", function () {
            if (layer._path) layer._path.style.cursor = "";
          });
        }
      },
    });
    bangunanLayer.addTo(map);
    bangunanLayerRef.current = bangunanLayer;

    // Cleanup
    return () => {
      try {
        map.eachLayer((layer: any) => {
          try {
            map.removeLayer(layer);
          } catch {}
        });
        map.remove();
      } catch {}
      leafletMapRef.current = null;
      nonBangunanLayerRef.current = null;
      bangunanLayerRef.current = null;
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
      maxZoom: 19,
    });
    tileLayer.addTo(map);
    basemapLayerRef.current = tileLayer;
  }, [basemap]);

  // Update non-bangunan layer jika data berubah
  useEffect(() => {
    const nonBangunanLayer = nonBangunanLayerRef.current;
    if (!nonBangunanLayer) return;
    nonBangunanLayer.clearLayers();
    if (layerVisible && nonBangunanFeatures.length > 0) {
      nonBangunanLayer.addData({
        type: "FeatureCollection",
        features: nonBangunanFeatures,
      } as any);
    }
  }, [nonBangunanFeatures, layerVisible]);

  // Update bangunan layer jika data berubah
  useEffect(() => {
    const bangunanLayer = bangunanLayerRef.current;
    const map = leafletMapRef.current;
    if (!bangunanLayer || !map) return;
    bangunanLayer.clearLayers();
    if (layerVisible && bangunanFeatures.length > 0) {
      bangunanLayer.addData({
        type: "FeatureCollection",
        features: bangunanFeatures,
      } as any);
      // Fit bounds ke bangunan jika ada
      const bounds = bangunanLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 19, padding: [20, 20] });
      }
    }
  }, [bangunanFeatures, layerVisible]);

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
      // Zoom ke lokasi, lalu highlight setelah animasi selesai
      map.fitBounds(bounds, { padding: [50, 50] });
      // Tunggu event moveend baru highlight
      const onMoveEnd = () => {
        highlightFeature(feature);
        map.off("moveend", onMoveEnd);
      };
      map.on("moveend", onMoveEnd);
    } else {
      highlightFeature(feature);
    }
    setSearchText(feature.properties?.nama || "");
    setShowSearchResults(false);
    if (feature.properties?.kategori === "Bangunan") {
      setSelectedFeature(feature);
      setCardVisible(true);
    }
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

  // Fungsi untuk handle klik tombol GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolokasi.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setUserLocation(latlng);
        const map = leafletMapRef.current;
        if (map) {
          map.setView(latlng, 18, { animate: true });
        }
      },
      (err) => {
        setIsLocating(false);
        alert(
          "Gagal mendapatkan lokasi: " +
            err.message +
            " (code: " +
            err.code +
            ")"
        );
        console.error("Geolocation error", err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Tampilkan marker user di map jika userLocation ada
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userLocation) {
      const marker = L.marker(userLocation, {
        icon: L.icon({
          iconUrl:
            "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl:
            "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
        }),
        title: "Lokasi Saya",
      });
      marker.addTo(map).bindPopup("Lokasi Saya");
      userMarkerRef.current = marker;
    }
    // Cleanup
    return () => {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    };
  }, [userLocation]);

  // Fungsi untuk menghitung centroid dari feature (Polygon/MultiPolygon)
  function getFeatureCentroid(feature: any): [number, number] {
    let coords: number[][] = [];
    if (feature.geometry.type === "Polygon") {
      coords = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === "MultiPolygon") {
      coords = feature.geometry.coordinates.flat(2);
    }
    const lats = coords.map((c) => c[1]);
    const lngs = coords.map((c) => c[0]);
    const lat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const lng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    return [lat, lng];
  }

  // Tampilkan polyline rute jika userLocation & hasil pencarian dipilih
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    // Cek: jika userLocation & searchText & searchResults.length==1 (hasil dipilih)
    if (userLocation && searchText && searchResults.length === 1) {
      const feature = searchResults[0];
      const [lat, lng] = getFeatureCentroid(feature);
      const polyline = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [lat, lng],
        ],
        {
          color: "#ff6600",
          weight: 5,
          opacity: 0.8,
          dashArray: "8 8",
        }
      );
      polyline.addTo(map);
      routeLineRef.current = polyline;
    }
    // Cleanup
    return () => {
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
    };
  }, [userLocation, searchText, searchResults]);

  // Fungsi untuk menutup modal dengan animasi fade
  const closeBuildingDetailModal = () => {
    setIsBuildingDetailFadingOut(true);
    setTimeout(() => {
      setShowBuildingDetailCanvas(false);
      setIsBuildingDetailFadingOut(false);
    }, 300); // durasi animasi fade
  };

  // Event listener pesan close-buildingdetail dari iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data === "close-buildingdetail") {
        closeBuildingDetailModal();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fungsi untuk highlight bangunan selama 1 detik dengan efek fade
  const highlightFeature = (feature: any) => {
    if (!feature) return;
    const bangunanLayer = bangunanLayerRef.current;
    if (!bangunanLayer) return;
    bangunanLayer.eachLayer((layer: any) => {
      if (
        layer.feature &&
        layer.feature.properties?.id === feature.properties?.id
      ) {
        // Simpan style awal
        const kategori = feature?.properties?.kategori || "Bangunan";
        const defaultStyle = kategoriStyle[kategori] || {
          color: "#adb5bd",
          fillColor: "#adb5bd",
          fillOpacity: 0.5,
        };
        // Highlight ke merah terang
        layer.setStyle({
          color: "#ff3333",
          fillColor: "#ff3333",
          fillOpacity: 0.7,
          opacity: 1,
        });
        setTimeout(() => {
          layer.setStyle(defaultStyle);
        }, 1000);
      }
    });
  };

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

      {/* Kontrol kanan bawah: tombol zoom, GPS, reset, dsb */}
      {!selectedFeature && (
        <div
          className="absolute right-4 bottom-4 z-50 flex flex-col gap-2"
          style={{ zIndex: 1050 }}
        >
          {/* Tombol GPS di atas kontrol zoom */}
          <button
            onClick={handleLocateMe}
            className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-primary/30
            ${
              isDark
                ? "bg-blue-900 border-blue-700 hover:bg-blue-800 text-white"
                : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-900"
            }
          `}
            style={{ width: 48, height: 48 }}
            title="Tampilkan Lokasi Saya"
            disabled={isLocating}
          >
            {isLocating ? (
              <svg
                className="animate-spin"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              // Ikon GPS/Target yang lebih jelas
              <FontAwesomeIcon icon={faCrosshairs} />
            )}
          </button>
          {/* Zoom Controls */}
          <div className="flex flex-col gap-1 mb-2">
            {/* Zoom In Button */}
            <button
              onClick={() => {
                const map = leafletMapRef.current;
                if (map) map.setZoom(Math.min(map.getZoom() + 1, 19));
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
              <FontAwesomeIcon icon={faPlus} />
            </button>
            {/* Zoom Out Button */}
            <button
              onClick={() => {
                const map = leafletMapRef.current;
                if (map)
                  map.setZoom(Math.max(map.getZoom() - 1, map.getMinZoom()));
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
              <FontAwesomeIcon icon={faMinus} />
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
              {/* Ikon reset posisi: panah melingkar */}
              <FontAwesomeIcon icon={faSyncAlt} />
            </button>
          </div>
        </div>
      )}

      {/* Kontrol kiri bawah: basemap dan toggle layer */}
      <div
        className="absolute left-4 bottom-4 z-50 flex flex-col gap-2"
        style={{ zIndex: 1050 }}
      >
        {/* Toggle Layer Button (ikon mata) */}
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
            // Ikon layer visible saja, tanpa teks 'Sembunyikan'
            <FontAwesomeIcon icon={faLayerGroup} />
          ) : (
            // Ikon layer hidden saja, tanpa teks 'Tampilkan'
            <FontAwesomeIcon icon={faLayerGroup} />
          )}
        </button>
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
              <FontAwesomeIcon icon={faGlobe} />
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
              <FontAwesomeIcon icon={faGlobe} />
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

      {/* Sidebar Gedung (ganti dengan floating card kanan bawah) */}
      {selectedFeature && (
        <div
          className={`absolute right-4 bottom-4 z-[201] w-64 max-w-xs bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-400 ${
            cardVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8 pointer-events-none"
          }`}
          style={{
            boxShadow: "0 8px 32px 0 rgba(30,41,59,0.18)",
            minHeight: 120,
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-base font-bold text-primary dark:text-primary-dark break-words whitespace-pre-line">
              {selectedFeature.properties?.nama || "Tanpa Nama"}
            </span>
            <button
              onClick={() => {
                setCardVisible(false);
                setTimeout(() => setSelectedFeature(null), 350);
              }}
              className="text-gray-400 hover:text-primary dark:hover:text-primary-dark text-xl font-bold focus:outline-none"
              title="Tutup"
            >
              ×
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-3 px-4 py-4">
            {selectedFeature.properties?.interaksi &&
              selectedFeature.properties.interaksi.toLowerCase() ===
                "interaktif" && (
                <button
                  className="w-full py-2 rounded-lg font-bold text-sm shadow bg-primary text-white hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-accent-dark mb-1"
                  onClick={openBuildingDetailModal}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  Detail Bangunan
                </button>
              )}
            <button className="w-full py-2 rounded-lg font-bold text-sm shadow bg-accent text-white hover:bg-accent/90 dark:bg-accent-dark dark:hover:bg-accent-dark/80 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-primary-dark">
              <FontAwesomeIcon icon={faRoute} className="mr-2" />
              Rute
            </button>
          </div>
        </div>
      )}

      {/* Modal 3D Mall Map */}
      {/* Removed as per new_code */}

      {/* Area Map/Canvas: tampilkan peta atau 3D Mall Map sesuai state */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 350,
          zIndex: 1,
          display: showBuildingDetailCanvas ? "none" : "block",
        }}
        className="w-full h-full"
      />
      {showBuildingDetailCanvas && (
        <div
          className={`absolute inset-0 w-full h-full flex flex-col z-[2000] bg-white dark:bg-gray-900 transition-opacity duration-300 ${
            isBuildingDetailFadingOut
              ? "opacity-0"
              : isBuildingDetailFadingIn
              ? "opacity-0 animate-fade-in"
              : "opacity-100"
          }`}
        >
          <iframe
            src="/building-details/index.html"
            title="Building Detail"
            className="flex-1 w-full h-full border-0 rounded-b-xl"
            style={{ minHeight: "350px" }}
          />
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
