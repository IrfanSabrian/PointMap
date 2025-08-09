/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
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
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import {
  findRoute,
  Point,
  calculateDistance,
  getRealWorldRoute,
} from "../lib/routing";
// Import fungsi routing dari src/lib/routeSteps
import { useGps } from "@/hooks/gps/useGps";
import { useRouting } from "@/hooks/routing/useRouting";
import {
  parseRouteSteps,
  getStepInstruction,
  calculateBearing,
} from "../lib/routeSteps";
import { geojsonBangunanUrl, geojsonStatisUrl } from "../lib/map/constants";
import { kategoriStyle, defaultStyle } from "../lib/map/styles";
import { BASEMAPS } from "../lib/map/basemaps";
import MapControlsPanel from "./map/LeafletMap/MapControlsPanel";
import { useRouteDrawing } from "@/hooks/routing/useRouteDrawing";
import { findAllRoutesToBuilding } from "../lib/routing";
import Navigation from "./map/LeafletMap/Navigation";
import { useFeatureSearch } from "@/hooks/map/useFeatureSearch";
import BuildingDetailModal from "./map/LeafletMap/BuildingDetailModal";
import EditRuanganForm from "./map/LeafletMap/EditRuanganForm";
import EditLantaiImageUploader from "./map/LeafletMap/EditLantaiImageUploader";
import type {
  FeatureType,
  FeatureFixed,
  FeatureProperties,
} from "../types/map";
import { validateToken, setupAutoLogout } from "../lib/auth";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  getLantaiGambarByBangunan,
  createLantaiGambar,
  deleteLantaiGambar,
} from "../services/lantaiGambar";
import {
  createRuangan,
  updateRuangan,
  getRuanganByBangunan,
} from "../services/ruangan";
import { updateBangunan, uploadBangunanThumbnail } from "../services/bangunan";

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

// moved constants/styles/basemaps/types to dedicated modules

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
    // FeatureType imported from ../types/map
    const basemapLayerRef = useRef<L.TileLayer | null>(null);
    const [basemap, setBasemap] = useState<string>(
      isDark ?? false ? "alidade_smooth_dark" : "esri_topo"
    );
    const [layerVisible, setLayerVisible] = useState(true);
    // inisialisasi setelah features dideklarasikan
    const [isSatellite, setIsSatellite] = useState(
      basemap === "esri_satellite"
    );
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [isHighlightActive, setIsHighlightActive] = useState(false);
    const [isContainerShaking, setIsContainerShaking] = useState(false);
    const [isNavigationActive, setIsNavigationActive] = useState(false);
    const [isStartDropdownOpen, setIsStartDropdownOpen] = useState(false);
    const [searchHighlightedId, setSearchHighlightedId] = useState<
      number | null
    >(null);
    const isHighlightActiveRef = useRef(false);
    const isNavigationActiveRef = useRef(false);
    const isGpsRecalcRef = useRef(false);
    const isZoomingRef = useRef(false);
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
    const [isEditingLantai, setIsEditingLantai] = useState(false);
    const [isEditingLantaiCount, setIsEditingLantaiCount] = useState(false);
    const [isEditingInteraksi, setIsEditingInteraksi] = useState(false);
    const [editName, setEditName] = useState("");
    const [editThumbnail, setEditThumbnail] = useState("");
    const [editLantaiCount, setEditLantaiCount] = useState(1);
    const [editInteraksi, setEditInteraksi] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [lantaiFiles, setLantaiFiles] = useState<{
      [key: number]: File | null;
    }>({});
    const [lantaiPreviewUrls, setLantaiPreviewUrls] = useState<{
      [key: number]: string | null;
    }>({});
    const [lantaiGambarData, setLantaiGambarData] = useState<any[]>([]);
    const [selectedLantaiFilter, setSelectedLantaiFilter] = useState<number>(1);
    const [showRuanganModal, setShowRuanganModal] = useState(false);
    const [showEditRuanganModal, setShowEditRuanganModal] = useState(false);
    const [showPinPositionModal, setShowPinPositionModal] = useState(false);
    const [selectedLantaiForRuangan, setSelectedLantaiForRuangan] = useState<
      number | null
    >(null);
    const [selectedRuanganForEdit, setSelectedRuanganForEdit] =
      useState<any>(null);
    const [ruanganList, setRuanganList] = useState<any[]>([]);
    const [ruanganForm, setRuanganForm] = useState({
      nama_ruangan: "",
      nomor_lantai: 1,
      nama_jurusan: "",
      nama_prodi: "",
      pin_style: "default",
      posisi_x: null as number | null,
      posisi_y: null as number | null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const {
      searchText,
      setSearchText,
      showSearchResults,
      setShowSearchResults,
      searchResults,
    } = useFeatureSearch({ bangunanFeatures, ruanganFeatures });
    const {
      isLoggedIn,
      isAdmin,
      refresh: refreshAuth,
    } = useAuth(() => {
      // Auto-logout callback
      showNotification(
        "error",
        "Sesi berakhir",
        "Token kedaluwarsa. Anda telah keluar otomatis."
      );
    });
    const [isMobile, setIsMobile] = useState(false);

    // Notification system state
    const [notification, setNotification] = useState<{
      type: "success" | "error";
      title: string;
      message: string;
      visible: boolean;
    } | null>(null);

    // Confirmation dialog state
    const [confirmationDialog, setConfirmationDialog] = useState<{
      visible: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
    } | null>(null);

    // Gunakan custom hook
    const {
      userLocation,
      userHeading,
      setUserLocation,
      isGettingLocation,
      setIsGettingLocation,
      isGpsRequesting,
      showGPSTroubleshoot,
      setShowGPSTroubleshoot,
      isUserInsideCampus,
      getCurrentLocation,
      isLiveTracking,
      startLiveTracking,
      stopLiveTracking,
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

    // Notification system functions
    const showNotification = useCallback(
      (type: "success" | "error", title: string, message: string) => {
        setNotification({
          type,
          title,
          message,
          visible: true,
        });

        // Auto hide after 4 seconds
        setTimeout(() => {
          setNotification((prev) =>
            prev ? { ...prev, visible: false } : null
          );
        }, 4000);
      },
      []
    );

    const hideNotification = useCallback(() => {
      setNotification((prev) => (prev ? { ...prev, visible: false } : null));
    }, []);

    const showConfirmation = useCallback(
      (title: string, message: string, onConfirm: () => void) => {
        setConfirmationDialog({
          visible: true,
          title,
          message,
          onConfirm,
        });
      },
      []
    );

    const hideConfirmation = useCallback(() => {
      setConfirmationDialog(null);
    }, []);

    const confirmAction = useCallback(() => {
      if (confirmationDialog?.onConfirm) {
        confirmationDialog.onConfirm();
      }
      hideConfirmation();
    }, [confirmationDialog]);

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

    // Mobile detection effect
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

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
            setNonBangunanFeatures([]);
            return;
          }
          const nonBangunan = (data.features || []).filter(
            (f: FeatureType) => f.properties?.kategori !== "Bangunan"
          );
          setNonBangunanFeatures(nonBangunan);
        })
        .catch((error) => {
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
            // Hapus data dummy, set kosong saja
            setBangunanFeatures([]);
            return;
          }
          setBangunanFeatures(data.features || []);
        })
        .catch((error) => {
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
        })
        .catch((error) => {
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
        // Touch handling configuration to prevent console warnings
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        // Prevent passive event listener issues
        dragging: true,
        trackResize: true,
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

      // Configure touch handling to prevent console warnings on mobile
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.style.touchAction = "none";
        (mapContainer.style as any).webkitTouchCallout = "none";
        (mapContainer.style as any).webkitUserSelect = "none";
        mapContainer.style.userSelect = "none";
      }

      // Override Leaflet's preventDefault to check if event is cancelable
      const originalPreventDefault = L.DomEvent.preventDefault;
      (L.DomEvent as any).preventDefault = function (e: Event) {
        if (e.cancelable !== false) {
          originalPreventDefault(e);
        }
        return L.DomEvent;
      };

      // Store reference for cleanup
      (map as any)._originalPreventDefault = originalPreventDefault;

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
          // Restore original preventDefault
          if ((map as any)._originalPreventDefault) {
            L.DomEvent.preventDefault = (map as any)._originalPreventDefault;
          }

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

          // Tambahkan efek shake saat mencoba menggeser peta ketika highlight aktif
          const mapContainer = document.querySelector(
            ".leaflet-container"
          ) as HTMLElement | null;
          let isPointerDown = false;
          let lastX = 0;
          let lastY = 0;
          let shakeCooldown = false;

          const isTargetMapControl = (target: Element | null) => {
            if (!target) return false;
            return (
              target.closest(".leaflet-control-zoom") ||
              target.closest(".leaflet-control-layers") ||
              target.closest('[data-control="reset-zoom"]') ||
              target.closest('[data-control="toggle-layer"]') ||
              target.closest('[data-control="toggle-basemap"]') ||
              target.closest('[data-control="zoom-in"]') ||
              target.closest('[data-control="zoom-out"]') ||
              target.closest('[data-control="locate-me"]') ||
              target.closest(".leaflet-control-attribution") ||
              target.closest(".leaflet-control-scale")
            );
          };

          const tryShake = (target: Element | null) => {
            const container = document.querySelector(
              '[data-container="building-detail"]'
            );
            const routeModal = document.querySelector(
              '[data-modal="route-modal"]'
            );
            const isMapControl = isTargetMapControl(target as Element);
            if (container && !routeModal && !isMapControl && !shakeCooldown) {
              setIsContainerShaking(true);
              shakeCooldown = true;
              setTimeout(() => {
                setIsContainerShaking(false);
                shakeCooldown = false;
              }, 600);
            }
          };

          const onMouseDown = (e: MouseEvent) => {
            if (!mapContainer) return;
            isPointerDown = true;
            lastX = e.clientX;
            lastY = e.clientY;
          };

          const onMouseMove = (e: MouseEvent) => {
            if (!isPointerDown) return;
            const dx = Math.abs(e.clientX - lastX);
            const dy = Math.abs(e.clientY - lastY);
            if (dx + dy > 4) {
              tryShake(e.target as Element);
            }
          };

          const onMouseUp = () => {
            isPointerDown = false;
          };

          const onTouchStart = (e: TouchEvent) => {
            if (!mapContainer || e.touches.length === 0) return;
            isPointerDown = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
          };

          const onTouchMove = (e: TouchEvent) => {
            if (!isPointerDown || e.touches.length === 0) return;
            const dx = Math.abs(e.touches[0].clientX - lastX);
            const dy = Math.abs(e.touches[0].clientY - lastY);
            if (dx + dy > 4) {
              tryShake(e.target as Element);
            }
          };

          const onTouchEnd = () => {
            isPointerDown = false;
          };

          if (mapContainer) {
            mapContainer.addEventListener("mousedown", onMouseDown, {
              passive: true,
              capture: true,
            } as AddEventListenerOptions);
            mapContainer.addEventListener("mousemove", onMouseMove, {
              passive: true,
              capture: true,
            } as AddEventListenerOptions);
            mapContainer.addEventListener("mouseup", onMouseUp, {
              passive: true,
              capture: true,
            } as AddEventListenerOptions);
            mapContainer.addEventListener("touchstart", onTouchStart, {
              passive: true,
              capture: true,
            } as AddEventListenerOptions);
            mapContainer.addEventListener("touchmove", onTouchMove, {
              passive: true,
              capture: true,
            } as AddEventListenerOptions);
            mapContainer.addEventListener("touchend", onTouchEnd, {
              passive: true,
              capture: true,
            } as AddEventListenerOptions);
          }

          // Fallback document-level listeners to catch movements intercepted by Leaflet
          const docOptions = {
            passive: true,
            capture: true,
          } as AddEventListenerOptions;
          document.addEventListener("mousemove", onMouseMove, docOptions);
          document.addEventListener("mouseup", onMouseUp, docOptions);
          document.addEventListener("touchmove", onTouchMove, docOptions);
          document.addEventListener("touchend", onTouchEnd, docOptions);

          // Cleanup function untuk dijalankan saat highlight nonaktif
          const cleanup = () => {
            document.removeEventListener("click", handleCanvasClick);
            if (mapContainer) {
              mapContainer.removeEventListener(
                "mousedown",
                onMouseDown as any,
                true
              );
              mapContainer.removeEventListener(
                "mousemove",
                onMouseMove as any,
                true
              );
              mapContainer.removeEventListener(
                "mouseup",
                onMouseUp as any,
                true
              );
              mapContainer.removeEventListener(
                "touchstart",
                onTouchStart as any,
                true
              );
              mapContainer.removeEventListener(
                "touchmove",
                onTouchMove as any,
                true
              );
              mapContainer.removeEventListener(
                "touchend",
                onTouchEnd as any,
                true
              );
            }
            document.removeEventListener("mousemove", onMouseMove as any, true);
            document.removeEventListener("mouseup", onMouseUp as any, true);
            document.removeEventListener("touchmove", onTouchMove as any, true);
            document.removeEventListener("touchend", onTouchEnd as any, true);
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

    // Pencarian dipindahkan ke useFeatureSearch hook

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
        if (isEditingName || isEditingThumbnail || isEditingInteraksi) {
          if (event.key === "Enter") {
            event.preventDefault();
            if (
              !isSaving &&
              ((isEditingName && editName.trim()) ||
                (isEditingThumbnail && editThumbnail.trim()) ||
                (isEditingInteraksi && editInteraksi) ||
                (isEditingName &&
                  isEditingInteraksi &&
                  editName.trim() &&
                  editInteraksi))
            ) {
              handleSaveEdit();
            }
          } else if (event.key === "Escape") {
            event.preventDefault();
            handleCancelEdit();
          }
        }
      };

      if (isEditingName || isEditingThumbnail || isEditingInteraksi) {
        document.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [
      isEditingName,
      isEditingThumbnail,
      isEditingInteraksi,
      editName,
      selectedFile,
      editInteraksi,
      isSaving,
    ]);

    // Sinkronisasi status login dengan perubahan storage/event, gunakan useAuth.refresh
    useEffect(() => {
      const handleStatus = () => refreshAuth();
      window.addEventListener("storage", handleStatus);
      window.addEventListener("login-status-changed", handleStatus);
      return () => {
        window.removeEventListener("storage", handleStatus);
        window.removeEventListener("login-status-changed", handleStatus);
      };
    }, [refreshAuth]);

    // Fungsi helper untuk highlight bangunan
    const highlightBangunan = (featureId: number) => {
      const bangunanLayer = bangunanLayerRef.current;
      if (!bangunanLayer) return;

      // Reset highlight sebelumnya jika ada
      if (searchHighlightedId && searchHighlightedId !== featureId) {
        resetBangunanHighlight();
      }

      bangunanLayer.eachLayer((layer: L.Layer) => {
        if (
          (layer as any).feature &&
          (layer as any).feature.geometry &&
          (layer as any).feature.geometry.type === "Polygon" &&
          (layer as any).feature.properties?.id === featureId
        ) {
          console.log("Highlighting bangunan from search:", featureId);

          // Style highlight yang sama dengan saat bangunan diklik
          const highlightStyle = {
            color: "#ff3333",
            fillColor: "#ff3333",
            fillOpacity: 0.7,
            opacity: 1,
            weight: 3,
          };

          // Terapkan style highlight permanen (tidak hilang setelah 1 detik)
          (layer as any).setStyle(highlightStyle);

          // Tambahkan CSS class untuk transisi yang lebih smooth
          if ((layer as any)._path) {
            (layer as any)._path.classList.add("building-highlight");
          }

          // Simpan reference ke layer yang di-highlight untuk bisa di-reset nanti
          (layer as any)._isHighlighted = true;
          (layer as any)._highlightedFeatureId = featureId;
        }
      });

      // Simpan ID yang sedang di-highlight
      setSearchHighlightedId(featureId);
    };

    // Fungsi untuk reset highlight bangunan
    const resetBangunanHighlight = () => {
      const bangunanLayer = bangunanLayerRef.current;
      if (!bangunanLayer) return;

      bangunanLayer.eachLayer((layer: L.Layer) => {
        if (
          (layer as any).feature &&
          (layer as any).feature.geometry &&
          (layer as any).feature.geometry.type === "Polygon" &&
          (layer as any)._isHighlighted
        ) {
          // Reset ke style default
          const kategori =
            (layer as any).feature?.properties?.kategori || "Bangunan";
          const defaultStyle = kategoriStyle[kategori] || {
            color: "#adb5bd",
            fillColor: "#adb5bd",
            fillOpacity: 0.5,
          };

          (layer as any).setStyle(defaultStyle);

          // Hapus CSS class highlight
          if ((layer as any)._path) {
            (layer as any)._path.classList.remove("building-highlight");
          }

          (layer as any)._isHighlighted = false;
          (layer as any)._highlightedFeatureId = null;
        }
      });
    };

    // Hapus highlight untuk satu bangunan berdasarkan ID apapun sumber highlight-nya
    const clearBangunanHighlightById = (featureId: number | string) => {
      const bangunanLayer = bangunanLayerRef.current;
      if (!bangunanLayer) return;

      bangunanLayer.eachLayer((layer: L.Layer) => {
        const f = (layer as any).feature;
        if (
          f &&
          f.geometry &&
          f.geometry.type === "Polygon" &&
          f.properties?.id == featureId
        ) {
          const kategori = f.properties?.kategori || "Bangunan";
          const style = kategoriStyle[kategori] || {
            color: "#adb5bd",
            fillColor: "#adb5bd",
            fillOpacity: 0.5,
          };
          (layer as any).setStyle(style);
          if ((layer as any)._path) {
            (layer as any)._path.classList.remove("building-highlight");
          }
          (layer as any)._isHighlighted = false;
          (layer as any)._highlightedFeatureId = null;
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
              // Samakan perilaku dengan klik bangunan: nonaktifkan interaksi peta dan highlight bangunan
              setIsHighlightActive(true);
              if (bangunan.properties?.id != null) {
                highlightBangunan(Number(bangunan.properties.id));
              }

              // Kirim pesan ke dashboard untuk update sidebar ruangan

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
            // Samakan perilaku dengan klik bangunan: nonaktifkan interaksi peta dan highlight bangunan
            setIsHighlightActive(true);
            if (bangunan.properties?.id != null) {
              highlightBangunan(Number(bangunan.properties.id));
            }

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
          // Tetap nonaktifkan interaksi peta saat modal ruangan dibuka
          setIsHighlightActive(true);

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

      // Reset search highlight jika ada highlight sebelumnya
      if (searchHighlightedId) {
        resetBangunanHighlight();
        setSearchHighlightedId(null);
      }

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
      if (isSatellite) {
        setBasemap(isDark ?? false ? "alidade_smooth_dark" : "esri_topo");
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
      if (!map) {
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

    useEffect(() => {
      if (!isSatellite && isDark !== undefined) {
        setBasemap(isDark ?? false ? "alidade_smooth_dark" : "esri_topo");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark]);

    // Fungsi untuk handle klik tombol GPS
    const handleLocateMe = () => {
      if (!navigator.geolocation) {
        showNotification(
          "error",
          "Error",
          "Browser tidak mendukung geolokasi."
        );
        return;
      }

      if (isLiveTracking) {
        // Hentikan live tracking
        stopLiveTracking();

        // Hapus marker GPS
        if (userMarkerRef.current && leafletMapRef.current) {
          leafletMapRef.current.removeLayer(userMarkerRef.current);
          userMarkerRef.current = null;
        }

        showNotification(
          "success",
          "Live GPS Tracking",
          "Live tracking GPS telah dihentikan."
        );
      } else {
        // Mulai live tracking dengan arah
        startLiveTracking();

        showNotification(
          "success",
          "Live GPS Tracking",
          "Live tracking GPS dengan arah telah diaktifkan. Posisi Anda akan selalu terupdate setiap 3 detik."
        );
      }
    };

    // Fungsi untuk membuat custom icon GPS marker
    const createUserMarkerIcon = (heading: number | null) => {
      const size = 40;
      return L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                 <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center;">
                   <div style="width: ${size - 8}px; height: ${
          size - 8
        }px; border-radius: 50%; background: white; border: 1px solid #3b82f6; position: relative;">
                     ${
                       heading !== null
                         ? `<div style="position: absolute; top: 2px; left: 50%; transform: translateX(-50%) rotate(${heading}deg); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 12px solid #3b82f6;"></div>`
                         : ""
                     }
                   </div>
                 </div>
               </div>`,
        className: "custom-user-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // Tampilkan marker user di map jika userLocation ada
    useEffect(() => {
      const map = leafletMapRef.current;
      if (!map) return;

      if (userLocation) {
        const heading = (userLocation as any).heading || userHeading;

        // Jika marker sudah ada, update posisinya
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(userLocation);
          userMarkerRef.current.setIcon(createUserMarkerIcon(heading));
          console.log(
            "📍 GPS marker updated to:",
            [userLocation.lat, userLocation.lng],
            "heading:",
            heading
          );
        } else {
          // Buat marker baru jika belum ada
          const marker = L.marker(userLocation, {
            icon: createUserMarkerIcon(heading),
            title: "Lokasi Saya",
          });
          marker.addTo(map).bindPopup("Lokasi Saya");
          userMarkerRef.current = marker;
          console.log(
            "📍 GPS marker created at:",
            [userLocation.lat, userLocation.lng],
            "heading:",
            heading
          );
        }
      } else {
        // Hapus marker jika tidak ada lokasi
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
          userMarkerRef.current = null;
          console.log("📍 GPS marker removed");
        }
      }

      // Cleanup
      return () => {
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
          userMarkerRef.current = null;
        }
      };
    }, [userLocation, userHeading]);

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
    const { addRouteLine, removeRouteLine } = useRouteDrawing(
      leafletMapRef as any
    );
    useEffect(() => {
      const map = leafletMapRef.current;
      if (!map) return;
      if (routeLineRef.current) {
        removeRouteLine(routeLineRef.current);
        routeLineRef.current = null;
      }
      // Cek: jika userLocation & searchText & searchResults.length==1 (hasil dipilih)
      if (userLocation && searchText && searchResults.length === 1) {
        const feature = searchResults[0];
        const [lat, lng] = getFeatureCentroid(feature);
        const line = addRouteLine(
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
        routeLineRef.current = line as any;
      }
      // Cleanup
      return () => {
        if (routeLineRef.current) {
          removeRouteLine(routeLineRef.current);
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

        // Reset search highlight saat modal ditutup
        if (searchHighlightedId) {
          resetBangunanHighlight();
          setSearchHighlightedId(null);
        }
      }, 300); // durasi animasi fade
    };

    // Fungsi untuk handle edit nama bangunan
    const handleEditName = () => {
      if (!selectedFeature?.properties?.nama) return;

      // Cek apakah user sudah login
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification(
          "error",
          "Akses Ditolak",
          "Anda harus login terlebih dahulu untuk mengedit bangunan."
        );
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
        showNotification(
          "error",
          "Akses Ditolak",
          "Anda harus login terlebih dahulu untuk mengedit bangunan."
        );
        return;
      }

      setSelectedFile(null);
      setIsEditingThumbnail(true);
    };

    // Fungsi untuk handle edit interaksi
    const handleEditInteraksi = () => {
      if (!selectedFeature?.properties?.nama) return;

      // Cek apakah user sudah login
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification(
          "error",
          "Akses Ditolak",
          "Anda harus login terlebih dahulu untuk mengedit bangunan."
        );
        return;
      }

      setIsEditingInteraksi(true);
      const currentInteraksi =
        selectedFeature?.properties?.interaksi || "Noninteraktif";
      setEditInteraksi(currentInteraksi);
    };

    // Fungsi untuk handle edit lantai
    const handleEditLantai = async () => {
      if (!selectedFeature?.properties?.id) return;

      // Cek apakah user sudah login
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification(
          "error",
          "Akses Ditolak",
          "Anda harus login terlebih dahulu untuk mengedit lantai."
        );
        return;
      }

      try {
        // Ambil data lantai gambar yang sudah ada
        const data = await getLantaiGambarByBangunan(
          Number(selectedFeature.properties.id),
          token
        );
        setLantaiGambarData(data || []);

        // Reset state
        setLantaiFiles({});
        setLantaiPreviewUrls({});
        setSelectedLantaiFilter(1); // Reset filter ke lantai pertama
        setEditLantaiCount(selectedFeature.properties.lantai || 1);
        setIsEditingLantai(true);
      } catch (error) {
        setLantaiGambarData([]);
        setIsEditingLantai(true);
      }
    };

    // Fungsi untuk simpan gambar lantai individual
    const handleSaveLantaiImage = async (lantaiNumber: number) => {
      try {
        const file = lantaiFiles[lantaiNumber];
        if (!file) {
          showNotification(
            "error",
            "Error",
            "Tidak ada file yang dipilih untuk lantai ini!"
          );
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          showNotification(
            "error",
            "Token Error",
            "Token tidak ditemukan. Silakan login ulang."
          );
          return;
        }

        const formData = new FormData();
        formData.append("gambar_lantai", file);
        formData.append("nomor_lantai", lantaiNumber.toString());
        formData.append("id_bangunan", String(selectedFeature?.properties?.id));

        await createLantaiGambar(
          {
            file,
            lantaiNumber,
            bangunanId: Number(selectedFeature?.properties?.id),
          },
          token
        );

        // Refresh data lantai gambar
        if (selectedFeature?.properties?.id) {
          const data = await getLantaiGambarByBangunan(
            Number(selectedFeature.properties.id),
            token
          );
          setLantaiGambarData(data || []);
        }

        // Hapus file dari state setelah berhasil disimpan
        setLantaiFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[lantaiNumber];
          return newFiles;
        });
        setLantaiPreviewUrls((prev) => {
          const newUrls = { ...prev };
          if (newUrls[lantaiNumber]) {
            URL.revokeObjectURL(newUrls[lantaiNumber]!);
            delete newUrls[lantaiNumber];
          }
          return newUrls;
        });

        showNotification(
          "success",
          "Berhasil",
          `Gambar lantai ${lantaiNumber} berhasil disimpan!`
        );
      } catch (error) {
        showNotification(
          "error",
          "Gagal",
          "Gagal menyimpan gambar lantai. Silakan coba lagi."
        );
      }
    };

    // Fungsi untuk hapus gambar lantai
    const handleDeleteLantaiImage = async (lantaiGambarId: number) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification(
            "error",
            "Token Error",
            "Token tidak ditemukan. Silakan login ulang."
          );
          return;
        }

        await deleteLantaiGambar(lantaiGambarId, token);

        // Refresh data lantai gambar
        if (selectedFeature?.properties?.id) {
          const lantaiData = await getLantaiGambarByBangunan(
            Number(selectedFeature.properties.id)
          );
          setLantaiGambarData(lantaiData || []);
        }

        showNotification(
          "success",
          "Berhasil dihapus",
          "Gambar lantai berhasil dihapus!"
        );
      } catch (error) {
        showNotification(
          "error",
          "Gagal dihapus",
          "Gagal menghapus gambar lantai: " + (error as Error).message
        );
      }
    };

    // Auth helpers dipindahkan ke lib

    // Fungsi untuk save ruangan
    const handleSaveRuangan = async () => {
      if (!selectedFeature?.properties?.id || !ruanganForm.nama_ruangan.trim())
        return;

      setIsSaving(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification(
            "error",
            "Token Error",
            "Token tidak ditemukan. Silakan login ulang."
          );
          return;
        }

        // Check if token is expired
        if (!validateToken(token)) {
          return;
        }

        const ruanganData = {
          nama_ruangan: ruanganForm.nama_ruangan.trim(),
          nomor_lantai: ruanganForm.nomor_lantai,
          id_bangunan: selectedFeature.properties.id,
          nama_jurusan: ruanganForm.nama_jurusan,
          nama_prodi: ruanganForm.nama_prodi,
          pin_style: ruanganForm.pin_style,
          posisi_x: ruanganForm.posisi_x,
          posisi_y: ruanganForm.posisi_y,
        };

        await createRuangan(ruanganData, token);

        // Reset form
        setRuanganForm({
          nama_ruangan: "",
          nomor_lantai: 1,
          nama_jurusan: "",
          nama_prodi: "",
          pin_style: "default",
          posisi_x: null,
          posisi_y: null,
        });
        setShowRuanganModal(false);

        showNotification(
          "success",
          "Berhasil dibuat",
          "Ruangan berhasil dibuat!"
        );
      } catch (error) {
        showNotification(
          "error",
          "Gagal dibuat",
          "Gagal membuat ruangan: " + (error as Error).message
        );
      } finally {
        setIsSaving(false);
      }
    };

    // Fungsi untuk fetch ruangan berdasarkan bangunan
    const fetchRuanganByBangunan = async (idBangunan: number) => {
      try {
        const data = await getRuanganByBangunan(idBangunan);

        // Convert object to array
        const ruanganArray: any[] = [];
        Object.keys(data).forEach((lantai) => {
          data[lantai].forEach((ruangan: any) => {
            ruanganArray.push(ruangan);
          });
        });

        setRuanganList(ruanganArray);
        return ruanganArray;
      } catch (error) {
        showNotification(
          "error",
          "Gagal mengambil data",
          "Gagal mengambil data ruangan: " + (error as Error).message
        );
        return [];
      }
    };

    // Fungsi untuk membuka modal edit ruangan
    const handleEditRuangan = async () => {
      if (!selectedFeature?.properties?.id) return;

      // Tutup modal edit lantai jika sedang terbuka
      if (
        isEditingLantai ||
        isEditingLantaiCount ||
        isEditingInteraksi ||
        isEditingName
      ) {
        handleCancelEdit();
      }

      try {
        await fetchRuanganByBangunan(Number(selectedFeature.properties.id));
        setShowEditRuanganModal(true);
      } catch (error) {}
    };

    // Fungsi untuk memilih ruangan untuk diedit
    const handleSelectRuanganForEdit = (ruangan: any) => {
      setSelectedRuanganForEdit(ruangan);
      setRuanganForm({
        nama_ruangan: ruangan.nama_ruangan,
        nomor_lantai: ruangan.nomor_lantai,
        nama_jurusan: ruangan.nama_jurusan || "",
        nama_prodi: ruangan.nama_prodi || "",
        pin_style: ruangan.pin_style || "default",
        posisi_x: ruangan.posisi_x,
        posisi_y: ruangan.posisi_y,
      });
      setSelectedLantaiForRuangan(ruangan.nomor_lantai);
      setShowEditRuanganModal(false);
      setShowRuanganModal(true);
    };

    // Fungsi untuk update ruangan
    const handleUpdateRuangan = async () => {
      if (
        !selectedRuanganForEdit?.id_ruangan ||
        !ruanganForm.nama_ruangan.trim()
      )
        return;

      setIsSaving(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification(
            "error",
            "Token Error",
            "Token tidak ditemukan. Silakan login ulang."
          );
          return;
        }

        // Check if token is expired
        if (!validateToken(token)) {
          return;
        }

        const ruanganData = {
          nama_ruangan: ruanganForm.nama_ruangan.trim(),
          nomor_lantai: ruanganForm.nomor_lantai,
          nama_jurusan: ruanganForm.nama_jurusan,
          nama_prodi: ruanganForm.nama_prodi,
          pin_style: ruanganForm.pin_style,
          posisi_x: ruanganForm.posisi_x,
          posisi_y: ruanganForm.posisi_y,
        };

        await updateRuangan(
          selectedRuanganForEdit.id_ruangan,
          ruanganData,
          token
        );

        // Reset form dan modal
        setRuanganForm({
          nama_ruangan: "",
          nomor_lantai: 1,
          nama_jurusan: "",
          nama_prodi: "",
          pin_style: "default",
          posisi_x: null,
          posisi_y: null,
        });
        setSelectedRuanganForEdit(null);
        setShowRuanganModal(false);

        showNotification(
          "success",
          "Berhasil diperbarui",
          "Ruangan berhasil diperbarui!"
        );
      } catch (error) {
        showNotification(
          "error",
          "Gagal diperbarui",
          "Gagal memperbarui ruangan: " + (error as Error).message
        );
      } finally {
        setIsSaving(false);
      }
    };

    // Fungsi untuk save edit
    const handleSaveEdit = async () => {
      if (!selectedFeature?.properties?.id) return;

      // Validasi untuk edit nama dan interaksi (opsional)
      // Removed required validation - fields can now be empty

      // Debug logging untuk troubleshooting

      setIsSaving(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification(
            "error",
            "Token Error",
            "Token tidak ditemukan. Silakan login ulang."
          );
          return;
        }

        // Handle edit nama dan interaksi (optional) - combined in one request
        if (isEditingName || isEditingInteraksi) {
          const updateData: any = {};

          if (isEditingName) {
            updateData.nama = editName.trim() || undefined;
          }

          if (isEditingInteraksi) {
            // Pastikan editInteraksi tidak kosong jika user sudah memilih nilai
            if (editInteraksi && editInteraksi.trim() !== "") {
              updateData.interaksi = editInteraksi;
            } else {
              // Jika kosong, gunakan nilai default "Noninteraktif"
              updateData.interaksi = "Noninteraktif";
            }
          }

          await updateBangunan(
            selectedFeature.properties.id,
            updateData,
            token
          );

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

          const result = await uploadBangunanThumbnail(
            Number(selectedFeature.properties.id),
            selectedFile,
            token
          );

          // Update local state
          if (selectedFeature) {
            selectedFeature.properties = {
              ...selectedFeature.properties,
              thumbnail: result.thumbnailPath,
            };
          }
        }

        // Handle update jumlah lantai

        if (
          isEditingLantaiCount &&
          editLantaiCount !== selectedFeature.properties.lantai
        ) {
          const updateData = { lantai: editLantaiCount };

          await updateBangunan(
            Number(selectedFeature.properties.id),
            updateData,
            token
          );

          // Update local state
          if (selectedFeature) {
            selectedFeature.properties = {
              ...selectedFeature.properties,
              ...updateData,
            };
          }
        }

        // Handle upload lantai - removed karena sekarang menggunakan tombol simpan individual
        // Upload lantai gambar sekarang ditangani oleh handleSaveLantaiImage

        // Reset edit mode
        setIsEditingName(false);
        setIsEditingThumbnail(false);
        setIsEditingLantai(false);
        setIsEditingLantaiCount(false);
        setIsEditingInteraksi(false);
        setEditName("");
        setEditLantaiCount(1);
        setEditInteraksi("");
        setSelectedFile(null);
        setLantaiFiles({});
        // Clean up file preview URLs
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
          setFilePreviewUrl(null);
        }
        // Clean up lantai preview URLs
        Object.values(lantaiPreviewUrls).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        setLantaiPreviewUrls({});

        // Tampilkan notifikasi yang lebih spesifik
        if (isEditingLantaiCount) {
          showNotification(
            "success",
            "Berhasil diperbarui",
            `Jumlah lantai berhasil diubah menjadi ${editLantaiCount} lantai!`
          );
        } else {
          showNotification(
            "success",
            "Berhasil diperbarui",
            "Berhasil menyimpan perubahan!"
          );
        }

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
        showNotification(
          "error",
          "Gagal diperbarui",
          "Gagal menyimpan perubahan. Silakan coba lagi."
        );
      } finally {
        setIsSaving(false);
      }
    };

    // Fungsi untuk cancel edit
    const handleCancelEdit = () => {
      setIsEditingName(false);
      setIsEditingThumbnail(false);
      setIsEditingLantai(false);
      setIsEditingLantaiCount(false);
      setIsEditingInteraksi(false);
      setEditName("");
      setEditLantaiCount(1);
      setEditInteraksi("");
      setSelectedFile(null);
      setLantaiFiles({});
      // Clean up file preview URL
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      // Clean up lantai preview URLs
      Object.values(lantaiPreviewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      setLantaiPreviewUrls({});
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
        // Implementation

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

        // Reset search highlight jika ada card detail yang aktif
        if (searchHighlightedId) {
          setSearchHighlightedId(null);
        }
      } else if (!cardVisible && searchHighlightedId) {
        // Jika card ditutup dan ada search highlight, biarkan highlight tetap
        // Highlight akan di-reset saat ada pencarian baru atau highlight baru
      }
    }, [cardVisible, selectedFeature, searchHighlightedId]);

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

    // findConnectedGates dipindahkan ke ../lib/routing

    // debugGraphConnectivity dipindahkan ke ../lib/routing

    // findAllRoutesToBuilding dipindahkan ke ../lib/routing

    // getRealWorldRoute dipindahkan ke src/lib/routing.ts

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

      // Jangan hapus jalur utama saat berpindah step
      // (hapus hanya highlight step jika digunakan)
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

        // Zoom ke posisi marker dengan smooth dan tahan di tengah ketika zooming
        isZoomingRef.current = true;
        map.setView(markerPosition, 19, { animate: true, duration: 0.8 });
        map.once("moveend", () => {
          isZoomingRef.current = false;
        });

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
            routePane.style.zIndex = "650"; // Di atas overlay biasa, di bawah marker (>= 650)
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
      if (!isGpsRecalcRef.current) {
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
      }

      // Titik awal
      if (routeStartType === "my-location") {
        setIsGettingLocation(true);
        try {
          const coords = await getCurrentLocation();
          setIsGettingLocation(false);
          startLatLng = coords;

          // Tambahkan pengecekan apakah user di dalam kampus
          const isInsideCampus = isUserInsideCampus(coords[0], coords[1]);
          if (isInsideCampus) {
            // Routing langsung ke tujuan tanpa gerbang
            if (!endLatLng) {
              showNotification("error", "Error", "Titik tujuan tidak valid.");
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
                if (!isGpsRecalcRef.current) {
                  leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                    padding: [40, 40],
                    maxZoom: 19,
                    animate: true,
                    duration: 1.5,
                  });
                }
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
              showNotification(
                "error",
                "Rute Tidak Ditemukan",
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
          showNotification(
            "error",
            "Error",
            `Titik awal dengan ID ${routeStartId} tidak ditemukan.`
          );
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
          showNotification(
            "error",
            "Error",
            `Bangunan dengan ID ${routeStartType} tidak ditemukan.`
          );
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
          showNotification(
            "error",
            "Error",
            `Bangunan dengan ID ${routeEndId} tidak ditemukan.`
          );
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
          showNotification(
            "error",
            "Error",
            `Titik tujuan "${routeEndSearchText}" tidak ditemukan.`
          );
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
        showNotification(
          "error",
          "Titik Tidak Valid",
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
        showNotification(
          "error",
          "Titik Sama",
          "Titik awal dan tujuan tidak boleh sama. Silakan pilih tujuan yang berbeda."
        );
        setShowRouteModal(false);
        setIsCalculatingRoute(false);
        return;
      }

      // Routing dengan logika khusus untuk "Lokasi Saya"
      if (startLatLng && endLatLng && leafletMapRef.current) {
        if (!isGpsRecalcRef.current && routeLine) {
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
              endLatLng,
              undefined,
              convertTitikToPoints(),
              jalurFeatures,
              titikFeatures
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
                  const line = addRouteLine(
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
                  );
                  setTimeout(() => {
                    removeRouteLine(line as any);
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
                  showNotification(
                    "error",
                    "GPS Error",
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
                  if (!isGpsRecalcRef.current) {
                    leafletMapRef.current.fitBounds(
                      mainRouteLayer.getBounds(),
                      {
                        padding: [60, 60],
                        maxZoom: 17,
                        animate: true,
                        duration: 1.5, // Smooth animation duration
                      }
                    );
                  }
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
                showNotification(
                  "error",
                  "Rute Tidak Ditemukan",
                  "Tidak ditemukan rute dari gerbang terdekat ke tujuan."
                );
                setIsCalculatingRoute(false);
              }
            } else {
              showNotification(
                "error",
                "Gerbang Tidak Ditemukan",
                "Tidak ditemukan gerbang terdekat."
              );
              setIsCalculatingRoute(false);
            }
          } catch (error) {
            console.error("🚨 Error dalam routing my-location:", error);
            showNotification(
              "error",
              "Error Routing",
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
              showNotification(
                "error",
                "Rute Tidak Valid",
                "Tidak ditemukan rute yang valid antara titik awal dan tujuan. Pastikan titik terhubung ke jalur."
              );
            }
          } catch (error) {
            console.error("🚨 Error dalam routing:", error);
            showNotification(
              "error",
              "Error Routing",
              "Terjadi error dalam routing. Silakan coba lagi atau pilih titik yang berbeda."
            );
          }
        }
      }
      setShowRouteModal(false);
      setIsCalculatingRoute(false);
      // reset flag recalc setelah selesai
      isGpsRecalcRef.current = false;
    };

    // Listener untuk GPS updates
    useEffect(() => {
      const handleGpsUpdate = (event: MessageEvent) => {
        if (event.data.type === "gps-updated") {
          console.log("📍 GPS updated, updating marker and route...");

          const newCoords = event.data.coordinates;
          const newHeading = event.data.heading;
          const newLatLng = L.latLng(newCoords[0], newCoords[1]);

          // Update marker GPS secara otomatis jika ada
          if (userMarkerRef.current) {
            const currentLatLng = userMarkerRef.current.getLatLng();
            const distance = currentLatLng.distanceTo(newLatLng);

            // Update marker setiap kali GPS berubah (tanpa batasan jarak)
            userMarkerRef.current.setLatLng(newLatLng);
            userMarkerRef.current.setIcon(createUserMarkerIcon(newHeading));
            console.log(
              "📍 GPS marker automatically updated to:",
              newCoords,
              "heading:",
              newHeading,
              "distance moved:",
              Math.round(distance),
              "meters"
            );
          }

          // Recalculate route HANYA jika navigasi aktif dan start dari GPS
          if (isNavigationActive && routeStartType === "my-location") {
            // tandai recalc dari GPS agar tidak hapus routeLine lebih dulu
            isGpsRecalcRef.current = true;
            setTimeout(() => {
              handleRouteSubmit();
            }, 1000); // Tunggu 1 detik untuk stabilitas
          }
        }
      };

      window.addEventListener("message", handleGpsUpdate);
      return () => {
        window.removeEventListener("message", handleGpsUpdate);
      };
    }, [isNavigationActive, routeStartType, routeSteps.length]);

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
          showNotification(
            "error",
            "Error",
            `Titik awal dengan ID ${startId} tidak ditemukan.`
          );
          setIsCalculatingRoute(false);
          return;
        }
      } else if (startType) {
        const bangunanCentroid = getCentroidById("bangunan", startType);
        if (bangunanCentroid) {
          startLatLng = bangunanCentroid as [number, number];
        } else {
          console.error(`❌ Bangunan dengan ID ${startType} tidak ditemukan.`);
          showNotification(
            "error",
            "Error",
            `Bangunan dengan ID ${startType} tidak ditemukan.`
          );
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
          showNotification(
            "error",
            "Error",
            `Bangunan dengan ID ${endId} tidak ditemukan.`
          );
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
        showNotification(
          "error",
          "Titik Tidak Valid",
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
            buildingName,
            convertTitikToPoints(),
            jalurFeatures,
            titikFeatures
          );

          if (
            gateInfo &&
            gateInfo.bestRoute &&
            gateInfo.bestRoute.gate &&
            gateInfo.bestRoute.gate.geometry &&
            gateInfo.bestRoute.gate.geometry.coordinates &&
            Array.isArray(gateInfo.bestRoute.gate.geometry.coordinates) &&
            gateInfo.bestRoute.gate.geometry.coordinates.length >= 2
          ) {
            const bestGateInfo = gateInfo.bestRoute;
            const allRoutes = gateInfo.allRoutes;

            // Validasi koordinat gerbang
            const gateCoordsRaw = bestGateInfo.gate.geometry.coordinates;
            if (!Array.isArray(gateCoordsRaw) || gateCoordsRaw.length < 2) {
              console.error("❌ Koordinat gerbang tidak valid:", gateCoordsRaw);
              showNotification(
                "error",
                "Error",
                "Koordinat gerbang tidak valid. Silakan coba lagi."
              );
              setIsCalculatingRoute(false);
              return;
            }

            const gateCoords: [number, number] = [
              gateCoordsRaw[1],
              gateCoordsRaw[0],
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
                const line = addRouteLine(
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
                );
                setTimeout(() => removeRouteLine(line as any), 10000);
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

              console.log(
                `🎯 Rute terbaik: ${bestGateInfo.gateName} → ${
                  bestGateInfo.targetPoint?.name || "Unknown"
                }`
              );
              console.log(`📏 Total distance: ${Math.round(totalDistance)}m`);
              console.log(`🛣️ Segments: ${finalRouteSegments.length}`);

              console.log(
                "🛣️ Membuat GeoJSON layer dengan segments:",
                finalRouteSegments.length
              );
              console.log(
                "🛣️ Segments:",
                finalRouteSegments.map(
                  (seg, idx) => `${idx + 1}. ID: ${seg.id || "unknown"}`
                )
              );

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
                console.log("🗺️ Menambahkan layer ke map");
                geoJsonLayer.addTo(leafletMapRef.current);

                try {
                  const bounds = geoJsonLayer.getBounds();
                  console.log("🗺️ Bounds:", bounds);
                  leafletMapRef.current.fitBounds(bounds, {
                    padding: [60, 60],
                    maxZoom: 17,
                    animate: true,
                    duration: 1.5, // Smooth animation duration
                  });
                  console.log("🗺️ Map berhasil di-fit ke bounds");
                } catch (error) {
                  console.error("❌ Error fitting bounds:", error);
                }
              } else {
                console.error("❌ leafletMapRef.current is null");
              }

              setRouteLine(geoJsonLayer);
              console.log("✅ Route line berhasil diset");

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

              // PERBAIKAN: Tampilkan jalur saja tanpa instruksi navigasi terlebih dahulu
              console.log(
                "🎯 Menampilkan jalur di map tanpa instruksi navigasi"
              );

              // Set route steps tapi jangan aktifkan navigasi
              setRouteSteps(
                parseRouteSteps(finalRouteSegments, startLatLng, endLatLng)
              );
              setActiveStepIndex(-1); // Nonaktifkan navigasi
            } else {
              console.log("❌ Tidak ditemukan rute dari gerbang ke tujuan");
              showNotification(
                "error",
                "Rute Tidak Ditemukan",
                "Tidak ditemukan rute dari gerbang ke tujuan. Silakan coba lokasi lain."
              );
              setIsCalculatingRoute(false);
              return;
            }
          } else {
            console.log("❌ Tidak ada gerbang yang terhubung ke tujuan");
            showNotification(
              "error",
              "Tidak Ada Rute",
              "Tidak ada gerbang yang terhubung ke tujuan. Silakan coba lokasi lain."
            );
            setIsCalculatingRoute(false);
            return;
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

            // PERBAIKAN: Tampilkan jalur saja tanpa instruksi navigasi
            console.log(
              "🎯 Menampilkan jalur di map tanpa instruksi navigasi (routing biasa)"
            );
            setRouteSteps(
              parseRouteSteps(
                routeResult.geojsonSegments,
                startLatLng,
                endLatLng,
                transportMode
              )
            );
            setActiveStepIndex(-1); // Nonaktifkan navigasi
          } else {
            showNotification(
              "error",
              "Rute Tidak Valid",
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
            routePane.style.zIndex = "650"; // Konsisten di atas overlay
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
        style={{
          minHeight: 350,
          touchAction: "none", // Prevent default touch behaviors
        }}
      >
        <MapControlsPanel
          isDark={!!isDark}
          isLiveTracking={!!isLiveTracking}
          isSatellite={!!isSatellite}
          layerVisible={!!layerVisible}
          onZoomIn={() => {
            const map = leafletMapRef.current;
            if (map) map.setZoom(Math.min(map.getZoom() + 1, 19));
          }}
          onZoomOut={() => {
            const map = leafletMapRef.current;
            if (map) map.setZoom(Math.max(map.getZoom() - 1, map.getMinZoom()));
          }}
          onReset={handleResetZoom}
          onLocateMe={handleLocateMe}
          onToggleLayer={handleToggleLayer}
          onToggleBasemap={handleToggleBasemap}
          searchText={searchText}
          onSearchTextChange={(value) => {
            setSearchText(value);
            setShowSearchResults(true);
            if (value.trim() === "" && searchHighlightedId) {
              resetBangunanHighlight();
              setSearchHighlightedId(null);
            }
          }}
          showSearchResults={showSearchResults}
          onToggleSearchResults={(show) => setShowSearchResults(show)}
          isLoadingData={isLoadingData}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult as any}
          isHighlightActive={!!isHighlightActive}
        />

        <Navigation
          isDark={!!isDark}
          isMobile={!!isMobile}
          routeSteps={routeSteps as any}
          activeStepIndex={activeStepIndex}
          hasReachedDestination={!!hasReachedDestination}
          routeDistance={routeDistance}
          totalWalkingTime={totalWalkingTime}
          totalVehicleTime={totalVehicleTime}
          transportMode={transportMode as any}
          showStartButton={routeSteps.length > 0 && activeStepIndex === -1}
          onStart={() => setActiveStepIndex(0)}
          onClose={() => {
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
            if (navigationMarkerRef.current && leafletMapRef.current) {
              leafletMapRef.current.removeLayer(navigationMarkerRef.current);
              navigationMarkerRef.current = null;
            }
            if (selectedFeature && selectedFeature.properties?.id) {
              setIsHighlightActive(true);
              const bangunanLayer = bangunanLayerRef.current;
              if (bangunanLayer) {
                bangunanLayer.eachLayer((layer: L.Layer) => {
                  if (
                    (layer as any).feature &&
                    (layer as any).feature.geometry &&
                    (layer as any).feature.geometry.type === "Polygon" &&
                    (layer as any).feature.properties?.id ===
                      Number(selectedFeature.properties.id)
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
              if (leafletMapRef.current && selectedFeature.geometry) {
                const centroid = getFeatureCentroid(selectedFeature);
                const currentZoom = leafletMapRef.current.getZoom();
                leafletMapRef.current.setView(centroid, currentZoom, {
                  animate: true,
                  duration: 1,
                });
              }
            }
            if (isMobile && selectedFeature) {
              setCardVisible(true);
              setTimeout(() => setCardAnimation(true), 50);
            }
          }}
          onPrev={() => {
            if (hasReachedDestination) setHasReachedDestination(false);
            else if (activeStepIndex > 0)
              setActiveStepIndex(activeStepIndex - 1);
          }}
          onNext={() => {
            if (activeStepIndex < routeSteps.length - 1)
              setActiveStepIndex(activeStepIndex + 1);
            else if (
              activeStepIndex === routeSteps.length - 1 &&
              !hasReachedDestination
            )
              setHasReachedDestination(true);
          }}
        />

        {/* Panel navigasi digabung menjadi satu komponen */}

        {/* Kontrol peta disatukan dalam MapControlsPanel */}

        {/* Sidebar Gedung (floating card kanan atas) - Mobile Responsive */}
        {selectedFeature && cardVisible && (
          <BuildingDetailModal
            isDark={!!isDark}
            isDashboard={!!isDashboard}
            isLoggedIn={isLoggedIn}
            selectedFeature={selectedFeature}
            isContainerShaking={isContainerShaking}
            onClose={() => {
              setCardVisible(false);
              setIsHighlightActive(false);
              setIsEditingName(false);
              setIsEditingThumbnail(false);
              setIsEditingInteraksi(false);
              setEditName("");
              setEditThumbnail("");
              setEditInteraksi("");
              // Hapus highlight seperti saat klik bangunan (prioritas ke yang sedang ditampilkan)
              if (selectedFeature?.properties?.id) {
                clearBangunanHighlightById(selectedFeature.properties.id);
              }
              if (searchHighlightedId) {
                resetBangunanHighlight();
                setSearchHighlightedId(null);
              }
              if (isNavigationActive) {
                setRouteSteps([]);
                setActiveStepIndex(0);
                setHasReachedDestination(false);
                setIsNavigationActive(false);
                if (routeLine && leafletMapRef.current) {
                  leafletMapRef.current.removeLayer(routeLine);
                  setRouteLine(null);
                }
                if (navigationMarkerRef.current && leafletMapRef.current) {
                  leafletMapRef.current.removeLayer(
                    navigationMarkerRef.current
                  );
                  navigationMarkerRef.current = null;
                }
              }
              // Pastikan style layer bangunan kembali default
              if (bangunanLayerRef.current) {
                bangunanLayerRef.current.resetStyle();
              }
              setTimeout(() => setSelectedFeature(null), 350);
            }}
            onOpenDetail={() => openBuildingDetailModal()}
            onEditThumbnail={handleEditThumbnail}
            onEditLantai={handleEditLantai}
            onSetRouteToBuilding={() => {
              setRouteEndType("bangunan");
              setRouteEndId(String(selectedFeature.properties.id ?? ""));
              setTimeout(() => setShowRouteModal(true), 10);
            }}
          />
        )}

        {/* Modal Edit Bangunan */}
        {(isEditingName ||
          isEditingThumbnail ||
          isEditingLantai ||
          isEditingLantaiCount ||
          isEditingInteraksi) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              data-modal="edit-modal"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit{" "}
                  {isEditingName && isEditingInteraksi
                    ? "Nama & Interaksi"
                    : isEditingName
                    ? "Nama"
                    : isEditingThumbnail
                    ? "Thumbnail"
                    : isEditingLantaiCount
                    ? "Jumlah Lantai"
                    : isEditingInteraksi
                    ? "Interaksi"
                    : "Lantai"}{" "}
                  Bangunan
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="space-y-4">
                {isEditingThumbnail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Thumbnail Baru
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
                            // Create preview URL for the selected file
                            const url = URL.createObjectURL(file);
                            setFilePreviewUrl(url);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />

                      {/* Preview file yang dipilih */}
                      {selectedFile && filePreviewUrl && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={filePreviewUrl}
                              alt="File preview"
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
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
                              onClick={() => {
                                setSelectedFile(null);
                                setFilePreviewUrl(null);
                                if (filePreviewUrl) {
                                  URL.revokeObjectURL(filePreviewUrl);
                                }
                              }}
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
                            src={`${
                              selectedFeature?.properties?.thumbnail?.startsWith(
                                "http"
                              )
                                ? ""
                                : "/"
                            }${
                              selectedFeature?.properties?.thumbnail
                            }?v=${Date.now()}`}
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

                {isEditingName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Bangunan
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Masukkan nama bangunan"
                      autoFocus
                    />
                    {/* Validation message removed - nama is now optional */}
                  </div>
                )}

                {isEditingInteraksi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status Interaksi
                    </label>
                    <select
                      value={editInteraksi}
                      onChange={(e) => setEditInteraksi(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Interaktif">Interaktif</option>
                      <option value="Noninteraktif">Noninteraktif</option>
                    </select>
                    {/* Validation message removed - interaksi is now optional */}
                  </div>
                )}

                {isEditingLantai && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Edit Lantai Bangunan -{" "}
                          {selectedFeature?.properties?.lantai || 0} Lantai
                        </label>
                        {/* Filter Lantai */}
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-gray-600 dark:text-gray-400">
                            Filter Lantai:
                          </label>
                          <select
                            value={selectedLantaiFilter}
                            onChange={(e) =>
                              setSelectedLantaiFilter(parseInt(e.target.value))
                            }
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary"
                          >
                            {Array.from(
                              {
                                length:
                                  selectedFeature?.properties?.lantai || 0,
                              },
                              (_, index) => (
                                <option key={index + 1} value={index + 1}>
                                  Lantai {index + 1}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditingLantaiCount(true)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors flex items-center gap-1"
                        title="Atur Jumlah Lantai"
                      >
                        <i className="fas fa-cog text-xs"></i>
                        Atur Lantai
                      </button>
                    </div>
                    {!isEditingLantaiCount && (
                      <>
                        <div className="mb-4">
                          {Array.from(
                            {
                              length: selectedFeature?.properties?.lantai || 0,
                            },
                            (_, index) => {
                              const lantaiNumber = index + 1;

                              // Hanya tampilkan lantai yang dipilih
                              if (lantaiNumber !== selectedLantaiFilter) {
                                return null;
                              }

                              const existingLantai = lantaiGambarData.find(
                                (l) => {
                                  // Extract nomor lantai from nama_file (e.g., "Lt1.svg" -> 1)
                                  const match =
                                    l.nama_file.match(/Lt(\d+)\.svg/i);
                                  const extractedNumber = match
                                    ? parseInt(match[1])
                                    : null;
                                  return extractedNumber === lantaiNumber;
                                }
                              );

                              const hasFile = lantaiFiles[lantaiNumber];
                              const previewUrl =
                                lantaiPreviewUrls[lantaiNumber];

                              return (
                                <div
                                  key={lantaiNumber}
                                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 max-w-2xl mx-auto"
                                >
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Lantai {lantaiNumber}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        {existingLantai && (
                                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                            <i className="fas fa-check mr-1"></i>
                                            Ada Gambar
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Tampilkan gambar SVG yang sudah ada jika tersedia */}
                                    {existingLantai && (
                                      <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                          Gambar saat ini:
                                        </p>
                                        <div className="relative group">
                                          <div
                                            className="cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all duration-200"
                                            onClick={() => {
                                              // Fancybox preview
                                              const img = new Image();
                                              img.src = `${
                                                existingLantai.path_file.startsWith(
                                                  "http"
                                                )
                                                  ? ""
                                                  : "/"
                                              }${
                                                existingLantai.path_file
                                              }?v=${Date.now()}`;
                                              img.onload = () => {
                                                const modal =
                                                  document.createElement("div");
                                                modal.className =
                                                  "fixed inset-0 bg-black/80 flex items-center justify-center z-[9999999] cursor-pointer";
                                                modal.onclick = () =>
                                                  modal.remove();

                                                const imgContainer =
                                                  document.createElement("div");
                                                imgContainer.className =
                                                  "max-w-4xl max-h-[90vh] p-4";
                                                imgContainer.onclick = (e) =>
                                                  e.stopPropagation();

                                                const previewImg =
                                                  document.createElement("img");
                                                previewImg.src = img.src;
                                                previewImg.className =
                                                  "w-full h-full object-contain rounded-lg";
                                                previewImg.alt = `Lantai ${lantaiNumber}`;

                                                const closeBtn =
                                                  document.createElement(
                                                    "button"
                                                  );
                                                closeBtn.className =
                                                  "absolute top-4 right-4 text-white text-2xl hover:text-gray-300";
                                                closeBtn.innerHTML = "×";
                                                closeBtn.onclick = () =>
                                                  modal.remove();

                                                imgContainer.appendChild(
                                                  previewImg
                                                );
                                                modal.appendChild(imgContainer);
                                                modal.appendChild(closeBtn);
                                                document.body.appendChild(
                                                  modal
                                                );
                                              };
                                            }}
                                          >
                                            <img
                                              src={`${
                                                existingLantai.path_file.startsWith(
                                                  "http"
                                                )
                                                  ? ""
                                                  : "/"
                                              }${
                                                existingLantai.path_file
                                              }?v=${Date.now()}`}
                                              alt={`Lantai ${lantaiNumber}`}
                                              className="w-full h-32 object-contain bg-gray-50 dark:bg-gray-700 group-hover:scale-105 transition-transform duration-200"
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.style.display = "none";
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <i className="fas fa-search-plus text-white text-2xl"></i>
                                              </div>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() =>
                                              handleDeleteLantaiImage(
                                                existingLantai.id_lantai_gambar
                                              )
                                            }
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors shadow-lg"
                                            title="Hapus gambar lantai"
                                          >
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {hasFile && previewUrl && (
                                      <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                          Preview file baru:
                                        </p>
                                        <div className="relative group">
                                          <div className="overflow-hidden rounded-lg border-2 border-blue-200 dark:border-blue-600">
                                            <img
                                              src={previewUrl}
                                              alt={`Preview Lantai ${lantaiNumber}`}
                                              className="w-full h-32 object-contain bg-gray-50 dark:bg-gray-700"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {!existingLantai && !hasFile && (
                                      <div className="mb-4">
                                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                          <div className="text-center">
                                            <i className="fas fa-image text-gray-400 text-3xl mb-2"></i>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              Belum ada gambar
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                      <input
                                        type="file"
                                        accept=".svg"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setLantaiFiles((prev) => ({
                                              ...prev,
                                              [lantaiNumber]: file,
                                            }));
                                            const url =
                                              URL.createObjectURL(file);
                                            setLantaiPreviewUrls((prev) => ({
                                              ...prev,
                                              [lantaiNumber]: url,
                                            }));
                                          }
                                        }}
                                        className="hidden"
                                        id={`lantai-${lantaiNumber}`}
                                      />
                                      <label
                                        htmlFor={`lantai-${lantaiNumber}`}
                                        className="flex-1 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                      >
                                        <i className="fas fa-upload text-xs"></i>
                                        {hasFile ? "Ganti File" : "Pilih File"}
                                      </label>
                                      {hasFile && (
                                        <>
                                          <button
                                            onClick={() =>
                                              handleSaveLantaiImage(
                                                lantaiNumber
                                              )
                                            }
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            title="Simpan gambar"
                                          >
                                            <i className="fas fa-save text-xs"></i>
                                            Simpan
                                          </button>
                                          <button
                                            onClick={() => {
                                              setLantaiFiles((prev) => {
                                                const newFiles = { ...prev };
                                                delete newFiles[lantaiNumber];
                                                return newFiles;
                                              });
                                              setLantaiPreviewUrls((prev) => {
                                                const newUrls = { ...prev };
                                                if (newUrls[lantaiNumber]) {
                                                  URL.revokeObjectURL(
                                                    newUrls[lantaiNumber]!
                                                  );
                                                  delete newUrls[lantaiNumber];
                                                }
                                                return newUrls;
                                              });
                                            }}
                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                                            title="Hapus file"
                                          >
                                            <i className="fas fa-times"></i>
                                          </button>
                                        </>
                                      )}
                                    </div>

                                    {(hasFile || existingLantai) && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setSelectedLantaiForRuangan(
                                              lantaiNumber
                                            );
                                            setRuanganForm((prev) => ({
                                              ...prev,
                                              nomor_lantai: lantaiNumber,
                                              posisi_x: null,
                                              posisi_y: null,
                                            }));
                                            setShowRuanganModal(true);
                                          }}
                                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                          <i className="fas fa-plus text-xs"></i>
                                          Buat Ruangan
                                        </button>
                                        <button
                                          onClick={handleEditRuangan}
                                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                          title="Edit Ruangan"
                                        >
                                          <i className="fas fa-edit text-xs"></i>
                                          Edit Ruangan
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Format yang didukung: SVG (Maks. 2MB per file)
                        </p>
                      </>
                    )}
                  </div>
                )}

                {isEditingLantaiCount && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Atur Jumlah Lantai
                      </label>
                      <button
                        onClick={() => setIsEditingLantaiCount(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <i className="fas fa-arrow-left text-sm"></i>
                        Kembali
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jumlah Lantai <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={editLantaiCount}
                        onChange={(e) =>
                          setEditLantaiCount(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Masukkan jumlah lantai"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Masukkan jumlah lantai bangunan (1-20)
                      </p>
                      {editLantaiCount <
                        (selectedFeature?.properties?.lantai || 1) && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start">
                            <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2"></i>
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              <p className="font-medium">Peringatan!</p>
                              <p className="mt-1">
                                Mengurangi jumlah lantai dari{" "}
                                {selectedFeature?.properties?.lantai} ke{" "}
                                {editLantaiCount} dapat menghapus data lantai
                                dan ruangan yang ada di lantai{" "}
                                {selectedFeature?.properties?.lantai}.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={(() => {
                      let disabled = isSaving;

                      // Nama and Interaksi are now optional - removed validation
                      // if (isEditingName && !isEditingLantaiCount) {
                      //   disabled = disabled || !editName.trim();
                      // }

                      if (isEditingThumbnail && !isEditingLantaiCount) {
                        disabled = disabled || !selectedFile;
                      }

                      if (isEditingLantai && !isEditingLantaiCount) {
                        // Lantai editing tidak memerlukan validasi khusus karena menggunakan tombol simpan individual
                        // disabled = disabled || false; // Selalu false
                      }

                      if (isEditingLantaiCount) {
                        disabled =
                          disabled ||
                          Number(editLantaiCount) < 1 ||
                          Number(editLantaiCount) > 20;
                      }

                      // Interaksi is now optional - removed validation
                      // if (isEditingInteraksi) {
                      //   disabled = disabled || !editInteraksi;
                      // }

                      // Combined validation for nama and interaksi is now optional
                      // if (isEditingName && isEditingInteraksi) {
                      //   disabled =
                      //     disabled || !editName.trim() || !editInteraksi;
                      // }

                      return disabled;
                    })()}
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

        {/* Modal Buat/Edit Ruangan */}
        <EditRuanganForm
          visible={showRuanganModal}
          isDark={!!isDark}
          selectedRuanganForEdit={selectedRuanganForEdit}
          selectedLantaiForRuangan={selectedLantaiForRuangan}
          ruanganForm={ruanganForm as any}
          maxLantai={selectedFeature?.properties?.lantai || 1}
          isSaving={isSaving}
          onChange={(partial) =>
            setRuanganForm((prev) => ({ ...prev, ...partial }))
          }
          onSave={handleSaveRuangan}
          onUpdate={handleUpdateRuangan}
          onClose={() => setShowRuanganModal(false)}
          onOpenPinPicker={() => setShowPinPositionModal(true)}
        />

        {/* Modal Pilih Posisi Pin */}
        {showPinPositionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999999]">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pilih Posisi Pin - Lantai {selectedLantaiForRuangan}
                </h3>
                <button
                  onClick={() => setShowPinPositionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Instructions - Fixed at top of scrollable area */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-0.5 mr-3 text-lg"></i>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                        Cara Menentukan Posisi Pin
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>
                          • Klik pada gambar lantai di bawah untuk menentukan
                          posisi pin
                        </li>
                        <li>
                          • Pin akan muncul sebagai titik merah dengan koordinat
                        </li>
                        <li>
                          • Posisi ini akan digunakan untuk menampilkan pin di
                          tampilan 3D
                        </li>
                        <li>
                          • Anda dapat mengklik ulang untuk mengubah posisi
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SVG Container dengan click handler */}
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                  {(() => {
                    const existingLantai = lantaiGambarData.find((l) => {
                      const match = l.nama_file.match(/Lt(\d+)\.svg/i);
                      const extractedNumber = match ? parseInt(match[1]) : null;
                      return extractedNumber === selectedLantaiForRuangan;
                    });

                    if (!existingLantai) {
                      return (
                        <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <div className="text-center">
                            <i className="fas fa-exclamation-triangle text-gray-400 text-3xl mb-2"></i>
                            <p className="text-gray-500 dark:text-gray-400">
                              Gambar SVG untuk lantai {selectedLantaiForRuangan}{" "}
                              tidak ditemukan
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="relative">
                        <img
                          src={`${
                            existingLantai.path_file.startsWith("http")
                              ? ""
                              : "/"
                          }${existingLantai.path_file}?v=${Date.now()}`}
                          alt={`Lantai ${selectedLantaiForRuangan}`}
                          className="w-full h-auto cursor-crosshair"
                          onClick={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const x = (
                              ((e.clientX - rect.left) / rect.width) *
                              100
                            ).toFixed(2);
                            const y = (
                              ((e.clientY - rect.top) / rect.height) *
                              100
                            ).toFixed(2);

                            setRuanganForm((prev) => ({
                              ...prev,
                              posisi_x: parseFloat(x),
                              posisi_y: parseFloat(y),
                            }));
                          }}
                        />
                        {ruanganForm.posisi_x && ruanganForm.posisi_y && (
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{
                              left: `${ruanganForm.posisi_x}%`,
                              top: `${ruanganForm.posisi_y}%`,
                            }}
                          >
                            {/* Pin marker dengan animasi */}
                            <div className="relative">
                              <div className="w-6 h-6 bg-red-500 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
                              <div className="w-6 h-6 bg-red-500 border-3 border-white rounded-full absolute top-0 left-0 animate-ping"></div>

                              {/* Tooltip dengan koordinat */}
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10">
                                <div className="font-semibold mb-1">
                                  📍 Pin Posisi
                                </div>
                                <div>X: {ruanganForm.posisi_x}%</div>
                                <div>Y: {ruanganForm.posisi_y}%</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {ruanganForm.posisi_x && ruanganForm.posisi_y && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start">
                      <i className="fas fa-check-circle text-green-600 dark:text-green-400 mr-3 text-lg mt-0.5"></i>
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                          ✅ Posisi Pin Berhasil Ditentukan!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Koordinat pin telah disimpan:{" "}
                          <strong>
                            X = {ruanganForm.posisi_x}%, Y =&nbsp;
                            {ruanganForm.posisi_y}%
                          </strong>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Klik "Konfirmasi Posisi" untuk melanjutkan atau klik
                          ulang pada gambar untuk mengubah posisi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Fixed */}
              <div className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPinPositionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Tutup
                </button>
                {ruanganForm.posisi_x && ruanganForm.posisi_y && (
                  <button
                    onClick={() => setShowPinPositionModal(false)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Konfirmasi Posisi
                  </button>
                )}
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
            touchAction: "none",
            WebkitTouchCallout: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
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

        {/* Custom Notification System */}
        {notification && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] max-w-md w-full mx-4 transition-all duration-500 ${
              notification.visible
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <div
              className={`rounded-lg shadow-lg border-l-4 p-4 flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-red-50 border-red-500 text-red-800"
              }`}
            >
              <div
                className={`text-xl ${
                  notification.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {notification.type === "success" ? (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="animate-pulse"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="animate-pulse"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {notification.title}
                </div>
                <div className="text-xs opacity-90">{notification.message}</div>
              </div>
              <button
                onClick={hideNotification}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Modal Pilih Ruangan untuk Edit */}
        {showEditRuanganModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pilih Ruangan untuk Diedit
                </h3>
                <button
                  onClick={() => setShowEditRuanganModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {ruanganList.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏢</div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Belum Ada Ruangan
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Belum ada ruangan yang dibuat untuk bangunan ini.
                    </p>
                    <button
                      onClick={() => setShowEditRuanganModal(false)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {ruanganList.map((ruangan, index) => (
                        <div
                          key={ruangan.id_ruangan}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => handleSelectRuanganForEdit(ruangan)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {ruangan.nama_ruangan}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Lantai {ruangan.nomor_lantai}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Jurusan:
                                  </span>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {ruangan.nama_jurusan || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Program Studi:
                                  </span>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {ruangan.nama_prodi || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Tipe Pin:
                                  </span>
                                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                                    {ruangan.pin_style?.replace(/_/g, " ") ||
                                      "default"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Posisi Pin:
                                  </span>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {ruangan.posisi_x && ruangan.posisi_y
                                      ? `${ruangan.posisi_x}%, ${ruangan.posisi_y}%`
                                      : "Belum diatur"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <i className="fas fa-chevron-right text-gray-400"></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog */}
        {confirmationDialog && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] transition-all duration-300 ${
              confirmationDialog.visible
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6 text-center transform transition-all duration-300 ${
                confirmationDialog.visible ? "scale-100" : "scale-95"
              }`}
            >
              <div className="text-4xl text-yellow-500 mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {confirmationDialog.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {confirmationDialog.message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={hideConfirmation}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Ya, Lanjutkan
                </button>
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
