/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  faSyncAlt,
  faLayerGroup,
  faGlobe,
  faCar,
  faWalking,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";
import { findRoute, Point, calculateDistance } from "../lib/routing";
// Import fungsi routing dari src/lib/routeSteps
import { useGps } from "./useGps";
import { useRouting } from "./useRouting";
import {
  parseRouteSteps,
  getStepInstruction,
  calculateBearing,
} from "../lib/routeSteps";

interface LeafletMapProps {
  isDark?: boolean;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  className?: string;
  isDashboard?: boolean;
}

export interface LeafletMapRef {
  highlightFeature: (
    featureType: string,
    featureId: number,
    featureName: string
  ) => void;
}

const geojsonBangunanUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/geojson`;
const geojsonStatisUrl = "/geojson/Polnep WGS_1984.geojson";

const kategoriStyle: Record<string, L.PathOptions> = {
  Bangunan: {
    color: "#1e40af", // Blue-800 - lebih gelap untuk bangunan
    weight: 2,
    fillColor: "#3b82f6", // Blue-500
    fillOpacity: 0.8,
  },
  Trotoar: {
    color: "#78716c", // Stone-600
    weight: 1,
    fillColor: "#a8a29e", // Stone-400
    fillOpacity: 0.7,
  },
  Jalan: {
    color: "#374151", // Gray-700
    weight: 2,
    fillColor: "#6b7280", // Gray-500
    fillOpacity: 0.8,
  },
  Lahan: {
    color: "#166534", // Green-800 - lebih gelap
    weight: 1,
    fillColor: "#22c55e", // Green-500
    fillOpacity: 0.6,
  },
  Parkir: {
    color: "#52525b", // Zinc-600
    weight: 1,
    fillColor: "#71717a", // Zinc-500
    fillOpacity: 0.7,
  },
  Kanopi: {
    color: "#ea580c", // Orange-600
    weight: 1,
    fillColor: "#fb923c", // Orange-400
    fillOpacity: 0.6,
  },
  Kolam: {
    color: "#0369a1", // Sky-700
    weight: 1,
    fillColor: "#0ea5e9", // Sky-500
    fillOpacity: 0.6,
  },
  Paving: {
    color: "#57534e", // Stone-700
    weight: 1,
    fillColor: "#78716c", // Stone-600
    fillOpacity: 0.8,
  },
  Taman: {
    color: "#7c3aed", // Violet-600
    weight: 1,
    fillColor: "#a78bfa", // Violet-400
    fillOpacity: 0.6,
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
    label: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
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
      isDashboard = false,
    },
    ref
  ) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    // Tambahkan type untuk properti GeoJSON agar tidak error linter
    interface FeatureProperties {
      id?: number | string;
      nama?: string;
      interaksi?: string;
      lantai?: number;
      kategori?: string;
      subtipe?: string;
      displayType?: string;
      displayInfo?: string;
      jurusan?: string;
      prodi?: string;
      isRuangan?: boolean;
      bangunan_id?: number | string;
      nomor_lantai?: number;
      thumbnail?: string;
      [key: string]: any;
    }

    interface FeatureFixed extends GeoJSON.Feature {
      properties: FeatureProperties;
      geometry: GeoJSON.Geometry;
    }

    // Ganti FeatureType menjadi FeatureFixed
    type FeatureType = FeatureFixed;
    const basemapLayerRef = useRef<L.TileLayer | null>(null);
    const [basemap, setBasemap] = useState<string>(
      isDark ? "alidade_smooth_dark" : "esri_topo"
    );
    const [layerVisible, setLayerVisible] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<FeatureType[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSatellite, setIsSatellite] = useState(
      basemap === "esri_satellite"
    );
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [isHighlightActive, setIsHighlightActive] = useState(false);
    const [isContainerShaking, setIsContainerShaking] = useState(false);
    const [isNavigationActive, setIsNavigationActive] = useState(false);
    const [isStartDropdownOpen, setIsStartDropdownOpen] = useState(false);
    const isHighlightActiveRef = useRef(false);
    const isNavigationActiveRef = useRef(false);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [routeEndType, setRouteEndType] = useState("bangunan");
    const [routeEndId, setRouteEndId] = useState("");
    const [selectedFeature, setSelectedFeature] = useState<FeatureType | null>(
      null
    );
    const [cardVisible, setCardVisible] = useState(false);
    const [showBuildingDetailCanvas, setShowBuildingDetailCanvas] =
      useState(false);
    const nonBangunanLayerRef = useRef<L.GeoJSON<FeatureType> | null>(null);
    const bangunanLayerRef = useRef<L.GeoJSON<FeatureType> | null>(null);
    const [nonBangunanFeatures, setNonBangunanFeatures] = useState<
      FeatureType[]
    >([]);
    const [bangunanFeatures, setBangunanFeatures] = useState<FeatureType[]>([]);
    const [ruanganFeatures, setRuanganFeatures] = useState<FeatureType[]>([]);
    const [isBuildingDetailFadingOut, setIsBuildingDetailFadingOut] =
      useState(false);
    const [isBuildingDetailFadingIn, setIsBuildingDetailFadingIn] =
      useState(false);
    const [cardAnimation, setCardAnimation] = useState(false);
    const [routeStartType, setRouteStartType] = useState<string>("my-location");
    const [routeStartId, setRouteStartId] = useState<string>("");
    const [titikFeatures, setTitikFeatures] = useState<any[]>([]); // Titik geojson
    const [jalurFeatures, setJalurFeatures] = useState<any[]>([]); // Jalur geojson
    const [routeEndSearchText, setRouteEndSearchText] = useState("");
    const [routeEndSearchResults, setRouteEndSearchResults] = useState<Point[]>(
      []
    );

    // State untuk edit mode
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingThumbnail, setIsEditingThumbnail] = useState(false);
    const [editName, setEditName] = useState("");
    const [editThumbnail, setEditThumbnail] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Gunakan custom hook
    const {
      userLocation,
      setUserLocation,
      isGettingLocation,
      setIsGettingLocation,
      isGpsRequesting,
      showGPSTroubleshoot,
      setShowGPSTroubleshoot,
      isUserInsideCampus,
      getCurrentLocation,
      startLiveTracking,
    } = useGps();

    const {
      routeSteps,
      setRouteSteps,
      activeStepIndex,
      setActiveStepIndex,
      routeDistance,
      setRouteDistance,
      totalWalkingTime,
      setTotalWalkingTime,
      totalVehicleTime,
      setTotalVehicleTime,
      routeLine,
      setRouteLine,
      alternativeRouteLines,
      setAlternativeRouteLines,
      destinationMarker,
      setDestinationMarker,
      hasReachedDestination,
      setHasReachedDestination,
      transportMode,
      setTransportMode,
      activeStepLineRef,
      parseRouteSteps,
      getStepInstruction,
    } = useRouting();

    // Add missing useRef declarations at the top of the component
    const userMarkerRef = useRef<L.Marker | null>(null);
    const routeLineRef = useRef<L.Polyline | null>(null);
    const navigationMarkerRef = useRef<L.Marker | null>(null);

    // Fungsi untuk membuka modal dengan animasi fade-in
    const openBuildingDetailModal = (selectedRuangan?: FeatureType) => {
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
            (f: FeatureType) => f.properties?.kategori !== "Bangunan"
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
      fetch(geojsonBangunanUrl, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.features)) {
            console.error("Data bangunan tidak valid:", data);
            // Hapus data dummy, set kosong saja
            setBangunanFeatures([]);
            return;
          }
          setBangunanFeatures(data.features || []);
          console.log("Bangunan data loaded:", data.features.length, "items");
        })
        .catch((error) => {
          console.error("Error loading bangunan data:", error);
          // Hapus data dummy, set kosong saja
          setBangunanFeatures([]);
        })
        .finally(() => setIsLoadingData(false));
    }, []);

    // Load data ruangan dari API
    useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
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
            // Hapus data dummy, set kosong saja
            setRuanganFeatures([]);
            return;
          }
          // Perbaiki mapping agar support dua struktur
          const ruanganForSearch = data.map((ruangan: any) => {
            // Jika ada ruangan.properties, gunakan itu. Jika tidak, ambil langsung dari root.
            const props = ruangan.properties || ruangan;
            return {
              type: "Feature",
              geometry: {
                type: "GeometryCollection",
                geometries: [],
              } as GeoJSON.GeometryCollection,
              properties: {
                id: props.id_ruangan,
                nama: props.nama_ruangan,
                kategori: "Ruangan",
                subtipe: props.deskripsi || "Ruangan",
                lantai: props.nomor_lantai,
                bangunan_id: props.id_bangunan,
                jurusan:
                  props.prodi && props.prodi.jurusan
                    ? props.prodi.jurusan.nama_jurusan
                    : "",
                prodi: props.prodi ? props.prodi.nama_prodi : "",
                searchable: true,
                isRuangan: true,
              },
            };
          }) as FeatureFixed[];
          setRuanganFeatures(ruanganForSearch);
          console.log("Ruangan data loaded:", ruanganForSearch.length, "items");
        })
        .catch((error) => {
          console.error("Error loading ruangan data:", error);
          // Hapus data dummy, set kosong saja
          setRuanganFeatures([]);
        });
    }, []);

    // Load data titik dari geojson
    useEffect(() => {
      fetch("/geojson/Titik WGS_1984.geojson")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.features)) {
            setTitikFeatures([]);
            return;
          }
          setTitikFeatures(data.features);
        })
        .catch(() => setTitikFeatures([]));
    }, []);

    // Load data jalur dari geojson
    useEffect(() => {
      fetch("/geojson/Jalur WGS_1984.geojson")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.features)) {
            setJalurFeatures([]);
            return;
          }
          setJalurFeatures(data.features);
        })
        .catch(() => setJalurFeatures([]));
    }, []);

    // Fungsi untuk mengkonversi titik GeoJSON ke format Point
    const convertTitikToPoints = (): Point[] => {
      return titikFeatures
        .map((titik: any) => {
          const coords = titik.geometry?.coordinates;
          if (coords && Array.isArray(coords) && coords.length > 0) {
            // Handle MultiPoint atau Point
            const pointCoords = Array.isArray(coords[0]) ? coords[0] : coords;
            const nama = titik.properties?.Nama || "";
            const lowerNama = nama.toLowerCase();

            // Filter out titik yang memiliki nama "Toilet" atau "Pos Satpam"
            if (
              lowerNama.includes("toilet") ||
              lowerNama.includes("pos satpam")
            ) {
              return null;
            }

            return {
              id: String(titik.id || titik.properties?.OBJECTID || ""),
              name:
                titik.properties?.Nama ||
                `Titik ${titik.id || titik.properties?.OBJECTID || ""}`,
              coordinates: [pointCoords[1], pointCoords[0]], // [lat, lng]
            };
          }
          return null;
        })
        .filter(Boolean) as Point[];
    };

    // Fungsi untuk mencari titik berdasarkan nama
    const searchTitikByName = (searchText: string): Point[] => {
      const points = convertTitikToPoints();
      const lowerSearchText = searchText.toLowerCase();
      return points.filter((point) =>
        point.name.toLowerCase().includes(lowerSearchText)
      );
    };

    // Debug: log jalur yang tersedia
    useEffect(() => {
      if (jalurFeatures.length > 0) {
        console.log("Jalur yang tersedia:", jalurFeatures.length);
        console.log("Contoh jalur:", jalurFeatures[0]);
      }
    }, [jalurFeatures]);

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
      // setAllFeatures([...bangunanFeatures, ...ruanganFeatures]); // Removed as per new_code
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

      // Tambahkan custom pane untuk rute dengan zIndex tinggi
      map.createPane("routePane");
      const routePane = map.getPane("routePane");
      if (routePane && routePane.style) {
        routePane.style.zIndex = "650";
      }

      // Layer non-bangunan (ditambahkan lebih dulu)
      const nonBangunanLayer = L.geoJSON(undefined, {
        style: (feature) => {
          const kategori =
            feature &&
            feature.properties &&
            (feature.properties as FeatureProperties).kategori;
          return kategoriStyle[kategori as string] || defaultStyle;
        },
        onEachFeature: (feature, layer) => {
          // Pastikan cursor menjadi 'grab' untuk semua tipe geometry
          const setGrabCursor = () => {
            if (
              (layer as any).feature &&
              (layer as any).feature.geometry &&
              (layer as any).feature.geometry.type === "Polygon"
            ) {
              (layer as any)._path &&
                ((layer as any)._path.style.cursor = "grab");
            }
            if ((layer as any).type === "FeatureGroup")
              (layer as any).style.cursor = "grab";
          };
          layer.on("mouseover", setGrabCursor);
          layer.on("mousemove", setGrabCursor);
          layer.on("mouseout", setGrabCursor);
        },
      }) as L.GeoJSON<FeatureFixed>;
      nonBangunanLayer.addTo(map);
      nonBangunanLayerRef.current = nonBangunanLayer;

      // Layer bangunan (di atas non-bangunan)
      const bangunanLayer = L.geoJSON(undefined, {
        style: () => kategoriStyle["Bangunan"] || defaultStyle,
        onEachFeature: (feature, layer) => {
          layer.on("mouseover", function (e: L.LeafletMouseEvent) {
            // setTooltipPosition({ // Removed as per new_code
            //   x: e.originalEvent.clientX,
            //   y: e.originalEvent.clientY,
            // });
          });
          layer.on("mouseout", function () {
            // setHoveredFeature(null); // Removed as per new_code
          });
          // Hanya kategori Bangunan yang bisa diklik
          if (feature.properties?.id) {
            layer.on("click", function (e: L.LeafletMouseEvent) {
              // Jika rute sedang tampil atau highlight aktif (dan navigation tidak aktif), blok interaksi klik bangunan lain
              if (
                routeLineRef.current ||
                (isHighlightActiveRef.current && !isNavigationActiveRef.current)
              ) {
                if (
                  e &&
                  e.originalEvent &&
                  typeof e.originalEvent.stopPropagation === "function"
                ) {
                  e.originalEvent.stopPropagation();
                }
                // Tambahkan efek shake pada container detail bangunan yang sedang aktif
                setIsContainerShaking(true);
                setTimeout(() => setIsContainerShaking(false), 600);
                return;
              }
              // Pastikan kategori diset dengan benar
              const featureWithKategori = {
                ...feature,
                properties: {
                  ...feature.properties,
                  kategori: "Bangunan",
                },
              } as FeatureFixed;
              setSelectedFeature(featureWithKategori);
              setCardVisible(true);
              setIsHighlightActive(true);
              // Kirim pesan ke dashboard untuk update sidebar
              window.postMessage(
                {
                  type: "building-clicked",
                  buildingId: (feature as FeatureFixed).properties?.id,
                  buildingName: (feature as FeatureFixed).properties?.nama,
                },
                "*"
              );
            });
            // Ubah cursor pointer untuk interaktif
            layer.on("mouseover", function () {
              if (
                (layer as any).feature &&
                (layer as any).feature.geometry &&
                (layer as any).feature.geometry.type === "Polygon"
              ) {
                (layer as any)._path &&
                  ((layer as any)._path.style.cursor = "pointer");
              }
            });
            layer.on("mouseout", function () {
              if (
                (layer as any).feature &&
                (layer as any).feature.geometry &&
                (layer as any).feature.geometry.type === "Polygon"
              ) {
                (layer as any)._path &&
                  ((layer as any)._path.style.cursor = "");
              }
            });
          } else {
            // Pastikan cursor default untuk non-bangunan
            layer.on("mouseover", function () {
              if (
                (layer as any).feature &&
                (layer as any).feature.geometry &&
                (layer as any).feature.geometry.type === "Polygon"
              ) {
                (layer as any)._path &&
                  ((layer as any)._path.style.cursor = "");
              }
            });
          }
        },
      });
      bangunanLayer.addTo(map);
      bangunanLayerRef.current = bangunanLayer;

      // Cleanup
      return () => {
        try {
          map.eachLayer((layer: L.Layer) => {
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

    // Control map interactions berdasarkan highlight state dan navigation state
    useEffect(() => {
      const map = leafletMapRef.current;
      if (!map) return;

      // Update refs untuk digunakan di event handler Leaflet
      isHighlightActiveRef.current = isHighlightActive;
      isNavigationActiveRef.current = isNavigationActive;

      // Jika navigation aktif, enable map interactions (bisa di-geser)
      if (isNavigationActive) {
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        // Cleanup canvas click handler jika ada
        if ((map as any)._canvasClickCleanup) {
          (map as any)._canvasClickCleanup();
          delete (map as any)._canvasClickCleanup;
        }
      }
      // Jika highlight aktif tapi navigation tidak aktif, disable map interactions
      else if (isHighlightActive) {
        // Disable map interactions
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        // Add click handler untuk canvas area dengan delay (hanya jika navigation tidak aktif)
        setTimeout(() => {
          const handleCanvasClick = (e: MouseEvent) => {
            // Cek apakah klik di luar container
            const container = document.querySelector(
              '[data-container="building-detail"]'
            );
            // Cek apakah modal route sedang terbuka
            const routeModal = document.querySelector(
              '[data-modal="route-modal"]'
            );

            // Cek apakah klik terjadi di dalam area peta (canvas peta)
            const mapContainer = document.querySelector(".leaflet-container");
            const isClickInsideMap =
              mapContainer && mapContainer.contains(e.target as Node);

            // Cek apakah klik pada kontrol peta (zoom in/out, reset, layer toggle, basemap toggle, GPS)
            const target = e.target as Element;
            const isMapControl =
              target.closest(".leaflet-control-zoom") || // Zoom in/out buttons
              target.closest(".leaflet-control-layers") || // Layer control
              target.closest('[data-control="reset-zoom"]') || // Reset zoom button
              target.closest('[data-control="toggle-layer"]') || // Toggle layer button
              target.closest('[data-control="toggle-basemap"]') || // Toggle basemap button
              target.closest('[data-control="zoom-in"]') || // Zoom in button
              target.closest('[data-control="zoom-out"]') || // Zoom out button
              target.closest('[data-control="locate-me"]') || // GPS button
              target.closest(".leaflet-control-attribution") || // Attribution
              target.closest(".leaflet-control-scale"); // Scale control

            if (
              container &&
              !container.contains(e.target as Node) &&
              !routeModal &&
              !isMapControl &&
              isClickInsideMap // Hanya trigger shake jika klik di dalam area peta
            ) {
              // Trigger shake effect (hanya jika modal route tidak terbuka, bukan kontrol peta, dan klik di dalam peta)
              setIsContainerShaking(true);
              setTimeout(() => setIsContainerShaking(false), 600);
            }
          };

          document.addEventListener("click", handleCanvasClick);

          // Cleanup function untuk dijalankan saat highlight nonaktif
          const cleanup = () => {
            document.removeEventListener("click", handleCanvasClick);
          };

          // Simpan cleanup function untuk dijalankan nanti
          if (map) {
            (map as any)._canvasClickCleanup = cleanup;
          }
        }, 100); // Delay 100ms untuk memastikan container sudah terbuka
      }
      // Jika keduanya tidak aktif, enable map interactions
      else {
        // Enable map interactions
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        // Cleanup canvas click handler jika ada
        if ((map as any)._canvasClickCleanup) {
          (map as any)._canvasClickCleanup();
          delete (map as any)._canvasClickCleanup;
        }
      }
    }, [isHighlightActive, isNavigationActive]);

    // Sync routeLine state dengan routeLineRef
    useEffect(() => {
      routeLineRef.current = routeLine as L.Polyline | null;
    }, [routeLine]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest(".route-modal-select")) {
          setIsStartDropdownOpen(false);
        }
      };

      if (isStartDropdownOpen) {
        document.addEventListener("click", handleClickOutside);
      }

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [isStartDropdownOpen]);

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
          features: nonBangunanFeatures as unknown as FeatureFixed[],
        } as GeoJSON.FeatureCollection);
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
          features: bangunanFeatures as unknown as FeatureFixed[],
        } as GeoJSON.FeatureCollection);
      }
    }, [bangunanFeatures, layerVisible]);

    // Search logic - untuk bangunan dan ruangan
    useEffect(() => {
      if (!searchText.trim()) {
        setSearchResults([]); // Tidak menampilkan apapun jika input kosong
        return;
      }

      const searchLower = searchText.toLowerCase();
      const results: FeatureType[] = [];

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

    // Event listener untuk menutup modal edit saat klik di luar
    useEffect(() => {
      const handleClickOutsideEdit = (event: MouseEvent) => {
        const editModal = document.querySelector('[data-modal="edit-modal"]');
        if (editModal && !editModal.contains(event.target as Node)) {
          handleCancelEdit();
        }
      };

      if (isEditingName || isEditingThumbnail) {
        document.addEventListener("mousedown", handleClickOutsideEdit);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutsideEdit);
      };
    }, [isEditingName, isEditingThumbnail]);

    // Event listener untuk keyboard shortcuts pada modal edit
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isEditingName || isEditingThumbnail) {
          if (event.key === "Enter") {
            event.preventDefault();
            if (
              !isSaving &&
              ((isEditingName && editName.trim()) ||
                (isEditingThumbnail && editThumbnail.trim()))
            ) {
              handleSaveEdit();
            }
          } else if (event.key === "Escape") {
            event.preventDefault();
            handleCancelEdit();
          }
        }
      };

      if (isEditingName || isEditingThumbnail) {
        document.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isEditingName, isEditingThumbnail, editName, selectedFile, isSaving]);

    // Cek status login (yang login sudah pasti admin)
    useEffect(() => {
      const checkLoginStatus = () => {
        const token = localStorage.getItem("token");
        const isUserLoggedIn = !!token;
        setIsLoggedIn(isUserLoggedIn);
        setIsAdmin(isUserLoggedIn); // Yang login sudah pasti admin
      };

      // Cek status awal
      checkLoginStatus();

      // Listen untuk perubahan storage (login/logout)
      window.addEventListener("storage", checkLoginStatus);

      // Listen untuk custom event login/logout
      window.addEventListener("login-status-changed", checkLoginStatus);

      return () => {
        window.removeEventListener("storage", checkLoginStatus);
        window.removeEventListener("login-status-changed", checkLoginStatus);
      };
    }, []);

    // Fungsi helper untuk highlight bangunan
    const highlightBangunan = (featureId: number) => {
      const bangunanLayer = bangunanLayerRef.current;
      if (!bangunanLayer) return;

      bangunanLayer.eachLayer((layer: L.Layer) => {
        if (
          (layer as any).feature &&
          (layer as any).feature.geometry &&
          (layer as any).feature.geometry.type === "Polygon" &&
          (layer as any).feature.properties?.id === featureId
        ) {
          console.log("Highlighting bangunan from search:", featureId);

          // Simpan style awal
          const kategori =
            (layer as any).feature?.properties?.kategori || "Bangunan";
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
          (layer as any).setStyle(highlightStyle);

          // Kembalikan ke style awal setelah 1 detik dengan efek fade yang lebih smooth
          setTimeout(() => {
            // Animasi fade kembali ke warna asli dengan transisi bertahap
            (layer as any).setStyle({
              ...defaultStyle,
              opacity: 0.9, // Mulai dengan opacity sedikit transparan
              weight: 2, // Kurangi ketebalan secara bertahap
            });

            // Transisi bertahap untuk efek fade yang lebih smooth
            setTimeout(() => {
              (layer as any).setStyle({
                ...defaultStyle,
                opacity: 0.7,
                weight: 1, // Kembalikan ke ketebalan normal
              });

              setTimeout(() => {
                (layer as any).setStyle(defaultStyle);
              }, 50);
            }, 50);
          }, 1000); // Durasi highlight 1 detik
        }
      });
    };

    // Handle select search result
    const handleSelectSearchResult = async (feature: FeatureType) => {
      // Blokir jika highlight aktif - user harus close container dulu
      if (isHighlightActive) {
        console.log(
          "⚠️ Container detail sedang terbuka, tutup dulu untuk memilih bangunan lain"
        );

        // Tambahkan efek shake pada container detail bangunan yang sedang aktif
        setIsContainerShaking(true);
        setTimeout(() => setIsContainerShaking(false), 600);
        return;
      }

      const map = leafletMapRef.current;
      if (!map) return;

      console.log("🔍 Menampilkan detail untuk:", feature.properties?.nama);

      // Tampilkan detail bangunan dan zoom ke lokasi
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

            // Zoom ke bangunan dengan animasi smooth
            map.fitBounds(bounds, {
              padding: [50, 50],
              animate: true,
              duration: 1.2, // Smooth animation
            });

            const onMoveEnd = () => {
              setSelectedFeature(bangunan);
              setCardVisible(true);
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
            openBuildingDetailModal(feature);

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
            duration: 1.2, // Smooth animation
          });

          // Highlight bangunan setelah zoom selesai
          const onMoveEnd = () => {
            if (
              feature.properties?.kategori === "Bangunan" ||
              feature.properties?.displayType === "bangunan"
            ) {
              highlightBangunan(Number(feature.properties?.id ?? 0));
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
            highlightBangunan(Number(feature.properties?.id ?? 0));
          }
        }
      }

      // Reset input dan tutup dropdown setelah pilih hasil
      setSearchText("");
      setShowSearchResults(false);

      if (
        feature.properties?.kategori === "Bangunan" ||
        feature.properties?.displayType === "bangunan"
      ) {
        setSelectedFeature(feature);
        setCardVisible(true);
        setIsHighlightActive(true);
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
      // setIsLocating(true); // Removed as per new_code
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Geolocation success:", pos.coords);
          // setIsLocating(false); // Removed as per new_code
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          setUserLocation(latlng);

          // Tambahkan pengecekan apakah user di dalam kampus
          const isInsideCampus = isUserInsideCampus(
            pos.coords.latitude,
            pos.coords.longitude
          );
          console.log("📍 [GPS-CHECK] User location check:", {
            coordinates: [pos.coords.latitude, pos.coords.longitude],
            isInsideCampus: isInsideCampus,
          });

          // Tampilkan informasi lokasi user
          const locationMessage = isInsideCampus
            ? "📍 Anda berada di dalam area kampus"
            : "📍 Anda berada di luar area kampus";
          console.log("📍 [GPS-CHECK] " + locationMessage);

          // Simpan status lokasi untuk digunakan nanti
          (latlng as any).isInsideCampus = isInsideCampus;

          const map = leafletMapRef.current;
          if (map) {
            map.setView(latlng, 18, { animate: true });
            console.log("Map view updated to user location");
          }
        },
        (err) => {
          console.log("Geolocation error:", err);
          // setIsLocating(false); // Removed as per new_code
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
    function getFeatureCentroid(feature: FeatureType): [number, number] {
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

    // Fungsi untuk handle edit nama bangunan
    const handleEditName = () => {
      if (!selectedFeature?.properties?.nama) return;

      // Cek apakah user sudah login
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Anda harus login terlebih dahulu untuk mengedit bangunan.");
        return;
      }

      setEditName(selectedFeature.properties.nama);
      setIsEditingName(true);
    };

    // Fungsi untuk handle edit thumbnail
    const handleEditThumbnail = () => {
      if (!selectedFeature?.properties?.nama) return;

      // Cek apakah user sudah login
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Anda harus login terlebih dahulu untuk mengedit bangunan.");
        return;
      }

      setSelectedFile(null);
      setIsEditingThumbnail(true);
    };

    // Fungsi untuk save edit
    const handleSaveEdit = async () => {
      if (!selectedFeature?.properties?.id) return;

      setIsSaving(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Token tidak ditemukan. Silakan login ulang.");
          return;
        }

        // Handle edit nama
        if (isEditingName && editName.trim()) {
          const updateData = { nama: editName.trim() };

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${selectedFeature.properties.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify(updateData),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          // Update local state
          if (selectedFeature) {
            selectedFeature.properties = {
              ...selectedFeature.properties,
              ...updateData,
            };
          }
        }

        // Handle upload thumbnail
        if (isEditingThumbnail && selectedFile) {
          const formData = new FormData();
          formData.append("thumbnail", selectedFile);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${selectedFeature.properties.id}/upload-thumbnail`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          // Update local state
          if (selectedFeature) {
            selectedFeature.properties = {
              ...selectedFeature.properties,
              thumbnail: result.thumbnailPath,
            };
          }
        }

        // Reset edit mode
        setIsEditingName(false);
        setIsEditingThumbnail(false);
        setEditName("");
        setSelectedFile(null);

        alert("Berhasil menyimpan perubahan!");

        // Refresh data bangunan
        if (bangunanLayerRef.current) {
          // Trigger re-render dengan data baru
          const currentFeatures = [...bangunanFeatures];
          const updatedIndex = currentFeatures.findIndex(
            (f) => f.properties?.id === selectedFeature.properties?.id
          );
          if (updatedIndex !== -1) {
            currentFeatures[updatedIndex] = selectedFeature;
            setBangunanFeatures(currentFeatures);
          }
        }
      } catch (error) {
        console.error("Error saving edit:", error);
        alert("Gagal menyimpan perubahan. Silakan coba lagi.");
      } finally {
        setIsSaving(false);
      }
    };

    // Fungsi untuk cancel edit
    const handleCancelEdit = () => {
      setIsEditingName(false);
      setIsEditingThumbnail(false);
      setEditName("");
      setSelectedFile(null);
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
            highlightBangunan(Number(featureId));

            // Pan ke lokasi bangunan dengan zoom smooth
            const bangunanLayer = bangunanLayerRef.current;
            if (bangunanLayer) {
              bangunanLayer.eachLayer((layer: L.Layer) => {
                if (
                  (layer as any).feature &&
                  (layer as any).feature.geometry &&
                  (layer as any).feature.geometry.type === "Polygon" &&
                  (layer as any).feature.properties?.id === Number(featureId)
                ) {
                  const map = leafletMapRef.current;
                  if (map && (layer as any).getBounds) {
                    map.fitBounds((layer as any).getBounds(), {
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
              (r) => r.properties?.id === Number(featureId)
            );

            if (selectedRuangan) {
              // Cari bangunan yang berisi ruangan ini
              const bangunanId = selectedRuangan.properties?.bangunan_id;
              const bangunan = bangunanFeatures.find(
                (b) => b.properties?.id === Number(bangunanId)
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
                      // Highlight permanen sudah ditangani oleh useEffect berdasarkan selectedFeature
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
                  // Highlight permanen sudah ditangani oleh useEffect berdasarkan selectedFeature
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
          // Jika container detail bangunan sedang aktif, berikan efek shake
          if (isHighlightActiveRef.current) {
            // Tambahkan efek shake pada container detail bangunan yang sedang aktif
            setIsContainerShaking(true);
            setTimeout(() => setIsContainerShaking(false), 600);
            return;
          }

          // Highlight bangunan menggunakan fungsi helper
          highlightBangunan(featureId);

          // Pan ke lokasi bangunan dengan zoom smooth
          const bangunanLayer = bangunanLayerRef.current;
          if (bangunanLayer) {
            bangunanLayer.eachLayer((layer: L.Layer) => {
              if (
                (layer as any).feature &&
                (layer as any).feature.geometry &&
                (layer as any).feature.geometry.type === "Polygon" &&
                (layer as any).feature.properties?.id === featureId
              ) {
                const map = leafletMapRef.current;
                if (map && (layer as any).getBounds) {
                  map.fitBounds((layer as any).getBounds(), {
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
              (b) => b.properties?.id === Number(bangunanId)
            );

            if (bangunan && bangunan.geometry) {
              // Jika container detail bangunan sedang aktif, berikan efek shake
              if (isHighlightActiveRef.current) {
                // Tambahkan efek shake pada container detail bangunan yang sedang aktif
                setIsContainerShaking(true);
                setTimeout(() => setIsContainerShaking(false), 600);
                return;
              }

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
                    // Highlight permanen sudah ditangani oleh useEffect berdasarkan selectedFeature
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
                // Highlight permanen sudah ditangani oleh useEffect berdasarkan selectedFeature
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
      bangunanLayer.eachLayer((layer: L.Layer) => {
        if (
          (layer as any).feature &&
          (layer as any).feature.geometry &&
          (layer as any).feature.geometry.type === "Polygon" &&
          (layer as any).feature.properties?.id
        ) {
          const kategori =
            (layer as any).feature?.properties?.kategori || "Bangunan";
          const defaultStyle = kategoriStyle[kategori] || {
            color: "#adb5bd",
            fillColor: "#adb5bd",
            fillOpacity: 0.5,
          };
          (layer as any).setStyle(defaultStyle);
        }
      });
      // Highlight merah hanya pada bangunan yang sedang aktif
      if (cardVisible && selectedFeature?.properties?.id) {
        const featureId = Number(selectedFeature.properties.id);
        bangunanLayer.eachLayer((layer: L.Layer) => {
          if (
            (layer as any).feature &&
            (layer as any).feature.geometry &&
            (layer as any).feature.geometry.type === "Polygon" &&
            (layer as any).feature.properties?.id === featureId
          ) {
            (layer as any).setStyle({
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
        feature = bangunanFeatures.find(
          (b: FeatureType) => b.properties.id == id
        );
      } else if (type === "ruangan") {
        feature = ruanganFeatures.find(
          (r: FeatureType) => r.properties.id == id
        );
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

    // Fungsi untuk mencari gerbang yang terhubung ke tujuan
    const findConnectedGates = (
      endCoords: [number, number],
      buildingName?: string
    ): any[] => {
      const gates = titikFeatures.filter(
        (t: any) =>
          t.properties?.Nama &&
          t.properties.Nama.toLowerCase().includes("gerbang")
      );

      if (gates.length === 0) return [];

      const connectedGates: any[] = [];
      const points = convertTitikToPoints();

      // PERBAIKAN: Cari titik tujuan yang memiliki nama sama dengan gedung
      let targetPoints: Point[] = [];
      if (buildingName) {
        // Cari titik yang namanya sama dengan gedung
        targetPoints = points.filter((point) =>
          point.name.toLowerCase().includes(buildingName.toLowerCase())
        );
        console.log(
          `🎯 Mencari titik tujuan dengan nama "${buildingName}": ${targetPoints.length} titik ditemukan`
        );
      }

      // Jika tidak ada titik dengan nama gedung, gunakan titik terdekat
      if (targetPoints.length === 0) {
        let nearestPoint: Point | null = null;
        let minDistance = Infinity;

        for (const point of points) {
          const distance = calculateDistance(endCoords, point.coordinates);
          if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = point;
          }
        }

        if (nearestPoint) {
          targetPoints = [nearestPoint];
          console.log(
            `🎯 Menggunakan titik terdekat: ${nearestPoint.name} (${Math.round(
              minDistance
            )}m)`
          );
        }
      }

      if (targetPoints.length === 0) {
        console.log("❌ Tidak ada titik tujuan yang ditemukan");
        return [];
      }

      // PERBAIKAN: Jika ada multiple titik dengan nama sama, GUNAKAN SEMUA titik
      if (targetPoints.length > 1) {
        console.log(
          `🎯 Multiple titik ditemukan untuk "${buildingName}". Akan mencari rute ke SEMUA ${targetPoints.length} titik:`,
          targetPoints.map((p) => p.name)
        );
      }

      // Test setiap gerbang apakah bisa route ke titik tujuan
      for (const gate of gates) {
        if (gate.geometry && gate.geometry.coordinates) {
          const gateCoords: [number, number] = [
            gate.geometry.coordinates[1],
            gate.geometry.coordinates[0],
          ];

          // Test route ke SEMUA titik tujuan
          for (const targetPoint of targetPoints) {
            try {
              const routeTest = findRoute(
                gateCoords,
                targetPoint.coordinates,
                points,
                jalurFeatures,
                "jalan_kaki", // Default untuk mencari gerbang terhubung
                false // isGpsInsideCampus = false
              );

              if (
                routeTest &&
                routeTest.geojsonSegments &&
                routeTest.geojsonSegments.length > 0
              ) {
                connectedGates.push({
                  gate: gate,
                  coords: gateCoords,
                  routeToDestination: routeTest,
                  gateName: gate.properties?.Nama || "Gerbang",
                  targetPoint: targetPoint,
                  totalDistance: routeTest.distance,
                });
                console.log(
                  `✅ Gerbang ${gate.properties?.Nama} → ${
                    targetPoint.name
                  }: ${Math.round(routeTest.distance)}m`
                );
              } else {
                console.log(
                  `❌ Gerbang ${gate.properties?.Nama} TIDAK terhubung ke ${targetPoint.name}`
                );
              }
            } catch (error) {
              console.warn(
                `⚠️ Error testing route from ${gate.properties?.Nama} to ${targetPoint.name}:`,
                error
              );
              continue;
            }
          }
        }
      }

      // Urutkan berdasarkan jarak terpendek
      connectedGates.sort((a, b) => a.totalDistance - b.totalDistance);

      console.log(
        `📊 Total ${connectedGates.length} gerbang terhubung, diurutkan berdasarkan jarak terpendek`
      );

      return connectedGates;
    };

    // Fungsi untuk mencari SEMUA rute ke SEMUA titik masuk gedung
    const findAllRoutesToBuilding = async (
      userCoords: [number, number],
      endCoords: [number, number],
      buildingName?: string
    ): Promise<{
      bestRoute: any;
      allRoutes: any[];
      gate: any;
      routeToDestination: any;
    } | null> => {
      // 1. PERTAMA: Cari gerbang yang terhubung ke tujuan dengan nama gedung
      const connectedGates = findConnectedGates(endCoords, buildingName);

      if (connectedGates.length === 0) {
        console.log("❌ Tidak ada gerbang yang terhubung ke tujuan");
        return null;
      }

      console.log(
        `🎯 Ditemukan ${connectedGates.length} gerbang yang terhubung ke tujuan`
      );

      // 2. KEDUA: Hitung rute OSRM dari GPS ke setiap gerbang untuk setiap kombinasi
      const allCompleteRoutes: any[] = [];

      // Batasi maksimal 5 kombinasi untuk performa
      const limitedGates = connectedGates.slice(0, 5);
      console.log(
        `🔍 Mencoba ${limitedGates.length} kombinasi gerbang-titik untuk performa`
      );

      for (const gateInfo of limitedGates) {
        console.log(
          `🔍 Mencari rute OSRM ke ${gateInfo.gateName} → ${gateInfo.targetPoint.name}...`
        );

        try {
          // Dapatkan rute OSRM dari GPS ke gerbang dengan timeout
          const osrmRoute = (await Promise.race([
            getRealWorldRoute(userCoords, gateInfo.coords),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("OSRM timeout")), 5000)
            ),
          ])) as any;

          let totalDistance: number;
          let osrmRouteToUse: any = null;

          if (osrmRoute) {
            // Total jarak = OSRM (GPS->Gerbang) + GeoJSON (Gerbang->Tujuan)
            totalDistance = osrmRoute.distance + gateInfo.totalDistance;
            osrmRouteToUse = osrmRoute;

            console.log(
              `📏 ${gateInfo.gateName} → ${
                gateInfo.targetPoint.name
              }: OSRM ${Math.round(osrmRoute.distance)}m + GeoJSON ${Math.round(
                gateInfo.totalDistance
              )}m = Total ${Math.round(totalDistance)}m`
            );
          } else {
            // Fallback ke garis lurus jika OSRM gagal
            const straightDistance = calculateDistance(
              userCoords,
              gateInfo.coords
            );
            totalDistance = straightDistance + gateInfo.totalDistance;

            console.log(
              `📏 ${gateInfo.gateName} → ${
                gateInfo.targetPoint.name
              } (fallback): Garis lurus ${Math.round(
                straightDistance
              )}m + GeoJSON ${Math.round(
                gateInfo.totalDistance
              )}m = Total ${Math.round(totalDistance)}m`
            );
          }

          // Simpan rute lengkap
          allCompleteRoutes.push({
            gate: gateInfo.gate,
            routeToDestination: gateInfo.routeToDestination,
            osrmRoute: osrmRouteToUse,
            totalDistance: totalDistance,
            gateName: gateInfo.gateName,
            coords: gateInfo.coords,
            targetPoint: gateInfo.targetPoint,
          });
        } catch (error) {
          console.warn(
            `⚠️ Error getting OSRM route to ${gateInfo.gateName} → ${gateInfo.targetPoint.name}:`,
            error
          );

          // Fallback ke garis lurus
          const straightDistance = calculateDistance(
            userCoords,
            gateInfo.coords
          );
          const totalDistance = straightDistance + gateInfo.totalDistance;

          // Simpan rute fallback
          allCompleteRoutes.push({
            gate: gateInfo.gate,
            routeToDestination: gateInfo.routeToDestination,
            osrmRoute: null,
            totalDistance: totalDistance,
            gateName: gateInfo.gateName,
            coords: gateInfo.coords,
            targetPoint: gateInfo.targetPoint,
          });
        }
      }

      if (allCompleteRoutes.length === 0) {
        console.log("❌ Tidak ada rute lengkap yang berhasil dibuat");
        return null;
      }

      // Urutkan semua rute berdasarkan jarak (terdekat di atas)
      allCompleteRoutes.sort((a, b) => a.totalDistance - b.totalDistance);

      const bestRoute = allCompleteRoutes[0];
      console.log(
        `🏆 Rute terbaik: ${bestRoute.gateName} → ${
          bestRoute.targetPoint.name
        } (Total: ${Math.round(bestRoute.totalDistance)}m)`
      );
      console.log(
        `📊 Total ${allCompleteRoutes.length} rute alternatif tersedia`
      );

      return {
        bestRoute: bestRoute,
        allRoutes: allCompleteRoutes,
        gate: bestRoute.gate,
        routeToDestination: bestRoute.routeToDestination,
      };
    };

    // Fungsi untuk mendapatkan jalur jalan asli menggunakan OSRM API
    const getRealWorldRoute = async (
      startCoords: [number, number], // [lat, lng]
      endCoords: [number, number] // [lat, lng]
    ): Promise<{
      coordinates: [number, number][];
      distance: number;
      geometry: any;
    } | null> => {
      try {
        // Validasi koordinat
        if (
          !startCoords ||
          !endCoords ||
          typeof startCoords[0] !== "number" ||
          typeof startCoords[1] !== "number" ||
          typeof endCoords[0] !== "number" ||
          typeof endCoords[1] !== "number"
        ) {
          console.error("❌ Koordinat tidak valid:", {
            startCoords,
            endCoords,
          });
          return null;
        }

        // OSRM API endpoint (public instance)
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;

        console.log("🛣️ Fetching real-world route from OSRM...", {
          startCoords,
          endCoords,
        });
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`OSRM API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          ); // Convert lng,lat to lat,lng

          console.log(
            "Real-world route found:",
            coordinates.length,
            "points,",
            Math.round(route.distance),
            "meters"
          );
          return {
            coordinates,
            distance: route.distance, // meters
            geometry: route.geometry,
          };
        } else {
          console.warn("No route found from OSRM");
          return null;
        }
      } catch (error) {
        console.error("OSRM routing error:", error);
        return null;
      }
    };

    // Handle semua step navigation dalam satu useEffect - tidak ada yang di-skip
    useEffect(() => {
      const map = leafletMapRef.current;
      if (
        !map ||
        !routeSteps.length ||
        activeStepIndex < 0 ||
        activeStepIndex >= routeSteps.length
      )
        return;

      // Hapus line sebelumnya
      if (activeStepLineRef.current) {
        map.removeLayer(activeStepLineRef.current);
        activeStepLineRef.current = null;
      }

      // Hapus navigation marker sebelumnya
      if (navigationMarkerRef.current) {
        console.log(`🔍 [DEBUG] Removing previous marker`);
        map.removeLayer(navigationMarkerRef.current);
        navigationMarkerRef.current = null;
      }

      // Debug: tampilkan semua step yang ada
      console.log(
        `🔍 [NAVIGATION] Total steps: ${routeSteps.length}, Active step: ${
          activeStepIndex + 1
        }`
      );
      routeSteps.forEach((s, idx) => {
        const sId = s.raw?.id || "unknown";
        console.log(
          `  Step ${idx + 1}: ID ${sId}, ${Math.round(s.distance || 0)}m`
        );
      });

      // Handle semua step - pastikan lingkaran bergerak sesuai dengan step yang aktif
      console.log(
        `🔍 [DEBUG] useEffect triggered - activeStepIndex: ${activeStepIndex}, hasReachedDestination: ${hasReachedDestination}`
      );

      const step = hasReachedDestination
        ? routeSteps[routeSteps.length - 1] // Gunakan step terakhir untuk marker merah
        : routeSteps[activeStepIndex];

      console.log(
        `🔍 [DEBUG] Step selected - hasReachedDestination: ${hasReachedDestination}, stepIndex: ${
          hasReachedDestination ? routeSteps.length - 1 : activeStepIndex
        }`
      );
      if (step && step.coordinates && step.coordinates.length > 0) {
        const isFirstStep = activeStepIndex === 0;
        const isLastStep = activeStepIndex === routeSteps.length - 1;

        // PERBAIKAN: Posisi marker sesuai dengan kondisi
        let markerPosition: [number, number];
        if (hasReachedDestination) {
          // Setelah step terakhir ditekan next: marker merah di titik tujuan (akhir garis)
          markerPosition = step.coordinates[step.coordinates.length - 1];
          console.log(
            `🔴 [DEBUG] Marker merah di posisi tujuan (akhir garis): [${markerPosition[0].toFixed(
              6
            )}, ${markerPosition[1].toFixed(6)}]`
          );
        } else if (isLastStep) {
          // Step terakhir (oranye): di awal garis terakhir
          markerPosition = step.coordinates[0];
          console.log(
            `🟠 [DEBUG] Marker oranye di posisi awal garis terakhir: [${markerPosition[0].toFixed(
              6
            )}, ${markerPosition[1].toFixed(6)}]`
          );
        } else {
          // Step lainnya: marker di awal step (node awal garis)
          markerPosition = step.coordinates[0];
          console.log(
            `🔵 [DEBUG] Marker di posisi awal step: [${markerPosition[0].toFixed(
              6
            )}, ${markerPosition[1].toFixed(6)}]`
          );
        }

        // PERBAIKAN: Cek apakah ini step terakhir dan sudah ditekan next
        let isActuallyAtDestination = false;
        if (isLastStep) {
          // Untuk step terakhir, cek apakah sudah ditekan next (activeStepIndex > routeSteps.length - 1)
          // Jika masih di step terakhir, belum sampai tujuan
          isActuallyAtDestination = false; // Belum sampai tujuan, masih di awal garis terakhir
          console.log(`🎯 Step terakhir: BERADA DI AWAL GARIS TERAKHIR`);
        }

        // Debug: Lihat koordinat step untuk memastikan posisi yang benar
        const segmentId = step.raw?.id || "unknown";
        console.log(
          `🔍 Step ${activeStepIndex + 1} (ID: ${segmentId}) coordinates:`,
          {
            start: step.coordinates[0],
            end: step.coordinates[step.coordinates.length - 1],
            totalPoints: step.coordinates.length,
            markerPosition: markerPosition,
            stepType: isFirstStep ? "FIRST" : isLastStep ? "LAST" : "MIDDLE",
            distance: Math.round(step.distance || 0),
            isFirstStep,
            isLastStep,
            totalSteps: routeSteps.length,
          }
        );

        let markerColor: string;
        let markerSize: number;

        // PERBAIKAN: Hanya 1 lingkaran yang ditampilkan pada satu waktu
        console.log(
          `🔍 [DEBUG] hasReachedDestination: ${hasReachedDestination}, isFirstStep: ${isFirstStep}, isLastStep: ${isLastStep}`
        );

        if (hasReachedDestination) {
          // Setelah step terakhir ditekan next: merah (tujuan tercapai)
          markerColor = "#ef4444"; // Merah
          markerSize = 40;
          console.log(`🔴 [DEBUG] Marker MERAH dipilih`);
        } else if (isFirstStep) {
          // Step pertama: hijau
          markerColor = "#10b981"; // Hijau
          markerSize = 34;
          console.log(`🟢 [DEBUG] Marker HIJAU dipilih`);
        } else if (isLastStep) {
          // Step terakhir: oranye
          markerColor = "#f97316"; // Oranye
          markerSize = 36;
          console.log(`🟠 [DEBUG] Marker ORANYE dipilih`);
        } else {
          // Step tengah: biru
          markerColor = "#4285f4"; // Biru
          markerSize = 32;
          console.log(`🔵 [DEBUG] Marker BIRU dipilih`);
        }

        const markerType = hasReachedDestination
          ? "DESTINATION_REACHED"
          : isFirstStep
          ? "START"
          : isLastStep
          ? "DESTINATION_NOT_REACHED"
          : "SEGMENT";

        const positionType = hasReachedDestination
          ? "TITIK TUJUAN (setelah next)"
          : "AWAL step (titik sambungan)";

        console.log(
          `🎯 Marker Step ${
            activeStepIndex + 1
          }: ${markerType} - lingkaran di ${positionType} [${markerPosition[0].toFixed(
            6
          )}, ${markerPosition[1].toFixed(
            6
          )}] - Warna: ${markerColor}, Ukuran: ${markerSize}px, hasReachedDestination: ${hasReachedDestination}`
        );

        // Buat marker bulat di titik sambungan
        console.log(
          `🔍 [DEBUG] Creating marker with color: ${markerColor}, size: ${markerSize}px, position: [${markerPosition[0].toFixed(
            6
          )}, ${markerPosition[1].toFixed(6)}]`
        );

        const navigationMarker = L.marker(markerPosition, {
          icon: L.divIcon({
            className: "navigation-circle-marker",
            html: `<div style="
              width: ${markerSize}px; 
              height: ${markerSize}px; 
              background: ${markerColor}; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              position: relative;
              z-index: 9999;
              transform: translateZ(0);
            "></div>`,
            iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize / 2],
          }),
          pane: "navigationPane",
          zIndexOffset: 2000,
        }).addTo(map);

        console.log(`🔍 [DEBUG] Marker created and added to map`);

        navigationMarkerRef.current = navigationMarker;

        // PERBAIKAN: Hapus destination marker terpisah karena sekarang hanya ada 1 marker
        if (destinationMarker && map.hasLayer(destinationMarker)) {
          map.removeLayer(destinationMarker);
          setDestinationMarker(null);
        }

        // Zoom ke posisi marker
        map.setView(markerPosition, 19, { animate: true, duration: 0.8 });

        // HAPUS: Highlight jalur step - menyebabkan garis leaflet-interactive yang mengganggu
        // if (step.coordinates.length > 1) {
        //   const stepPolyline = L.polyline(step.coordinates, {
        //     color: markerColor,
        //     weight: 5,
        //     opacity: 0.7,
        //     dashArray: "8, 4",
        //   }).addTo(map);

        //   // Cleanup highlight sebelumnya
        //   if (
        //     activeStepLineRef.current &&
        //     map.hasLayer(activeStepLineRef.current)
        //   ) {
        //     map.removeLayer(activeStepLineRef.current);
        //   }
        //   activeStepLineRef.current = stepPolyline;
        // }
      }

      // Cleanup function
      return () => {
        if (
          activeStepLineRef.current &&
          map.hasLayer(activeStepLineRef.current)
        ) {
          map.removeLayer(activeStepLineRef.current);
          activeStepLineRef.current = null;
        }
        if (
          navigationMarkerRef.current &&
          map.hasLayer(navigationMarkerRef.current)
        ) {
          map.removeLayer(navigationMarkerRef.current);
          navigationMarkerRef.current = null;
        }
        if (destinationMarker && map.hasLayer(destinationMarker)) {
          map.removeLayer(destinationMarker);
          setDestinationMarker(null);
        }
      };
    }, [activeStepIndex, routeSteps.length, hasReachedDestination]); // Depend pada activeStepIndex, routeSteps.length, dan hasReachedDestination

    // Log setiap kali stepper dirender atau step berubah
    useEffect(() => {
      if (
        routeSteps.length > 0 &&
        activeStepIndex >= 0 &&
        activeStepIndex < routeSteps.length
      ) {
        console.log(
          "[ROUTE STEPPER] Rendered. Step:",
          activeStepIndex + 1,
          "/",
          routeSteps.length
        );
      }
    }, [activeStepIndex, routeSteps.length]); // Depend pada activeStepIndex dan length, bukan array

    // Hapus atau modifikasi useEffect yang menyebabkan infinite loop
    // useEffect untuk melanjutkan routing jika pendingRoute ada dan userLocation sudah update
    // useEffect(() => {
    //   if (pendingRoute && userLocation) {
    //     const currentPendingRoute = pendingRoute;
    //     setPendingRoute(null);
    //     setTimeout(() => {
    //       currentPendingRoute();
    //     }, 0);
    //   }
    // }, [pendingRoute, userLocation?.lat, userLocation?.lng]); // Depend pada koordinat, bukan object

    // Hapus rute dan GPS marker saat card bangunan di-close
    useEffect(() => {
      if (!cardVisible && leafletMapRef.current) {
        // Reset edit mode
        setIsEditingName(false);
        setIsEditingThumbnail(false);
        setEditName("");
        setEditThumbnail("");

        // Hapus route line jika ada
        if (routeLine) {
          leafletMapRef.current.removeLayer(routeLine);
          setRouteLine(null);
          setRouteDistance(null);
        }

        // Hapus alternative route lines jika ada
        if (alternativeRouteLines.length > 0) {
          alternativeRouteLines.forEach((layer) => {
            if (leafletMapRef.current) {
              leafletMapRef.current.removeLayer(layer);
            }
          });
          setAlternativeRouteLines([]);
        }

        // Hapus navigation marker jika ada
        if (navigationMarkerRef.current) {
          leafletMapRef.current.removeLayer(navigationMarkerRef.current);
          navigationMarkerRef.current = null;
        }

        // Hapus GPS marker jika ada
        if (userMarkerRef.current) {
          leafletMapRef.current.removeLayer(userMarkerRef.current);
          userMarkerRef.current = null;
          setUserLocation(null); // Reset GPS location state
        }
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

    // useEffect untuk membuat pane khusus dengan z-index yang benar
    useEffect(() => {
      if (leafletMapRef.current) {
        const map = leafletMapRef.current;

        // Buat pane khusus untuk route dengan z-index rendah
        if (!map.getPane("routePane")) {
          map.createPane("routePane");
          const routePane = map.getPane("routePane");
          if (routePane) {
            routePane.style.zIndex = "400"; // Di bawah marker biasa (600)
          }
        }

        // Buat pane khusus untuk navigation marker dengan z-index SANGAT tinggi
        if (!map.getPane("navigationPane")) {
          map.createPane("navigationPane");
          const navPane = map.getPane("navigationPane");
          if (navPane) {
            navPane.style.zIndex = "1000"; // Di atas SEMUA layer termasuk route
            navPane.style.pointerEvents = "auto";
          }
        }
      }
    }, []);

    // Redefine handleRouteSubmit in this component (inside the component function, before return)
    const handleRouteSubmit = async () => {
      setIsCalculatingRoute(true);
      let startLatLng: [number, number] | null = null;
      let endLatLng: [number, number] | null = null;
      setRouteDistance(null);

      // PERBAIKAN: Cleanup routes sebelumnya
      if (routeLine && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(routeLine);
        setRouteLine(null);
      }
      if (alternativeRouteLines.length > 0) {
        alternativeRouteLines.forEach((layer) => {
          if (leafletMapRef.current) {
            leafletMapRef.current.removeLayer(layer);
          }
        });
        setAlternativeRouteLines([]);
      }

      // Titik awal
      if (routeStartType === "my-location") {
        setIsGettingLocation(true);
        try {
          const coords = await getCurrentLocation();
          setIsGettingLocation(false);
          startLatLng = coords;
          console.log("📍 GPS berhasil diambil untuk routing:", coords);

          // Tambahkan pengecekan apakah user di dalam kampus
          const isInsideCampus = isUserInsideCampus(coords[0], coords[1]);
          console.log("📍 [GPS-ROUTING] Pengecekan lokasi GPS untuk routing:");
          console.log(
            `📍 [GPS-ROUTING] Koordinat: [${coords[0].toFixed(
              6
            )}, ${coords[1].toFixed(6)}]`
          );
          console.log(`📍 [GPS-ROUTING] Di dalam kampus: ${isInsideCampus}`);

          if (isInsideCampus) {
            console.log(
              "📍 [GPS-ROUTING] Routing langsung ke tujuan (tanpa gerbang)"
            );
            // Routing langsung ke tujuan tanpa gerbang
            if (!endLatLng) {
              alert("Titik tujuan tidak valid.");
              setShowRouteModal(false);
              setIsCalculatingRoute(false);
              return;
            }
            const points = convertTitikToPoints();
            let filteredJalurFeatures = jalurFeatures;
            if (transportMode === "jalan_kaki") {
              const pejalanSegments = jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "pejalan"
              );
              const bothSegments = jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "both"
              );
              filteredJalurFeatures = [...pejalanSegments, ...bothSegments];
            } else if (transportMode === "kendaraan") {
              // Untuk kendaraan, terapkan logika oneway
              const bothSegments = jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "both"
              );
              const pejalanSegments = jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "pejalan"
              );

              // Filter jalur oneway untuk kendaraan
              const filteredBothSegments = bothSegments.filter(
                (segment: any) => {
                  // Jika bukan oneway, bisa digunakan
                  if (segment.properties?.arah !== "oneway") {
                    return true;
                  }

                  // Jika oneway, cek arah yang diizinkan untuk kendaraan
                  // Kendaraan hanya boleh dari hijau (end) ke merah (start)
                  // TIDAK BOLEH dari merah (start) ke hijau (end)
                  const routeCoords = segment.geometry?.coordinates;
                  if (routeCoords && routeCoords.length >= 2) {
                    const startPoint = [routeCoords[0][1], routeCoords[0][0]]; // [lat, lng] dari titik merah
                    const endPoint = [
                      routeCoords[routeCoords.length - 1][1],
                      routeCoords[routeCoords.length - 1][0],
                    ]; // [lat, lng] dari titik hijau

                    // Cek apakah jalur ini mengarah dari hijau ke merah (diizinkan)
                    // Atau bisa digunakan untuk routing dari GPS ke tujuan
                    return true; // Untuk sementara izinkan semua, logika oneway akan diterapkan di routing algorithm
                  }
                  return true;
                }
              );

              // Gabungkan jalur both (dengan filter oneway) dan pejalan (untuk akses)
              filteredJalurFeatures = [
                ...filteredBothSegments,
                ...pejalanSegments,
              ];

              console.log(
                "🏍️ Mode kendaraan: Filtered routes for oneway restrictions"
              );
              console.log(`  - Total jalur both: ${bothSegments.length}`);
              console.log(
                `  - Jalur both setelah filter oneway: ${filteredBothSegments.length}`
              );
              console.log(
                `  - Jalur pejalan untuk akses: ${pejalanSegments.length}`
              );
            }
            console.log(`🏍️ [GPS-ROUTING] Mode transportasi: ${transportMode}`);
            if (transportMode === "kendaraan") {
              console.log(
                "🏍️ [GPS-ROUTING] Logika oneway diterapkan untuk kendaraan"
              );
              console.log(
                "🏍️ [GPS-ROUTING] Jalur oneway hanya boleh dari hijau→merah (dilarang merah→hijau)"
              );
            }

            // Untuk GPS di dalam kampus, cari jalur GeoJSON terdekat sebagai titik awal
            console.log(
              "📍 [GPS-ROUTING] Mencari jalur GeoJSON terdekat sebagai titik awal routing"
            );

            // Coba routing dari jalur terdekat ke tujuan
            const routeResult = findRoute(
              coords,
              endLatLng,
              points,
              filteredJalurFeatures,
              transportMode,
              true // isGpsInsideCampus = true
            );
            if (
              routeResult &&
              routeResult.geojsonSegments &&
              routeResult.geojsonSegments.length > 0
            ) {
              const geoJsonLayer = L.geoJSON(
                {
                  type: "FeatureCollection",
                  features:
                    routeResult.geojsonSegments as GeoJSON.Feature<GeoJSON.Geometry>[],
                } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
                {
                  style: () => ({
                    color: "#2563eb",
                    weight: 6,
                    opacity: 1,
                  }),
                  pane: "routePane",
                }
              );
              if (leafletMapRef.current) {
                geoJsonLayer.addTo(leafletMapRef.current);
                leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                  padding: [40, 40],
                  maxZoom: 19,
                  animate: true,
                  duration: 1.5,
                });
              }
              setRouteDistance(Math.round(routeResult.distance));
              // Hitung total waktu berjalan kaki dan kendaraan
              let totalWalkingTime = 0;
              let totalVehicleTime = 0;
              routeResult.geojsonSegments.forEach((segment: any) => {
                if (segment.properties?.waktu_kaki)
                  totalWalkingTime += Number(segment.properties.waktu_kaki);
                if (segment.properties?.waktu_kendara)
                  totalVehicleTime += Number(segment.properties.waktu_kendara);
              });
              setTotalWalkingTime(totalWalkingTime);
              setTotalVehicleTime(totalVehicleTime);
              setRouteSteps(
                parseRouteSteps(
                  routeResult.geojsonSegments,
                  coords,
                  endLatLng,
                  transportMode
                )
              );
              setActiveStepIndex(0);
              setHasReachedDestination(false);
              setIsNavigationActive(true);
            } else {
              alert(
                "Tidak ditemukan rute yang valid dari lokasi Anda ke tujuan. Pastikan Anda berada di area yang terhubung ke jalur kampus."
              );
              setIsCalculatingRoute(false);
            }
            return;
          } else {
            console.log(
              "📍 [GPS-ROUTING] Routing via gerbang terdekat (di luar kampus)"
            );
          }
        } catch (error) {
          setIsGettingLocation(false);
          setIsCalculatingRoute(false);
          console.error("GPS Error in handleRouteSubmit:", error);
          if (titikFeatures.length > 0) {
            const firstTitik = titikFeatures[0];
            setRouteStartType("titik");
            setRouteStartId(
              String(firstTitik.id || firstTitik.properties?.OBJECTID)
            );
          }
          return;
        }
      } else if (routeStartType === "titik" && routeStartId) {
        // Cari titik dari geojson
        const titik = titikFeatures.find(
          (t: any) =>
            String(t.id || t.properties?.OBJECTID) === String(routeStartId)
        );
        if (titik && titik.geometry && titik.geometry.coordinates) {
          const coords = titik.geometry.coordinates;
          startLatLng = [coords[1], coords[0]];
        } else {
          alert(`Titik awal dengan ID ${routeStartId} tidak ditemukan.`);
          setShowRouteModal(false);
          setIsCalculatingRoute(false);
          return;
        }
      } else if (routeStartType) {
        // Jika bangunan, ambil centroid bangunan
        const bangunanCentroid = getCentroidById("bangunan", routeStartType);
        if (bangunanCentroid) {
          startLatLng = bangunanCentroid as [number, number];
        } else {
          alert(`Bangunan dengan ID ${routeStartType} tidak ditemukan.`);
          setShowRouteModal(false);
          setIsCalculatingRoute(false);
          return;
        }
      }

      // Titik tujuan
      if (routeEndType === "bangunan" && routeEndId) {
        const bangunanCentroid = getCentroidById("bangunan", routeEndId);
        if (bangunanCentroid) {
          endLatLng = bangunanCentroid as [number, number];
        } else {
          alert(`Bangunan dengan ID ${routeEndId} tidak ditemukan.`);
          setShowRouteModal(false);
          setIsCalculatingRoute(false);
          return;
        }
      } else if (routeEndType === "titik" && routeEndSearchText) {
        // Cari titik tujuan dari geojson
        const tujuan = convertTitikToPoints().find(
          (p) => p.name === routeEndSearchText
        );
        if (tujuan) {
          endLatLng = tujuan.coordinates;
        } else {
          alert(`Titik tujuan "${routeEndSearchText}" tidak ditemukan.`);
          setShowRouteModal(false);
          setIsCalculatingRoute(false);
          return;
        }
      }

      // Validasi
      if (
        !startLatLng ||
        !endLatLng ||
        startLatLng[0] === undefined ||
        startLatLng[1] === undefined ||
        endLatLng[0] === undefined ||
        endLatLng[1] === undefined
      ) {
        alert(
          "Titik awal atau tujuan tidak valid. Pastikan Anda memilih titik yang benar dan data geojson sudah benar."
        );
        setShowRouteModal(false);
        setIsCalculatingRoute(false);
        return;
      }

      // Validasi titik awal dan tujuan sama
      const distance = calculateDistance(startLatLng, endLatLng);
      if (distance < 10) {
        // Jika jarak kurang dari 10 meter, dianggap sama
        alert(
          "Titik awal dan tujuan tidak boleh sama. Silakan pilih tujuan yang berbeda."
        );
        setShowRouteModal(false);
        setIsCalculatingRoute(false);
        return;
      }

      // Routing dengan logika khusus untuk "Lokasi Saya"
      if (startLatLng && endLatLng && leafletMapRef.current) {
        if (routeLine) {
          leafletMapRef.current.removeLayer(routeLine);
        }

        const points = convertTitikToPoints();
        let finalRouteSegments: any[] = [];
        let totalDistance = 0;

        // Jika titik awal adalah "Lokasi Saya", route via gerbang terbaik yang terhubung ke tujuan
        if (routeStartType === "my-location") {
          try {
            const bestGateInfo = await findAllRoutesToBuilding(
              startLatLng,
              endLatLng
            );

            if (
              bestGateInfo &&
              bestGateInfo.bestRoute &&
              bestGateInfo.bestRoute.gate &&
              bestGateInfo.bestRoute.gate.geometry &&
              bestGateInfo.bestRoute.gate.geometry.coordinates
            ) {
              const bestRoute = bestGateInfo.bestRoute;
              const allRoutes = bestGateInfo.allRoutes;

              const gateCoords: [number, number] = [
                bestRoute.gate.geometry.coordinates[1],
                bestRoute.gate.geometry.coordinates[0],
              ];

              // Segment 1: GPS Location -> Gerbang terbaik (jalur jalan asli)
              console.log(
                "🗺️ Using optimized OSRM route: GPS →",
                bestRoute.gate.properties?.Nama
              );

              // Gunakan OSRM route yang sudah didapat dari findAllRoutesToBuilding
              const realWorldGpsToGate = bestRoute.osrmRoute;

              let gpsToGateSegment;
              let gpsToGateDistance;

              if (realWorldGpsToGate) {
                gpsToGateDistance = realWorldGpsToGate.distance;
                const latLngs = realWorldGpsToGate.coordinates;
                // HAPUS: Debug polyline yang mengganggu routing
                // if (leafletMapRef.current) {
                //   const debugPolyline = L.polyline(latLngs, {
                //     color: "#00FF00",
                //     weight: 8,
                //     opacity: 0.8,
                //     dashArray: "10, 5",
                //   }).addTo(leafletMapRef.current);
                //   setTimeout(() => {
                //     if (leafletMapRef.current) {
                //       leafletMapRef.current.removeLayer(debugPolyline);
                //     }
                //   }, 10000);
                // }
                gpsToGateSegment = {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: latLngs.map((coord: [number, number]) => [
                      coord[1],
                      coord[0],
                    ]),
                  },
                  properties: {
                    routeType: "gps-to-gate-real",
                    distance: gpsToGateDistance,
                    name:
                      "GPS ke " +
                      (bestGateInfo.gate.properties?.Nama || "Gerbang") +
                      " (Jalur Jalan)",
                  },
                };
              } else {
                gpsToGateDistance = calculateDistance(startLatLng, gateCoords);
                const gpsLng = Number(startLatLng[1]);
                const gpsLat = Number(startLatLng[0]);
                const gateLng = Number(
                  bestGateInfo.gate.geometry.coordinates[0]
                );
                const gateLat = Number(
                  bestGateInfo.gate.geometry.coordinates[1]
                );
                if (leafletMapRef.current) {
                  const fallbackPolyline = L.polyline(
                    [
                      [gpsLat, gpsLng],
                      [gateLat, gateLng],
                    ],
                    {
                      color: "#FF00FF",
                      weight: 8,
                      opacity: 0.8,
                      dashArray: "10, 5",
                    }
                  ).addTo(leafletMapRef.current);
                  setTimeout(() => {
                    if (leafletMapRef.current) {
                      leafletMapRef.current.removeLayer(fallbackPolyline);
                    }
                  }, 10000);
                }
                gpsToGateSegment = {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [gpsLng, gpsLat],
                      [gateLng, gateLat],
                    ],
                  },
                  properties: {
                    routeType: "gps-to-gate",
                    distance: gpsToGateDistance,
                    name:
                      "GPS ke " +
                      (bestGateInfo.gate.properties?.Nama || "Gerbang") +
                      " (Garis Lurus)",
                  },
                };
                const coordDistance = Math.sqrt(
                  Math.pow(gpsLng - gateLng, 2) + Math.pow(gpsLat - gateLat, 2)
                );
                if (coordDistance < 0.000001) {
                  alert(
                    "Error: GPS dan Gerbang terlalu dekat. Coba lokasi yang berbeda."
                  );
                  setIsCalculatingRoute(false);
                  return;
                }
              }

              // Segment 2: Gerbang -> Tujuan akhir (gunakan route yang sudah dihitung)
              const gateToEndResult = bestGateInfo.routeToDestination;

              if (gateToEndResult) {
                totalDistance = gpsToGateDistance + gateToEndResult.distance;
                finalRouteSegments = [
                  gpsToGateSegment,
                  ...gateToEndResult.geojsonSegments,
                ];

                // Tampilkan rute utama (terdekat) dengan warna biru
                const mainRouteLayer = L.geoJSON(
                  {
                    type: "FeatureCollection",
                    features:
                      finalRouteSegments as GeoJSON.Feature<GeoJSON.Geometry>[],
                  } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
                  {
                    style: (feature) => ({
                      color: "#2563eb", // Biru untuk rute utama
                      weight: 6,
                      opacity: 1,
                    }),
                    pane: "routePane",
                  }
                );
                if (leafletMapRef.current) {
                  mainRouteLayer.addTo(leafletMapRef.current);
                  leafletMapRef.current.fitBounds(mainRouteLayer.getBounds(), {
                    padding: [60, 60],
                    maxZoom: 17,
                    animate: true,
                    duration: 1.5, // Smooth animation duration
                  });
                }
                setRouteLine(mainRouteLayer);

                // Tampilkan rute alternatif dengan warna abu-abu (jika ada lebih dari 1 rute)
                if (allRoutes.length > 1) {
                  console.log(
                    `🔄 Menampilkan ${
                      allRoutes.length - 1
                    } rute alternatif dengan warna abu-abu`
                  );

                  // Buat pane khusus untuk rute alternatif dengan z-index lebih rendah
                  if (leafletMapRef.current) {
                    leafletMapRef.current.createPane("alternativeRoutePane");
                    const alternativePane = leafletMapRef.current.getPane(
                      "alternativeRoutePane"
                    );
                    if (alternativePane && alternativePane.style) {
                      alternativePane.style.zIndex = "600"; // Di bawah routePane (650)
                    }
                  }

                  // Tampilkan semua rute alternatif (kecuali yang terbaik)
                  for (let i = 1; i < allRoutes.length; i++) {
                    const alternativeRoute = allRoutes[i];

                    // Buat segment GPS ke gerbang alternatif
                    let alternativeGpsToGateSegment;
                    let alternativeGpsToGateDistance;

                    if (alternativeRoute.osrmRoute) {
                      alternativeGpsToGateDistance =
                        alternativeRoute.osrmRoute.distance;
                      const latLngs = alternativeRoute.osrmRoute.coordinates;
                      alternativeGpsToGateSegment = {
                        type: "Feature",
                        geometry: {
                          type: "LineString",
                          coordinates: latLngs.map(
                            (coord: [number, number]) => [coord[1], coord[0]]
                          ),
                        },
                        properties: {
                          routeType: "gps-to-gate-alternative",
                          distance: alternativeGpsToGateDistance,
                          name: `GPS ke ${alternativeRoute.gateName} (Alternatif)`,
                        },
                      };
                    } else {
                      alternativeGpsToGateDistance = calculateDistance(
                        startLatLng,
                        alternativeRoute.coords
                      );
                      const gpsLng = Number(startLatLng[1]);
                      const gpsLat = Number(startLatLng[0]);
                      const gateLng = Number(
                        alternativeRoute.gate.geometry.coordinates[0]
                      );
                      const gateLat = Number(
                        alternativeRoute.gate.geometry.coordinates[1]
                      );

                      alternativeGpsToGateSegment = {
                        type: "Feature",
                        geometry: {
                          type: "LineString",
                          coordinates: [
                            [gpsLng, gpsLat],
                            [gateLng, gateLat],
                          ],
                        },
                        properties: {
                          routeType: "gps-to-gate-alternative",
                          distance: alternativeGpsToGateDistance,
                          name: `GPS ke ${alternativeRoute.gateName} (Alternatif)`,
                        },
                      };
                    }

                    // Gabungkan dengan rute dari gerbang ke tujuan
                    const alternativeRouteSegments = [
                      alternativeGpsToGateSegment,
                      ...alternativeRoute.routeToDestination.geojsonSegments,
                    ];

                    // Tampilkan rute alternatif dengan warna abu-abu
                    const alternativeLayer = L.geoJSON(
                      {
                        type: "FeatureCollection",
                        features:
                          alternativeRouteSegments as GeoJSON.Feature<GeoJSON.Geometry>[],
                      } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
                      {
                        style: (feature) => ({
                          color: "#6b7280", // Abu-abu untuk rute alternatif
                          weight: 4,
                          opacity: 0.6,
                        }),
                        pane: "alternativeRoutePane",
                      }
                    );
                    if (leafletMapRef.current) {
                      alternativeLayer.addTo(leafletMapRef.current);
                      leafletMapRef.current.fitBounds(
                        alternativeLayer.getBounds(),
                        {
                          padding: [60, 60],
                          maxZoom: 17,
                          animate: true,
                          duration: 1.5, // Smooth animation duration
                        }
                      );
                    }
                  }
                }

                const allLatLngs: L.LatLng[] = [];
                if (realWorldGpsToGate) {
                  realWorldGpsToGate.coordinates.forEach(
                    (coord: [number, number]) => {
                      allLatLngs.push(L.latLng(coord[0], coord[1]));
                    }
                  );
                } else {
                  allLatLngs.push(L.latLng(startLatLng[0], startLatLng[1]));
                  allLatLngs.push(L.latLng(gateCoords[0], gateCoords[1]));
                }
                // PERBAIKAN: Hapus penambahan endLatLng yang menyebabkan garis langsung mengganggu
                // allLatLngs.push(L.latLng(endLatLng[0], endLatLng[1]));
                gateToEndResult.coordinates.forEach(
                  (coord: [number, number]) => {
                    allLatLngs.push(L.latLng(coord[0], coord[1]));
                  }
                );
                const bounds = L.latLngBounds(allLatLngs);
                if (leafletMapRef.current) {
                  leafletMapRef.current.fitBounds(bounds, {
                    padding: [60, 60],
                    maxZoom: 17,
                    animate: true,
                    duration: 1.5, // Smooth animation duration
                  });
                }
                setRouteDistance(Math.round(totalDistance));

                // PERBAIKAN: Hitung total waktu berjalan kaki dan kendaraan
                let totalWalkingTime = 0;
                let totalVehicleTime = 0;

                console.log("🔍 [TIME] Menghitung total waktu dari segmen:");
                finalRouteSegments.forEach((segment: any, idx: number) => {
                  const segmentId = segment.id || "unknown";
                  const waktuKaki = segment.properties?.waktu_kaki || 0;
                  const waktuKendara = segment.properties?.waktu_kendara || 0;

                  totalWalkingTime += Number(waktuKaki);
                  totalVehicleTime += Number(waktuKendara);

                  console.log(
                    `  ${
                      idx + 1
                    }. ID ${segmentId}: kaki=${waktuKaki}s, kendara=${waktuKendara}s`
                  );
                });

                console.log(
                  `📊 [TIME] Total: kaki=${totalWalkingTime}s (${Math.floor(
                    totalWalkingTime / 60
                  )} menit ${Math.round(
                    totalWalkingTime % 60
                  )} detik), kendara=${totalVehicleTime}s (${Math.floor(
                    totalVehicleTime / 60
                  )} menit ${Math.round(totalVehicleTime % 60)} detik)`
                );

                setTotalWalkingTime(totalWalkingTime);
                setTotalVehicleTime(totalVehicleTime);

                setRouteSteps(
                  parseRouteSteps(
                    finalRouteSegments,
                    startLatLng,
                    endLatLng,
                    transportMode
                  )
                );
                setActiveStepIndex(0);
                setHasReachedDestination(false);
                setIsNavigationActive(true);
              } else {
                alert("Tidak ditemukan rute dari gerbang terdekat ke tujuan.");
                setIsCalculatingRoute(false);
              }
            } else {
              alert("Tidak ditemukan gerbang terdekat.");
              setIsCalculatingRoute(false);
            }
          } catch (error) {
            console.error("🚨 Error dalam routing my-location:", error);
            alert(
              "Terjadi error dalam routing dari lokasi Anda. Silakan coba lagi atau pilih titik yang berbeda."
            );
          }
        } else {
          // Routing biasa (bukan dari "Lokasi Saya")
          try {
            // Filter jalur berdasarkan mode transportasi
            let filteredJalurFeatures = jalurFeatures;
            if (transportMode === "jalan_kaki") {
              // Untuk pejalan kaki, prioritaskan jalur "pejalan", jika tidak ada baru pakai "both"
              const pejalanSegments = jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "pejalan"
              );
              const bothSegments = jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "both"
              );

              // Gabungkan dengan prioritas jalur pejalan
              filteredJalurFeatures = [...pejalanSegments, ...bothSegments];
              console.log(
                `🚶 Mode pejalan kaki: ${pejalanSegments.length} segmen pejalan + ${bothSegments.length} segmen both`
              );
            } else if (transportMode === "kendaraan") {
              // PERBAIKAN: Kendaraan bisa menggunakan semua jalur dengan algoritma cerdas
              // Algoritma Dijkstra akan memilih jalur optimal dengan penalty untuk jalur pejalan
              filteredJalurFeatures = jalurFeatures;
              console.log(
                `🏍️ Mode kendaraan: ${filteredJalurFeatures.length} segmen (algoritma cerdas untuk meminimalkan penggunaan jalur pejalan)`
              );
            }

            // PERBAIKAN: Cek apakah tujuan adalah gedung dengan multiple pintu
            let nearestPoint: Point | null = null;
            if (routeEndType === "titik" && routeEndSearchText) {
              // Cari semua titik dengan nama yang sama
              const allPoints = convertTitikToPoints();
              console.log(
                `🔍 [DEBUG] Total points available: ${allPoints.length}`
              );
              console.log(`🔍 [DEBUG] Searching for: "${routeEndSearchText}"`);

              const sameNamePoints = allPoints.filter(
                (p) => p.name === routeEndSearchText
              );

              console.log(
                `🔍 [DEBUG] Points with same name: ${sameNamePoints.length}`
              );
              sameNamePoints.forEach((p, idx) => {
                console.log(
                  `  ${idx + 1}. ${p.name} (ID: ${
                    p.id
                  }) at [${p.coordinates[0].toFixed(
                    6
                  )}, ${p.coordinates[1].toFixed(6)}]`
                );
              });

              if (sameNamePoints.length > 1) {
                // Cari titik terdekat dari multiple points
                let minDistance = Infinity;
                let closestPoint: Point | null = null;

                for (const point of sameNamePoints) {
                  const distance = calculateDistance(
                    startLatLng,
                    point.coordinates
                  );
                  console.log(
                    `🔍 [DISTANCE] ${point.name} (${point.id}): ${Math.round(
                      distance
                    )}m`
                  );

                  if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                  }
                }

                if (closestPoint) {
                  nearestPoint = closestPoint;
                  console.log(
                    `🏢 [NEAREST] Titik terdekat: ${closestPoint.name} (${
                      closestPoint.id
                    }) - ${Math.round(minDistance)}m`
                  );
                }
              } else if (sameNamePoints.length === 1) {
                nearestPoint = sameNamePoints[0];
                console.log(
                  `🔍 [DEBUG] Single point found: ${nearestPoint.name}`
                );
              } else {
                console.log(
                  `🔍 [DEBUG] No points found for "${routeEndSearchText}"`
                );
              }
            }

            let routeResult: any = null;

            if (nearestPoint) {
              // Gunakan titik terdekat untuk routing
              console.log(
                `🏢 [NEAREST] Routing to nearest point: ${
                  nearestPoint.name
                } at [${nearestPoint.coordinates[0].toFixed(
                  6
                )}, ${nearestPoint.coordinates[1].toFixed(6)}]`
              );

              routeResult = findRoute(
                startLatLng,
                nearestPoint.coordinates,
                points,
                filteredJalurFeatures,
                transportMode,
                false // isGpsInsideCampus = false
              );

              if (routeResult) {
                console.log(
                  `🏢 [NEAREST] Route found: ${Math.round(
                    routeResult.distance
                  )}m with ${routeResult.geojsonSegments.length} segments`
                );
              } else {
                console.warn(`⚠️ [NEAREST] No route found to nearest point!`);
              }
            } else {
              // Routing biasa untuk tujuan tunggal
              routeResult = findRoute(
                startLatLng,
                endLatLng,
                points,
                filteredJalurFeatures,
                transportMode,
                false // isGpsInsideCampus = false
              );
            }

            if (
              routeResult &&
              routeResult.geojsonSegments &&
              routeResult.geojsonSegments.length > 0
            ) {
              const geoJsonLayer = L.geoJSON(
                {
                  type: "FeatureCollection",
                  features:
                    routeResult.geojsonSegments as GeoJSON.Feature<GeoJSON.Geometry>[],
                } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
                {
                  style: () => ({
                    color: "#2563eb",
                    weight: 6,
                    opacity: 1,
                  }),
                  pane: "routePane",
                }
              );
              if (leafletMapRef.current) {
                geoJsonLayer.addTo(leafletMapRef.current);
                leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                  padding: [40, 40],
                  maxZoom: 19,
                  animate: true,
                  duration: 1.5, // Smooth animation duration
                });
              }
              setRouteLine(geoJsonLayer);

              // PERBAIKAN: Hapus alternative routes (tidak digunakan lagi)
              setAlternativeRouteLines([]);

              // Smooth zoom animation untuk single route
              leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                padding: [40, 40],
                maxZoom: 19,
                animate: true,
                duration: 1.5, // Smooth animation duration
              });
              setRouteDistance(Math.round(routeResult.distance));

              // PERBAIKAN: Hitung total waktu berjalan kaki dan kendaraan
              let totalWalkingTime = 0;
              let totalVehicleTime = 0;

              console.log(
                "🔍 [TIME] Menghitung total waktu dari segmen (routing biasa):"
              );
              routeResult.geojsonSegments.forEach(
                (segment: any, idx: number) => {
                  const segmentId = segment.id || "unknown";
                  const waktuKaki = segment.properties?.waktu_kaki || 0;
                  const waktuKendara = segment.properties?.waktu_kendara || 0;

                  totalWalkingTime += Number(waktuKaki);
                  totalVehicleTime += Number(waktuKendara);

                  console.log(
                    `  ${
                      idx + 1
                    }. ID ${segmentId}: kaki=${waktuKaki}s, kendara=${waktuKendara}s`
                  );
                }
              );

              console.log(
                `📊 [TIME] Total: kaki=${totalWalkingTime}s (${Math.floor(
                  totalWalkingTime / 60
                )} menit ${Math.round(
                  totalWalkingTime % 60
                )} detik), kendara=${totalVehicleTime}s (${Math.floor(
                  totalVehicleTime / 60
                )} menit ${Math.round(totalVehicleTime % 60)} detik)`
              );

              setTotalWalkingTime(totalWalkingTime);
              setTotalVehicleTime(totalVehicleTime);

              setRouteSteps(
                parseRouteSteps(
                  routeResult.geojsonSegments,
                  startLatLng,
                  endLatLng,
                  transportMode
                )
              );
              setActiveStepIndex(0);
              setHasReachedDestination(false);
              setIsNavigationActive(true);
            } else {
              alert(
                "Tidak ditemukan rute yang valid antara titik awal dan tujuan. Pastikan titik terhubung ke jalur."
              );
            }
          } catch (error) {
            console.error("🚨 Error dalam routing:", error);
            alert(
              "Terjadi error dalam routing. Silakan coba lagi atau pilih titik yang berbeda."
            );
          }
        }
      }
      setShowRouteModal(false);
      setIsCalculatingRoute(false);
    };

    // Listener untuk GPS updates
    useEffect(() => {
      const handleGpsUpdate = (event: MessageEvent) => {
        if (event.data.type === "gps-updated" && routeSteps.length > 0) {
          console.log("📍 GPS updated, recalculating route...");
          // Recalculate route dengan GPS baru
          setTimeout(() => {
            handleRouteSubmit();
          }, 1000); // Tunggu 1 detik untuk stabilitas
        }
      };

      window.addEventListener("message", handleGpsUpdate);
      return () => {
        window.removeEventListener("message", handleGpsUpdate);
      };
    }, [routeSteps.length]);

    // Fungsi untuk melakukan routing dengan parameter yang sudah pasti
    const performRouting = async (
      startType: string,
      startId: string,
      endType: string,
      endId: string,
      gpsCoords?: [number, number]
    ) => {
      let startLatLng: [number, number] | null = null;
      let endLatLng: [number, number] | null = null;
      setRouteDistance(null);

      // Titik awal
      if (startType === "my-location" && gpsCoords) {
        startLatLng = gpsCoords;
      } else if (startType === "titik" && startId) {
        const titik = titikFeatures.find(
          (t: any) => String(t.id || t.properties?.OBJECTID) === String(startId)
        );
        if (titik && titik.geometry && titik.geometry.coordinates) {
          const coords = titik.geometry.coordinates;
          startLatLng = [coords[1], coords[0]];
        } else {
          console.error(`❌ Titik awal dengan ID ${startId} tidak ditemukan.`);
          alert(`Titik awal dengan ID ${startId} tidak ditemukan.`);
          setIsCalculatingRoute(false);
          return;
        }
      } else if (startType) {
        const bangunanCentroid = getCentroidById("bangunan", startType);
        if (bangunanCentroid) {
          startLatLng = bangunanCentroid as [number, number];
        } else {
          console.error(`❌ Bangunan dengan ID ${startType} tidak ditemukan.`);
          alert(`Bangunan dengan ID ${startType} tidak ditemukan.`);
          setIsCalculatingRoute(false);
          return;
        }
      }

      // Titik tujuan
      if (endType === "bangunan" && endId) {
        const bangunanCentroid = getCentroidById("bangunan", endId);
        if (bangunanCentroid) {
          endLatLng = bangunanCentroid as [number, number];
        } else {
          console.error(`❌ Bangunan dengan ID ${endId} tidak ditemukan.`);
          alert(`Bangunan dengan ID ${endId} tidak ditemukan.`);
          setIsCalculatingRoute(false);
          return;
        }
      }

      // Validasi
      if (
        !startLatLng ||
        !endLatLng ||
        startLatLng[0] === undefined ||
        startLatLng[1] === undefined ||
        endLatLng[0] === undefined ||
        endLatLng[1] === undefined
      ) {
        console.error("❌ Koordinat tidak valid:", { startLatLng, endLatLng });
        alert(
          "Titik awal atau tujuan tidak valid. Pastikan Anda memilih titik yang benar dan data geojson sudah benar."
        );
        setIsCalculatingRoute(false);
        return;
      }

      console.log("✅ Koordinat valid, memulai routing:", {
        startLatLng,
        endLatLng,
      });

      // Routing dengan logika khusus untuk "Lokasi Saya"
      if (startLatLng && endLatLng && leafletMapRef.current) {
        if (routeLine) {
          leafletMapRef.current.removeLayer(routeLine);
        }

        const points = convertTitikToPoints();
        let finalRouteSegments: any[] = [];
        let totalDistance = 0;

        // Jika titik awal adalah "Lokasi Saya", route via gerbang terbaik yang terhubung ke tujuan
        if (startType === "my-location") {
          // Dapatkan nama gedung dari endType jika ada
          let buildingName: string | undefined;
          if (endType === "bangunan" && endId) {
            const bangunan = bangunanFeatures.find(
              (b: any) =>
                String(b.id || b.properties?.OBJECTID) === String(endId)
            );
            if (bangunan && bangunan.properties?.Nama) {
              buildingName = bangunan.properties.Nama;
              console.log(`🏢 Menggunakan nama gedung: ${buildingName}`);
            }
          }

          const gateInfo = await findAllRoutesToBuilding(
            startLatLng,
            endLatLng,
            buildingName
          );

          if (
            gateInfo &&
            gateInfo.bestRoute.gate &&
            gateInfo.bestRoute.gate.geometry &&
            gateInfo.bestRoute.gate.geometry.coordinates
          ) {
            const bestGateInfo = gateInfo.bestRoute;
            const allRoutes = gateInfo.allRoutes;

            const gateCoords: [number, number] = [
              bestGateInfo.gate.geometry.coordinates[1],
              bestGateInfo.gate.geometry.coordinates[0],
            ];

            // Segment 1: GPS Location -> Gerbang terbaik (jalur jalan asli)
            console.log(
              "🗺️ Using optimized OSRM route: GPS →",
              bestGateInfo.gate.properties?.Nama
            );

            // Gunakan OSRM route yang sudah didapat dari findBestGateForDestination
            const realWorldGpsToGate = bestGateInfo.osrmRoute;

            let gpsToGateSegment;
            let gpsToGateDistance;

            if (realWorldGpsToGate) {
              gpsToGateDistance = realWorldGpsToGate.distance;
              const latLngs = realWorldGpsToGate.coordinates;
              // HAPUS: Debug polyline yang mengganggu routing
              // if (leafletMapRef.current) {
              //   const debugPolyline = L.polyline(latLngs, {
              //     color: "#00FF00",
              //     weight: 8,
              //     opacity: 0.8,
              //     dashArray: "10, 5",
              //   }).addTo(leafletMapRef.current);
              //   setTimeout(() => {
              //     if (leafletMapRef.current) {
              //       leafletMapRef.current.removeLayer(debugPolyline);
              //     }
              //   }, 10000);
              // }
              gpsToGateSegment = {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: latLngs.map((coord: [number, number]) => [
                    coord[1],
                    coord[0],
                  ]),
                },
                properties: {
                  routeType: "gps-to-gate-real",
                  distance: gpsToGateDistance,
                  name:
                    "GPS ke " +
                    (bestGateInfo.gate.properties?.Nama || "Gerbang") +
                    " (Jalur Jalan)",
                },
              };
            } else {
              gpsToGateDistance = calculateDistance(startLatLng, gateCoords);
              const gpsLng = Number(startLatLng[1]);
              const gpsLat = Number(startLatLng[0]);
              const gateLng = Number(bestGateInfo.gate.geometry.coordinates[0]);
              const gateLat = Number(bestGateInfo.gate.geometry.coordinates[1]);
              if (leafletMapRef.current) {
                const fallbackPolyline = L.polyline(
                  [
                    [gpsLat, gpsLng],
                    [gateLat, gateLng],
                  ],
                  {
                    color: "#FF00FF",
                    weight: 8,
                    opacity: 0.8,
                    dashArray: "10, 5",
                  }
                ).addTo(leafletMapRef.current);
                setTimeout(() => {
                  if (leafletMapRef.current) {
                    leafletMapRef.current.removeLayer(fallbackPolyline);
                  }
                }, 10000);
              }
              gpsToGateSegment = {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [gpsLng, gpsLat],
                    [gateLng, gateLat],
                  ],
                },
                properties: {
                  routeType: "gps-to-gate",
                  distance: gpsToGateDistance,
                  name:
                    "GPS ke " +
                    (bestGateInfo.gate.properties?.Nama || "Gerbang") +
                    " (Garis Lurus)",
                },
              };
            }

            // Segment 2: Gerbang -> Tujuan akhir (gunakan route yang sudah dihitung)
            const gateToEndResult = bestGateInfo.routeToDestination;

            if (gateToEndResult) {
              totalDistance = gpsToGateDistance + gateToEndResult.distance;
              finalRouteSegments = [
                gpsToGateSegment,
                ...gateToEndResult.geojsonSegments,
              ];
              const geoJsonLayer = L.geoJSON(
                {
                  type: "FeatureCollection",
                  features:
                    finalRouteSegments as GeoJSON.Feature<GeoJSON.Geometry>[],
                } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
                {
                  style: (feature) => ({
                    color: "#2563eb", // Biru konsisten
                    weight: 6,
                    opacity: 1,
                  }),
                  pane: "routePane",
                }
              );
              if (leafletMapRef.current) {
                geoJsonLayer.addTo(leafletMapRef.current);
                leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                  padding: [60, 60],
                  maxZoom: 17,
                  animate: true,
                  duration: 1.5, // Smooth animation duration
                });
              }
              setRouteLine(geoJsonLayer);

              const allLatLngs: L.LatLng[] = [];
              if (realWorldGpsToGate) {
                realWorldGpsToGate.coordinates.forEach(
                  (coord: [number, number]) => {
                    allLatLngs.push(L.latLng(coord[0], coord[1]));
                  }
                );
              } else {
                allLatLngs.push(L.latLng(startLatLng[0], startLatLng[1]));
                allLatLngs.push(L.latLng(gateCoords[0], gateCoords[1]));
              }
              // PERBAIKAN: Hapus penambahan endLatLng yang menyebabkan garis langsung mengganggu
              // allLatLngs.push(L.latLng(endLatLng[0], endLatLng[1]));
              gateToEndResult.coordinates.forEach((coord: [number, number]) => {
                allLatLngs.push(L.latLng(coord[0], coord[1]));
              });

              const bounds = L.latLngBounds(allLatLngs);

              // Smooth zoom animation
              leafletMapRef.current.fitBounds(bounds, {
                padding: [60, 60],
                maxZoom: 17,
                animate: true,
                duration: 1.5, // Smooth animation duration
              });

              setRouteDistance(Math.round(totalDistance));

              // PERBAIKAN: Hitung total waktu berjalan kaki dan kendaraan
              let totalWalkingTime = 0;
              let totalVehicleTime = 0;

              finalRouteSegments.forEach((segment: any) => {
                if (segment.properties?.waktu_kaki) {
                  totalWalkingTime += Number(segment.properties.waktu_kaki);
                }
                if (segment.properties?.waktu_kendara) {
                  totalVehicleTime += Number(segment.properties.waktu_kendara);
                }
              });

              setTotalWalkingTime(totalWalkingTime);
              setTotalVehicleTime(totalVehicleTime);

              setRouteSteps(
                parseRouteSteps(finalRouteSegments, startLatLng, endLatLng)
              );
              setActiveStepIndex(0);
            } else {
              alert("Tidak ditemukan rute dari gerbang terdekat ke tujuan.");
            }
          } else {
            alert("Tidak ditemukan gerbang terdekat.");
          }
        } else {
          // Routing biasa (bukan dari "Lokasi Saya")
          const routeResult = findRoute(
            startLatLng,
            endLatLng,
            points,
            jalurFeatures,
            transportMode,
            false // isGpsInsideCampus = false
          );
          if (
            routeResult &&
            routeResult.geojsonSegments &&
            routeResult.geojsonSegments.length > 0
          ) {
            const geoJsonLayer = L.geoJSON(
              {
                type: "FeatureCollection",
                features:
                  routeResult.geojsonSegments as GeoJSON.Feature<GeoJSON.Geometry>[],
              } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
              {
                style: () => ({
                  color: "#2563eb",
                  weight: 6,
                  opacity: 1,
                }),
                pane: "routePane",
              }
            );
            if (leafletMapRef.current) {
              geoJsonLayer.addTo(leafletMapRef.current);
              leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                padding: [40, 40],
                maxZoom: 19,
                animate: true,
                duration: 1.5, // Smooth animation duration
              });
            }
            setRouteLine(geoJsonLayer);

            // Smooth zoom animation
            leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
              padding: [40, 40],
              maxZoom: 19,
              animate: true,
              duration: 1.5, // Smooth animation duration
            });

            setRouteDistance(Math.round(routeResult.distance));

            // PERBAIKAN: Hitung total waktu berjalan kaki dan kendaraan
            let totalWalkingTime = 0;
            let totalVehicleTime = 0;

            console.log(
              "🔍 [TIME] Menghitung total waktu dari segmen (performRouting):"
            );
            routeResult.geojsonSegments.forEach((segment: any, idx: number) => {
              const segmentId = segment.id || "unknown";
              const waktuKaki = segment.properties?.waktu_kaki || 0;
              const waktuKendara = segment.properties?.waktu_kendara || 0;

              totalWalkingTime += Number(waktuKaki);
              totalVehicleTime += Number(waktuKendara);

              console.log(
                `  ${
                  idx + 1
                }. ID ${segmentId}: kaki=${waktuKaki}s, kendara=${waktuKendara}s`
              );
            });

            console.log(
              `📊 [TIME] Total: kaki=${totalWalkingTime}s (${Math.floor(
                totalWalkingTime / 60
              )} menit ${Math.round(
                totalWalkingTime % 60
              )} detik), kendara=${totalVehicleTime}s (${Math.floor(
                totalVehicleTime / 60
              )} menit ${Math.round(totalVehicleTime % 60)} detik)`
            );

            setTotalWalkingTime(totalWalkingTime);
            setTotalVehicleTime(totalVehicleTime);

            setRouteSteps(
              parseRouteSteps(
                routeResult.geojsonSegments,
                startLatLng,
                endLatLng,
                transportMode
              )
            );
            setActiveStepIndex(0);
          } else {
            alert(
              "Tidak ditemukan rute yang valid antara titik awal dan tujuan. Pastikan titik terhubung ke jalur."
            );
          }
        }
      }
    };

    useEffect(() => {
      if (leafletMapRef.current) {
        const map = leafletMapRef.current;

        // Buat pane khusus untuk route dengan z-index rendah
        if (!map.getPane("routePane")) {
          map.createPane("routePane");
          const routePane = map.getPane("routePane");
          if (routePane) {
            routePane.style.zIndex = "400"; // Di bawah marker biasa (600)
          }
        }

        // Buat pane khusus untuk navigation marker dengan z-index SANGAT tinggi
        if (!map.getPane("navigationPane")) {
          map.createPane("navigationPane");
          const navPane = map.getPane("navigationPane");
          if (navPane) {
            navPane.style.zIndex = "1000"; // Di atas SEMUA layer termasuk route
            navPane.style.pointerEvents = "auto";
          }
        }
      }
    }, []);

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
              onFocus={() => setShowSearchResults(true)}
              placeholder="Cari nama bangunan atau ruangan..."
              className={`pl-9 pr-2 py-1.5 w-full bg-transparent outline-none text-sm rounded-xl ${
                isDark
                  ? "text-white placeholder:text-gray-400"
                  : "text-gray-900 placeholder:text-gray-500"
              } ${isHighlightActive ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ minWidth: 120 }}
              disabled={isHighlightActive}
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

        {/* Step-by-Step Navigation Panel - Bottom Center */}
        {routeSteps.length > 0 && (
          <div
            className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[201] w-96 max-w-[90vw] ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            } border rounded-xl shadow-lg`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm">Instruksi Navigasi</h3>
                  {routeDistance !== null && (
                    <div className="text-xs text-primary dark:text-primary-dark font-bold">
                      Total Jarak: {Math.round(routeDistance)} meter
                    </div>
                  )}
                  {totalWalkingTime !== null && totalVehicleTime !== null && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                      {transportMode === "jalan_kaki" ? (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faWalking}
                            className="text-green-600 w-3 h-3"
                          />
                          {Math.floor(totalWalkingTime / 60)} menit{" "}
                          {Math.round(totalWalkingTime % 60)} detik
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faMotorcycle}
                            className="text-blue-600 w-3 h-3"
                          />
                          {Math.floor(totalVehicleTime / 60)} menit{" "}
                          {Math.round(totalVehicleTime % 60)} detik
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setRouteSteps([]);
                    setActiveStepIndex(0);
                    setHasReachedDestination(false);
                    setIsNavigationActive(false);
                    setTotalWalkingTime(null);
                    setTotalVehicleTime(null);
                    if (destinationMarker && leafletMapRef.current) {
                      leafletMapRef.current.removeLayer(destinationMarker);
                      setDestinationMarker(null);
                    }
                    if (routeLine && leafletMapRef.current) {
                      leafletMapRef.current.removeLayer(routeLine);
                      setRouteLine(null);
                    }
                    // Hapus navigation marker
                    if (navigationMarkerRef.current && leafletMapRef.current) {
                      leafletMapRef.current.removeLayer(
                        navigationMarkerRef.current
                      );
                      navigationMarkerRef.current = null;
                    }
                    // Kembalikan highlight gedung
                    if (selectedFeature && selectedFeature.properties?.id) {
                      setIsHighlightActive(true);

                      // Highlight permanen gedung (tidak hilang setelah 1 detik)
                      const bangunanLayer = bangunanLayerRef.current;
                      if (bangunanLayer) {
                        bangunanLayer.eachLayer((layer: L.Layer) => {
                          if (
                            (layer as any).feature &&
                            (layer as any).feature.geometry &&
                            (layer as any).feature.geometry.type ===
                              "Polygon" &&
                            (layer as any).feature.properties?.id ===
                              Number(selectedFeature.properties.id)
                          ) {
                            const highlightStyle = {
                              color: "#ff3333",
                              fillColor: "#ff3333",
                              fillOpacity: 0.7,
                              opacity: 1,
                              weight: 3,
                            };
                            (layer as any).setStyle(highlightStyle);
                          }
                        });
                      }

                      // Pindahkan map ke posisi gedung yang di-highlight (tanpa mengubah zoom)
                      if (leafletMapRef.current && selectedFeature.geometry) {
                        const centroid = getFeatureCentroid(selectedFeature);
                        const currentZoom = leafletMapRef.current.getZoom();
                        leafletMapRef.current.setView(centroid, currentZoom, {
                          animate: true,
                          duration: 1,
                        });
                      }
                    }
                  }}
                  className="text-gray-400 hover:text-primary dark:hover:text-primary-dark text-xl font-bold focus:outline-none"
                  title="Tutup Navigasi"
                >
                  ×
                </button>
              </div>

              {/* Current Step Display */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {hasReachedDestination
                      ? routeSteps.length + 1
                      : activeStepIndex + 1}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    dari {routeSteps.length + 1} langkah
                  </div>
                  {/* PERBAIKAN: Jangan tampilkan jarak untuk step terakhir (oranye) dan step merah */}
                  {activeStepIndex < routeSteps.length - 1 &&
                    !hasReachedDestination &&
                    activeStepIndex !== routeSteps.length - 1 && (
                      <div className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                        {Math.round(routeSteps[activeStepIndex]?.distance || 0)}
                        m
                      </div>
                    )}
                </div>
                <div className="text-sm font-medium leading-relaxed">
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

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log(
                      `🔍 [DEBUG] Prev clicked - activeStepIndex: ${activeStepIndex}, hasReachedDestination: ${hasReachedDestination}`
                    );
                    if (hasReachedDestination) {
                      // Jika sedang di marker merah, kembali ke step oranye
                      console.log(
                        `🔍 [DEBUG] Resetting hasReachedDestination to false`
                      );
                      setHasReachedDestination(false);
                    } else if (activeStepIndex > 0) {
                      console.log(
                        `🔍 [DEBUG] Moving to previous step: ${
                          activeStepIndex - 1
                        }`
                      );
                      setActiveStepIndex(activeStepIndex - 1);
                    }
                  }}
                  disabled={activeStepIndex === 0 && !hasReachedDestination}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeStepIndex === 0 && !hasReachedDestination
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  }`}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => {
                    console.log(
                      `🔍 [DEBUG] Next clicked - activeStepIndex: ${activeStepIndex}, routeSteps.length: ${routeSteps.length}, hasReachedDestination: ${hasReachedDestination}`
                    );
                    if (activeStepIndex < routeSteps.length - 1) {
                      console.log(
                        `🔍 [DEBUG] Moving to next step: ${activeStepIndex + 1}`
                      );
                      setActiveStepIndex(activeStepIndex + 1);
                    } else if (
                      activeStepIndex === routeSteps.length - 1 &&
                      !hasReachedDestination
                    ) {
                      // Jika sudah di step terakhir dan belum mencapai tujuan, set hasReachedDestination
                      console.log(
                        `🔴 [DEBUG] Setting hasReachedDestination to true - activeStepIndex: ${activeStepIndex}, routeSteps.length: ${routeSteps.length}`
                      );
                      setHasReachedDestination(true);
                    } else {
                      console.log(
                        `⚠️ [DEBUG] No action taken - activeStepIndex: ${activeStepIndex}, routeSteps.length: ${routeSteps.length}, hasReachedDestination: ${hasReachedDestination}`
                      );
                    }
                  }}
                  disabled={
                    activeStepIndex === routeSteps.length - 1 &&
                    hasReachedDestination
                  }
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeStepIndex === routeSteps.length - 1 &&
                    hasReachedDestination
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  }`}
                >
                  Next →
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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

        {/* Kontrol kanan bawah: tombol zoom, GPS, reset, dsb */}
        <div
          className="absolute right-4 bottom-4 z-50 flex flex-col gap-2"
          style={{ zIndex: 1050 }}
        >
          {/* Zoom Controls */}
          <div className="flex flex-col gap-1 mb-2">
            {/* Zoom In Button */}
            <button
              data-control="zoom-in"
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
              data-control="zoom-out"
              onClick={() => {
                console.log("Zoom out clicked");
                const map = leafletMapRef.current;
                if (map) {
                  const newZoom = Math.max(map.getZoom() - 1, map.getMinZoom());
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
              data-control="reset-zoom"
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

        {/* Kontrol kiri bawah: basemap dan toggle layer */}
        <div
          className="absolute left-4 bottom-4 z-50 flex flex-col gap-2"
          style={{ zIndex: 1050 }}
        >
          {/* Toggle Layer Button (ikon mata) */}
          <button
            data-control="toggle-layer"
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
            data-control="toggle-basemap"
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

        {/* Sidebar Gedung (floating card kanan atas) */}
        {selectedFeature && (
          <div
            data-container="building-detail"
            className={`absolute right-4 top-4 z-[201] w-64 max-w-xs bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-out
              ${
                cardVisible && cardAnimation
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95 pointer-events-none"
              }
              ${isContainerShaking ? "animate-shake" : ""}
            `}
            style={{
              boxShadow: "0 8px 32px 0 rgba(30,41,59,0.18)",
              minHeight: 120,
            }}
          >
            {/* Header dengan nama gedung - 2 baris */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              {/* Baris 1: Tombol close */}
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => {
                    setCardVisible(false);
                    setIsHighlightActive(false);
                    // Reset edit mode
                    setIsEditingName(false);
                    setIsEditingThumbnail(false);
                    setEditName("");
                    setEditThumbnail("");
                    // Jika navigation aktif, tutup juga navigation
                    if (isNavigationActive) {
                      setRouteSteps([]);
                      setActiveStepIndex(0);
                      setHasReachedDestination(false);
                      setIsNavigationActive(false);
                      if (routeLine && leafletMapRef.current) {
                        leafletMapRef.current.removeLayer(routeLine);
                        setRouteLine(null);
                      }
                      // Hapus navigation marker
                      if (
                        navigationMarkerRef.current &&
                        leafletMapRef.current
                      ) {
                        leafletMapRef.current.removeLayer(
                          navigationMarkerRef.current
                        );
                        navigationMarkerRef.current = null;
                      }
                    }
                    // Clear highlight dari bangunan layer
                    if (bangunanLayerRef.current) {
                      bangunanLayerRef.current.resetStyle();
                    }
                    setTimeout(() => setSelectedFeature(null), 350);
                  }}
                  className="text-gray-400 hover:text-primary dark:hover:text-primary-dark text-xl font-bold focus:outline-none transition-all duration-200"
                  title="Tutup"
                >
                  ×
                </button>
              </div>

              {/* Baris 2: Nama gedung dan tombol edit */}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-primary dark:text-primary-dark break-words whitespace-pre-line pr-8">
                  {selectedFeature.properties?.nama || "Tanpa Nama"}
                </span>
                {isDashboard && (
                  <button
                    onClick={handleEditName}
                    className="text-gray-400 hover:text-primary dark:hover:text-primary-dark transition-colors"
                    title="Edit nama bangunan"
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Gambar thumbnail bangunan */}
            <div className="px-4 pt-2">
              <div className="relative">
                <img
                  src={
                    selectedFeature.properties?.thumbnail
                      ? `/${selectedFeature.properties.thumbnail}`
                      : selectedFeature.properties?.id
                      ? `/img/${selectedFeature.properties.id}/thumbnail.jpg`
                      : "/img/default/thumbnail.jpg"
                  }
                  alt={selectedFeature.properties?.nama || "Bangunan"}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    // Fallback ke gambar default jika tidak ditemukan
                    const target = e.target as HTMLImageElement;
                    target.src = "/img/default/thumbnail.jpg";
                  }}
                />
                {isDashboard && (
                  <button
                    onClick={handleEditThumbnail}
                    className="absolute top-2 right-2 text-white hover:text-primary dark:hover:text-primary-dark transition-colors z-20 p-1"
                    title="Edit thumbnail"
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                )}
              </div>
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
                      setRouteEndId(
                        String(selectedFeature.properties.id ?? "")
                      );
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

        {/* Modal Edit Bangunan */}
        {(isEditingName || isEditingThumbnail) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              data-modal="edit-modal"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit {isEditingName ? "Nama" : "Thumbnail"} Bangunan
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="space-y-4">
                {isEditingName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Bangunan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent ${
                        isEditingName && !editName.trim()
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Masukkan nama bangunan"
                      autoFocus
                    />
                    {isEditingName && !editName.trim() && (
                      <p className="text-xs text-red-500 mt-1">
                        Nama bangunan tidak boleh kosong
                      </p>
                    )}
                  </div>
                )}

                {isEditingThumbnail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Thumbnail Baru{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {/* File input */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />

                      {/* Preview file yang dipilih */}
                      {selectedFile && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <i className="fas fa-image text-primary text-lg"></i>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Thumbnail saat ini */}
                      {selectedFeature?.properties?.thumbnail && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Thumbnail saat ini:
                          </p>
                          <img
                            src={`/${selectedFeature?.properties?.thumbnail}`}
                            alt="Current thumbnail"
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/img/default/thumbnail.jpg";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Format yang didukung: JPG, PNG, GIF, WebP (Maks. 5MB)
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={
                      isSaving ||
                      (isEditingName && !editName.trim()) ||
                      (isEditingThumbnail && !selectedFile)
                    }
                    className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save text-sm"></i>
                        Simpan
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-1">
                    Enter
                  </span>
                  untuk simpan,
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1 mr-1">
                    Esc
                  </span>
                  untuk batal
                </div>
              </div>
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
          <div
            data-modal="route-modal"
            className="absolute inset-0 z-[3000] flex items-center justify-center"
          >
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
                {/* Mode Transportasi */}
                <div className="route-modal-select">
                  <label className="block text-sm font-medium mb-1">
                    Mode Transportasi
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTransportMode("jalan_kaki")}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                        transportMode === "jalan_kaki"
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faWalking} className="w-4 h-4" />
                        <span className="text-sm font-medium">Jalan Kaki</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportMode("kendaraan")}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                        transportMode === "kendaraan"
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FontAwesomeIcon
                          icon={faMotorcycle}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Kendaraan</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Titik Awal */}
                <div className="route-modal-select">
                  <label className="block text-sm font-medium mb-1">
                    Titik Awal
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-left flex items-center justify-between"
                      onClick={() =>
                        setIsStartDropdownOpen(!isStartDropdownOpen)
                      }
                    >
                      <span>
                        {routeStartType === "my-location"
                          ? isGettingLocation
                            ? "📍 Mendapatkan Lokasi..."
                            : "📍 Lokasi Saya"
                          : (() => {
                              const selectedTitik = titikFeatures.find(
                                (t: any) =>
                                  String(t.id || t.properties?.OBJECTID) ===
                                  String(routeStartId)
                              );
                              return selectedTitik
                                ? selectedTitik.properties?.Nama ||
                                    `Titik ${
                                      selectedTitik.id ||
                                      selectedTitik.properties?.OBJECTID
                                    }`
                                : "Pilih titik awal";
                            })()}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isStartDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isStartDropdownOpen && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 dropdown-list"
                        onWheel={(e) => {
                          const target = e.currentTarget;
                          const scrollTop = target.scrollTop;
                          const scrollHeight = target.scrollHeight;
                          const clientHeight = target.clientHeight;
                          const delta = e.deltaY;

                          // Cek apakah scroll akan melebihi batas
                          const willScrollPastTop = delta < 0 && scrollTop <= 0;
                          const willScrollPastBottom =
                            delta > 0 &&
                            scrollTop + clientHeight >= scrollHeight;

                          // Jika akan scroll melebihi batas, prevent default dan stop propagation
                          if (willScrollPastTop || willScrollPastBottom) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }

                          // Jika scroll masih dalam batas, prevent default untuk mencegah scroll halaman
                          e.preventDefault();
                        }}
                      >
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-b border-gray-100 dark:border-gray-700"
                          onClick={() => {
                            setRouteStartType("my-location");
                            setRouteStartId("");
                            setIsStartDropdownOpen(false);
                          }}
                        >
                          {isGettingLocation
                            ? "📍 Mendapatkan Lokasi..."
                            : "📍 Lokasi Saya"}
                        </button>
                        {titikFeatures
                          .filter((t: any) => {
                            const nama = t.properties?.Nama || "";
                            const lowerNama = nama.toLowerCase();
                            // Filter out titik yang memiliki nama "Toilet" atau "Pos Satpam"
                            return (
                              !lowerNama.includes("toilet") &&
                              !lowerNama.includes("pos satpam")
                            );
                          })
                          .sort((a: any, b: any) => {
                            const namaA = a.properties?.Nama || "";
                            const namaB = b.properties?.Nama || "";
                            const lowerNamaA = namaA.toLowerCase();
                            const lowerNamaB = namaB.toLowerCase();

                            // Gerbang selalu di atas
                            const isGerbangA = lowerNamaA.includes("gerbang");
                            const isGerbangB = lowerNamaB.includes("gerbang");

                            if (isGerbangA && !isGerbangB) return -1;
                            if (!isGerbangA && isGerbangB) return 1;
                            if (isGerbangA && isGerbangB) {
                              // Jika keduanya gerbang, urutkan alfabetis
                              return namaA.localeCompare(namaB);
                            }

                            // Sisanya urutkan alfabetis
                            return namaA.localeCompare(namaB);
                          })
                          .map((t: any) => (
                            <button
                              key={t.id || t.properties?.OBJECTID}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                              onClick={() => {
                                setRouteStartType("titik");
                                setRouteStartId(
                                  String(t.id || t.properties?.OBJECTID)
                                );
                                setIsStartDropdownOpen(false);
                              }}
                            >
                              {t.properties?.Nama ||
                                `Titik ${t.id || t.properties?.OBJECTID}`}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Titik Tujuan */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titik Tujuan
                  </label>
                  {routeEndType === "bangunan" && routeEndId ? (
                    // Tampilkan bangunan yang dipilih (dari klik bangunan)
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">
                        {(() => {
                          const b = bangunanFeatures.find(
                            (b: FeatureType) => b.properties.id == routeEndId
                          );
                          return b ? b.properties.nama : "Bangunan";
                        })()}
                      </span>
                    </div>
                  ) : (
                    // Input manual untuk mencari titik tujuan
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={routeEndSearchText}
                        onChange={(e) => {
                          const searchText = e.target.value;
                          setRouteEndSearchText(searchText);
                          if (searchText.trim()) {
                            const results = searchTitikByName(searchText);
                            setRouteEndSearchResults(results);
                          } else {
                            setRouteEndSearchResults([]);
                          }
                        }}
                        placeholder="Cari nama titik tujuan..."
                      />
                      {/* Dropdown hasil pencarian */}
                      {routeEndSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                          {routeEndSearchResults.map((point) => (
                            <button
                              key={point.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                              onClick={() => {
                                setRouteEndSearchText(point.name);
                                setRouteEndType("titik");
                                setRouteEndSearchResults([]);
                              }}
                            >
                              {point.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Tombol submit */}
                <button
                  type="submit"
                  disabled={isGettingLocation || isCalculatingRoute}
                  className={`w-full py-2 rounded-lg font-bold mt-2 transition-all ${
                    isGettingLocation || isCalculatingRoute
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {isGettingLocation ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mendapatkan Lokasi GPS...
                    </div>
                  ) : isCalculatingRoute ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menghitung Rute...
                    </div>
                  ) : (
                    "Cari Rute"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal GPS Troubleshooting */}
        {showGPSTroubleshoot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🚨 GPS Bermasalah
                  </h3>
                  <button
                    onClick={() => setShowGPSTroubleshoot(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Tidak dapat mengambil lokasi GPS. Silakan coba lagi atau
                      pilih titik awal secara manual.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowGPSTroubleshoot(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LeafletMap.displayName = "LeafletMap";

export default LeafletMap;
