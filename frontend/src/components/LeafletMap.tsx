import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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

export interface LeafletMapRef {
  highlightFeature: (
    featureType: string,
    featureId: number,
    featureName: string
  ) => void;
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

const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>(
  (
    {
      isDark = false,
      initialLat = -0.0545,
      initialLng = 109.3465,
      initialZoom = 18,
      className = "",
    },
    ref
  ) => {
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
    const [isSatellite, setIsSatellite] = useState(
      basemap === "esri_satellite"
    );
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
    const [ruanganFeatures, setRuanganFeatures] = useState<any[]>([]);
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
    // Tambahkan state untuk animasi card agar fade-in juga smooth
    const [cardAnimation, setCardAnimation] = useState(false);
    // State untuk modal rute
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [routeStartType, setRouteStartType] = useState("my-location");
    const [routeStartId, setRouteStartId] = useState("");
    const [routeEndType, setRouteEndType] = useState("bangunan");
    const [routeEndId, setRouteEndId] = useState("");
    // State untuk polyline rute
    const [routeLine, setRouteLine] = useState<L.Polyline | null>(null);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);

    // Fungsi untuk membuka modal dengan animasi fade-in
    const openBuildingDetailModal = (selectedRuangan?: any) => {
      setIsBuildingDetailFadingIn(true);
      setShowBuildingDetailCanvas(true);
      setTimeout(() => {
        setIsBuildingDetailFadingIn(false);
      }, 300); // durasi animasi fade

      // Jika ada ruangan yang dipilih, kirim informasi ke iframe
      if (selectedRuangan) {
        setTimeout(() => {
          const iframe = document.querySelector(
            'iframe[title="Building Detail"]'
          ) as HTMLIFrameElement | null;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              {
                type: "highlight-ruangan",
                ruanganId: selectedRuangan.properties?.id,
                ruanganNama: selectedRuangan.properties?.nama,
                ruanganLantai: selectedRuangan.properties?.lantai,
              },
              "*"
            );
          }
        }, 500); // Tunggu modal terbuka
      }
    };

    // Load data non-bangunan dari file statis (hanya untuk tampilan, bukan pencarian)
    useEffect(() => {
      fetch(geojsonStatisUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.features)) {
            console.error("Data non-bangunan tidak valid:", data);
            setNonBangunanFeatures([]);
            return;
          }
          const nonBangunan = (data.features || []).filter(
            (f: any) => f.properties?.kategori !== "Bangunan"
          );
          setNonBangunanFeatures(nonBangunan);
          console.log("Non-bangunan data loaded:", nonBangunan.length, "items");
        })
        .catch((error) => {
          console.error("Error loading non-bangunan data:", error);
          setNonBangunanFeatures([]);
        });
    }, []);

    // Load data bangunan dari API
    useEffect(() => {
      setIsLoadingData(true);
      fetch(geojsonBangunanUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.features)) {
            console.error("Data bangunan tidak valid:", data);
            setBangunanFeatures([]);
            return;
          }
          setBangunanFeatures(data.features || []);
          console.log("Bangunan data loaded:", data.features.length, "items");
        })
        .catch((error) => {
          console.error("Error loading bangunan data:", error);
          setBangunanFeatures([]);
        })
        .finally(() => setIsLoadingData(false));
    }, []);

    // Load data ruangan dari API
    useEffect(() => {
      fetch("http://localhost:3001/api/ruangan")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // Pastikan data adalah array
          if (!Array.isArray(data)) {
            console.error("Data ruangan bukan array:", data);
            setRuanganFeatures([]);
            return;
          }

          // Konversi data ruangan ke format yang bisa dicari
          const ruanganForSearch = data.map((ruangan: any) => ({
            type: "Feature",
            geometry: null, // Ruangan tidak punya geometry di peta utama
            properties: {
              id: ruangan.id_ruangan,
              nama: ruangan.nama_ruangan,
              kategori: "Ruangan",
              subtipe: ruangan.deskripsi || "Ruangan",
              lantai: ruangan.nomor_lantai,
              bangunan_id: ruangan.id_bangunan,
              jurusan: ruangan.prodi?.jurusan?.nama_jurusan || "",
              prodi: ruangan.prodi?.nama_prodi || "",
              searchable: true,
              isRuangan: true,
            },
          }));
          setRuanganFeatures(ruanganForSearch);
          console.log("Ruangan data loaded:", ruanganForSearch.length, "items");
        })
        .catch((error) => {
          console.error("Error loading ruangan data:", error);
          setRuanganFeatures([]);
        });
    }, []);

    // Kirim data nama gedung & jumlah lantai ke iframe saat modal building-detail dibuka
    useEffect(() => {
      if (showBuildingDetailCanvas && selectedFeature) {
        const namaGedung = selectedFeature.properties?.nama;
        const jumlahLantai = Number(selectedFeature.properties?.lantai) || 0;
        const iframe = document.querySelector(
          'iframe[title="Building Detail"]'
        ) as HTMLIFrameElement | null;
        if (iframe && namaGedung && jumlahLantai > 0) {
          let count = 0;
          const interval = setInterval(() => {
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage(
                {
                  type: "set-building-detail",
                  namaGedung,
                  jumlahLantai,
                },
                "*"
              );
              // DEBUG: log setiap kirim pesan
              console.log("Kirim postMessage ke iframe:", {
                namaGedung,
                jumlahLantai,
              });
              count++;
              if (count > 12) clearInterval(interval);
            }
          }, 200);
          setTimeout(() => clearInterval(interval), 2500);
        }
      }
    }, [showBuildingDetailCanvas, selectedFeature]);

    // Gabungkan data bangunan dan ruangan untuk pencarian (hanya yang bisa dicari)
    useEffect(() => {
      setAllFeatures([...bangunanFeatures, ...ruanganFeatures]);
    }, [bangunanFeatures, ruanganFeatures]);

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
      // Set posisi awal sama dengan tombol reset
      map.setView([initialLat, initialLng], initialZoom, { animate: false });

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
              // Jika rute sedang tampil, blok interaksi klik bangunan lain
              if (routeLine) {
                if (
                  e &&
                  e.originalEvent &&
                  typeof e.originalEvent.stopPropagation === "function"
                ) {
                  e.originalEvent.stopPropagation();
                }
                return;
              }
              setSelectedFeature(feature);
              setCardVisible(true);
              // Kirim pesan ke dashboard untuk update sidebar
              window.postMessage(
                {
                  type: "building-clicked",
                  buildingId: feature.properties?.id,
                  buildingName: feature.properties?.nama,
                },
                "*"
              );
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
      }
    }, [bangunanFeatures, layerVisible]);

    // Search logic - untuk bangunan dan ruangan
    useEffect(() => {
      if (!searchText.trim()) {
        setSearchResults([]); // Tidak menampilkan apapun jika input kosong
        return;
      }

      const searchLower = searchText.toLowerCase();
      const results: any[] = [];

      // Cari bangunan terlebih dahulu
      bangunanFeatures.forEach((bangunan) => {
        const nama = bangunan.properties?.nama || "";
        if (nama.toLowerCase().includes(searchLower)) {
          // Tambahkan bangunan dengan format yang diinginkan
          results.push({
            ...bangunan,
            properties: {
              ...bangunan.properties,
              displayType: "bangunan",
              displayInfo: `${bangunan.properties?.lantai || 0} Lantai`,
            },
          });
        }
      });

      // Cari ruangan
      ruanganFeatures.forEach((ruangan) => {
        const nama = ruangan.properties?.nama || "";
        if (nama.toLowerCase().includes(searchLower)) {
          results.push({
            ...ruangan,
            properties: {
              ...ruangan.properties,
              displayType: "ruangan",
              isRuangan: true,
            },
          });
        }
      });

      setSearchResults(results);
    }, [searchText, bangunanFeatures, ruanganFeatures]);

    // Event listener untuk menutup dropdown search
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const searchContainer = document.querySelector(".search-container");
        if (
          searchContainer &&
          !searchContainer.contains(event.target as Node)
        ) {
          setShowSearchResults(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Fungsi helper untuk highlight bangunan
    const highlightBangunan = (featureId: number) => {
      const bangunanLayer = bangunanLayerRef.current;
      if (!bangunanLayer) return;

      bangunanLayer.eachLayer((layer: any) => {
        if (layer.feature && layer.feature.properties?.id === featureId) {
          console.log("Highlighting bangunan from search:", featureId);

          // Simpan style awal
          const kategori = layer.feature?.properties?.kategori || "Bangunan";
          const defaultStyle = kategoriStyle[kategori] || {
            color: "#adb5bd",
            fillColor: "#adb5bd",
            fillOpacity: 0.5,
          };

          // Animasi fade ke merah dengan transisi smooth
          const highlightStyle = {
            color: "#ff3333",
            fillColor: "#ff3333",
            fillOpacity: 0.7,
            opacity: 1,
            weight: 3, // Tambah ketebalan border untuk efek yang lebih dramatis
          };

          // Terapkan style highlight dengan animasi
          layer.setStyle(highlightStyle);

          // Kembalikan ke style awal setelah 1 detik dengan efek fade yang lebih smooth
          setTimeout(() => {
            // Animasi fade kembali ke warna asli dengan transisi bertahap
            layer.setStyle({
              ...defaultStyle,
              opacity: 0.9, // Mulai dengan opacity sedikit transparan
              weight: 2, // Kurangi ketebalan secara bertahap
            });

            // Transisi bertahap untuk efek fade yang lebih smooth
            setTimeout(() => {
              layer.setStyle({
                ...defaultStyle,
                opacity: 0.7,
                weight: 1, // Kembalikan ke ketebalan normal
              });

              setTimeout(() => {
                layer.setStyle(defaultStyle);
              }, 50);
            }, 50);
          }, 1000); // Durasi highlight 1 detik
        }
      });
    };

    // Handle select search result
    const handleSelectSearchResult = (feature: any) => {
      const map = leafletMapRef.current;
      if (!map) return;

      // Jika ini adalah ruangan, cari bangunan yang terkait
      if (feature.properties?.displayType === "ruangan") {
        const bangunanId = feature.properties?.bangunan_id;
        const bangunan = bangunanFeatures.find(
          (b) => b.properties?.id === bangunanId
        );

        if (bangunan && bangunan.geometry) {
          // Zoom ke bangunan yang berisi ruangan
          let coordinates: number[][][] = [];
          if (bangunan.geometry.type === "Polygon") {
            coordinates = bangunan.geometry.coordinates;
          } else if (bangunan.geometry.type === "MultiPolygon") {
            coordinates = bangunan.geometry.coordinates.flat();
          }

          if (coordinates.length > 0) {
            const allCoords = coordinates.flat();
            const lats = allCoords.map((c) => c[1]);
            const lngs = allCoords.map((c) => c[0]);
            const bounds = L.latLngBounds(
              [Math.min(...lats), Math.min(...lngs)],
              [Math.max(...lats), Math.max(...lngs)]
            );

            // Zoom ke bangunan, lalu buka detail bangunan dengan ruangan yang di-highlight
            map.fitBounds(bounds, {
              padding: [50, 50],
              animate: true,
              duration: 0.8,
            });
            const onMoveEnd = () => {
              setSelectedFeature(bangunan);
              setCardVisible(true);
              // Highlight bangunan setelah zoom selesai
              highlightBangunan(bangunan.properties?.id);
              // Langsung buka modal detail bangunan dengan ruangan yang dipilih
              openBuildingDetailModal(feature);

              // Kirim pesan ke dashboard untuk update sidebar ruangan
              console.log("Sending room-clicked message:", {
                type: "room-clicked",
                roomId: feature.properties?.id,
                roomName: feature.properties?.nama,
              });
              window.postMessage(
                {
                  type: "room-clicked",
                  roomId: feature.properties?.id,
                  roomName: feature.properties?.nama,
                },
                "*"
              );

              map.off("moveend", onMoveEnd);
            };
            map.on("moveend", onMoveEnd);
          } else {
            // Jika tidak ada geometry, langsung buka modal
            setSelectedFeature(bangunan);
            setCardVisible(true);
            highlightBangunan(bangunan.properties?.id);
            openBuildingDetailModal(feature);

            // Kirim pesan ke dashboard untuk update sidebar ruangan
            console.log("Sending room-clicked message (no geometry):", {
              type: "room-clicked",
              roomId: feature.properties?.id,
              roomName: feature.properties?.nama,
            });
            window.postMessage(
              {
                type: "room-clicked",
                roomId: feature.properties?.id,
                roomName: feature.properties?.nama,
              },
              "*"
            );
          }
        } else {
          // Jika bangunan tidak ditemukan, tetap buka modal dengan ruangan yang dipilih
          console.warn(
            "Bangunan tidak ditemukan untuk ruangan:",
            feature.properties?.nama
          );
          openBuildingDetailModal(feature);

          // Kirim pesan ke dashboard untuk update sidebar ruangan
          console.log("Sending room-clicked message (no building found):", {
            type: "room-clicked",
            roomId: feature.properties?.id,
            roomName: feature.properties?.nama,
          });
          window.postMessage(
            {
              type: "room-clicked",
              roomId: feature.properties?.id,
              roomName: feature.properties?.nama,
            },
            "*"
          );
        }
      } else if (feature.geometry) {
        // Untuk bangunan dan fasilitas lain
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

          // Zoom ke lokasi dengan animasi smooth
          map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 0.8,
          });

          // Highlight bangunan setelah zoom selesai
          const onMoveEnd = () => {
            if (
              feature.properties?.kategori === "Bangunan" ||
              feature.properties?.displayType === "bangunan"
            ) {
              highlightBangunan(feature.properties?.id);
            }
            map.off("moveend", onMoveEnd);
          };
          map.on("moveend", onMoveEnd);
        } else {
          // Jika tidak ada geometry, langsung highlight
          if (
            feature.properties?.kategori === "Bangunan" ||
            feature.properties?.displayType === "bangunan"
          ) {
            highlightBangunan(feature.properties?.id);
          }
        }
      }

      setSearchText(""); // Bersihkan input pencarian
      setShowSearchResults(false);

      if (
        feature.properties?.kategori === "Bangunan" ||
        feature.properties?.displayType === "bangunan"
      ) {
        setSelectedFeature(feature);
        setCardVisible(true);
      }
    };

    // Toggle basemap
    const handleToggleBasemap = () => {
      console.log("Toggle basemap clicked, current isSatellite:", isSatellite);
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
      console.log("Toggle layer clicked, current layerVisible:", layerVisible);
      setLayerVisible((v) => !v);
    };

    // Reset zoom/center
    const handleResetZoom = () => {
      console.log("Reset zoom clicked");
      const map = leafletMapRef.current;
      if (!map) {
        console.log("Map not ready");
        return;
      }
      // Fallback ke posisi awal
      const initialPosition = L.latLng(initialLat, initialLng);
      map.setView(initialPosition, initialZoom, {
        animate: true,
        duration: 0.5,
      });
      console.log(
        "Reset to initial position:",
        initialPosition,
        "zoom:",
        initialZoom
      );
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
      console.log("Locate me clicked");
      if (!navigator.geolocation) {
        alert("Browser tidak mendukung geolokasi.");
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Geolocation success:", pos.coords);
          setIsLocating(false);
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          setUserLocation(latlng);
          const map = leafletMapRef.current;
          if (map) {
            map.setView(latlng, 18, { animate: true });
            console.log("Map view updated to user location");
          }
        },
        (err) => {
          console.log("Geolocation error:", err);
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

    // Event listener untuk pesan highlight dari dashboard
    useEffect(() => {
      function handleHighlightMessage(event: MessageEvent) {
        if (event.data.type === "highlight-feature") {
          const { featureType, featureId, featureName } = event.data;

          if (featureType === "bangunan") {
            // Highlight bangunan menggunakan fungsi helper
            highlightBangunan(featureId);

            // Pan ke lokasi bangunan dengan zoom smooth
            const bangunanLayer = bangunanLayerRef.current;
            if (bangunanLayer) {
              bangunanLayer.eachLayer((layer: any) => {
                if (
                  layer.feature &&
                  layer.feature.properties?.id === featureId
                ) {
                  const map = leafletMapRef.current;
                  if (map && layer.getBounds) {
                    map.fitBounds(layer.getBounds(), {
                      padding: [50, 50],
                      animate: true,
                      duration: 0.8,
                    });
                  }
                }
              });
            }
          } else if (featureType === "ruangan") {
            // Handle ruangan seperti pencarian - zoom ke bangunan dan highlight
            console.log("Highlight ruangan:", featureId, featureName);

            // Cari ruangan di data ruangan
            const selectedRuangan = ruanganFeatures.find(
              (r) => r.properties?.id === featureId
            );

            if (selectedRuangan) {
              // Cari bangunan yang berisi ruangan ini
              const bangunanId = selectedRuangan.properties?.bangunan_id;
              const bangunan = bangunanFeatures.find(
                (b) => b.properties?.id === bangunanId
              );

              if (bangunan && bangunan.geometry) {
                // Zoom ke bangunan yang berisi ruangan
                let coordinates: number[][][] = [];
                if (bangunan.geometry.type === "Polygon") {
                  coordinates = bangunan.geometry.coordinates;
                } else if (bangunan.geometry.type === "MultiPolygon") {
                  coordinates = bangunan.geometry.coordinates.flat();
                }

                if (coordinates.length > 0) {
                  const allCoords = coordinates.flat();
                  const lats = allCoords.map((c) => c[1]);
                  const lngs = allCoords.map((c) => c[0]);
                  const bounds = L.latLngBounds(
                    [Math.min(...lats), Math.min(...lngs)],
                    [Math.max(...lats), Math.max(...lngs)]
                  );

                  // Zoom ke bangunan, lalu buka detail bangunan dengan ruangan yang di-highlight
                  const map = leafletMapRef.current;
                  if (map) {
                    map.fitBounds(bounds, {
                      padding: [50, 50],
                      animate: true,
                      duration: 0.8,
                    });
                    const onMoveEnd = () => {
                      setSelectedFeature(bangunan);
                      setCardVisible(true);
                      // Highlight bangunan setelah zoom selesai
                      highlightBangunan(bangunan.properties?.id);
                      // Langsung buka modal detail bangunan dengan ruangan yang dipilih
                      openBuildingDetailModal(selectedRuangan);
                      map.off("moveend", onMoveEnd);
                    };
                    map.on("moveend", onMoveEnd);
                  }
                } else {
                  // Jika tidak ada geometry, langsung buka modal
                  setSelectedFeature(bangunan);
                  setCardVisible(true);
                  highlightBangunan(bangunan.properties?.id);
                  openBuildingDetailModal(selectedRuangan);
                }
              } else {
                // Jika bangunan tidak ditemukan, tetap buka modal dengan ruangan yang dipilih
                console.warn(
                  "Bangunan tidak ditemukan untuk ruangan:",
                  selectedRuangan.properties?.nama
                );
                openBuildingDetailModal(selectedRuangan);
              }
            }
          }
        }
      }

      window.addEventListener("message", handleHighlightMessage);
      return () =>
        window.removeEventListener("message", handleHighlightMessage);
    }, []);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      highlightFeature: (
        featureType: string,
        featureId: number,
        featureName: string
      ) => {
        console.log("highlightFeature called:", {
          featureType,
          featureId,
          featureName,
        });

        if (featureType === "bangunan") {
          // Highlight bangunan menggunakan fungsi helper
          highlightBangunan(featureId);

          // Pan ke lokasi bangunan dengan zoom smooth
          const bangunanLayer = bangunanLayerRef.current;
          if (bangunanLayer) {
            bangunanLayer.eachLayer((layer: any) => {
              if (layer.feature && layer.feature.properties?.id === featureId) {
                const map = leafletMapRef.current;
                if (map && layer.getBounds) {
                  map.fitBounds(layer.getBounds(), {
                    padding: [50, 50],
                    animate: true,
                    duration: 0.8,
                  });
                }
              }
            });
          }
        } else if (featureType === "ruangan") {
          // Handle ruangan seperti pencarian - zoom ke bangunan dan highlight
          console.log("Highlight ruangan:", featureId, featureName);

          // Cari ruangan di data ruangan
          const selectedRuangan = ruanganFeatures.find(
            (r) => r.properties?.id === featureId
          );

          if (selectedRuangan) {
            // Cari bangunan yang berisi ruangan ini
            const bangunanId = selectedRuangan.properties?.bangunan_id;
            const bangunan = bangunanFeatures.find(
              (b) => b.properties?.id === bangunanId
            );

            if (bangunan && bangunan.geometry) {
              // Zoom ke bangunan yang berisi ruangan
              let coordinates: number[][][] = [];
              if (bangunan.geometry.type === "Polygon") {
                coordinates = bangunan.geometry.coordinates;
              } else if (bangunan.geometry.type === "MultiPolygon") {
                coordinates = bangunan.geometry.coordinates.flat();
              }

              if (coordinates.length > 0) {
                const allCoords = coordinates.flat();
                const lats = allCoords.map((c) => c[1]);
                const lngs = allCoords.map((c) => c[0]);
                const bounds = L.latLngBounds(
                  [Math.min(...lats), Math.min(...lngs)],
                  [Math.max(...lats), Math.max(...lngs)]
                );

                // Zoom ke bangunan, lalu buka detail bangunan dengan ruangan yang di-highlight
                const map = leafletMapRef.current;
                if (map) {
                  map.fitBounds(bounds, {
                    padding: [50, 50],
                    animate: true,
                    duration: 0.8,
                  });
                  const onMoveEnd = () => {
                    setSelectedFeature(bangunan);
                    setCardVisible(true);
                    // Highlight bangunan setelah zoom selesai
                    highlightBangunan(bangunan.properties?.id);
                    // Langsung buka modal detail bangunan dengan ruangan yang dipilih
                    openBuildingDetailModal(selectedRuangan);
                    map.off("moveend", onMoveEnd);
                  };
                  map.on("moveend", onMoveEnd);
                }
              } else {
                // Jika tidak ada geometry, langsung buka modal
                setSelectedFeature(bangunan);
                setCardVisible(true);
                highlightBangunan(bangunan.properties?.id);
                openBuildingDetailModal(selectedRuangan);
              }
            } else {
              // Jika bangunan tidak ditemukan, tetap buka modal dengan ruangan yang dipilih
              console.warn(
                "Bangunan tidak ditemukan untuk ruangan:",
                selectedRuangan.properties?.nama
              );
              openBuildingDetailModal(selectedRuangan);
            }
          }
        }
      },
    }));

    // Saat cardVisible berubah ke true, trigger animasi fade-in
    useEffect(() => {
      if (cardVisible) {
        setTimeout(() => setCardAnimation(true), 10);
      } else {
        setCardAnimation(false);
      }
    }, [cardVisible]);

    // Highlight merah persist selama card detail bangunan terbuka
    useEffect(() => {
      const bangunanLayer = bangunanLayerRef.current;
      if (!bangunanLayer) return;
      // Reset semua bangunan ke style default
      bangunanLayer.eachLayer((layer: any) => {
        if (layer.feature && layer.feature.properties?.id) {
          const kategori = layer.feature?.properties?.kategori || "Bangunan";
          const defaultStyle = kategoriStyle[kategori] || {
            color: "#adb5bd",
            fillColor: "#adb5bd",
            fillOpacity: 0.5,
          };
          layer.setStyle(defaultStyle);
        }
      });
      // Highlight merah hanya pada bangunan yang sedang aktif
      if (cardVisible && selectedFeature?.properties?.id) {
        const featureId = selectedFeature.properties.id;
        bangunanLayer.eachLayer((layer: any) => {
          if (layer.feature && layer.feature.properties?.id === featureId) {
            layer.setStyle({
              color: "#ff3333",
              fillColor: "#ff3333",
              fillOpacity: 0.7,
              opacity: 1,
              weight: 3,
            });
          }
        });
      }
    }, [cardVisible, selectedFeature]);

    // Fungsi untuk dapatkan koordinat centroid dari featureId (bangunan/ruangan)
    const getCentroidById = (type: "bangunan" | "ruangan", id: string) => {
      let feature = null;
      if (type === "bangunan") {
        feature = bangunanFeatures.find((b: any) => b.properties.id == id);
      } else if (type === "ruangan") {
        feature = ruanganFeatures.find((r: any) => r.properties.id == id);
      }
      if (!feature || !feature.geometry) return null;
      let coords: number[][] = [];
      if (feature.geometry.type === "Polygon") {
        coords = feature.geometry.coordinates[0];
      } else if (feature.geometry.type === "MultiPolygon") {
        coords = feature.geometry.coordinates.flat(2);
      }
      if (!coords.length) return null;
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      const lat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const lng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      return [lat, lng];
    };

    // Fungsi untuk handle submit rute
    const handleRouteSubmit = async () => {
      let startLatLng: [number, number] | null = null;
      let endLatLng: [number, number] | null = null;
      setRouteDistance(null);
      // Titik awal
      if (routeStartId === "my-location" && userLocation) {
        startLatLng = [userLocation.lat, userLocation.lng];
      } else if (routeStartId) {
        startLatLng = getCentroidById("bangunan", routeStartId) as [
          number,
          number
        ];
      }
      // Titik tujuan (selalu bangunan)
      if (routeEndType === "bangunan" && routeEndId) {
        endLatLng = getCentroidById("bangunan", routeEndId) as [number, number];
      }
      // Gambar polyline jika kedua titik valid
      if (startLatLng && endLatLng && leafletMapRef.current) {
        if (routeLine) {
          leafletMapRef.current.removeLayer(routeLine);
        }
        const polyline = L.polyline([startLatLng, endLatLng], {
          color: "#ff6600",
          weight: 5,
          opacity: 0.8,
          dashArray: "8 8",
        });
        polyline.addTo(leafletMapRef.current);
        setRouteLine(polyline);
        // Zoom ke rute
        leafletMapRef.current.fitBounds(
          L.latLngBounds([startLatLng, endLatLng]),
          { padding: [40, 40], maxZoom: 19 }
        );
        // Hitung jarak jika titik awal lokasi saya
        if (routeStartId === "my-location") {
          const R = 6371000; // meter
          const toRad = (deg: number) => (deg * Math.PI) / 180;
          const dLat = toRad(endLatLng[0] - startLatLng[0]);
          const dLng = toRad(endLatLng[1] - startLatLng[1]);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(startLatLng[0])) *
              Math.cos(toRad(endLatLng[0])) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c;
          setRouteDistance(Math.round(d));
        }
      }
      setShowRouteModal(false);
    };

    // Hapus rute saat card bangunan di-close
    useEffect(() => {
      if (!cardVisible && routeLine && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(routeLine);
        setRouteLine(null);
        setRouteDistance(null);
      }
    }, [cardVisible]);

    // Debug: log kategori setiap kali selectedFeature berubah
    useEffect(() => {
      if (selectedFeature) {
        console.log(
          "DEBUG selectedFeature kategori:",
          selectedFeature?.properties?.kategori
        );
      }
    }, [selectedFeature]);

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
              placeholder="Cari nama bangunan atau ruangan..."
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
                      : `Menampilkan ${Math.min(
                          searchResults.length,
                          10
                        )} bangunan`}
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
                        {feature.properties?.displayType === "ruangan" ? (
                          <>
                            <span className="text-blue-600 dark:text-blue-400">
                              🏢 Ruangan
                            </span>
                            {feature.properties?.lantai &&
                              ` • Lantai ${feature.properties.lantai}`}
                            {feature.properties?.jurusan &&
                              ` • ${feature.properties.jurusan}`}
                            {feature.properties?.prodi &&
                              ` • ${feature.properties.prodi}`}
                          </>
                        ) : (
                          <>
                            <span className="text-green-600 dark:text-green-400">
                              🏛️ Bangunan
                            </span>
                            {feature.properties?.displayInfo &&
                              ` • ${feature.properties.displayInfo}`}
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

        {/* Kontrol kanan bawah: tombol zoom, GPS, reset, dsb */}
        {!selectedFeature && (
          <div
            className="absolute right-4 bottom-4 z-50 flex flex-col gap-2"
            style={{ zIndex: 1050 }}
          >
            {/* Zoom Controls */}
            <div className="flex flex-col gap-1 mb-2">
              {/* Zoom In Button */}
              <button
                onClick={() => {
                  console.log("Zoom in clicked");
                  const map = leafletMapRef.current;
                  if (map) {
                    const newZoom = Math.min(map.getZoom() + 1, 19);
                    map.setZoom(newZoom);
                    console.log("Zoom in successful, new zoom:", newZoom);
                  } else {
                    console.log("Map not ready for zoom in");
                  }
                }}
                className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
                  console.log("Zoom out clicked");
                  const map = leafletMapRef.current;
                  if (map) {
                    const newZoom = Math.max(
                      map.getZoom() - 1,
                      map.getMinZoom()
                    );
                    map.setZoom(newZoom);
                    console.log("Zoom out successful, new zoom:", newZoom);
                  } else {
                    console.log("Map not ready for zoom out");
                  }
                }}
                className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
                className={`flex items-center justify-center rounded-lg shadow-lg px-3 py-2 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
            className={`flex flex-col items-center justify-center rounded-lg shadow-lg px-4 py-3 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer
          ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
            className={`flex flex-col items-center justify-center rounded-lg shadow-lg px-4 py-3 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/30 cursor-pointer
          ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
            className={`absolute right-4 bottom-4 z-[201] w-64 max-w-xs bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-out
              ${
                cardVisible && cardAnimation
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95 pointer-events-none"
              }
            `}
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
                    onClick={() => openBuildingDetailModal()}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    Detail Bangunan
                  </button>
                )}
              {selectedFeature?.properties?.id &&
                selectedFeature?.properties?.nama && (
                  <button
                    className="w-full py-2 rounded-lg font-bold text-sm shadow bg-accent text-white hover:bg-accent/90 dark:bg-accent-dark dark:hover:bg-accent-dark/80 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-primary-dark"
                    onClick={() => {
                      // Set tujuan otomatis ke bangunan yang sedang diklik
                      setRouteEndType("bangunan");
                      setRouteEndId(selectedFeature.properties.id);
                      setTimeout(() => setShowRouteModal(true), 10);
                    }}
                  >
                    <FontAwesomeIcon icon={faRoute} className="mr-2" />
                    Rute
                  </button>
                )}
              {!selectedFeature?.properties?.id && (
                <div className="text-xs text-red-500">
                  [DEBUG] Ini bukan bangunan dari API (tidak ada properti id)
                </div>
              )}
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
            minHeight: 300,
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
              src={`/building-details/index.html?id=${
                selectedFeature?.properties?.id || "45"
              }`}
              title="Building Detail"
              className="flex-1 w-full h-full border-0 rounded-b-xl"
              style={{ minHeight: "300px" }}
            />
          </div>
        )}

        {/* MODAL RUTE (di dalam canvas) */}
        {showRouteModal && (
          <div className="absolute inset-0 z-[3000] flex items-center justify-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowRouteModal(false)}
            />
            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-[3010] animate-fadeInUp">
              {/* Tombol tutup */}
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl focus:outline-none"
                onClick={() => setShowRouteModal(false)}
                title="Tutup"
              >
                ×
              </button>
              <h3 className="text-lg font-bold mb-4 text-primary dark:text-primary-dark text-center">
                Rute
              </h3>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRouteSubmit();
                }}
              >
                {/* Titik Awal */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titik Awal
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={routeStartId || "my-location"}
                    onChange={(e) => setRouteStartId(e.target.value)}
                  >
                    <option value="my-location">Lokasi Saya</option>
                    {bangunanFeatures.map((b: any) => (
                      <option key={b.properties.id} value={b.properties.id}>
                        {b.properties.nama}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Titik Tujuan */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titik Tujuan
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                    value={(() => {
                      if (routeEndType === "bangunan") {
                        const b = bangunanFeatures.find(
                          (b: any) => b.properties.id == routeEndId
                        );
                        return b ? b.properties.nama : "Bangunan";
                      } else if (routeEndType === "ruangan") {
                        const r = ruanganFeatures.find(
                          (r: any) => r.properties.id == routeEndId
                        );
                        return r ? r.properties.nama : "Ruangan";
                      }
                      return "";
                    })()}
                    readOnly
                    disabled
                  />
                </div>
                {/* Tombol submit */}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary text-white font-bold mt-2 hover:bg-primary/90 transition-all"
                >
                  Cari Rute
                </button>
              </form>
              {/* Jarak rute jika lokasi saya */}
              {routeDistance !== null && (
                <div className="mt-2 text-center text-sm text-primary font-semibold">
                  Jarak: {routeDistance} meter
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default LeafletMap;
