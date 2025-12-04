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
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
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
import DrawingSidebar from "./map/LeafletMap/DrawingSidebar";

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
  updateLantaiGambar,
} from "../services/lantaiGambar";
import {
  createRuangan,
  updateRuangan,
  getRuanganByBangunan,
  deleteRuangan,
} from "../services/ruangan";
import { updateBangunan, uploadBangunanThumbnail } from "../services/bangunan";
import { getTitik } from "../services/titik";
import { getJalur } from "../services/jalur";

// Import custom hooks for state & refs management
import { useMapState } from "@/hooks/map/useMapState";
import { useMapRefs } from "@/hooks/map/useMapRefs";

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
  toggleJalurLayer: (show: boolean) => void;
  toggleTitikLayer: (show: boolean) => void;
  toggleBangunanLayer: (show: boolean) => void;
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
    // ==================== INITIALIZE CUSTOM HOOKS ====================
    // Map State Management (75 states organized in 11 categories)
    const mapState = useMapState(isDark);
    const {
      config,
      loading,
      ui,
      animation,
      features,
      routing,
      drawing,
      edit,
      lantai,
      ruangan,
      layerVisibility,
      highlight,
    } = mapState;

    // Map Refs Management (14 refs organized in 4 categories)
    const mapRefs = useMapRefs();

    // ==================== SYNC DRAWING REFS WITH STATE ====================
    // Update refs setiap kali state berubah (for performance optimization)
    useEffect(() => {
      mapRefs.isDrawingEnabledRef.current = drawing.isDrawingEnabled;
      mapRefs.drawingModeRef.current = drawing.drawingMode;
    }, [drawing.isDrawingEnabled, drawing.drawingMode, mapRefs]);

    useEffect(() => {
      mapRefs.isHighlightActiveRef.current = highlight.isHighlightActive;
    }, [highlight.isHighlightActive, mapRefs]);

    useEffect(() => {
      mapRefs.isNavigationActiveRef.current = routing.isNavigationActive;
    }, [routing.isNavigationActive, mapRefs]);

    // ==================== OTHER HOOKS ====================
    const {
      searchText,
      setSearchText,
      showSearchResults,
      setShowSearchResults,
      searchResults,
    } = useFeatureSearch({ 
      bangunanFeatures: features.bangunanFeatures, 
      ruanganFeatures: features.ruanganFeatures 
    });
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
      focusToUserLocation,
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
      hideConfirmation()
    }, [confirmationDialog]);

    // Fungsi untuk membuka modal dengan animasi fade-in
    const openBuildingDetailModal = (selectedRuangan?: FeatureType) => {
      animation.setIsBuildingDetailFadingIn(true);
      ui.setShowBuildingDetailCanvas(true);
      setTimeout(() => {
        animation.setIsBuildingDetailFadingIn(false);
      }, 300); // durasi animasi fade

      // Refresh data lantai setiap kali modal dibuka
      setTimeout(() => {
        refreshLantaiData();
      }, 100);

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
            features.setNonBangunanFeatures([]);
            return;
          }
          const nonBangunan = (data.features || []).filter(
            (f: FeatureType) => f.properties?.kategori !== "Bangunan"
          );
          features.setNonBangunanFeatures(nonBangunan);
        })
        .catch((error) => {
          features.setNonBangunanFeatures([]);
        });
    }, []);

    // Load data bangunan dari API
    useEffect(() => {
      loading.setIsLoadingData(true);
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
            features.setBangunanFeatures([]);
            return;
          }
          features.setBangunanFeatures(data.features || []);
        })
        .catch((error) => {
          // Hapus data dummy, set kosong saja
          features.setBangunanFeatures([]);
        })
        .finally(() => loading.setIsLoadingData(false));
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
            features.setRuanganFeatures([]);
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
          features.setRuanganFeatures(ruanganForSearch);
        })
        .catch((error) => {
          // Hapus data dummy, set kosong saja
          features.setRuanganFeatures([]);
        });
    }, []);

    // Load data titik dari database Railway
    useEffect(() => {
      const fetchTitikData = async () => {
        try {
          const titikData = await getTitik();
          if (titikData && titikData.length > 0) {
            // Convert database data to GeoJSON format for compatibility
            const geoJsonFeatures = titikData.map((titik) => ({
              type: "Feature",
              id: titik.id_titik,
              geometry: JSON.parse(titik.geometri),
              properties: {
                OBJECTID: titik.id_titik,
                Nama: titik.nama,
              },
            }));
            features.setTitikFeatures(geoJsonFeatures);
          } else {
            features.setTitikFeatures([]);
          }
        } catch (error) {
          console.error("Error fetching titik data:", error);
          features.setTitikFeatures([]);
        }
      };

      fetchTitikData();
    }, []);

    // Load data jalur dari database Railway
    useEffect(() => {
      const fetchJalurData = async () => {
        try {
          const jalurData = await getJalur();
          if (jalurData && jalurData.length > 0) {
            // Convert database data to GeoJSON format for compatibility
            const geoJsonFeatures = jalurData.map((jalur) => ({
              type: "Feature",
              id: jalur.id_jalur,
              geometry: JSON.parse(jalur.geometri),
              properties: {
                id: jalur.id_jalur,
                OBJECTID: jalur.id_jalur,
                FID: 0,
                FID_ba_Project: 0,
                Shape_Length: Number(jalur.panjang) || 0,
                panjang: Number(jalur.panjang) || 0,
                Mode: jalur.mode,
                waktu_kaki: Number(jalur.waktu_kaki) || 0,
                waktu_kendara: Number(jalur.waktu_kendara) || 0,
                arah: jalur.arah,
                nama: `Jalur ${jalur.id_jalur}`,
                jenis: "jalur",
                kategori: "Jalur",
              },
            }));
            features.setJalurFeatures(geoJsonFeatures);
          } else {
            features.setJalurFeatures([]);
          }
        } catch (error) {
          console.error("Error fetching jalur data:", error);
          features.setJalurFeatures([]);
        }
      };

      fetchJalurData();
    }, []);

    // Fungsi untuk mengkonversi titik GeoJSON ke format Point
    const convertTitikToPoints = (): Point[] => {
      return features.titikFeatures
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
      if (features.jalurFeatures.length > 0) {
        console.log("Jalur yang tersedia:", features.jalurFeatures.length);
        console.log("Contoh jalur:", features.jalurFeatures[0]);
      }
    }, [features.jalurFeatures]);

    // Handle visibility layer jalur dan titik untuk dashboard admin
    useEffect(() => {
      if (!mapRefs.leafletMapRef.current || !isDashboard) return;

      const map = mapRefs.leafletMapRef.current;

      // Update visibility jalur layer menggunakan ref
      if (mapRefs.jalurLayerRef.current) {
        if (layerVisibility.jalurLayerVisible) {
          if (!map.hasLayer(mapRefs.jalurLayerRef.current)) {
            map.addLayer(mapRefs.jalurLayerRef.current);
          }
        } else {
          if (map.hasLayer(mapRefs.jalurLayerRef.current)) {
            map.removeLayer(mapRefs.jalurLayerRef.current);
          }
          // Marker ujung jalur sudah menjadi bagian dari jalur layer, tidak perlu dikelola secara terpisah
        }
      }

      // Update visibility titik layer menggunakan ref
      if (mapRefs.titikLayerRef.current) {
        if (layerVisibility.titikLayerVisible) {
          if (!map.hasLayer(mapRefs.titikLayerRef.current)) {
            map.addLayer(mapRefs.titikLayerRef.current);
          }
        } else {
          if (map.hasLayer(mapRefs.titikLayerRef.current)) {
            map.removeLayer(mapRefs.titikLayerRef.current);
          }
        }
      }
    }, [layerVisibility.jalurLayerVisible, layerVisibility.titikLayerVisible, isDashboard]);

    // Create layer untuk jalur dan titik ketika data tersedia
    useEffect(() => {
      if (!mapRefs.leafletMapRef.current || !isDashboard) return;

      const map = mapRefs.leafletMapRef.current;

      // Buat layer jalur jika belum ada dan data tersedia
      if (features.jalurFeatures.length > 0 && !mapRefs.jalurLayerRef.current) {
        // Buat layer group untuk jalur dan marker ujung
        const jalurLayerGroup = L.layerGroup();

        // Buat jalur layer
        const jalurLineLayer = L.geoJSON(features.jalurFeatures as any, {
          style: () => ({
            color: "#000000", // Hitam
            weight: 3,
            opacity: 0.8,
          }),
          pane: "overlayPane",
          onEachFeature: (feature, layer) => {
            // Enable PM for existing jalur shapes but keep it disabled by default
            if ((layer as any).pm) {
              (layer as any).pm.enable({
                allowEditing: true,
                allowScaling: true,
                allowRotating: true,
                allowDrag: true,
                allowRemoval: true,
                allowCutting: true,
                allowAddingVertices: true,
                allowRemovingVertices: true,
                allowMovingVertices: true,
                allowMiddleMarkers: true,
              });
              // Disable PM by default - it will be enabled selectively
              (layer as any).pm.disable();

              // Add click handler for selective editing
              layer.on("click", function (e: L.LeafletMouseEvent) {
                // Check if drawing mode is active
                if (!mapRefs.drawingModeRef.current) {
                  return;
                }

                // If there's already a shape being edited, disable it first
                if (drawing.isEditingShape && drawing.editingShape && drawing.editingShape !== layer) {
                  console.log("🔄 Disabling previous editing shape");
                  if ((drawing.editingShape as any).pm) {
                    (drawing.editingShape as any).pm.disable();
                  }
                  drawing.setIsEditingShape(false);
                  drawing.setEditingShape(null);
                  drawing.setOriginalShapeData(null);
                }

                // Reset all other layers to disabled state
                if (mapRefs.bangunanLayerRef.current) {
                  (mapRefs.bangunanLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }
                if (mapRefs.jalurLayerRef.current) {
                  (mapRefs.jalurLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }
                if (mapRefs.titikLayerRef.current) {
                  (mapRefs.titikLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }
                if (mapRefs.nonBangunanLayerRef.current) {
                  (mapRefs.nonBangunanLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }

                // Enable PM for this specific layer based on drawing mode
                try {
                  if (mapRefs.drawingModeRef.current === "edit") {
                    console.log(
                      "🔍 Selective editing: Edit mode - checking PM state"
                    );
                    console.log(
                      "🔍 PM enabled state:",
                      (layer as any).pm?.enabled()
                    );

                    // Save original shape data
                    const originalData = {
                      latLngs: (layer as any).getLatLngs(),
                      type: layer.constructor.name,
                    };
                    drawing.setOriginalShapeData(originalData);
                    drawing.setEditingShape(layer);
                    drawing.setIsEditingShape(true);

                    (layer as any).pm.enable({ allowEditing: true });
                    console.log(
                      "🔍 PM enabled state after enable:",
                      (layer as any).pm?.enabled()
                    );

                    // Apply visual feedback for edit mode
                    applyVisualFeedback(layer, "edit");

                    console.log(
                      "✅ Edit enabled for jalur layer:",
                      feature.properties?.nama || feature.properties?.id
                    );
                  } else if (mapRefs.drawingModeRef.current === "scale") {
                    (layer as any).pm.enable({
                      allowScaling: true,
                    });
                    console.log(
                      "✅ Scale enabled for jalur layer:",
                      feature.properties?.nama || feature.properties?.id
                    );
                  } else if (mapRefs.drawingModeRef.current === "drag") {
                    console.log(
                      "🔍 Selective editing: Drag mode - checking PM state"
                    );
                    console.log(
                      "🔍 PM enabled state:",
                      (layer as any).pm?.enabled()
                    );

                    // First, disable drag on all other layers
                    map.eachLayer((otherLayer: any) => {
                      if (otherLayer && otherLayer !== layer && otherLayer.pm) {
                        try {
                          if (typeof otherLayer.pm.disableDrag === "function") {
                            otherLayer.pm.disableDrag();
                          } else if (
                            typeof otherLayer.pm.disable === "function"
                          ) {
                            otherLayer.pm.disable();
                          }
                        } catch (error) {
                          // Ignore errors
                        }
                      }
                    });

                    (layer as any).pm.enableLayerDrag();
                    console.log(
                      "🔍 PM enabled state after enableLayerDrag:",
                      (layer as any).pm?.enabled()
                    );

                    // Apply visual feedback for drag mode
                    applyVisualFeedback(layer, "drag");

                    console.log(
                      "✅ Drag enabled for jalur layer:",
                      feature.properties?.nama || feature.properties?.id
                    );

                    // Store the dragged shape and show confirmation
                    drawing.setDraggedShape(layer);
                    drawing.setOriginalShapePosition(
                      (layer as any).getLatLngs
                        ? (layer as any).getLatLngs()
                        : null
                    );
                    drawing.setShowDragConfirmation(true);
                  } else if (mapRefs.drawingModeRef.current === "remove") {
                    (layer as any).pm.enable({ allowRemoval: true });

                    // Apply visual feedback for remove mode
                    applyVisualFeedback(layer, "remove");

                    console.log(
                      "✅ Remove enabled for jalur layer:",
                      feature.properties?.nama || feature.properties?.id
                    );
                  }
                } catch (error) {
                  console.log("❌ Error enabling PM for jalur layer:", error);
                }
              });

              console.log(
                "✅ PM enabled for jalur layer:",
                feature.properties?.nama || feature.properties?.id
              );
            }
          },
        });

        // Tambahkan jalur ke layer group
        jalurLineLayer.addTo(jalurLayerGroup);

        // Tambahkan marker ujung untuk setiap jalur
        features.jalurFeatures.forEach((feature) => {
          if (
            feature.geometry &&
            (feature.geometry.type === "LineString" ||
              feature.geometry.type === "MultiLineString")
          ) {
            let coordinates: number[][] = [];

            if (feature.geometry.type === "LineString") {
              coordinates = feature.geometry.coordinates as number[][];
            } else if (feature.geometry.type === "MultiLineString") {
              // Ambil semua koordinat dari MultiLineString
              coordinates = (
                feature.geometry.coordinates as number[][][]
              ).flat();
            }

            if (coordinates.length >= 2) {
              // Tambahkan marker di ujung awal jalur
              const startCoord = coordinates[0];
              const startMarker = L.circleMarker(
                [startCoord[1], startCoord[0]],
                {
                  radius: 3,
                  fillColor: "#ffffff",
                  color: "#000000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1,
                  pane: "overlayPane",
                }
              );

              // Tambahkan marker ke jalur layer group
              startMarker.addTo(jalurLayerGroup);

              // Tambahkan marker di ujung akhir jalur
              const endCoord = coordinates[coordinates.length - 1];
              const endMarker = L.circleMarker([endCoord[1], endCoord[0]], {
                radius: 3,
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                opacity: 1,
                fillOpacity: 1,
                pane: "overlayPane",
              });

              // Tambahkan marker ke jalur layer group
              endMarker.addTo(jalurLayerGroup);

              // Marker sudah menjadi bagian dari jalur layer, tidak perlu dikelola secara terpisah
            }
          }
        });

        // Gunakan jalurLayerGroup sebagai jalurLayer
        const jalurLayer = jalurLayerGroup;
        // Set z-index agar jalur berada di atas bangunan
        (jalurLayer as any).setZIndex(150);

        // Simpan jalur layer ke ref tanpa menambahkan ke map
        mapRefs.jalurLayerRef.current = jalurLayer;
        console.log("Jalur layer created and saved to ref");

        // Tambahkan jalur layer ke map dengan delay untuk render terakhir
        setTimeout(() => {
          if (layerVisibility.jalurLayerVisible) {
            jalurLayer.addTo(map);
            console.log("Jalur layer added to map");
          }
        }, 200);
      }
    }, [features.jalurFeatures, layerVisibility.jalurLayerVisible, isDashboard]);

    useEffect(() => {
      if (!mapRefs.leafletMapRef.current || !isDashboard) return;

      const map = mapRefs.leafletMapRef.current;

      // Buat layer titik jika belum ada dan data tersedia
      if (features.titikFeatures.length > 0 && !mapRefs.titikLayerRef.current) {
        const titikLayer = L.geoJSON(features.titikFeatures as any, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#ef4444",
              color: "#dc2626",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
          pane: "overlayPane",
          onEachFeature: (feature, layer) => {
            // Enable PM for existing point shapes but keep it disabled by default
            if ((layer as any).pm) {
              (layer as any).pm.enable({
                allowEditing: true,
                allowScaling: true,
                allowRotating: true,
                allowDrag: true,
                allowRemoval: true,
                allowCutting: true,
                allowAddingVertices: true,
                allowRemovingVertices: true,
                allowMovingVertices: true,
                allowMiddleMarkers: true,
              });
              // Disable PM by default - it will be enabled selectively
              (layer as any).pm.disable();

              // Add click handler for selective editing
              layer.on("click", function (e: L.LeafletMouseEvent) {
                // Check if drawing mode is active
                if (!mapRefs.drawingModeRef.current) {
                  return;
                }

                // If there's already a shape being edited, disable it first
                if (drawing.isEditingShape && drawing.editingShape && drawing.editingShape !== layer) {
                  console.log("🔄 Disabling previous editing shape");
                  if ((drawing.editingShape as any).pm) {
                    (drawing.editingShape as any).pm.disable();
                  }
                  drawing.setIsEditingShape(false);
                  drawing.setEditingShape(null);
                  drawing.setOriginalShapeData(null);
                }

                // Reset all other layers to disabled state
                if (mapRefs.bangunanLayerRef.current) {
                  (mapRefs.bangunanLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }
                if (mapRefs.jalurLayerRef.current) {
                  (mapRefs.jalurLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }
                if (mapRefs.titikLayerRef.current) {
                  (mapRefs.titikLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }
                if (mapRefs.nonBangunanLayerRef.current) {
                  (mapRefs.nonBangunanLayerRef.current as any).eachLayer(
                    (otherLayer: any) => {
                      if (otherLayer.pm && otherLayer !== layer) {
                        otherLayer.pm.disable();
                      }
                    }
                  );
                }

                // Enable PM for this specific layer based on drawing mode
                try {
                  if (mapRefs.drawingModeRef.current === "edit") {
                    // Save original shape data
                    const originalData = {
                      latLng: (layer as any).getLatLng(),
                      radius: (layer as any).getRadius
                        ? (layer as any).getRadius()
                        : null,
                      type: layer.constructor.name,
                    };
                    drawing.setOriginalShapeData(originalData);
                    drawing.setEditingShape(layer);
                    drawing.setIsEditingShape(true);

                    (layer as any).pm.enable({ allowEditing: true });

                    // Apply visual feedback for edit mode
                    applyVisualFeedback(layer, "edit");

                    console.log(
                      "✅ Edit enabled for point layer:",
                      feature.properties?.Nama || feature.properties?.id
                    );
                  } else if (mapRefs.drawingModeRef.current === "scale") {
                    (layer as any).pm.enable({
                      allowScaling: true,
                    });
                    console.log(
                      "✅ Scale enabled for point layer:",
                      feature.properties?.Nama || feature.properties?.id
                    );
                  } else if (mapRefs.drawingModeRef.current === "drag") {
                    // First, disable drag on all other layers
                    map.eachLayer((otherLayer: any) => {
                      if (otherLayer && otherLayer !== layer && otherLayer.pm) {
                        try {
                          if (typeof otherLayer.pm.disableDrag === "function") {
                            otherLayer.pm.disableDrag();
                          } else if (
                            typeof otherLayer.pm.disable === "function"
                          ) {
                            otherLayer.pm.disable();
                          }
                        } catch (error) {
                          // Ignore errors
                        }
                      }
                    });

                    (layer as any).pm.enableLayerDrag();

                    // Apply visual feedback for drag mode
                    applyVisualFeedback(layer, "drag");

                    console.log(
                      "✅ Drag enabled for point layer:",
                      feature.properties?.Nama || feature.properties?.id
                    );

                    // Store the dragged shape and show confirmation
                    drawing.setDraggedShape(layer);
                    drawing.setOriginalShapePosition(
                      (layer as any).getLatLng
                        ? (layer as any).getLatLng()
                        : null
                    );
                    drawing.setShowDragConfirmation(true);
                  } else if (mapRefs.drawingModeRef.current === "remove") {
                    (layer as any).pm.enable({ allowRemoval: true });

                    // Apply visual feedback for remove mode
                    applyVisualFeedback(layer, "remove");

                    console.log(
                      "✅ Remove enabled for point layer:",
                      feature.properties?.Nama || feature.properties?.id
                    );
                  }
                } catch (error) {
                  console.log("❌ Error enabling PM for point layer:", error);
                }
              });

              console.log(
                "✅ PM enabled for point layer:",
                feature.properties?.Nama || feature.properties?.id
              );
            }
          },
        });
        // Set z-index agar titik berada di atas jalur
        (titikLayer as any).setZIndex(200);

        // Simpan titik layer ke ref tanpa menambahkan ke map
        mapRefs.titikLayerRef.current = titikLayer;
        console.log("Titik layer created and saved to ref");

        // Tambahkan titik layer ke map dengan delay untuk render terakhir
        setTimeout(() => {
          if (layerVisibility.titikLayerVisible) {
            titikLayer.addTo(map);
            console.log("Titik layer added to map");
          }
        }, 300);
      }
    }, [features.titikFeatures, layerVisibility.titikLayerVisible, isDashboard]);

    // Update visibility bangunan layer menggunakan ref
    useEffect(() => {
      if (!mapRefs.leafletMapRef.current || !isDashboard) return;

      const map = mapRefs.leafletMapRef.current;

      // Update visibility bangunan layer menggunakan ref
      if (mapRefs.bangunanLayerRef.current) {
        if (layerVisibility.bangunanLayerVisible) {
          if (!map.hasLayer(mapRefs.bangunanLayerRef.current)) {
            map.addLayer(mapRefs.bangunanLayerRef.current);
          }
        } else {
          if (map.hasLayer(mapRefs.bangunanLayerRef.current)) {
            map.removeLayer(mapRefs.bangunanLayerRef.current);
          }
        }
      }
    }, [layerVisibility.bangunanLayerVisible, isDashboard]);

    // Kirim data nama gedung & jumlah lantai ke iframe saat modal building-detail dibuka
    useEffect(() => {
      if (ui.showBuildingDetailCanvas && features.selectedFeature) {
        const namaGedung = features.selectedFeature.properties?.nama;
        const jumlahLantai = Number(features.selectedFeature.properties?.lantai) || 0;
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
    }, [ui.showBuildingDetailCanvas, features.selectedFeature]);

    // Gabungkan data bangunan dan ruangan untuk pencarian (hanya yang bisa dicari)
    useEffect(() => {
      // setAllFeatures([...features.bangunanFeatures, ...features.ruanganFeatures]); // Removed as per new_code
    }, [features.bangunanFeatures, features.ruanganFeatures]);

    // Inisialisasi map hanya sekali
    useEffect(() => {
      if (!mapRefs.mapRef.current || mapRefs.leafletMapRef.current) return;
      const map = L.map(mapRefs.mapRef.current, {
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
      mapRefs.leafletMapRef.current = map;
      // Set posisi awal sama dengan tombol reset
      map.setView([initialLat, initialLng], initialZoom, { animate: false });

      // Basemap awal
      const bm = BASEMAPS.find((b) => b.key === config.basemap) || BASEMAPS[1];
      const tileLayer = L.tileLayer(bm.url, {
        attribution: bm.attribution,
        maxZoom: 19,
      });
      tileLayer.addTo(map);
      mapRefs.basemapLayerRef.current = tileLayer;

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
          // Enable PM for existing Polnep geojson shapes but keep it disabled by default
          if ((layer as any).pm) {
            (layer as any).pm.enable({
              allowEditing: true,
              allowScaling: true,
              allowRotating: true,
              allowDrag: true,
              allowRemoval: true,
              allowCutting: true,
              allowAddingVertices: true,
              allowRemovingVertices: true,
              allowMovingVertices: true,
              allowMiddleMarkers: true,
            });
            // Disable PM by default - it will be enabled selectively
            (layer as any).pm.disable();

            // Add click handler for selective editing
            layer.on("click", function (e: L.LeafletMouseEvent) {
              // Check if drawing mode is active
              if (!mapRefs.drawingModeRef.current) {
                return;
              }

              // Reset all other layers to disabled state
              if (mapRefs.bangunanLayerRef.current) {
                (mapRefs.bangunanLayerRef.current as any).eachLayer(
                  (otherLayer: any) => {
                    if (otherLayer.pm && otherLayer !== layer) {
                      otherLayer.pm.disable();
                    }
                  }
                );
              }
              if (mapRefs.jalurLayerRef.current) {
                (mapRefs.jalurLayerRef.current as any).eachLayer((otherLayer: any) => {
                  if (otherLayer.pm && otherLayer !== layer) {
                    otherLayer.pm.disable();
                  }
                });
              }
              if (mapRefs.titikLayerRef.current) {
                (mapRefs.titikLayerRef.current as any).eachLayer((otherLayer: any) => {
                  if (otherLayer.pm && otherLayer !== layer) {
                    otherLayer.pm.disable();
                  }
                });
              }
              if (mapRefs.nonBangunanLayerRef.current) {
                (mapRefs.nonBangunanLayerRef.current as any).eachLayer(
                  (otherLayer: any) => {
                    if (otherLayer.pm && otherLayer !== layer) {
                      otherLayer.pm.disable();
                    }
                  }
                );
              }

              // Enable PM for this specific layer based on drawing mode
              try {
                if (mapRefs.drawingModeRef.current === "edit") {
                  // Save original shape data
                  const originalData = {
                    latLngs: (layer as any).getLatLngs(),
                    type: layer.constructor.name,
                  };
                  drawing.setOriginalShapeData(originalData);
                  drawing.setEditingShape(layer);
                  drawing.setIsEditingShape(true);

                  (layer as any).pm.enable({ allowEditing: true });

                  // Apply visual feedback for edit mode
                  applyVisualFeedback(layer, "edit");

                  console.log(
                    "✅ Edit enabled for Polnep geojson layer:",
                    feature.properties?.id || "unknown"
                  );
                } else if (mapRefs.drawingModeRef.current === "scale") {
                  (layer as any).pm.enable({
                    allowScaling: true,
                  });
                  console.log(
                    "✅ Scale enabled for Polnep geojson layer:",
                    feature.properties?.id || "unknown"
                  );
                } else if (mapRefs.drawingModeRef.current === "drag") {
                  // First, disable drag on all other layers
                  map.eachLayer((otherLayer: any) => {
                    if (otherLayer && otherLayer !== layer && otherLayer.pm) {
                      try {
                        if (typeof otherLayer.pm.disableDrag === "function") {
                          otherLayer.pm.disableDrag();
                        } else if (
                          typeof otherLayer.pm.disable === "function"
                        ) {
                          otherLayer.pm.disable();
                        }
                      } catch (error) {
                        // Ignore errors
                      }
                    }
                  });

                  (layer as any).pm.enableLayerDrag();

                  // Apply visual feedback for drag mode
                  applyVisualFeedback(layer, "drag");

                  console.log(
                    "✅ Drag enabled for Polnep geojson layer:",
                    feature.properties?.id || "unknown"
                  );

                  // Store the dragged shape and show confirmation
                  drawing.setDraggedShape(layer);
                  drawing.setOriginalShapePosition(
                    (layer as any).getLatLngs
                      ? (layer as any).getLatLngs()
                      : null
                  );
                  drawing.setShowDragConfirmation(true);
                } else if (mapRefs.drawingModeRef.current === "remove") {
                  (layer as any).pm.enable({ allowRemoval: true });

                  // Apply visual feedback for remove mode
                  applyVisualFeedback(layer, "remove");

                  console.log(
                    "✅ Remove enabled for Polnep geojson layer:",
                    feature.properties?.id || "unknown"
                  );
                }
              } catch (error) {
                console.log(
                  "❌ Error enabling PM for Polnep geojson layer:",
                  error
                );
              }
            });

            console.log(
              "✅ PM enabled for Polnep geojson layer:",
              feature.properties?.id || "unknown"
            );
          }

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
      mapRefs.nonBangunanLayerRef.current = nonBangunanLayer;

      // Layer bangunan (di atas non-bangunan)
      const bangunanLayer = L.geoJSON(undefined, {
        style: () => kategoriStyle["Bangunan"] || defaultStyle,
        onEachFeature: (feature, layer) => {
          // Enable PM for existing building shapes but keep it disabled by default
          if ((layer as any).pm) {
            (layer as any).pm.enable({
              allowEditing: true,
              allowScaling: true,
              allowRotating: true,
              allowDrag: true,
              allowRemoval: true,
              allowCutting: true,
              allowAddingVertices: true,
              allowRemovingVertices: true,
              allowMovingVertices: true,
              allowMiddleMarkers: true,
            });
            // Disable PM by default - it will be enabled selectively
            (layer as any).pm.disable();

            // Add click handler for selective editing
            layer.on("click", function (e: L.LeafletMouseEvent) {
              // Check if drawing mode is active
              if (!mapRefs.drawingModeRef.current) {
                return;
              }

              // Reset all other layers to disabled state
              if (mapRefs.bangunanLayerRef.current) {
                (mapRefs.bangunanLayerRef.current as any).eachLayer(
                  (otherLayer: any) => {
                    if (otherLayer.pm && otherLayer !== layer) {
                      otherLayer.pm.disable();
                    }
                  }
                );
              }
              if (mapRefs.jalurLayerRef.current) {
                (mapRefs.jalurLayerRef.current as any).eachLayer((otherLayer: any) => {
                  if (otherLayer.pm && otherLayer !== layer) {
                    otherLayer.pm.disable();
                  }
                });
              }
              if (mapRefs.titikLayerRef.current) {
                (mapRefs.titikLayerRef.current as any).eachLayer((otherLayer: any) => {
                  if (otherLayer.pm && otherLayer !== layer) {
                    otherLayer.pm.disable();
                  }
                });
              }
              if (mapRefs.nonBangunanLayerRef.current) {
                (mapRefs.nonBangunanLayerRef.current as any).eachLayer(
                  (otherLayer: any) => {
                    if (otherLayer.pm && otherLayer !== layer) {
                      otherLayer.pm.disable();
                    }
                  }
                );
              }

              // Enable PM for this specific layer based on drawing mode
              try {
                if (mapRefs.drawingModeRef.current === "edit") {
                  // Save original shape data
                  const originalData = {
                    latLngs: (layer as any).getLatLngs(),
                    type: layer.constructor.name,
                  };
                  drawing.setOriginalShapeData(originalData);
                  drawing.setEditingShape(layer);
                  drawing.setIsEditingShape(true);

                  (layer as any).pm.enable({ allowEditing: true });

                  // Apply visual feedback for edit mode
                  applyVisualFeedback(layer, "edit");

                  console.log(
                    "✅ Edit enabled for building layer:",
                    feature.properties?.nama || feature.properties?.id
                  );
                } else if (mapRefs.drawingModeRef.current === "scale") {
                  (layer as any).pm.enable({
                    allowScaling: true,
                  });
                  console.log(
                    "✅ Scale enabled for building layer:",
                    feature.properties?.nama || feature.properties?.id
                  );
                } else if (mapRefs.drawingModeRef.current === "drag") {
                  // First, disable drag on all other layers
                  map.eachLayer((otherLayer: any) => {
                    if (otherLayer && otherLayer !== layer && otherLayer.pm) {
                      try {
                        if (typeof otherLayer.pm.disableDrag === "function") {
                          otherLayer.pm.disableDrag();
                        } else if (
                          typeof otherLayer.pm.disable === "function"
                        ) {
                          otherLayer.pm.disable();
                        }
                      } catch (error) {
                        // Ignore errors
                      }
                    }
                  });

                  (layer as any).pm.enableLayerDrag();

                  // Apply visual feedback for drag mode
                  applyVisualFeedback(layer, "drag");

                  console.log(
                    "✅ Drag enabled for building layer:",
                    feature.properties?.nama || feature.properties?.id
                  );

                  // Store the dragged shape and show confirmation
                  drawing.setDraggedShape(layer);
                  drawing.setOriginalShapePosition(
                    (layer as any).getLatLngs
                      ? (layer as any).getLatLngs()
                      : null
                  );
                  drawing.setShowDragConfirmation(true);
                } else if (mapRefs.drawingModeRef.current === "remove") {
                  (layer as any).pm.enable({ allowRemoval: true });

                  // Apply visual feedback for remove mode
                  applyVisualFeedback(layer, "remove");

                  console.log(
                    "✅ Remove enabled for building layer:",
                    feature.properties?.nama || feature.properties?.id
                  );
                }
              } catch (error) {
                console.log("❌ Error enabling PM for building layer:", error);
              }
            });

            console.log(
              "✅ PM enabled for building layer:",
              feature.properties?.nama || feature.properties?.id
            );
          }

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
              console.log("🏢 Building clicked");

              // Blok klik bangunan jika drawing mode aktif DAN ada drawing.activeShape
              if (mapRefs.drawingModeRef.current && drawing.activeShape) {
                console.log(
                  "🚫 Building click blocked - drawing mode active with active shape:",
                  mapRefs.drawingModeRef.current
                );
                return;
              }

              // Jika rute sedang tampil atau highlight aktif (dan navigation tidak aktif), blok interaksi klik bangunan lain
              if (
                mapRefs.routeLineRef.current ||
                (mapRefs.isHighlightActiveRef.current && !mapRefs.isNavigationActiveRef.current)
              ) {
                if (
                  e &&
                  e.originalEvent &&
                  typeof e.originalEvent.stopPropagation === "function"
                ) {
                  e.originalEvent.stopPropagation();
                }
                // Tambahkan efek shake pada container detail bangunan yang sedang aktif
                animation.setIsContainerShaking(true);
                setTimeout(() => animation.setIsContainerShaking(false), 600);
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
              // Set flag untuk mencegah canvas click handler terpicu
              mapRefs.isBuildingClickedRef.current = true;
              features.setSelectedFeature(featureWithKategori);
              ui.setCardVisible(true);
              highlight.setIsHighlightActive(true);

              // Reset flag setelah delay singkat
              setTimeout(() => {
                mapRefs.isBuildingClickedRef.current = false;
              }, 100);
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
      // Set z-index agar bangunan berada di bawah jalur dan titik
      (bangunanLayer as any).setZIndex(50);
      bangunanLayer.addTo(map);
      mapRefs.bangunanLayerRef.current = bangunanLayer;

      // Pastikan bangunan layer berada di bawah semua layer lain
      map.on("layeradd", (e: any) => {
        if (e.layer === bangunanLayer) {
          // Bangunan harus selalu di bawah
          (e.layer as any).setZIndex(50);
        }
      });

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
        mapRefs.leafletMapRef.current = null;
        mapRefs.nonBangunanLayerRef.current = null;
        mapRefs.bangunanLayerRef.current = null;
        mapRefs.basemapLayerRef.current = null;
      };
    }, []); // hanya sekali

    // Geoman.js drawing tools setup
    useEffect(() => {
      const map = mapRefs.leafletMapRef.current;
      if (!map || !isDashboard) return;

      // Initialize Geoman.js
      if ((map as any).pm) {
        // Disable all drawing tools by default - only use methods that exist
        if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
        if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
        if (map.pm.disableGlobalRemovalMode) map.pm.disableGlobalRemovalMode();
        if (map.pm.disableGlobalCutMode) map.pm.disableGlobalCutMode();

        // Set cursor untuk drawing mode
        const setDrawingCursor = () => {
          const mapContainer = map.getContainer();
          if (mapContainer) {
            mapContainer.style.cursor = "crosshair";
          }
        };

        const resetCursor = () => {
          const mapContainer = map.getContainer();
          if (mapContainer) {
            mapContainer.style.cursor = "";
          }
        };

        // Add event listeners for drawing events
        map.on("pm:create", (e: any) => {
          console.log("🔄 Shape created:", e.shape);

          // Add selective editing functionality to the newly created shape
          const newLayer = e.layer;
          if (newLayer && (newLayer as any).pm) {
            // Enable PM for the new shape but keep it disabled by default
            (newLayer as any).pm.enable({
              allowEditing: true,
              allowScaling: true,
              allowRotating: true,
              allowDrag: true,
              allowRemoval: true,
              allowCutting: true,
              allowAddingVertices: true,
              allowRemovingVertices: true,
              allowMovingVertices: true,
              allowMiddleMarkers: true,
            });
            // Disable PM by default - it will be enabled selectively
            (newLayer as any).pm.disable();

            // Add click handler for selective editing
            newLayer.on("click", function (e: L.LeafletMouseEvent) {
              // Check if drawing mode is active
              if (!mapRefs.drawingModeRef.current) {
                return;
              }

              // Reset all other layers to disabled state
              if (mapRefs.bangunanLayerRef.current) {
                (mapRefs.bangunanLayerRef.current as any).eachLayer(
                  (otherLayer: any) => {
                    if (otherLayer.pm && otherLayer !== newLayer) {
                      otherLayer.pm.disable();
                    }
                  }
                );
              }
              if (mapRefs.jalurLayerRef.current) {
                (mapRefs.jalurLayerRef.current as any).eachLayer((otherLayer: any) => {
                  if (otherLayer.pm && otherLayer !== newLayer) {
                    otherLayer.pm.disable();
                  }
                });
              }
              if (mapRefs.titikLayerRef.current) {
                (mapRefs.titikLayerRef.current as any).eachLayer((otherLayer: any) => {
                  if (otherLayer.pm && otherLayer !== newLayer) {
                    otherLayer.pm.disable();
                  }
                });
              }
              if (mapRefs.nonBangunanLayerRef.current) {
                (mapRefs.nonBangunanLayerRef.current as any).eachLayer(
                  (otherLayer: any) => {
                    if (otherLayer.pm && otherLayer !== newLayer) {
                      otherLayer.pm.disable();
                    }
                  }
                );
              }

              // If there's already a shape being edited, disable it first
              if (drawing.isEditingShape && drawing.editingShape && drawing.editingShape !== newLayer) {
                console.log("🔄 Disabling previous editing shape");
                if ((drawing.editingShape as any).pm) {
                  (drawing.editingShape as any).pm.disable();
                }
                drawing.setIsEditingShape(false);
                drawing.setEditingShape(null);
                drawing.setOriginalShapeData(null);
              }

              // Also disable PM on all other layers in the map
              map.eachLayer((otherLayer: any) => {
                if (
                  otherLayer.pm &&
                  otherLayer !== newLayer &&
                  otherLayer !== map
                ) {
                  otherLayer.pm.disable();
                }
              });

              // Enable PM for this specific layer based on drawing mode
              try {
                if (mapRefs.drawingModeRef.current === "edit") {
                  // Save original shape data
                  const originalData = {
                    latLngs: newLayer.getLatLngs ? newLayer.getLatLngs() : null,
                    latLng: newLayer.getLatLng ? newLayer.getLatLng() : null,
                    radius: newLayer.getRadius ? newLayer.getRadius() : null,
                    type: newLayer.constructor.name,
                  };
                  drawing.setOriginalShapeData(originalData);
                  drawing.setEditingShape(newLayer);
                  drawing.setIsEditingShape(true);

                  (newLayer as any).pm.enable({ allowEditing: true });

                  // Add visual feedback for selected shape
                  newLayer.setStyle({
                    weight: 4,
                    opacity: 0.8,
                    color: "#4CAF50",
                    fillOpacity: 0.3,
                    fillColor: "#4CAF50",
                  });

                  console.log("✅ Edit enabled for new shape");
                } else if (mapRefs.drawingModeRef.current === "scale") {
                  (newLayer as any).pm.enable({
                    allowScaling: true,
                  });
                  console.log("✅ Scale enabled for new shape");
                } else if (mapRefs.drawingModeRef.current === "drag") {
                  // First, disable drag on all other layers
                  map.eachLayer((otherLayer: any) => {
                    if (
                      otherLayer &&
                      otherLayer !== newLayer &&
                      otherLayer.pm
                    ) {
                      try {
                        if (typeof otherLayer.pm.disableDrag === "function") {
                          otherLayer.pm.disableDrag();
                        } else if (
                          typeof otherLayer.pm.disable === "function"
                        ) {
                          otherLayer.pm.disable();
                        }
                      } catch (error) {
                        // Ignore errors
                      }
                    }
                  });

                  (newLayer as any).pm.enableLayerDrag();

                  // Add visual feedback for selected shape
                  newLayer.setStyle({
                    weight: 4,
                    opacity: 0.8,
                    color: "#ff6b6b",
                    fillOpacity: 0.3,
                    fillColor: "#ff6b6b",
                  });

                  console.log("✅ Drag enabled for new shape");

                  // Store the dragged shape and show confirmation
                  drawing.setDraggedShape(newLayer);
                  drawing.setOriginalShapePosition(
                    newLayer.getLatLngs ? newLayer.getLatLngs() : null
                  );
                  drawing.setShowDragConfirmation(true);
                } else if (mapRefs.drawingModeRef.current === "remove") {
                  (newLayer as any).pm.enable({ allowRemoval: true });

                  // Add visual feedback for selected shape
                  newLayer.setStyle({
                    weight: 4,
                    opacity: 0.8,
                    color: "#f44336",
                    fillOpacity: 0.3,
                    fillColor: "#f44336",
                  });

                  console.log("✅ Remove enabled for new shape");
                }
              } catch (error) {
                console.log("❌ Error enabling PM for new shape:", error);
              }
            });

            console.log("✅ PM enabled for new shape");
          }

          // Setelah selesai menggambar, nonaktifkan mode gambar tapi jangan tutup sidebar
          try {
            if ((map as any).pm?.disableDraw) {
              (map as any).pm.disableDraw();
            }
          } catch {}
          // Reset drawing mode dan state
          drawing.setDrawingMode(null);
          drawing.setIsDrawingEnabled(false);
          // Update ref langsung untuk memastikan state ter-update
          mapRefs.isDrawingEnabledRef.current = false;
          mapRefs.drawingModeRef.current = null;
          console.log("✅ State reset");
          // Reset cursor setelah selesai menggambar
          resetCursor();
        });

        // Event listener untuk polyline drawing - batasi hanya 1 garis lurus
        map.on("pm:drawstart", (e: any) => {
          console.log("🔄 Drawing started:", e.shape);
          // Set cursor crosshair saat mulai menggambar
          setDrawingCursor();
        });

        map.on("pm:drawend", (e: any) => {
          console.log("🔄 Drawing ended:", e.shape);
          // Jika ini adalah polyline atau polygon, nonaktifkan drawing mode setelah selesai
          if (
            e.shape === "Line" ||
            e.shape === "Polyline" ||
            e.shape === "Polygon"
          ) {
            try {
              if ((map as any).pm?.disableDraw) {
                (map as any).pm.disableDraw();
              }
            } catch {}
            // Reset drawing mode dan state untuk polyline dan polygon
            drawing.setDrawingMode(null);
            drawing.setIsDrawingEnabled(false);
            // Update ref langsung untuk memastikan state ter-update
            mapRefs.isDrawingEnabledRef.current = false;
            mapRefs.drawingModeRef.current = null;
            console.log("✅ State reset");
            // Reset cursor setelah selesai menggambar
            resetCursor();
          }
        });

        map.on("pm:edit", (e: any) => {
          // You can handle the edited shape here
        });

        map.on("pm:editstart", (e: any) => {
          // Set cursor crosshair saat mulai edit
          setDrawingCursor();
        });

        map.on("pm:editend", (e: any) => {
          // Reset cursor setelah selesai edit
          resetCursor();
        });

        map.on("pm:remove", (e: any) => {
          // You can handle the removed shape here
        });

        map.on("pm:removestart", (e: any) => {
          // Set cursor crosshair saat mulai remove
          setDrawingCursor();
        });

        map.on("pm:removeend", (e: any) => {
          // Reset cursor setelah selesai remove
          resetCursor();
          // Reset drawing state setelah remove selesai
          if (mapRefs.drawingModeRef.current === "remove") {
            console.log("🔄 pm:removeend - Resetting drawing state");
            drawing.setDrawingMode(null);
            drawing.setIsDrawingEnabled(false);
            // Update ref langsung untuk memastikan state ter-update
            mapRefs.isDrawingEnabledRef.current = false;
            mapRefs.drawingModeRef.current = null;
            console.log("✅ pm:removeend - Drawing state reset complete");
          }
        });

        map.on("pm:dragstart", (e: any) => {
          // Set cursor crosshair saat mulai drag
          setDrawingCursor();
        });

        map.on("pm:dragend", (e: any) => {
          // If this is the currently dragged shape, keep it in drag state
          // until user confirms or cancels
          if (drawing.draggedShape === e.target) {
            // Don't reset cursor yet, keep drag state active
            return;
          }

          // Reset cursor setelah selesai drag
          resetCursor();
        });

        map.on("pm:cut", (e: any) => {
          console.log("Shape cut:", e);
          // You can handle the cut shape here
        });

        map.on("pm:cutstart", (e: any) => {
          console.log("Cut started:", e);
          // Set cursor crosshair saat mulai cut
          setDrawingCursor();
        });

        map.on("pm:cutend", (e: any) => {
          console.log("Cut ended:", e);
          // Reset cursor setelah selesai cut
          resetCursor();
        });

        map.on("pm:scale", (e: any) => {
          console.log("Shape scaled:", e);
          // You can handle the scaled shape here
        });

        map.on("pm:scalestart", (e: any) => {
          console.log("Scale started:", e);
          // Set cursor crosshair saat mulai scale
          setDrawingCursor();
        });

        map.on("pm:scaleend", (e: any) => {
          console.log("Scale ended:", e);
          // Reset cursor setelah selesai scale
          resetCursor();
        });

        // Add click event listener for layers when in edit mode
        map.on("click", (e: any) => {
          // Skip jika bangunan sedang diklik
          if (mapRefs.isBuildingClickedRef.current) {
            console.log("🚫 Canvas click blocked");
            return;
          }

          console.log("🔍 Canvas clicked");

          if (mapRefs.drawingModeRef.current === "edit") {
            const clickedLayer = e.target || e.layer || e.sourceTarget;
            console.log(
              "📝 Edit mode - clickedLayer:",
              clickedLayer?.constructor?.name
            );

            // Check if this layer has our selective editing click handler
            // If it does, let the selective editing handle it instead
            const hasSelectiveEditing =
              (clickedLayer as any)._events &&
              (clickedLayer as any)._events.click &&
              (clickedLayer as any)._events.click.some(
                (handler: any) =>
                  handler.fn &&
                  handler.fn.toString().includes("mapRefs.drawingModeRef.current")
              );

            if (hasSelectiveEditing) {
              console.log(
                "✅ Layer has selective editing - letting selective editing handle it"
              );
              return; // Let the selective editing click handler take over
            }

            if (
              clickedLayer &&
              (clickedLayer as any).pm &&
              typeof (clickedLayer as any).pm.enable === "function"
            ) {
              try {
                (clickedLayer as any).pm.enable({
                  mode: "edit",
                  allowEditing: false,
                  allowScaling: true,
                });
                console.log("✅ Edit enabled");
              } catch (error) {
                console.log("❌ Error enabling edit mode:", error);
              }
            } else {
              console.log(
                "⚠️ Layer doesn't have valid pm.enable method, trying fallback..."
              );
              // Fallback: find layer by click point
              const clickPoint = map.containerPointToLatLng(e.containerPoint);
              console.log(
                "📍 Click point:",
                clickPoint.lat.toFixed(4),
                clickPoint.lng.toFixed(4)
              );

              // Look for individual shapes, not layer groups
              map.eachLayer((layer: any) => {
                // Skip if it's a layer group (has _layers array)
                if (layer && (layer as any)._layers) {
                  console.log(
                    "🔍 Skipping layer group:",
                    layer.constructor.name
                  );
                  return;
                }

                // Check if it's an individual shape with pm support
                if (
                  layer &&
                  (layer as any).pm &&
                  typeof (layer as any).pm.enable === "function" &&
                  layer.getBounds &&
                  !(layer as any)._layers // Ensure it's not a group
                ) {
                  try {
                    const bounds = layer.getBounds();
                    if (bounds.contains(clickPoint)) {
                      console.log(
                        "🎯 Found individual shape at click point:",
                        layer.constructor.name
                      );
                      console.log("🔍 Shape PM object:", (layer as any).pm);
                      console.log(
                        "🔍 Shape PM enable method:",
                        typeof (layer as any).pm.enable
                      );

                      console.log("🔍 Trying to enable edit mode...");

                      // First, disable ALL other layers to ensure single selection
                      map.eachLayer((otherLayer: any) => {
                        if (
                          otherLayer !== layer &&
                          otherLayer.pm &&
                          otherLayer.pm.disable
                        ) {
                          try {
                            otherLayer.pm.disable();
                            console.log(
                              "🔒 Disabled other layer:",
                              otherLayer.constructor.name
                            );
                          } catch (error) {
                            console.log(
                              "⚠️ Could not disable other layer:",
                              error
                            );
                          }
                        }
                      });

                      // Check if this is a real Leaflet-Geoman layer
                      const pmObject = (layer as any).pm;
                      const availableMethods = Object.getOwnPropertyNames(
                        pmObject
                      ).filter((name) => typeof pmObject[name] === "function");

                      console.log("🔍 Available PM methods:", availableMethods);
                      console.log(
                        "🔍 PM object type:",
                        pmObject.constructor.name
                      );
                      console.log("🔍 Layer type:", layer.constructor.name);
                      console.log(
                        "🔍 Layer instanceof L.Path:",
                        layer instanceof (L as any).Path
                      );
                      console.log(
                        "🔍 Layer instanceof L.Polygon:",
                        layer instanceof (L as any).Polygon
                      );
                      console.log(
                        "🔍 Layer instanceof L.Polyline:",
                        layer instanceof (L as any).Polyline
                      );

                      // Check if this is a real Leaflet shape
                      if (
                        layer instanceof (L as any).Path ||
                        layer instanceof (L as any).Polygon ||
                        layer instanceof (L as any).Polyline ||
                        layer instanceof (L as any).Circle ||
                        layer instanceof (L as any).CircleMarker ||
                        layer instanceof (L as any).Rectangle
                      ) {
                        // Check if this is a Geoman-created layer (not from GeoJSON)
                        const isGeomanLayer =
                          (layer as any)._pm &&
                          (layer as any)._pm._enabled !== undefined;
                        const isFromGeoJSON =
                          (layer as any).feature &&
                          (layer as any).feature.properties;

                        console.log("🔍 Is Geoman layer:", isGeomanLayer);
                        console.log("🔍 Is from GeoJSON:", isFromGeoJSON);

                        if (isFromGeoJSON) {
                          console.log(
                            "✅ This is a GeoJSON layer, allowing selective editing"
                          );
                          // Don't return - allow GeoJSON layers to be edited through selective editing
                        }

                        console.log(
                          "✅ This is a real Leaflet shape, trying to enable..."
                        );

                        // Log the specific shape type for better debugging
                        if (layer instanceof (L as any).Polyline) {
                          console.log(
                            "📏 This is a POLYLINE - will restrict vertex addition"
                          );
                        } else if (layer instanceof (L as any).Polygon) {
                          console.log(
                            "🔷 This is a POLYGON - standard editing allowed"
                          );
                        } else if (layer instanceof (L as any).Circle) {
                          console.log(
                            "⭕ This is a CIRCLE - standard editing allowed"
                          );
                        } else if (layer instanceof (L as any).CircleMarker) {
                          console.log(
                            "🔵 This is a CIRCLE MARKER - standard editing allowed"
                          );
                        } else if (layer instanceof (L as any).Rectangle) {
                          console.log(
                            "⬜ This is a RECTANGLE - standard editing allowed"
                          );
                        } else {
                          console.log(
                            "📐 This is a generic PATH - standard editing allowed"
                          );
                        }

                        try {
                          // Method 1: Try pm.enable with options - ONLY EDIT MODE
                          if (pmObject.enable) {
                            pmObject.enable({
                              mode: "edit",
                              allowEditing: true,
                              allowScaling: false, // Disable scaling in edit mode
                              allowRotating: false, // Disable rotating in edit mode
                              allowAddingVertices: false, // Disable adding new vertices
                              allowRemovingVertices: false, // Disable removing vertices
                              allowMovingVertices: true, // Allow moving existing vertices only
                              allowMiddleMarkers: false, // CRITICAL: Prevent middle markers for vertex addition
                            });
                            console.log(
                              "✅ Method 1: pm.enable with edit mode (no rotate/scale, no add/remove vertices)"
                            );

                            // For polyline, use simple approach with allowMiddleMarkers: false
                            if (layer instanceof (L as any).Polyline) {
                              console.log(
                                "🔒 Adding simple polyline vertex protection..."
                              );

                              // Store original latlngs to prevent vertex addition
                              const originalLatLngs = layer.getLatLngs();
                              layer._originalLatLngs = originalLatLngs;
                              layer._originalVertexCount =
                                originalLatLngs.length;

                              console.log(
                                `💾 Stored original polyline with ${originalLatLngs.length} vertices`
                              );

                              // Simple interval to monitor vertex count
                              const vertexProtectionInterval = setInterval(
                                () => {
                                  if (layer && layer._originalLatLngs) {
                                    const currentLatLngs = layer.getLatLngs();

                                    // Check if vertices were added
                                    if (
                                      currentLatLngs.length >
                                      layer._originalLatLngs.length
                                    ) {
                                      console.log(
                                        `🚫 VERTEX ADDITION DETECTED! Current: ${currentLatLngs.length}, Original: ${layer._originalLatLngs.length}`
                                      );

                                      // Restore original vertices
                                      layer.setLatLngs(layer._originalLatLngs);
                                      console.log(
                                        "🔄 Polyline restored to original state"
                                      );
                                    }
                                  }
                                },
                                100
                              ); // Check every 100ms

                              // Store the interval ID for cleanup
                              layer._vertexProtectionInterval =
                                vertexProtectionInterval;

                              // Add cleanup when layer is removed or disabled
                              layer.on("remove", () => {
                                if (layer._vertexProtectionInterval) {
                                  clearInterval(
                                    layer._vertexProtectionInterval
                                  );
                                  console.log(
                                    "🧹 Vertex protection interval cleaned up for polyline"
                                  );
                                }
                              });

                              layer.on("pm:disable", () => {
                                if (layer._vertexProtectionInterval) {
                                  clearInterval(
                                    layer._vertexProtectionInterval
                                  );
                                  console.log(
                                    "🧹 Vertex protection interval cleaned up when polyline disabled"
                                  );
                                }
                              });

                              console.log(
                                "🔒 Simple polyline vertex protection activated!"
                              );
                            }
                          }

                          // Method 2: Try pm.enableEdit with specific options for polyline
                          if (pmObject.enableEdit) {
                            // Check if this is a polyline to apply specific restrictions
                            if (layer instanceof (L as any).Polyline) {
                              pmObject.enableEdit({
                                allowAddingVertices: false, // Polyline cannot add new vertices
                                allowRemovingVertices: false, // Polyline cannot remove vertices
                                allowMovingVertices: true, // Polyline can only move existing vertices
                                allowMiddleMarkers: false, // CRITICAL: Prevent middle markers
                              });
                              console.log(
                                "✅ Method 2: pm.enableEdit for polyline (no add/remove vertices)"
                              );

                              // Apply additional protection for polyline
                              if (!layer._vertexProtectionInterval) {
                                const originalLatLngs = layer.getLatLngs();
                                layer._originalLatLngs = originalLatLngs;
                                console.log(
                                  `💾 Method 2: Stored original polyline with ${originalLatLngs.length} vertices`
                                );

                                const vertexProtectionInterval = setInterval(
                                  () => {
                                    if (layer && layer._originalLatLngs) {
                                      const currentLatLngs = layer.getLatLngs();
                                      if (
                                        currentLatLngs.length >
                                        layer._originalLatLngs.length
                                      ) {
                                        console.log(
                                          `🚫 Method 2: VERTEX ADDITION DETECTED! Current: ${currentLatLngs.length}, Original: ${layer._originalLatLngs.length}`
                                        );
                                        layer.setLatLngs(
                                          layer._originalLatLngs
                                        );
                                        console.log(
                                          "🔄 Method 2: Polyline restored to original state"
                                        );
                                      }
                                    }
                                  },
                                  50
                                );

                                layer._vertexProtectionInterval =
                                  vertexProtectionInterval;
                              }
                            } else {
                              pmObject.enableEdit();
                              console.log(
                                "✅ Method 2: pm.enableEdit for other shapes"
                              );
                            }
                          }

                          // Method 3: Try pm.enableScale (DISABLED for edit mode)
                          // if (pmObject.enableScale) {
                          //   pmObject.enableScale();
                          //   console.log("✅ Method 3: pm.enableScale");
                          // }

                          // Method 4: Try pm.enableDrag (DISABLED for edit mode)
                          // if (pmObject.enableDrag) {
                          //   pmObject.enableDrag();
                          //   console.log("✅ Method 4: pm.enableDrag");
                          // }

                          // Method 5: Try pm.enableRotate (DISABLED for edit mode)
                          // if (pmObject.enableRotate) {
                          //   pmObject.enableRotate();
                          //   console.log("✅ Method 5: pm.enableRotate");
                          // }

                          // Method 6: Try pm.enable with string mode and specific options
                          if (pmObject.enable) {
                            // Check if this is a polyline to apply specific restrictions
                            if (layer instanceof (L as any).Polyline) {
                              pmObject.enable("edit", {
                                allowAddingVertices: false, // Polyline cannot add new vertices
                                allowRemovingVertices: false, // Polyline cannot remove vertices
                                allowMovingVertices: true, // Polyline can only move existing vertices
                                allowMiddleMarkers: false, // CRITICAL: Prevent middle markers
                              });
                              console.log(
                                "✅ Method 6: pm.enable('edit') for polyline (no add/remove vertices)"
                              );

                              // Apply additional protection for polyline
                              if (!layer._vertexProtectionInterval) {
                                const originalLatLngs = layer.getLatLngs();
                                layer._originalLatLngs = originalLatLngs;
                                console.log(
                                  `💾 Method 6: Stored original polyline with ${originalLatLngs.length} vertices`
                                );

                                const vertexProtectionInterval = setInterval(
                                  () => {
                                    if (layer && layer._originalLatLngs) {
                                      const currentLatLngs = layer.getLatLngs();
                                      if (
                                        currentLatLngs.length >
                                        layer._originalLatLngs.length
                                      ) {
                                        console.log(
                                          `🚫 Method 6: VERTEX ADDITION DETECTED! Current: ${currentLatLngs.length}, Original: ${layer._originalLatLngs.length}`
                                        );
                                        layer.setLatLngs(
                                          layer._originalLatLngs
                                        );
                                        console.log(
                                          "🔄 Method 6: Polyline restored to original state"
                                        );
                                      }
                                    }
                                  },
                                  50
                                );

                                layer._vertexProtectionInterval =
                                  vertexProtectionInterval;
                              }
                            } else {
                              pmObject.enable("edit", {
                                allowMiddleMarkers: false, // CRITICAL: Prevent middle markers
                              });
                              console.log(
                                "✅ Method 6: pm.enable('edit') for other shapes"
                              );
                            }
                          }
                        } catch (error) {
                          console.log("❌ Error enabling edit mode:", error);
                        }

                        // Check if any method worked
                        setTimeout(() => {
                          console.log(
                            "🔍 Checking if mode was actually enabled..."
                          );
                          console.log(
                            "Layer PM enabled:",
                            pmObject.enabled
                              ? pmObject.enabled()
                              : "No enabled method"
                          );
                          console.log(
                            "Layer PM editing:",
                            pmObject.editing
                              ? pmObject.editing()
                              : "No editing method"
                          );
                          console.log(
                            "Layer PM scaling:",
                            pmObject.scaling
                              ? pmObject.scaling()
                              : "No scaling method"
                          );
                          console.log(
                            "Layer PM dragging:",
                            pmObject.dragging
                              ? pmObject.dragging()
                              : "No dragging method"
                          );
                          console.log(
                            "Layer PM rotating:",
                            pmObject.rotating
                              ? pmObject.rotating()
                              : "No rotating method"
                          );
                        }, 100);
                      } else {
                        console.log(
                          "❌ This is NOT a real Leaflet shape, cannot enable editing"
                        );
                      }

                      console.log("✅ Edit enabled");
                      return; // Stop after finding the first valid shape

                      // Verify if mode was actually enabled
                      setTimeout(() => {
                        console.log(
                          "🔍 Checking if mode was actually enabled..."
                        );
                        console.log(
                          "Layer PM enabled:",
                          (layer as any).pm.enabled()
                        );
                        // Check if vertices are visible
                        console.log(
                          "🔍 Layer element:",
                          layer.getElement
                            ? layer.getElement()
                            : "No getElement method"
                        );
                        console.log(
                          "🔍 Layer bounds:",
                          layer.getBounds
                            ? layer.getBounds()
                            : "No getBounds method"
                        );
                      }, 100);
                    }
                  } catch (error) {
                    console.log("❌ Error in fallback:", error);
                  }
                }
              });
            }
          } else if (mapRefs.drawingModeRef.current === "scale") {
            const clickedLayer = e.target || e.layer || e.sourceTarget;
            console.log(
              "🔄 Scale mode - clickedLayer:",
              clickedLayer?.constructor?.name
            );
            console.log(
              "🔍 Clicked layer type:",
              clickedLayer?.constructor?.name
            );
            console.log(
              "🔍 Has getBounds method:",
              typeof clickedLayer?.getBounds === "function"
            );
            console.log(
              "🔍 Has getLatLngs method:",
              typeof clickedLayer?.getLatLngs === "function"
            );

            // Check if this layer has our selective editing click handler
            const hasSelectiveEditing =
              (clickedLayer as any)._events &&
              (clickedLayer as any)._events.click &&
              (clickedLayer as any)._events.click.some(
                (handler: any) =>
                  handler.fn &&
                  handler.fn.toString().includes("mapRefs.drawingModeRef.current")
              );

            if (hasSelectiveEditing) {
              console.log(
                "✅ Layer has selective editing - letting selective editing handle it"
              );
              return; // Let the selective editing click handler take over
            }

            if (
              clickedLayer &&
              (clickedLayer as any).pm &&
              typeof (clickedLayer as any).pm.enable === "function"
            ) {
              try {
                (clickedLayer as any).pm.enable({ mode: "scale" });
                console.log("✅ Scale mode enabled for layer");
              } catch (error) {
                console.log("❌ Error enabling scale mode:", error);
              }
            } else {
              console.log(
                "⚠️ Layer doesn't have valid pm.enable method, trying fallback..."
              );
              // Fallback: find layer by click point
              const clickPoint = map.containerPointToLatLng(e.containerPoint);
              map.eachLayer((layer: any) => {
                if (
                  layer &&
                  (layer as any).pm &&
                  typeof (layer as any).pm.enable === "function" &&
                  layer.getBounds
                ) {
                  try {
                    const bounds = layer.getBounds();
                    if (bounds.contains(clickPoint)) {
                      console.log(
                        "🎯 Found layer at click point:",
                        layer.constructor.name
                      );
                      console.log(
                        "🔍 Fallback layer PM object:",
                        (layer as any).pm
                      );
                      console.log(
                        "🔍 Fallback layer PM enable method:",
                        typeof (layer as any).pm.enable
                      );

                      console.log("🔍 Trying to enable rotate mode...");

                      // First, disable ALL other layers to ensure single selection
                      map.eachLayer((otherLayer: any) => {
                        if (
                          otherLayer !== layer &&
                          otherLayer.pm &&
                          otherLayer.pm.disable
                        ) {
                          try {
                            otherLayer.pm.disable();
                            console.log(
                              "🔒 Disabled other layer:",
                              otherLayer.constructor.name
                            );
                          } catch (error) {
                            console.log(
                              "⚠️ Could not disable other layer:",
                              error
                            );
                          }
                        }
                      });

                      // Check if this is a real Leaflet-Geoman layer
                      const pmObject = (layer as any).pm;
                      const availableMethods = Object.getOwnPropertyNames(
                        pmObject
                      ).filter((name) => typeof pmObject[name] === "function");

                      console.log("🔍 Available PM methods:", availableMethods);
                      console.log(
                        "🔍 PM object type:",
                        pmObject.constructor.name
                      );
                      console.log("🔍 Layer type:", layer.constructor.name);
                      console.log(
                        "🔍 Layer instanceof L.Path:",
                        layer instanceof (L as any).Path
                      );

                      // Check if this is a real Leaflet shape
                      if (
                        layer instanceof (L as any).Path ||
                        layer instanceof (L as any).Polygon ||
                        layer instanceof (L as any).Polyline ||
                        layer instanceof (L as any).Circle ||
                        layer instanceof (L as any).CircleMarker ||
                        layer instanceof (L as any).Rectangle
                      ) {
                        // Check if this is a Geoman-created layer (not from GeoJSON)
                        const isGeomanLayer =
                          (layer as any)._pm &&
                          (layer as any)._pm._enabled !== undefined;
                        const isFromGeoJSON =
                          (layer as any).feature &&
                          (layer as any).feature.properties;

                        console.log("🔍 Is Geoman layer:", isGeomanLayer);
                        console.log("🔍 Is from GeoJSON:", isFromGeoJSON);

                        if (isFromGeoJSON) {
                          console.log(
                            "❌ This is a GeoJSON layer, cannot be rotated"
                          );
                          return;
                        }

                        console.log(
                          "✅ This is a real Leaflet shape, trying to enable rotate..."
                        );

                        try {
                          // First disable any existing modes
                          if (pmObject.disable) {
                            pmObject.disable();
                          }

                          // Enable rotate mode with proper options
                          pmObject.enable({
                            mode: "rotate",
                            allowEditing: false,
                            allowScaling: false,
                            allowMiddleMarkers: false,
                            allowSelfIntersection: false,
                            allowSelfIntersectionEdit: false,
                          });

                          console.log("✅ Rotate mode enabled successfully");
                        } catch (error) {
                          console.log("❌ Error enabling rotate mode:", error);
                        }
                      } else {
                        console.log(
                          "❌ This is NOT a real Leaflet shape, cannot enable rotating"
                        );
                      }
                    }
                  } catch (error) {
                    console.log("❌ Error in fallback:", error);
                  }
                }
              });
            }
          } else if (mapRefs.drawingModeRef.current === "drag") {
            const clickedLayer = e.target || e.layer || e.sourceTarget;
            console.log(
              "🚚 Drag mode - clickedLayer:",
              clickedLayer?.constructor?.name
            );

            // Check if this layer has our selective editing click handler
            const hasSelectiveEditing =
              (clickedLayer as any)._events &&
              (clickedLayer as any)._events.click &&
              (clickedLayer as any)._events.click.some(
                (handler: any) =>
                  handler.fn &&
                  handler.fn.toString().includes("mapRefs.drawingModeRef.current")
              );

            if (hasSelectiveEditing) {
              console.log(
                "✅ Layer has selective editing - letting selective editing handle it"
              );
              return; // Let the selective editing click handler take over
            }

            // Check if there's already a shape being dragged
            if (drawing.draggedShape && drawing.draggedShape !== clickedLayer) {
              // Disable drag on the previous shape
              try {
                if (
                  (drawing.draggedShape as any).pm &&
                  typeof (drawing.draggedShape as any).pm.disable === "function"
                ) {
                  (drawing.draggedShape as any).pm.disable();
                }
              } catch (error) {
                console.log("❌ Error disabling previous drag:", error);
              }

              // Reset drag state
              drawing.setDraggedShape(null);
              drawing.setOriginalShapePosition(null);
              drawing.setShowDragConfirmation(false);
              drawing.setPendingDragShape(null);

              console.log("🔄 Switched to new shape for dragging");
            }

            // If no shape is being dragged or same shape clicked, enable drag
            if (
              clickedLayer &&
              (clickedLayer as any).pm &&
              typeof (clickedLayer as any).pm.enable === "function"
            ) {
              try {
                // First, disable drag on all other layers
                map.eachLayer((layer: any) => {
                  if (layer && layer !== clickedLayer && layer.pm) {
                    try {
                      if (typeof layer.pm.disableDrag === "function") {
                        layer.pm.disableDrag();
                      } else if (typeof layer.pm.disable === "function") {
                        layer.pm.disable();
                      }
                    } catch (error) {
                      // Ignore errors
                    }
                  }
                });

                // Store original position before enabling drag
                const originalPosition = clickedLayer.getLatLngs
                  ? clickedLayer.getLatLngs()
                  : null;

                (clickedLayer as any).pm.enableLayerDrag();

                // Add visual feedback for selected shape
                if (clickedLayer.setStyle) {
                  clickedLayer.setStyle({
                    weight: 4,
                    opacity: 0.8,
                    color: "#ff6b6b",
                    fillOpacity: 0.3,
                    fillColor: "#ff6b6b",
                  });
                } else if (clickedLayer.setIcon) {
                  // For markers
                  const selectedIcon = (L as any).divIcon({
                    html: '<div style="background-color: #ff6b6b; border: 3px solid #ffffff; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);"></div>',
                    className: "selected-marker",
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  });
                  clickedLayer.setIcon(selectedIcon);
                }

                console.log("✅ Drag mode enabled for layer");

                // Store the dragged shape and its original position
                drawing.setDraggedShape(clickedLayer);
                drawing.setOriginalShapePosition(originalPosition);
                drawing.setShowDragConfirmation(true);
              } catch (error) {
                console.log("❌ Error enabling drag mode:", error);
              }
            } else {
              console.log(
                "⚠️ Layer doesn't have valid pm.enable method, trying fallback..."
              );
              // Fallback: find layer by click point
              const clickPoint = map.containerPointToLatLng(e.containerPoint);
              map.eachLayer((layer: any) => {
                if (
                  layer &&
                  (layer as any).pm &&
                  typeof (layer as any).pm.enable === "function" &&
                  layer.getBounds
                ) {
                  try {
                    const bounds = layer.getBounds();
                    if (bounds.contains(clickPoint)) {
                      console.log(
                        "🎯 Found layer at click point:",
                        layer.constructor.name
                      );
                      console.log(
                        "🔍 Fallback layer PM object:",
                        (layer as any).pm
                      );
                      console.log(
                        "🔍 Fallback layer PM enable method:",
                        typeof (layer as any).pm.enable
                      );

                      console.log("🔍 Trying to enable drag mode...");

                      // First, disable ALL other layers to ensure single selection
                      map.eachLayer((otherLayer: any) => {
                        if (
                          otherLayer !== layer &&
                          otherLayer.pm &&
                          otherLayer.pm.disable
                        ) {
                          try {
                            otherLayer.pm.disable();
                            console.log(
                              "🔒 Disabled other layer:",
                              otherLayer.constructor.name
                            );
                          } catch (error) {
                            console.log(
                              "⚠️ Could not disable other layer:",
                              error
                            );
                          }
                        }
                      });

                      // Check if this is a real Leaflet-Geoman layer
                      const pmObject = (layer as any).pm;
                      const availableMethods = Object.getOwnPropertyNames(
                        pmObject
                      ).filter((name) => typeof pmObject[name] === "function");

                      console.log("🔍 Available PM methods:", availableMethods);
                      console.log(
                        "🔍 PM object type:",
                        pmObject.constructor.name
                      );
                      console.log("🔍 Layer type:", layer.constructor.name);
                      console.log(
                        "🔍 Layer instanceof L.Path:",
                        layer instanceof (L as any).Path
                      );

                      // Check if this is a real Leaflet shape
                      if (
                        layer instanceof (L as any).Path ||
                        layer instanceof (L as any).Polygon ||
                        layer instanceof (L as any).Polyline ||
                        layer instanceof (L as any).Circle ||
                        layer instanceof (L as any).CircleMarker ||
                        layer instanceof (L as any).Rectangle
                      ) {
                        // Check if this is a Geoman-created layer (not from GeoJSON)
                        const isGeomanLayer =
                          (layer as any)._pm &&
                          (layer as any)._pm._enabled !== undefined;
                        const isFromGeoJSON =
                          (layer as any).feature &&
                          (layer as any).feature.properties;

                        console.log("🔍 Is Geoman layer:", isGeomanLayer);
                        console.log("🔍 Is from GeoJSON:", isFromGeoJSON);

                        if (isFromGeoJSON) {
                          console.log(
                            "❌ This is a GeoJSON layer, cannot be dragged"
                          );
                          return;
                        }

                        console.log(
                          "✅ This is a real Leaflet shape, trying to enable drag..."
                        );

                        try {
                          // Method 1: Try pm.enable with options - ONLY DRAG MODE
                          if (pmObject.enable) {
                            pmObject.enableLayerDrag();

                            // Add visual feedback for selected shape
                            if (clickedLayer.setStyle) {
                              clickedLayer.setStyle({
                                weight: 4,
                                opacity: 0.8,
                                color: "#ff6b6b",
                                fillOpacity: 0.3,
                                fillColor: "#ff6b6b",
                              });
                            } else if (clickedLayer.setIcon) {
                              // For markers
                              const selectedIcon = (L as any).divIcon({
                                html: '<div style="background-color: #ff6b6b; border: 3px solid #ffffff; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);"></div>',
                                className: "selected-marker",
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                              });
                              clickedLayer.setIcon(selectedIcon);
                            }

                            console.log(
                              "✅ Method 1: pm.enable with drag mode (no edit/scale/rotate)"
                            );

                            // Store the dragged shape and show confirmation
                            drawing.setDraggedShape(layer);
                            drawing.setOriginalShapePosition(
                              layer.getLatLngs ? layer.getLatLngs() : null
                            );
                            drawing.setShowDragConfirmation(true);
                          }

                          // Method 2: Try pm.enableDrag
                          if (pmObject.enableDrag) {
                            pmObject.enableDrag();
                            console.log("✅ Method 2: pm.enableDrag");
                          }

                          // Method 3: Try pm.enable with string mode
                          if (pmObject.enable) {
                            pmObject.enable("drag", {
                              allowMiddleMarkers: false, // CRITICAL: Prevent middle markers
                            });
                            console.log("✅ Method 3: pm.enable('drag')");
                          }
                        } catch (error) {
                          console.log("❌ Error enabling drag mode:", error);
                        }

                        // Check if any method worked
                        setTimeout(() => {
                          console.log(
                            "🔍 Checking if drag mode was actually enabled..."
                          );
                          console.log(
                            "Layer PM enabled:",
                            pmObject.enabled
                              ? pmObject.enabled()
                              : "No enabled method"
                          );
                          console.log(
                            "Layer PM dragging:",
                            pmObject.dragging
                              ? pmObject.dragging()
                              : "No dragging method"
                          );
                        }, 100);
                      } else {
                        console.log(
                          "❌ This is NOT a real Leaflet shape, cannot enable dragging"
                        );
                      }

                      console.log("✅ Drag mode enabled via fallback");
                      return; // Stop after finding the first valid shape

                      // Verify if mode was actually enabled
                      setTimeout(() => {
                        console.log(
                          "🔍 Checking if drag mode was actually enabled..."
                        );
                        console.log(
                          "Layer PM enabled:",
                          (layer as any).pm.enabled()
                        );
                        // Check if vertices are visible
                        console.log(
                          "🔍 Layer element:",
                          layer.getElement
                            ? layer.getElement()
                            : "No getElement method"
                        );
                        console.log(
                          "🔍 Layer bounds:",
                          layer.getBounds
                            ? layer.getBounds()
                            : "No getBounds method"
                        );
                      }, 100);
                    }
                  } catch (error) {
                    console.log("❌ Error in fallback:", error);
                  }
                }
              });
            }
          } else if (mapRefs.drawingModeRef.current === "remove") {
            const clickedLayer = e.target || e.layer || e.sourceTarget;
            console.log(
              "🗑️ Remove mode - clickedLayer:",
              clickedLayer?.constructor?.name
            );

            // Check if this layer has our selective editing click handler
            const hasSelectiveEditing =
              (clickedLayer as any)._events &&
              (clickedLayer as any)._events.click &&
              (clickedLayer as any)._events.click.some(
                (handler: any) =>
                  handler.fn &&
                  handler.fn.toString().includes("mapRefs.drawingModeRef.current")
              );

            if (hasSelectiveEditing) {
              console.log(
                "✅ Layer has selective editing - letting selective editing handle it"
              );
              return; // Let the selective editing click handler take over
            }

            if (clickedLayer && (clickedLayer as any).pm) {
              showConfirmation(
                "Konfirmasi Hapus",
                "Apakah yakin ingin menghapus layer ini?",
                () => {
                  try {
                    if ((clickedLayer as any).pm.remove) {
                      (clickedLayer as any).pm.remove();
                      console.log("✅ Layer removed successfully");
                    } else if ((clickedLayer as any).remove) {
                      clickedLayer.remove();
                      console.log("✅ Layer removed using fallback");
                    }
                  } catch (error) {
                    console.log("❌ Error removing layer:", error);
                  }
                }
              );
            } else {
              console.log("❌ No layer clicked for removal");
            }
          }
        });

        // Use pm:click event for better layer detection
        map.on("pm:click", (e: any) => {
          // Skip jika bangunan sedang diklik
          if (mapRefs.isBuildingClickedRef.current) {
            return;
          }

          console.log("🎯 PM click event - mode:", mapRefs.drawingModeRef.current);

          if (mapRefs.drawingModeRef.current === "edit") {
            try {
              (e.target as any).pm.enable({
                mode: "edit",
                allowEditing: false,
                allowScaling: true,
              });
              console.log("✅ Edit enabled");
            } catch (error) {
              console.log("❌ Error in PM click edit:", error);
            }
          } else if (mapRefs.drawingModeRef.current === "scale") {
            try {
              (e.target as any).pm.enable({ mode: "scale" });
              console.log("✅ Scale mode enabled via PM click");
            } catch (error) {
              console.log("❌ Error in PM click scale:", error);
            }
          } else if (mapRefs.drawingModeRef.current === "drag") {
            try {
              // First, disable drag on all other layers
              map.eachLayer((layer: any) => {
                if (layer && layer !== e.target && layer.pm) {
                  try {
                    if (typeof layer.pm.disableDrag === "function") {
                      layer.pm.disableDrag();
                    } else if (typeof layer.pm.disable === "function") {
                      layer.pm.disable();
                    }
                  } catch (error) {
                    // Ignore errors
                  }
                }
              });

              (e.target as any).pm.enableLayerDrag();

              // Add visual feedback for selected shape
              if (e.target.setStyle) {
                e.target.setStyle({
                  weight: 4,
                  opacity: 0.8,
                  color: "#ff6b6b",
                  fillOpacity: 0.3,
                  fillColor: "#ff6b6b",
                });
              } else if (e.target.setIcon) {
                // For markers
                const selectedIcon = (L as any).divIcon({
                  html: '<div style="background-color: #ff6b6b; border: 3px solid #ffffff; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);"></div>',
                  className: "selected-marker",
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                });
                e.target.setIcon(selectedIcon);
              }

              console.log("✅ Drag mode enabled via PM click");

              // Store the dragged shape and show confirmation
              drawing.setDraggedShape(e.target);
              drawing.setOriginalShapePosition(
                e.target.getLatLngs ? e.target.getLatLngs() : null
              );
              drawing.setShowDragConfirmation(true);
            } catch (error) {
              console.log("❌ Error in PM click drag:", error);
            }
          }
        });

        // Monitor layer additions
        map.on("layeradd", (e: any) => {
          if (e.layer && (e.layer as any).pm) {
            console.log(
              "➕ New layer added with pm:",
              e.layer.constructor.name
            );
          }
        });

        // Removed individual layer click handlers to avoid conflicts

        // Auto-disable modes after operations complete
        map.on("pm:edit", (e: any) => {
          if (mapRefs.drawingModeRef.current === "edit" && !drawing.isEditingShape) {
            try {
              (e.target as any).pm.disable();
              console.log("🔄 Edit disabled");
              // Reset drawing state setelah edit selesai
              drawing.setDrawingMode(null);
              drawing.setIsDrawingEnabled(false);
              // Update ref langsung untuk memastikan state ter-update
              mapRefs.isDrawingEnabledRef.current = false;
              mapRefs.drawingModeRef.current = null;
            } catch (error) {
              console.log("❌ Error disabling edit mode:", error);
            }
          } else if (drawing.isEditingShape) {
            console.log("🔄 Edit completed - waiting for user confirmation");
          }
        });

        map.on("pm:drag", (e: any) => {
          if (mapRefs.drawingModeRef.current === "drag") {
            try {
              (e.target as any).pm.disable();
              console.log("🔄 Drag mode auto-disabled");
              // Reset drawing state setelah drag selesai
              drawing.setDrawingMode(null);
              drawing.setIsDrawingEnabled(false);
              // Update ref langsung untuk memastikan state ter-update
              mapRefs.isDrawingEnabledRef.current = false;
              mapRefs.drawingModeRef.current = null;
            } catch (error) {
              console.log("❌ Error disabling drag mode:", error);
            }
          }
        });
      }

      return () => {
        if (map && (map as any).pm) {
          // Remove event listeners
          map.off("pm:create");
          map.off("pm:drawstart");
          map.off("pm:drawend");
          map.off("pm:edit");
          map.off("pm:remove");
          map.off("pm:cut");
          map.off("pm:scale");
          map.off("pm:drag");
          map.off("click");
          map.off("pm:click");
          map.off("layeradd");

          // Remove click events from individual layers
          map.eachLayer((layer: any) => {
            if (layer && (layer as any).pm) {
              try {
                layer.off("click");
              } catch (error) {
                console.log("Error removing click event from layer:", error);
              }
            }
          });

          // Cleanup circle marker mode if exists
          if ((map as any)._circleMarkerCleanup) {
            (map as any)._circleMarkerCleanup();
            delete (map as any)._circleMarkerCleanup;
          }

          // Cleanup Geoman.js - only use methods that exist
          try {
            if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
          } catch (error) {
            console.log("Could not disable global edit mode:", error);
          }
          try {
            if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
          } catch (error) {
            console.log("Could not disable global drag mode:", error);
          }
          try {
            if (map.pm.disableGlobalRemovalMode)
              map.pm.disableGlobalRemovalMode();
          } catch (error) {
            console.log("Could not disable global removal mode:", error);
          }
          try {
            if (map.pm.disableGlobalCutMode) map.pm.disableGlobalCutMode();
          } catch (error) {
            console.log("Could not disable global cut mode:", error);
          }
        }
      };
    }, [isDashboard]);

    // Handle drawing mode changes
    useEffect(() => {
      const map = mapRefs.leafletMapRef.current;
      if (!map || !isDashboard || !(map as any).pm) return;

      // Fungsi untuk mengatur cursor
      const setDrawingCursor = () => {
        const mapContainer = map.getContainer();
        if (mapContainer) {
          mapContainer.style.cursor = "crosshair";
        }
      };

      const resetCursor = () => {
        const mapContainer = map.getContainer();
        if (mapContainer) {
          mapContainer.style.cursor = "";
        }
      };

      // Disable all modes first - only use methods that exist
      try {
        if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
      } catch (error) {
        console.log("Could not disable global edit mode:", error);
      }
      try {
        if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
      } catch (error) {
        console.log("Could not disable global drag mode:", error);
      }
      try {
        if (map.pm.disableGlobalRemovalMode) map.pm.disableGlobalRemovalMode();
      } catch (error) {
        console.log("Could not disable global removal mode:", error);
      }
      try {
        if (map.pm.disableGlobalCutMode) map.pm.disableGlobalCutMode();
      } catch (error) {
        console.log("Could not disable global cut mode:", error);
      }

      // Disable drawing mode if available - try multiple methods
      if ((map as any).pm.disableDraw) {
        (map as any).pm.disableDraw();
      } else if ((map as any).pm.disablePolygonDraw) {
        (map as any).pm.disablePolygonDraw();
      } else if ((map as any).pm.disableLineDraw) {
        (map as any).pm.disableLineDraw();
      } else if ((map as any).pm.disableCircleDraw) {
        (map as any).pm.disableCircleDraw();
      }

      // Cleanup circle marker mode if exists
      if ((map as any)._circleMarkerCleanup) {
        (map as any)._circleMarkerCleanup();
        delete (map as any)._circleMarkerCleanup;
      }

      // Enable the selected mode
      if (drawing.drawingMode) {
        // Set cursor crosshair untuk semua drawing modes
        setDrawingCursor();

        switch (drawing.drawingMode) {
          case "polygon":
            // Try to enable polygon drawing
            try {
              if ((map as any).pm.enableDraw) {
                (map as any).pm.enableDraw("Polygon");
              } else if ((map as any).pm.enablePolygonDraw) {
                (map as any).pm.enablePolygonDraw();
              } else if ((map as any).pm.setGlobalOptions) {
                (map as any).pm.setGlobalOptions({
                  mode: "draw",
                  shape: "Polygon",
                });
              } else {
                // Last resort: try to enable any drawing mode
                (map as any).pm.enableDraw();
              }
            } catch (error) {
              console.log("Polygon drawing not available:", error);
            }
            break;
          case "polyline":
            // Enable polyline drawing dengan mode 1 garis lurus saja
            try {
              if ((map as any).pm.enableDraw) {
                // Gunakan mode Line yang hanya memerlukan 2 titik
                (map as any).pm.enableDraw("Line", {
                  // Konfigurasi untuk polyline 1 garis lurus
                  continueDrawing: false, // Tidak bisa lanjut drawing
                  finishOn: "click", // Selesai saat klik kedua
                  maxPoints: 2, // Maksimal hanya 2 titik
                });
              } else if ((map as any).pm.enableLineDraw) {
                (map as any).pm.enableLineDraw({
                  continueDrawing: false,
                  finishOn: "click",
                  maxPoints: 2,
                });
              } else if ((map as any).pm.setGlobalOptions) {
                (map as any).pm.setGlobalOptions({
                  mode: "draw",
                  shape: "Line",
                  continueDrawing: false,
                  finishOn: "click",
                  maxPoints: 2,
                });
              } else {
                // Last resort: try to enable any drawing mode
                (map as any).pm.enableDraw();
              }
              console.log(
                "Polyline drawing mode activated - click 2 points to create a straight line"
              );
            } catch (error) {
              console.log("Polyline drawing not available:", error);
            }
            break;
          case "circle":
            // Enable circle marker drawing (multiple markers until tool is clicked again)
            try {
              // Disable any existing drawing mode first
              if ((map as any).pm.disableDraw) {
                (map as any).pm.disableDraw();
              }

              // Set up click handler untuk circle marker
              const handleCircleMarkerClick = (e: any) => {
                // Skip jika bangunan sedang diklik
                if (mapRefs.isBuildingClickedRef.current) {
                  return;
                }

                const { lat, lng } = e.latlng;

                // Create circle marker
                const circleMarker = L.circleMarker([lat, lng], {
                  radius: 8,
                  fillColor: "#3b82f6",
                  color: "#1e40af",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8,
                }).addTo(map);

                // Add selective editing functionality to the circle marker
                if ((circleMarker as any).pm) {
                  // Enable PM for the circle marker but keep it disabled by default
                  (circleMarker as any).pm.enable({
                    allowEditing: true,
                    allowScaling: true,
                    allowRotating: true,
                    allowDrag: true,
                    allowRemoval: true,
                    allowCutting: true,
                    allowAddingVertices: true,
                    allowRemovingVertices: true,
                    allowMovingVertices: true,
                    allowMiddleMarkers: true,
                  });
                  // Disable PM by default - it will be enabled selectively
                  (circleMarker as any).pm.disable();

                  // Add click handler for selective editing
                  circleMarker.on("click", function (e: L.LeafletMouseEvent) {
                    // Check if drawing mode is active
                    if (!mapRefs.drawingModeRef.current) {
                      return;
                    }

                    // Reset all other layers to disabled state
                    if (mapRefs.bangunanLayerRef.current) {
                      (mapRefs.bangunanLayerRef.current as any).eachLayer(
                        (otherLayer: any) => {
                          if (otherLayer.pm && otherLayer !== circleMarker) {
                            otherLayer.pm.disable();
                          }
                        }
                      );
                    }
                    if (mapRefs.jalurLayerRef.current) {
                      (mapRefs.jalurLayerRef.current as any).eachLayer(
                        (otherLayer: any) => {
                          if (otherLayer.pm && otherLayer !== circleMarker) {
                            otherLayer.pm.disable();
                          }
                        }
                      );
                    }
                    if (mapRefs.titikLayerRef.current) {
                      (mapRefs.titikLayerRef.current as any).eachLayer(
                        (otherLayer: any) => {
                          if (otherLayer.pm && otherLayer !== circleMarker) {
                            otherLayer.pm.disable();
                          }
                        }
                      );
                    }
                    if (mapRefs.nonBangunanLayerRef.current) {
                      (mapRefs.nonBangunanLayerRef.current as any).eachLayer(
                        (otherLayer: any) => {
                          if (otherLayer.pm && otherLayer !== circleMarker) {
                            otherLayer.pm.disable();
                          }
                        }
                      );
                    }

                    // If there's already a shape being edited, disable it first
                    if (
                      drawing.isEditingShape &&
                      drawing.editingShape &&
                      drawing.editingShape !== circleMarker
                    ) {
                      console.log("🔄 Disabling previous editing shape");
                      if ((drawing.editingShape as any).pm) {
                        (drawing.editingShape as any).pm.disable();
                      }
                      drawing.setIsEditingShape(false);
                      drawing.setEditingShape(null);
                      drawing.setOriginalShapeData(null);
                    }

                    // Also disable PM on all other layers in the map
                    map.eachLayer((otherLayer: any) => {
                      if (
                        otherLayer.pm &&
                        otherLayer !== circleMarker &&
                        otherLayer !== map
                      ) {
                        otherLayer.pm.disable();
                      }
                    });

                    // Enable PM for this specific layer based on drawing mode
                    try {
                      if (mapRefs.drawingModeRef.current === "edit") {
                        // Save original shape data
                        const originalData = {
                          latLng: circleMarker.getLatLng(),
                          radius: circleMarker.getRadius(),
                          type: circleMarker.constructor.name,
                        };
                        drawing.setOriginalShapeData(originalData);
                        drawing.setEditingShape(circleMarker);
                        drawing.setIsEditingShape(true);

                        (circleMarker as any).pm.enable({ allowEditing: true });

                        // Add visual feedback for selected circle marker
                        circleMarker.setStyle({
                          weight: 4,
                          opacity: 0.8,
                          color: "#4CAF50",
                          fillOpacity: 0.3,
                          fillColor: "#4CAF50",
                        });

                        console.log("✅ Edit enabled for circle marker");
                      } else if (mapRefs.drawingModeRef.current === "scale") {
                        (circleMarker as any).pm.enable({
                          allowScaling: true,
                        });
                        console.log("✅ Scale enabled for circle marker");
                      } else if (mapRefs.drawingModeRef.current === "drag") {
                        // First, disable drag on all other layers
                        map.eachLayer((otherLayer: any) => {
                          if (
                            otherLayer &&
                            otherLayer !== circleMarker &&
                            otherLayer.pm
                          ) {
                            try {
                              if (
                                typeof otherLayer.pm.disableDrag === "function"
                              ) {
                                otherLayer.pm.disableDrag();
                              } else if (
                                typeof otherLayer.pm.disable === "function"
                              ) {
                                otherLayer.pm.disable();
                              }
                            } catch (error) {
                              // Ignore errors
                            }
                          }
                        });

                        (circleMarker as any).pm.enableLayerDrag();

                        // Add visual feedback for selected circle marker
                        circleMarker.setStyle({
                          weight: 4,
                          opacity: 0.8,
                          color: "#ff6b6b",
                          fillOpacity: 0.3,
                          fillColor: "#ff6b6b",
                        });

                        console.log("✅ Drag enabled for circle marker");

                        // Store the dragged shape and show confirmation
                        drawing.setDraggedShape(circleMarker);
                        drawing.setOriginalShapePosition(
                          circleMarker.getLatLng
                            ? circleMarker.getLatLng()
                            : null
                        );
                        drawing.setShowDragConfirmation(true);
                      } else if (mapRefs.drawingModeRef.current === "remove") {
                        (circleMarker as any).pm.enable({ allowRemoval: true });

                        // Add visual feedback for selected circle marker
                        circleMarker.setStyle({
                          weight: 4,
                          opacity: 0.8,
                          color: "#f44336",
                          fillOpacity: 0.3,
                          fillColor: "#f44336",
                        });

                        console.log("✅ Remove enabled for circle marker");
                      }
                    } catch (error) {
                      console.log(
                        "❌ Error enabling PM for circle marker:",
                        error
                      );
                    }
                  });

                  console.log("✅ PM enabled for circle marker");
                }

                // Add to map
                console.log("Circle marker created at:", lat, lng);

                // Jangan reset drawing mode, biarkan user bisa tambah marker lagi
                // Drawing mode hanya akan reset ketika user klik tombol marker lagi
              };

              // Add click event listener
              map.on("click", handleCircleMarkerClick);

              // Store cleanup function
              (map as any)._circleMarkerCleanup = () => {
                map.off("click", handleCircleMarkerClick);
              };

              console.log(
                "Circle marker mode activated - click on map to place markers, click tool again to finish"
              );
            } catch (error) {
              console.log("Circle marker mode not available:", error);
            }
            break;
          case "edit":
            // Disable drag mode on all layers when switching to edit mode
            try {
              if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
              map.eachLayer((layer: any) => {
                if (
                  layer &&
                  layer.pm &&
                  typeof layer.pm.disableDrag === "function"
                ) {
                  try {
                    layer.pm.disableDrag();
                  } catch (error) {
                    // Ignore errors
                  }
                }
              });
            } catch (error) {
              // Ignore errors
            }
            // Don't enable global edit mode - just set flag for click handler
            console.log("Edit mode activated");
            // Cursor sudah di-set di atas dengan setDrawingCursor()
            break;
          case "drag":
            // Disable other modes when switching to drag mode
            try {
              if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
              if (map.pm.disableGlobalRemovalMode)
                map.pm.disableGlobalRemovalMode();
              if (map.pm.disableGlobalCutMode) map.pm.disableGlobalCutMode();

              // Disable layer-specific modes
              map.eachLayer((layer: any) => {
                if (layer && layer.pm) {
                  try {
                    if (typeof layer.pm.disable === "function")
                      layer.pm.disable();
                  } catch (error) {
                    // Ignore errors
                  }
                }
              });
            } catch (error) {
              // Ignore errors
            }
            console.log("Drag mode activated - click on a layer to drag it");
            // Cursor sudah di-set di atas dengan setDrawingCursor()
            break;
          case "remove":
            // Disable drag mode on all layers when switching to remove mode
            try {
              if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
              map.eachLayer((layer: any) => {
                if (
                  layer &&
                  layer.pm &&
                  typeof layer.pm.disableDrag === "function"
                ) {
                  try {
                    layer.pm.disableDrag();
                  } catch (error) {
                    // Ignore errors
                  }
                }
              });
            } catch (error) {
              // Ignore errors
            }
            // Don't enable global removal mode - just set flag for click handler
            console.log(
              "Remove mode activated - click on a layer to remove it"
            );
            // Cursor sudah di-set di atas dengan setDrawingCursor()
            break;
          case "scale":
            // Disable drag mode on all layers when switching to scale mode
            try {
              if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
              map.eachLayer((layer: any) => {
                if (
                  layer &&
                  layer.pm &&
                  typeof layer.pm.disableDrag === "function"
                ) {
                  try {
                    layer.pm.disableDrag();
                  } catch (error) {
                    // Ignore errors
                  }
                }
              });
            } catch (error) {
              // Ignore errors
            }
            // Don't enable global scale mode - just set flag for click handler
            console.log("Scale mode activated - click on a layer to scale it");
            // Cursor sudah di-set di atas dengan setDrawingCursor()
            break;
        }
      } else {
        // Disable all PM modes when drawing is disabled
        try {
          // Disable all global modes
          if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
          if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
          if (map.pm.disableGlobalRemovalMode)
            map.pm.disableGlobalRemovalMode();
          if (map.pm.disableGlobalCutMode) map.pm.disableGlobalCutMode();

          // Disable drawing modes
          if (map.pm.disableDraw) map.pm.disableDraw();

          // Disable all layer-specific modes
          map.eachLayer((layer: any) => {
            if (layer && layer.pm) {
              try {
                if (typeof layer.pm.disable === "function") layer.pm.disable();
                if (typeof layer.pm.disableDrag === "function")
                  layer.pm.disableDrag();
                if (typeof layer.pm.disableEdit === "function")
                  layer.pm.disableEdit();
                if (typeof layer.pm.disableRotate === "function")
                  layer.pm.disableRotate();
                if (typeof layer.pm.disableScale === "function")
                  layer.pm.disableScale();
                if (typeof layer.pm.disableRemoval === "function")
                  layer.pm.disableRemoval();
              } catch (error) {
                // Ignore errors
              }
            }
          });
        } catch (error) {
          // Ignore errors
        }

        // Reset drag state when drawing is disabled
        drawing.setDraggedShape(null);
        drawing.setOriginalShapePosition(null);
        drawing.setShowDragConfirmation(false);
        drawing.setPendingDragShape(null);

        // Reset cursor jika tidak ada drawing mode aktif
        resetCursor();
      }
    }, [drawing.drawingMode, isDashboard]);

    // Control map interactions berdasarkan highlight state, navigation state, dan drawing state
    useEffect(() => {
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;

      // Update refs untuk digunakan di event handler Leaflet
      mapRefs.isHighlightActiveRef.current = highlight.isHighlightActive;
      mapRefs.isNavigationActiveRef.current = routing.isNavigationActive;

      // Jika navigation aktif, enable map interactions (bisa di-geser)
      if (routing.isNavigationActive) {
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
      // Jika drawing mode aktif (terutama drag mode), enable map interactions
      else if (drawing.isDrawingEnabled && drawing.drawingMode) {
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
      // Jika highlight aktif tapi navigation dan drawing tidak aktif, disable map interactions
      else if (highlight.isHighlightActive) {
        // Disable map interactions
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        // Add click handler untuk canvas area dengan delay (hanya jika navigation tidak aktif)
        setTimeout(() => {
          const handleCanvasClick = (e: Event) => {
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

            // Cek apakah klik pada kontrol peta (zoom in/out, reset, layer toggle, config.basemap toggle, GPS)
            const target = e.target as Element;
            const isMapControl =
              target.closest(".leaflet-control-zoom") || // Zoom in/out buttons
              target.closest(".leaflet-control-layers") || // Layer control
              target.closest('[data-control="reset-zoom"]') || // Reset zoom button
              target.closest('[data-control="toggle-layer"]') || // Toggle layer button
              target.closest('[data-control="toggle-config.basemap"]') || // Toggle config.basemap button
              target.closest('[data-control="zoom-in"]') || // Zoom in button
              target.closest('[data-control="zoom-out"]') || // Zoom out button
              target.closest('[data-control="locate-me"]') || // GPS button
              target.closest(".leaflet-control-attribution") || // Attribution
              target.closest(".leaflet-control-scale"); // Scale control

            // Cek apakah klik terjadi pada bangunan (polygon) atau elemen SVG lainnya
            const pathElement = target.closest("path");
            const svgElement = target.closest("svg");
            const isClickOnBuilding =
              (pathElement &&
                pathElement.getAttribute("fill") !== "none" &&
                pathElement.getAttribute("stroke") !== "none") ||
              (svgElement && svgElement.closest(".leaflet-zoom-animated"));
            console.log("🔍 isClickOnBuilding:", isClickOnBuilding);

            if (
              container &&
              !container.contains(e.target as Node) &&
              !routeModal &&
              !isMapControl &&
              isClickInsideMap &&
              !isClickOnBuilding &&
              !mapRefs.isBuildingClickedRef.current
            ) {
              // Klik di luar container tapi di dalam area peta, tutup detail
              console.log("🖱️ Canvas clicked - closing building detail");
              ui.setCardVisible(false);
              highlight.setIsHighlightActive(false);

              // Tambahkan efek shake pada container sebelum ditutup untuk memberikan feedback visual
              if (container) {
                animation.setIsContainerShaking(true);
                setTimeout(() => {
                  animation.setIsContainerShaking(false);
                  setTimeout(() => features.setSelectedFeature(null), 350);
                }, 600);
              } else {
                setTimeout(() => features.setSelectedFeature(null), 350);
              }
            }
          };

          // Cleanup function untuk dijalankan saat highlight nonaktif
          const cleanup = () => {
            document.removeEventListener("click", handleCanvasClick);
            const mapContainer = document.querySelector(".leaflet-container");
            if (mapContainer) {
              mapContainer.removeEventListener("click", handleCanvasClick);
            }
          };

          document.addEventListener("click", handleCanvasClick);
          const mapContainer = document.querySelector(".leaflet-container");
          if (mapContainer) {
            mapContainer.addEventListener("click", handleCanvasClick);
          }

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
    }, [highlight.isHighlightActive, routing.isNavigationActive, drawing.isDrawingEnabled, drawing.drawingMode]);

    // Helper functions for cursor management
    const setDrawingCursor = () => {
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.style.cursor = "crosshair";
      }
    };

    const resetCursor = () => {
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.style.cursor = "";
      }
    };

    // Control map interactions berdasarkan highlight state, navigation state, dan drawing state
    useEffect(() => {
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;

      // Update refs untuk digunakan di event handler Leaflet
      mapRefs.isHighlightActiveRef.current = highlight.isHighlightActive;
      mapRefs.isNavigationActiveRef.current = routing.isNavigationActive;

      // Jika navigation aktif, enable map interactions (bisa di-geser)
      if (routing.isNavigationActive) {
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
      // Jika drawing mode aktif (terutama drag mode), enable map interactions
      else if (drawing.isDrawingEnabled && drawing.drawingMode) {
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
      // Jika highlight aktif tapi navigation dan drawing tidak aktif, disable map interactions
      else if (highlight.isHighlightActive) {
        // Disable map interactions
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        // Add click handler untuk canvas area dengan delay (hanya jika navigation tidak aktif)
        setTimeout(() => {
          const handleCanvasClick = (e: Event) => {
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

            // Cek apakah klik pada kontrol peta (zoom in/out, reset, layer toggle, config.basemap toggle, GPS)
            const target = e.target as Element;
            const isMapControl =
              target.closest(".leaflet-control-zoom") || // Zoom in/out buttons
              target.closest(".leaflet-control-layers") || // Layer control
              target.closest('[data-control="reset-zoom"]') || // Reset zoom button
              target.closest('[data-control="toggle-layer"]') || // Toggle layer button
              target.closest('[data-control="toggle-config.basemap"]') || // Toggle config.basemap button
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
              animation.setIsContainerShaking(true);
              setTimeout(() => animation.setIsContainerShaking(false), 600);
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
              target.closest('[data-control="toggle-config.basemap"]') ||
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
              animation.setIsContainerShaking(true);
              shakeCooldown = true;
              setTimeout(() => {
                animation.setIsContainerShaking(false);
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
    }, [highlight.isHighlightActive, routing.isNavigationActive, drawing.isDrawingEnabled, drawing.drawingMode]);

    // Sync routeLine state dengan mapRefs.routeLineRef
    useEffect(() => {
      mapRefs.routeLineRef.current = routeLine as L.Polyline | null;
    }, [routeLine]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest(".route-modal-select")) {
          routing.setIsStartDropdownOpen(false);
        }
      };

      if (routing.isStartDropdownOpen) {
        document.addEventListener("click", handleClickOutside);
      }

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [routing.isStartDropdownOpen]);

    // Update config.basemap layer
    useEffect(() => {
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;
      if (mapRefs.basemapLayerRef.current) {
        try {
          if (map.hasLayer(mapRefs.basemapLayerRef.current)) {
            map.removeLayer(mapRefs.basemapLayerRef.current);
          }
        } catch {}
        mapRefs.basemapLayerRef.current = null;
      }
      const bm = BASEMAPS.find((b) => b.key === config.basemap) || BASEMAPS[1];
      const tileLayer = L.tileLayer(bm.url, {
        attribution: bm.attribution,
        maxZoom: 19,
      });
      tileLayer.addTo(map);
      mapRefs.basemapLayerRef.current = tileLayer;
    }, [config.basemap]);

    // Update non-bangunan layer jika data berubah
    useEffect(() => {
      const nonBangunanLayer = mapRefs.nonBangunanLayerRef.current;
      if (!nonBangunanLayer) return;
      nonBangunanLayer.clearLayers();
      if (config.layerVisible && features.nonBangunanFeatures.length > 0) {
        nonBangunanLayer.addData({
          type: "FeatureCollection",
          features: features.nonBangunanFeatures as unknown as FeatureFixed[],
        } as GeoJSON.FeatureCollection);
      }
    }, [features.nonBangunanFeatures, config.layerVisible]);

    // Update bangunan layer jika data berubah
    useEffect(() => {
      const bangunanLayer = mapRefs.bangunanLayerRef.current;
      const map = mapRefs.leafletMapRef.current;
      if (!bangunanLayer || !map) return;
      bangunanLayer.clearLayers();
      if (config.layerVisible && features.bangunanFeatures.length > 0) {
        bangunanLayer.addData({
          type: "FeatureCollection",
          features: features.bangunanFeatures as unknown as FeatureFixed[],
        } as GeoJSON.FeatureCollection);
      }
    }, [features.bangunanFeatures, config.layerVisible]);

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

      if (edit.isEditingName || edit.isEditingThumbnail) {
        document.addEventListener("mousedown", handleClickOutsideEdit);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutsideEdit);
      };
    }, [edit.isEditingName, edit.isEditingThumbnail]);

    // Event listener untuk keyboard shortcuts pada modal edit
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (edit.isEditingName || edit.isEditingThumbnail || edit.isEditingInteraksi) {
          if (event.key === "Enter") {
            event.preventDefault();
            if (
              !loading.isSaving &&
              ((edit.isEditingName && edit.editName.trim()) ||
                (edit.isEditingThumbnail && edit.editThumbnail.trim()) ||
                (edit.isEditingInteraksi && edit.editInteraksi) ||
                (edit.isEditingName &&
                  edit.isEditingInteraksi &&
                  edit.editName.trim() &&
                  edit.editInteraksi))
            ) {
              handleSaveEdit();
            }
          } else if (event.key === "Escape") {
            event.preventDefault();
            handleCancelEdit();
          }
        }
      };

      if (edit.isEditingName || edit.isEditingThumbnail || edit.isEditingInteraksi) {
        document.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [
      edit.isEditingName,
      edit.isEditingThumbnail,
      edit.isEditingInteraksi,
      edit.editName,
      edit.selectedFile,
      edit.editInteraksi,
      loading.isSaving,
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

    // Aktifkan GPS otomatis saat halaman pertama kali dimuat
    useEffect(() => {
      // Hapus startLiveTracking otomatis - GPS hanya akan aktif saat tombol lokasi diklik
      // startLiveTracking();

      // Cleanup saat component unmount
      return () => {
        stopLiveTracking();
      };
    }, []); // Hanya jalankan sekali saat mount

    // Event listener untuk fokus ke lokasi pengguna
    useEffect(() => {
      const handleFocusToUserLocation = (event: MessageEvent) => {
        if (event.data.type === "focus-to-user-location" && userLocation) {
          const map = mapRefs.leafletMapRef.current;
          if (map) {
            map.setView(userLocation, Math.max(map.getZoom(), 16), {
              animate: true,
              duration: 1,
            });
          }
        }
      };

      window.addEventListener("message", handleFocusToUserLocation);
      return () => {
        window.removeEventListener("message", handleFocusToUserLocation);
      };
    }, [userLocation]);

    // Fungsi helper untuk highlight bangunan
    const highlightBangunan = (featureId: number) => {
      const bangunanLayer = mapRefs.bangunanLayerRef.current;
      if (!bangunanLayer) return;

      // Reset highlight sebelumnya jika ada
      if (highlight.searchHighlightedId && highlight.searchHighlightedId !== featureId) {
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
      highlight.setSearchHighlightedId(featureId);
    };

    // Fungsi untuk reset highlight bangunan
    const resetBangunanHighlight = () => {
      const bangunanLayer = mapRefs.bangunanLayerRef.current;
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
      const bangunanLayer = mapRefs.bangunanLayerRef.current;
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
      if (highlight.isHighlightActive) {
        console.log(
          "⚠️ Container detail sedang terbuka, tutup dulu untuk memilih bangunan lain"
        );

        // Tambahkan efek shake pada container detail bangunan yang sedang aktif
        animation.setIsContainerShaking(true);
        setTimeout(() => animation.setIsContainerShaking(false), 600);
        return;
      }

      const map = mapRefs.leafletMapRef.current;
      if (!map) return;

      // Tampilkan detail bangunan dan zoom ke lokasi
      if (feature.properties?.displayType === "ruangan") {
        const bangunanId = feature.properties?.bangunan_id;
        const bangunan = features.bangunanFeatures.find(
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
              features.setSelectedFeature(bangunan);
              ui.setCardVisible(true);
              openBuildingDetailModal(feature);
              // Samakan perilaku dengan klik bangunan: nonaktifkan interaksi peta dan highlight bangunan
              highlight.setIsHighlightActive(true);
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
            features.setSelectedFeature(bangunan);
            ui.setCardVisible(true);
            openBuildingDetailModal(feature);
            // Samakan perilaku dengan klik bangunan: nonaktifkan interaksi peta dan highlight bangunan
            highlight.setIsHighlightActive(true);
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
          highlight.setIsHighlightActive(true);

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
      if (highlight.searchHighlightedId) {
        resetBangunanHighlight();
        highlight.setSearchHighlightedId(null);
      }

      if (
        feature.properties?.kategori === "Bangunan" ||
        feature.properties?.displayType === "bangunan"
      ) {
        features.setSelectedFeature(feature);
        ui.setCardVisible(true);
        highlight.setIsHighlightActive(true);
      }
    };

    // Toggle config.basemap
    const handleToggleBasemap = () => {
      if (config.isSatellite) {
        config.setBasemap(isDark ?? false ? "alidade_smooth_dark" : "esri_topo");
        config.setIsSatellite(false);
      } else {
        config.setBasemap("esri_satellite");
        config.setIsSatellite(true);
      }
    };

    // Toggle layer
    const handleToggleLayer = () => {
      config.setLayerVisible((v) => !v);
    };

    // Toggle layer jalur dan titik untuk dashboard admin
    const toggleJalurLayer = (show: boolean) => {
      layerVisibility.setJalurLayerVisible(show);
      // Layer visibility akan dihandle oleh useEffect yang mengawasi layerVisibility.jalurLayerVisible
    };

    const toggleTitikLayer = (show: boolean) => {
      layerVisibility.setTitikLayerVisible(show);
      // Layer visibility akan dihandle oleh useEffect yang mengawasi layerVisibility.titikLayerVisible
    };

    const toggleBangunanLayer = (show: boolean) => {
      layerVisibility.setBangunanLayerVisible(show);
      // Layer visibility akan dihandle oleh useEffect yang mengawasi layerVisibility.bangunanLayerVisible
    };

    // Function to reset visual feedback for a specific shape only
    const resetShapeVisualFeedback = (layer: any) => {
      if (!layer) return;

      console.log("🔄 Resetting visual feedback for layer:", layer);

      // Don't change any colors - just remove the border
      // Shape should keep its original appearance

      // Remove rectangle border
      removeRectangleBorder(layer);

      console.log("✅ Visual feedback reset completed");
    };

    // Function to disable/enable shape interactions
    const setShapeInteractions = (enabled: boolean) => {
      if (!mapRefs.leafletMapRef.current) return;

      mapRefs.leafletMapRef.current.eachLayer((layer: any) => {
        if (layer && layer !== drawing.activeShape) {
          // Disable/enable click events on other shapes
          if (enabled) {
            // Re-enable click events
            if (layer._originalClickHandler) {
              layer.on("click", layer._originalClickHandler);
            }
          } else {
            // Store original click handler and disable
            if (layer._events?.click) {
              layer._originalClickHandler = layer._events.click[0]?.fn;
              layer.off("click");
            }
          }
        }
      });
    };

    // Function to add rectangle border like photo editing apps
    const addRectangleBorder = (layer: any, mode: string) => {
      if (!layer) return;

      // Remove existing border first
      removeRectangleBorder(layer);

      // Get layer bounds
      const bounds = layer.getBounds();

      // Create rectangle border using polygon
      const rectangleBorder = (L as any).polygon(
        [
          bounds.getNorthWest(),
          bounds.getNorthEast(),
          bounds.getSouthEast(),
          bounds.getSouthWest(),
        ],
        {
          color: "#808080", // Gray border
          weight: 2,
          opacity: 1,
          fillColor: "transparent",
          fillOpacity: 0,
          className: "rectangle-border",
          interactive: false,
        }
      );

      rectangleBorder.addTo(mapRefs.leafletMapRef.current);

      // Add event listeners to update border when shape changes
      const updateBorder = () => {
        if (layer._rectangleBorder && layer.getBounds) {
          const bounds = layer.getBounds();
          const newBorder = (L as any).polygon(
            [
              bounds.getNorthWest(),
              bounds.getNorthEast(),
              bounds.getSouthEast(),
              bounds.getSouthWest(),
            ],
            {
              color: "#808080", // Gray border
              weight: 2,
              opacity: 1,
              fillColor: "transparent",
              fillOpacity: 0,
              className: "rectangle-border",
              interactive: false,
            }
          );

          // Remove old border and add new one
          if (mapRefs.leafletMapRef.current) {
            mapRefs.leafletMapRef.current.removeLayer(layer._rectangleBorder);
            newBorder.addTo(mapRefs.leafletMapRef.current);
            layer._rectangleBorder = newBorder;
          }
        }
      };

      // Store update function on layer
      layer._updateBorder = updateBorder;

      // Add event listeners for shape changes
      layer.on("pm:edit", updateBorder);
      layer.on("pm:drag", updateBorder);
      layer.on("pm:rotate", updateBorder);
      layer.on("pm:scale", updateBorder);

      // Store border on layer
      layer._rectangleBorder = rectangleBorder;
    };

    // Function to remove rectangle border
    const removeRectangleBorder = (layer: any) => {
      console.log("🔄 Removing rectangle border for layer:", layer);

      if (layer._rectangleBorder) {
        console.log("📍 Found rectangle border, removing...");
        if (mapRefs.leafletMapRef.current) {
          mapRefs.leafletMapRef.current.removeLayer(layer._rectangleBorder);
        }
        delete layer._rectangleBorder;
        console.log("✅ Rectangle border removed from map");
      } else {
        console.log("⚠️ No rectangle border found on layer");
      }

      // Remove event listeners
      if (layer._updateBorder) {
        console.log("🔄 Removing event listeners...");
        layer.off("pm:edit", layer._updateBorder);
        layer.off("pm:drag", layer._updateBorder);
        layer.off("pm:rotate", layer._updateBorder);
        layer.off("pm:scale", layer._updateBorder);
        delete layer._updateBorder;
        console.log("✅ Event listeners removed");
      }

      console.log("✅ Rectangle border removal completed");
    };

    // Function to apply visual feedback to a specific shape
    const applyVisualFeedback = (layer: any, mode: string) => {
      if (!layer) return;

      // Check if there's already an active shape
      if (drawing.activeShape && drawing.activeShape !== layer) {
        // Show confirmation modal to switch to new shape
        drawing.setPendingNewShape({ layer, mode });
        ui.setShowShapeSwitchModal(true);
        return;
      }

      // Set new active shape
      drawing.setActiveShape(layer);

      // Disable interactions on other shapes
      setShapeInteractions(false);

      // Add rectangle border like photo editing apps
      addRectangleBorder(layer, mode);
    };

    // Function to handle shape switch confirmation
    const handleConfirmShapeSwitch = () => {
      if (drawing.pendingNewShape) {
        // Reset current active shape
        if (drawing.activeShape) {
          resetShapeVisualFeedback(drawing.activeShape);
        }

        // Enable interactions on all shapes temporarily
        setShapeInteractions(true);

        // Set new active shape
        drawing.setActiveShape(drawing.pendingNewShape.layer);

        // Disable interactions on other shapes again
        setShapeInteractions(false);

        // Apply visual feedback to new shape
        const { layer, mode } = drawing.pendingNewShape;
        addRectangleBorder(layer, mode);

        // Reset pending state
        drawing.setPendingNewShape(null);
        ui.setShowShapeSwitchModal(false);
      }
    };

    const handleCancelShapeSwitch = () => {
      drawing.setPendingNewShape(null);
      ui.setShowShapeSwitchModal(false);
    };

    // Drawing tool handlers
    const handleDrawingModeChange = (mode: string | null) => {
      // Reset editing state when changing drawing mode
      if (drawing.isEditingShape && drawing.editingShape) {
        console.log(
          "🔄 Resetting previous editing shape when changing drawing mode"
        );
        // Don't disable PM - just reset state
        drawing.setIsEditingShape(false);
        drawing.setEditingShape(null);
        drawing.setOriginalShapeData(null);
      }

      // Reset drag state when changing drawing mode
      if (drawing.draggedShape) {
        console.log(
          "🔄 Resetting previous dragged shape when changing drawing mode"
        );
        // Don't disable PM - just reset state
        drawing.setDraggedShape(null);
        drawing.setOriginalShapePosition(null);
        drawing.setShowDragConfirmation(false);
        drawing.setPendingDragShape(null);
      }

      // Reset active shape when changing drawing mode
      if (drawing.activeShape) {
        resetShapeVisualFeedback(drawing.activeShape);
        drawing.setActiveShape(null);
        setShapeInteractions(true);
      }

      drawing.setDrawingMode(mode);
      drawing.setIsDrawingEnabled(!!mode);
    };

    // Edit confirmation handlers
    const handleSaveEditConfirmation = () => {
      if (drawing.editingShape) {
        console.log("✅ Edit changes saved");

        // Reset visual feedback and active shape
        if (drawing.activeShape) {
          console.log("🔄 Resetting drawing.activeShape after edit save:", drawing.activeShape);
          resetShapeVisualFeedback(drawing.activeShape);
          drawing.setActiveShape(null);
          console.log("✅ drawing.activeShape reset to null");
        }

        // Re-enable interactions on all shapes
        setShapeInteractions(true);

        // Disable PM to allow re-enabling for future operations
        if ((drawing.editingShape as any).pm) {
          try {
            (drawing.editingShape as any).pm.disable();
            console.log("✅ PM disabled after edit save");

            // Verify PM is actually disabled
            setTimeout(() => {
              if (
                (drawing.editingShape as any).pm &&
                (drawing.editingShape as any).pm.enabled()
              ) {
                console.log("⚠️ PM is still enabled after disable!");
              } else {
                console.log("✅ PM is properly disabled");
              }
            }, 100);
          } catch (error) {
            console.log("❌ Error disabling PM after edit save:", error);
          }
        }

        // Reset editing state
        drawing.setIsEditingShape(false);
        drawing.setEditingShape(null);
        drawing.setOriginalShapeData(null);
        // Don't reset drawing mode completely - keep it available for next use
        // Just clear the active shape so buildings can be clicked
        // drawing.setDrawingMode(null);
        // drawing.setIsDrawingEnabled(false);
        // mapRefs.drawingModeRef.current = null;
        // mapRefs.isDrawingEnabledRef.current = false;
      }
    };

    const handleCancelEditConfirmation = () => {
      if (drawing.editingShape && drawing.originalShapeData) {
        console.log("❌ Edit changes cancelled - restoring original shape");
        try {
          // Restore original shape data
          if (
            drawing.editingShape instanceof (L as any).Polygon ||
            drawing.editingShape instanceof (L as any).Polyline
          ) {
            drawing.editingShape.setLatLngs(drawing.originalShapeData.latLngs);
          } else if (
            drawing.editingShape instanceof (L as any).Circle ||
            drawing.editingShape instanceof (L as any).CircleMarker
          ) {
            drawing.editingShape.setLatLng(drawing.originalShapeData.latLng);
            if (drawing.originalShapeData.radius) {
              drawing.editingShape.setRadius(drawing.originalShapeData.radius);
            }
          }

          // Don't change any colors - shape should keep its original appearance

          // Disable PM to allow re-enabling for future operations
          if ((drawing.editingShape as any).pm) {
            try {
              (drawing.editingShape as any).pm.disable();
              console.log("✅ PM disabled after edit cancel");

              // Verify PM is actually disabled
              setTimeout(() => {
                if (
                  (drawing.editingShape as any).pm &&
                  (drawing.editingShape as any).pm.enabled()
                ) {
                  console.log("⚠️ PM is still enabled after disable!");
                } else {
                  console.log("✅ PM is properly disabled");
                }
              }, 100);
            } catch (error) {
              console.log("❌ Error disabling PM after edit cancel:", error);
            }
          }

          console.log("✅ Shape restored to original state");

          // Reset visual feedback and active shape
          if (drawing.activeShape) {
            console.log(
              "🔄 Resetting drawing.activeShape after edit cancel:",
              drawing.activeShape
            );
            resetShapeVisualFeedback(drawing.activeShape);
            drawing.setActiveShape(null);
            console.log("✅ drawing.activeShape reset to null");
          }

          // Re-enable interactions on all shapes
          setShapeInteractions(true);
        } catch (error) {
          console.log("❌ Error restoring shape:", error);
        }

        // Reset editing state
        drawing.setIsEditingShape(false);
        drawing.setEditingShape(null);
        drawing.setOriginalShapeData(null);
        // Don't reset drawing mode completely - keep it available for next use
        // Just clear the active shape so buildings can be clicked
        // drawing.setDrawingMode(null);
        // drawing.setIsDrawingEnabled(false);
        // mapRefs.drawingModeRef.current = null;
        // mapRefs.isDrawingEnabledRef.current = false;
      }
    };

    // Drag confirmation handlers
    const handleConfirmDrag = () => {
      console.log("✅ User confirmed drag - saving shape position");

      // Reset visual feedback and active shape
      if (drawing.activeShape) {
        resetShapeVisualFeedback(drawing.activeShape);
        drawing.setActiveShape(null);
      }

      // Re-enable interactions on all shapes
      setShapeInteractions(true);

      // Disable PM to allow re-enabling for future operations
      if (drawing.draggedShape && (drawing.draggedShape as any).pm) {
        try {
          (drawing.draggedShape as any).pm.disable();
          console.log("✅ PM disabled after drag save");

          // Verify PM is actually disabled
          setTimeout(() => {
            if (
              (drawing.draggedShape as any).pm &&
              (drawing.draggedShape as any).pm.enabled()
            ) {
              console.log("⚠️ PM is still enabled after disable!");
            } else {
              console.log("✅ PM is properly disabled");
            }
          }, 100);
        } catch (error) {
          console.log("❌ Error disabling PM after drag save:", error);
        }
      }

      // Reset drag state
      drawing.setDraggedShape(null);
      drawing.setOriginalShapePosition(null);
      drawing.setShowDragConfirmation(false);
      drawing.setPendingDragShape(null);

      // Don't reset drawing mode completely - keep it available for next use
      // Just clear the active shape so buildings can be clicked
      // drawing.setDrawingMode(null);
      // drawing.setIsDrawingEnabled(false);
      // mapRefs.drawingModeRef.current = null;
      // mapRefs.isDrawingEnabledRef.current = false;

      console.log("✅ Drag completed and saved - buildings can now be clicked");
    };

    const handleCancelDrag = () => {
      console.log("❌ User cancelled drag - reverting shape position");

      // Revert the shape to its original position
      if (drawing.draggedShape && drawing.originalShapePosition) {
        try {
          if (
            drawing.draggedShape instanceof (L as any).Polygon ||
            drawing.draggedShape instanceof (L as any).Polyline
          ) {
            drawing.draggedShape.setLatLngs(drawing.originalShapePosition);
          } else if (
            drawing.draggedShape instanceof (L as any).Circle ||
            drawing.draggedShape instanceof (L as any).CircleMarker
          ) {
            drawing.draggedShape.setLatLng(drawing.originalShapePosition);
          }

          // Don't change any colors - shape should keep its original appearance

          // Disable PM to allow re-enabling for future operations
          if ((drawing.draggedShape as any).pm) {
            try {
              (drawing.draggedShape as any).pm.disable();
              console.log("✅ PM disabled after drag cancel");

              // Verify PM is actually disabled
              setTimeout(() => {
                if (
                  (drawing.draggedShape as any).pm &&
                  (drawing.draggedShape as any).pm.enabled()
                ) {
                  console.log("⚠️ PM is still enabled after disable!");
                } else {
                  console.log("✅ PM is properly disabled");
                }
              }, 100);
            } catch (error) {
              console.log("❌ Error disabling PM after drag cancel:", error);
            }
          }

          console.log("✅ Shape reverted to original position");
        } catch (error) {
          console.log("❌ Error reverting shape:", error);
        }
      }

      // Reset visual feedback and active shape
      if (drawing.activeShape) {
        resetShapeVisualFeedback(drawing.activeShape);
        drawing.setActiveShape(null);
      }

      // Re-enable interactions on all shapes
      setShapeInteractions(true);

      // Reset drag state
      drawing.setDraggedShape(null);
      drawing.setOriginalShapePosition(null);
      drawing.setShowDragConfirmation(false);
      drawing.setPendingDragShape(null);

      // Don't reset drawing mode completely - keep it available for next use
      // Just clear the active shape so buildings can be clicked
      // drawing.setDrawingMode(null);
      // drawing.setIsDrawingEnabled(false);
      // mapRefs.drawingModeRef.current = null;
      // mapRefs.isDrawingEnabledRef.current = false;

      console.log(
        "✅ Drag cancelled and reverted - buildings can now be clicked"
      );
    };

    const handleToggleDrawing = () => {
      const newState = !drawing.isDrawingEnabled;
      drawing.setIsDrawingEnabled(newState);
      if (!newState) {
        drawing.setDrawingMode(null);
      }
    };

    // Reset zoom/center
    const handleResetZoom = () => {
      const map = mapRefs.leafletMapRef.current;
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
      if (!config.isSatellite && isDark !== undefined) {
        config.setBasemap(isDark ?? false ? "alidade_smooth_dark" : "esri_topo");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark]);

    // Fungsi untuk handle klik tombol GPS - update GPS sekali dan fokus ke lokasi
    const handleLocateMe = () => {
      if (!navigator.geolocation) {
        showNotification(
          "error",
          "Error",
          "Browser tidak mendukung geolokasi."
        );
        return;
      }

      // Update GPS sekali saja setiap kali tombol diklik
      getCurrentLocation()
        .then(([lat, lng]) => {
          const map = mapRefs.leafletMapRef.current;
          if (map) {
            const userLatLng = L.latLng(lat, lng);
            map.setView(userLatLng, Math.max(map.getZoom(), 16), {
              animate: true,
              duration: 1,
            });
            showNotification(
              "success",
              "Lokasi Saya",
              "GPS diperbarui dan fokus ke lokasi Anda."
            );
          }
        })
        .catch((error) => {
          showNotification(
            "error",
            "Error",
            "Gagal mendapatkan lokasi GPS. Pastikan GPS aktif dan izin lokasi diberikan."
          );
        });
    };

    // Fungsi untuk membuat custom icon GPS marker seperti Google Maps
    const createUserMarkerIcon = (heading: number | null) => {
      const size = 32;
      return L.divIcon({
        html: `<div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                 <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: white; border: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center;">
                   <div style="width: ${size - 12}px; height: ${
          size - 12
        }px; border-radius: 50%; background: #3b82f6; border: 1px solid #3b82f6; position: relative;">
                     ${
                       heading !== null
                         ? `<div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%) rotate(${
                             heading + 180
                           }deg); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 20px solid #3b82f6; opacity: 1; z-index: 1000;">
                               <div style="position: absolute; top: -6px; left: -5px; width: 10px; height: 10px; border-radius: 50%; background: white; border: 1px solid #3b82f6;"></div>
                             </div>`
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
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;

      if (userLocation) {
        const heading = (userLocation as any).heading || userHeading;

        // Jika marker sudah ada, update posisinya
        if (mapRefs.userMarkerRef.current) {
          mapRefs.userMarkerRef.current.setLatLng(userLocation);
          mapRefs.userMarkerRef.current.setIcon(createUserMarkerIcon(heading));
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
          mapRefs.userMarkerRef.current = marker;
          console.log(
            "📍 GPS marker created at:",
            [userLocation.lat, userLocation.lng],
            "heading:",
            heading
          );
        }
      } else {
        // Hapus marker jika tidak ada lokasi
        if (mapRefs.userMarkerRef.current) {
          map.removeLayer(mapRefs.userMarkerRef.current);
          mapRefs.userMarkerRef.current = null;
          console.log("📍 GPS marker removed");
        }
      }

      // Cleanup
      return () => {
        if (mapRefs.userMarkerRef.current) {
          map.removeLayer(mapRefs.userMarkerRef.current);
          mapRefs.userMarkerRef.current = null;
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
      mapRefs.leafletMapRef as any
    );
    useEffect(() => {
      const map = mapRefs.leafletMapRef.current;
      if (!map) return;
      if (mapRefs.routeLineRef.current) {
        removeRouteLine(mapRefs.routeLineRef.current);
        mapRefs.routeLineRef.current = null;
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
        mapRefs.routeLineRef.current = line as any;
      }
      // Cleanup
      return () => {
        if (mapRefs.routeLineRef.current) {
          removeRouteLine(mapRefs.routeLineRef.current);
          mapRefs.routeLineRef.current = null;
        }
      };
    }, [userLocation, searchText, searchResults]);

    // Fungsi untuk menutup modal dengan animasi fade
    const closeBuildingDetailModal = () => {
      animation.setIsBuildingDetailFadingOut(true);
      setTimeout(() => {
        ui.setShowBuildingDetailCanvas(false);
        animation.setIsBuildingDetailFadingOut(false);

        // Reset search highlight saat modal ditutup
        if (highlight.searchHighlightedId) {
          resetBangunanHighlight();
          highlight.setSearchHighlightedId(null);
        }

        // Reset state lantai saat modal ditutup
        lantai.setLantaiFiles({});
        lantai.setLantaiPreviewUrls({});
        lantai.setSavedLantaiFiles({});
        lantai.setLantaiGambarData([]);
        lantai.setTambahLantaiFile(null);
        lantai.setTambahLantaiPreviewUrl(null);
      }, 300); // durasi animasi fade
    };

    // Fungsi untuk handle edit nama bangunan
    const handleEditName = () => {
      if (!features.selectedFeature?.properties?.nama) return;

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

      edit.setEditName(features.selectedFeature.properties.nama);
      edit.setIsEditingName(true);
    };

    // Fungsi untuk handle edit thumbnail
    const handleEditThumbnail = () => {
      if (!features.selectedFeature?.properties?.nama) return;

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

      edit.setSelectedFile(null);
      edit.setIsEditingThumbnail(true);
    };

    // Fungsi untuk handle edit interaksi
    const handleEditInteraksi = () => {
      if (!features.selectedFeature?.properties?.nama) return;

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

      edit.setIsEditingInteraksi(true);
      const currentInteraksi =
        features.selectedFeature?.properties?.interaksi || "Noninteraktif";
      edit.setEditInteraksi(currentInteraksi);
    };

    // Fungsi untuk handle edit lantai
    const handleEditLantai = async () => {
      if (!features.selectedFeature?.properties?.id) return;

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
          Number(features.selectedFeature.properties.id),
          token
        );
        lantai.setLantaiGambarData(data || []);

        // Ambil data ruangan untuk menghitung jumlah ruangan per lantai
        await fetchRuanganByBangunan(Number(features.selectedFeature.properties.id));

        // Reset state
        lantai.setLantaiFiles({});
        lantai.setLantaiPreviewUrls({});
        lantai.setSelectedLantaiFilter(1); // Reset filter ke lantai pertama

        // Inisialisasi lantai.savedLantaiFiles berdasarkan data yang sudah ada
        const savedFiles: { [key: number]: boolean } = {};
        if (data && data.length > 0) {
          data.forEach((lantai: any) => {
            const match = lantai.nama_file.match(/Lt(\d+)\.svg/i);
            if (match) {
              const lantaiNumber = parseInt(match[1]);
              savedFiles[lantaiNumber] = true;
            }
          });
        }
        lantai.setSavedLantaiFiles(savedFiles);

        edit.setIsEditingLantai(true);
      } catch (error) {
        lantai.setLantaiGambarData([]);
        edit.setIsEditingLantai(true);
      }
    };

    // Fungsi untuk simpan gambar lantai individual
    const handleSaveLantaiImage = async (lantaiNumber: number) => {
      try {
        const file = lantai.lantaiFiles[lantaiNumber];
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
        formData.append("id_bangunan", String(features.selectedFeature?.properties?.id));

        await createLantaiGambar(
          {
            file,
            lantaiNumber,
            bangunanId: Number(features.selectedFeature?.properties?.id),
          },
          token
        );

        // Refresh data lantai gambar
        if (features.selectedFeature?.properties?.id) {
          const data = await getLantaiGambarByBangunan(
            Number(features.selectedFeature.properties.id),
            token
          );
          lantai.setLantaiGambarData(data || []);

          // Update lantai.savedLantaiFiles berdasarkan data yang baru
          const savedFiles: { [key: number]: boolean } = {};
          if (data && data.length > 0) {
            data.forEach((lantai: any) => {
              const match = lantai.nama_file.match(/Lt(\d+)\.svg/i);
              if (match) {
                const lantaiNumber = parseInt(match[1]);
                savedFiles[lantaiNumber] = true;
              }
            });
          }
          lantai.setSavedLantaiFiles(savedFiles);
        }

        // Hapus file dari state setelah berhasil disimpan
        lantai.setLantaiFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[lantaiNumber];
          return newFiles;
        });
        lantai.setLantaiPreviewUrls((prev) => {
          const newUrls = { ...prev };
          if (newUrls[lantaiNumber]) {
            URL.revokeObjectURL(newUrls[lantaiNumber]!);
            delete newUrls[lantaiNumber];
          }
          return newUrls;
        });

        // Refresh modal jika sedang terbuka
        if (ui.showBuildingDetailCanvas) {
          await openBuildingDetailModal();
        }

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

        // Cari lantai yang akan dihapus untuk validasi
        const lantaiToDelete = lantai.lantaiGambarData.find(
          (l) => l.id_lantai_gambar === lantaiGambarId
        );
        if (!lantaiToDelete) {
          showNotification(
            "error",
            "Data Error",
            "Data lantai tidak ditemukan."
          );
          return;
        }

        // Validasi: hanya lantai teratas yang boleh dihapus
        const maxLantaiNumber = Math.max(
          ...lantai.lantaiGambarData.map((l) => {
            const match = (l?.nama_file || "").match(/Lt(\d+)\.svg/i);
            return match ? parseInt(match[1]) : 0;
          })
        );

        const currentLantaiNumber = parseInt(
          lantaiToDelete.nama_file.match(/Lt(\d+)\.svg/i)?.[1] || "0"
        );

        if (currentLantaiNumber !== maxLantaiNumber) {
          showNotification(
            "error",
            "Tidak Bisa Dihapus",
            `Lantai ${currentLantaiNumber} tidak bisa dihapus karena bukan lantai teratas. Hapus lantai ${maxLantaiNumber} terlebih dahulu.`
          );
          return;
        }

        await deleteLantaiGambar(lantaiGambarId, token);

        // Refresh data lantai gambar dan update field lantai di tabel bangunan
        if (features.selectedFeature?.properties?.id) {
          const bangunanId = Number(features.selectedFeature.properties.id);
          const lantaiData = await getLantaiGambarByBangunan(bangunanId, token);
          lantai.setLantaiGambarData(lantaiData || []);

          // Update field lantai di tabel bangunan
          const jumlahLantaiTersisa = lantaiData ? lantaiData.length : 0;
          const newLantaiValue = jumlahLantaiTersisa; // Gunakan jumlah lantai yang tersisa (0, 1, 2, dst)

          try {
            await updateBangunan(bangunanId, { lantai: newLantaiValue }, token);

            // Update features.selectedFeature properties dengan jumlah lantai yang baru
            if (features.selectedFeature && features.selectedFeature.properties) {
              features.selectedFeature.properties.lantai = newLantaiValue;
            }

            // Update lantai.savedLantaiFiles berdasarkan data yang baru
            const savedFiles: { [key: number]: boolean } = {};
            if (lantaiData && lantaiData.length > 0) {
              lantaiData.forEach((lantai: any) => {
                const match = lantai.nama_file.match(/Lt(\d+)\.svg/i);
                if (match) {
                  const lantaiNumber = parseInt(match[1]);
                  savedFiles[lantaiNumber] = true;
                }
              });
            }
            lantai.setSavedLantaiFiles(savedFiles);

            // Renumbering lantai setelah penghapusan
            await renumberLantaiAfterDelete(currentLantaiNumber);

            // Refresh modal dengan data terbaru secara immediate
            if (ui.showBuildingDetailCanvas) {
              // Refresh data tanpa tutup modal
              await openBuildingDetailModal();
            }
          } catch (error) {
            console.error("Gagal update field lantai di bangunan:", error);
            showNotification(
              "error",
              "Update tidak lengkap",
              "Gambar lantai berhasil dihapus tapi gagal update jumlah lantai di bangunan"
            );
          }
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

    // Fungsi untuk hapus lantai dan semua ruangan di dalamnya
    const handleDeleteLantai = async (lantaiNumber: number) => {
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

        if (!features.selectedFeature?.properties?.id) {
          showNotification(
            "error",
            "Data Error",
            "ID bangunan tidak ditemukan."
          );
          return;
        }

        const bangunanId = Number(features.selectedFeature.properties.id);

        // Validasi: hanya lantai teratas yang boleh dihapus
        const maxLantaiNumber = Math.max(
          ...lantai.lantaiGambarData.map((l) => {
            const match = (l?.nama_file || "").match(/Lt(\d+)\.svg/i);
            return match ? parseInt(match[1]) : 0;
          })
        );

        if (lantaiNumber !== maxLantaiNumber) {
          showNotification(
            "error",
            "Tidak Bisa Dihapus",
            `Lantai ${lantaiNumber} tidak bisa dihapus karena bukan lantai teratas. Hapus lantai ${maxLantaiNumber} terlebih dahulu.`
          );
          return;
        }

        // Hapus gambar lantai terlebih dahulu
        const lantaiGambar = lantai.lantaiGambarData.find((l) => {
          const match = (l?.nama_file || "").match(/Lt(\d+)\.svg/i);
          const extractedNumber = match ? parseInt(match[1]) : null;
          return extractedNumber === lantaiNumber;
        });

        if (lantaiGambar) {
          try {
            await deleteLantaiGambar(lantaiGambar.id_lantai_gambar, token);
          } catch (error) {
            console.error("Gagal menghapus gambar lantai:", error);
            showNotification(
              "error",
              "Gagal hapus gambar",
              "Gagal menghapus gambar lantai dari Cloudinary"
            );
            return;
          }
        }

        // Hapus semua ruangan di lantai tersebut
        const ruanganDiLantai = ruangan.ruanganList.filter(
          (ruangan) => ruangan.nomor_lantai === lantaiNumber
        );

        for (const ruangan of ruanganDiLantai) {
          try {
            // Hapus ruangan (gallery akan otomatis terhapus karena CASCADE)
            await deleteRuangan(ruangan.id_ruangan, token);
          } catch (error) {
            console.error(
              `Gagal menghapus ruangan ${ruangan.nama_ruangan}:`,
              error
            );
          }
        }

        // Refresh data lantai gambar untuk menghitung jumlah lantai yang tersisa
        const lantaiData = await getLantaiGambarByBangunan(bangunanId, token);
        lantai.setLantaiGambarData(lantaiData || []);

        // Update field lantai di tabel bangunan
        const jumlahLantaiTersisa = lantaiData ? lantaiData.length : 0;
        const newLantaiValue = jumlahLantaiTersisa; // Gunakan jumlah lantai yang tersisa (0, 1, 2, dst)

        try {
          await updateBangunan(bangunanId, { lantai: newLantaiValue }, token);

          // Update features.selectedFeature properties dengan jumlah lantai yang baru
          if (features.selectedFeature && features.selectedFeature.properties) {
            features.selectedFeature.properties.lantai = newLantaiValue;
          }

          // Refresh modal dengan data terbaru secara immediate
          if (ui.showBuildingDetailCanvas) {
            // Refresh data tanpa tutup modal
            await openBuildingDetailModal();
          }
        } catch (error) {
          console.error("Gagal update field lantai di bangunan:", error);
          showNotification(
            "error",
            "Update tidak lengkap",
            "Lantai berhasil dihapus tapi gagal update jumlah lantai di bangunan"
          );
        }

        // Renumbering lantai setelah penghapusan
        await renumberLantaiAfterDelete(lantaiNumber);

        // Refresh data ruangan
        await fetchRuanganByBangunan(bangunanId);

        // Update lantai.savedLantaiFiles
        const savedFiles: { [key: number]: boolean } = {};
        if (lantaiData && lantaiData.length > 0) {
          lantaiData.forEach((lantai: any) => {
            const match = lantai.nama_file.match(/Lt(\d+)\.svg/i);
            if (match) {
              const lantaiNumber = parseInt(match[1]);
              savedFiles[lantaiNumber] = true;
            }
          });
        }
        lantai.setSavedLantaiFiles(savedFiles);

        showNotification(
          "success",
          "Berhasil dihapus",
          `Lantai ${lantaiNumber} dan semua ruangan di dalamnya berhasil dihapus! Jumlah lantai tersisa: ${jumlahLantaiTersisa}`
        );
      } catch (error) {
        console.error("Error dalam handleDeleteLantai:", error);
        showNotification(
          "error",
          "Gagal dihapus",
          "Gagal menghapus lantai: " + (error as Error).message
        );
      }
    };

    // REMOVED: Unused Tambah Lantai modal handlers (handleAddLantai, handleTambahLantaiFileChange, handleSaveTambahLantai, handleCancelTambahLantai)

    // Fungsi untuk force refresh data lantai
    const refreshLantaiData = async () => {
      if (!features.selectedFeature?.properties?.id) return;

      try {
        const token = localStorage.getItem("token");
        if (token) {
          const lantaiData = await getLantaiGambarByBangunan(
            Number(features.selectedFeature.properties.id),
            token
          );
          lantai.setLantaiGambarData(lantaiData || []);

          // Update lantai.savedLantaiFiles
          const savedFiles: { [key: number]: boolean } = {};
          if (lantaiData && lantaiData.length > 0) {
            lantaiData.forEach((lantai: any) => {
              const match = lantai.nama_file.match(/Lt(\d+)\.svg/i);
              if (match) {
                const lantaiNumber = parseInt(match[1]);
                savedFiles[lantaiNumber] = true;
              }
            });
          }
          lantai.setSavedLantaiFiles(savedFiles);
        }
      } catch (error) {
        console.error("Error refreshing lantai data:", error);
      }
    };

    // Fungsi untuk renumbering lantai setelah penghapusan
    const renumberLantaiAfterDelete = async (deletedLantaiNumber: number) => {
      if (!features.selectedFeature?.properties?.id) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const bangunanId = Number(features.selectedFeature.properties.id);

        // Ambil data lantai yang tersisa
        const lantaiData = await getLantaiGambarByBangunan(bangunanId, token);

        if (!lantaiData || lantaiData.length === 0) return;

        // Urutkan lantai berdasarkan nomor yang ada di nama file
        const sortedLantai = lantaiData.sort((a: any, b: any) => {
          const matchA = (a.nama_file || "").match(/Lt(\d+)\.svg/i);
          const matchB = (b.nama_file || "").match(/Lt(\d+)\.svg/i);
          const numA = matchA ? parseInt(matchA[1]) : 0;
          const numB = matchB ? parseInt(matchB[1]) : 0;
          return numA - numB;
        });

        // Renumbering: lantai dengan nomor tertinggi akan menjadi lantai teratas
        let newLantaiNumber = 1;
        for (const lantai of sortedLantai) {
          const currentMatch = lantai.nama_file.match(/Lt(\d+)\.svg/i);
          if (currentMatch) {
            const currentNumber = parseInt(currentMatch[1]);

            // Jika nomor lantai berubah, update nama file
            if (currentNumber !== newLantaiNumber) {
              const newFileName = `Lt${newLantaiNumber}.svg`;

              // Update nama file di database menggunakan service yang ada
              try {
                await updateLantaiGambar(
                  lantai.id_lantai_gambar,
                  {
                    nama_file: newFileName,
                    nomor_lantai: newLantaiNumber,
                    id_bangunan: bangunanId,
                  },
                  token
                );
              } catch (error) {
                console.error(
                  `Gagal update nama file lantai ${currentNumber}:`,
                  error
                );
              }
            }

            newLantaiNumber++;
          }
        }

        // Refresh data setelah renumbering
        await refreshLantaiData();

        showNotification(
          "success",
          "Renumbering Selesai",
          "Nomor lantai telah diurutkan ulang setelah penghapusan."
        );
      } catch (error) {
        console.error("Error renumbering lantai:", error);
        showNotification(
          "error",
          "Renumbering Gagal",
          "Gagal mengurutkan ulang nomor lantai, tapi penghapusan tetap berhasil."
        );
      }
    };

    // Auth helpers dipindahkan ke lib

    // Fungsi untuk save ruangan
    const handleSaveRuangan = async () => {
      if (!features.selectedFeature?.properties?.id || !ruangan.ruanganForm.nama_ruangan.trim())
        return;

      loading.setIsSaving(true);
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
          nama_ruangan: ruangan.ruanganForm.nama_ruangan.trim(),
          nomor_lantai: ruangan.ruanganForm.nomor_lantai,
          id_bangunan: features.selectedFeature.properties.id,
          nama_jurusan: ruangan.ruanganForm.nama_jurusan,
          nama_prodi: ruangan.ruanganForm.nama_prodi,
          pin_style: ruangan.ruanganForm.pin_style,
          posisi_x: ruangan.ruanganForm.posisi_x,
          posisi_y: ruangan.ruanganForm.posisi_y,
        };

        await createRuangan(ruanganData, token);

        // Reset form
        ruangan.setRuanganForm({
          nama_ruangan: "",
          nomor_lantai: 1,
          nama_jurusan: "",
          nama_prodi: "",
          pin_style: "default",
          posisi_x: null,
          posisi_y: null,
        });
        // REMOVED: ui.setShowRuanganModal(false) - modal no longer exists

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
        loading.setIsSaving(false);
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

        ruangan.setRuanganList(ruanganArray);
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
    const handleEditRuangan = async (lantaiNumber?: number) => {
      if (!features.selectedFeature?.properties?.id) return;

      // Tutup modal edit lantai jika sedang terbuka
      if (edit.isEditingLantai || edit.isEditingInteraksi || edit.isEditingName) {
        handleCancelEdit();
      }

      try {
        await fetchRuanganByBangunan(Number(features.selectedFeature.properties.id));

        // Jika ada lantaiNumber, set lantai untuk ruangan baru
        if (lantaiNumber) {
          lantai.setSelectedLantaiForRuangan(lantaiNumber);
          ruangan.setRuanganForm((prev) => ({ ...prev, nomor_lantai: lantaiNumber }));
        }

        // Reset form dan buka modal buat ruangan baru
        ruangan.setSelectedRuanganForEdit(null);
        ruangan.setRuanganForm({
          nama_ruangan: "",
          nomor_lantai: lantaiNumber || 1,
          nama_jurusan: "",
          nama_prodi: "",
          pin_style: "default",
          posisi_x: null,
          posisi_y: null,
        });
        // REMOVED: ui.setShowRuanganModal(true) - modal no longer exists
      } catch (error) {}
    };

    // Fungsi untuk memilih ruangan untuk diedit
    const handleSelectRuanganForEdit = (ruangan: any) => {
      ruangan.setSelectedRuanganForEdit(ruangan);
      ruangan.setRuanganForm({
        nama_ruangan: ruangan.nama_ruangan,
        nomor_lantai: ruangan.nomor_lantai,
        nama_jurusan: ruangan.nama_jurusan || "",
        nama_prodi: ruangan.nama_prodi || "",
        pin_style: ruangan.pin_style || "default",
        posisi_x: ruangan.posisi_x,
        posisi_y: ruangan.posisi_y,
      });
      lantai.setSelectedLantaiForRuangan(ruangan.nomor_lantai);

      // REMOVED: ui.setShowRuanganModal(true) - modal no longer exists
    };

    // Fungsi untuk edit ruangan yang sudah ada
    const handleEditExistingRuangan = async (ruangan: any) => {
      if (!features.selectedFeature?.properties?.id) return;

      try {
        await fetchRuanganByBangunan(Number(features.selectedFeature.properties.id));

        // Set ruangan yang akan diedit
        ruangan.setSelectedRuanganForEdit(ruangan);
        ruangan.setRuanganForm({
          nama_ruangan: ruangan.nama_ruangan,
          nomor_lantai: ruangan.nomor_lantai,
          nama_jurusan: ruangan.nama_jurusan || "",
          nama_prodi: ruangan.nama_prodi || "",
          pin_style: ruangan.pin_style || "default",
          posisi_x: ruangan.posisi_x,
          posisi_y: ruangan.posisi_y,
        });
        lantai.setSelectedLantaiForRuangan(ruangan.nomor_lantai);

        // REMOVED: ui.setShowRuanganModal(true) - modal no longer exists
      } catch (error) {}
    };

    // Fungsi untuk hapus ruangan
    const handleDeleteRuangan = async (ruangan: any) => {
      if (!features.selectedFeature?.properties?.id) return;

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

        // Konfirmasi penghapusan
        showConfirmation(
          "Konfirmasi Hapus Ruangan",
          `Yakin ingin menghapus ruangan "${ruangan.nama_ruangan}"? Tindakan ini tidak dapat dibatalkan.`,
          async () => {
            try {
              await deleteRuangan(ruangan.id_ruangan, token);

              // Refresh data ruangan
              await fetchRuanganByBangunan(
                Number(features.selectedFeature?.properties?.id)
              );

              showNotification(
                "success",
                "Berhasil dihapus",
                "Ruangan berhasil dihapus!"
              );
            } catch (error) {
              showNotification(
                "error",
                "Gagal dihapus",
                "Gagal menghapus ruangan: " + (error as Error).message
              );
            }
          }
        );
      } catch (error) {
        showNotification(
          "error",
          "Error",
          "Terjadi kesalahan: " + (error as Error).message
        );
      }
    };

    // Fungsi untuk update ruangan
    const handleUpdateRuangan = async () => {
      if (
        !ruangan.selectedRuanganForEdit?.id_ruangan ||
        !ruangan.ruanganForm.nama_ruangan.trim()
      )
        return;

      loading.setIsSaving(true);
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
          nama_ruangan: ruangan.ruanganForm.nama_ruangan.trim(),
          nomor_lantai: ruangan.ruanganForm.nomor_lantai,
          nama_jurusan: ruangan.ruanganForm.nama_jurusan,
          nama_prodi: ruangan.ruanganForm.nama_prodi,
          pin_style: ruangan.ruanganForm.pin_style,
          posisi_x: ruangan.ruanganForm.posisi_x,
          posisi_y: ruangan.ruanganForm.posisi_y,
        };

        await updateRuangan(
          ruangan.selectedRuanganForEdit.id_ruangan,
          ruanganData,
          token
        );

        // Reset form dan modal
        ruangan.setRuanganForm({
          nama_ruangan: "",
          nomor_lantai: 1,
          nama_jurusan: "",
          nama_prodi: "",
          pin_style: "default",
          posisi_x: null,
          posisi_y: null,
        });
        ruangan.setSelectedRuanganForEdit(null);
        // REMOVED: ui.setShowRuanganModal(false) - modal no longer exists

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
        loading.setIsSaving(false);
      }
    };

    // Fungsi untuk save edit
    const handleSaveEdit = async () => {
      if (!features.selectedFeature?.properties?.id) return;

      // Validasi untuk edit nama dan interaksi (opsional)
      // Removed required validation - fields can now be empty

      // Debug logging untuk troubleshooting

      loading.setIsSaving(true);
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
        if (edit.isEditingName || edit.isEditingInteraksi) {
          const updateData: any = {};

          if (edit.isEditingName) {
            updateData.nama = edit.editName.trim() || undefined;
          }

          if (edit.isEditingInteraksi) {
            // Pastikan edit.editInteraksi tidak kosong jika user sudah memilih nilai
            if (edit.editInteraksi && edit.editInteraksi.trim() !== "") {
              updateData.interaksi = edit.editInteraksi;
            } else {
              // Jika kosong, gunakan nilai default "Noninteraktif"
              updateData.interaksi = "Noninteraktif";
            }
          }

          await updateBangunan(
            features.selectedFeature.properties.id,
            updateData,
            token
          );

          // Update local state
          if (features.selectedFeature) {
            features.selectedFeature.properties = {
              ...features.selectedFeature.properties,
              ...updateData,
            };
          }
        }

        // Handle upload thumbnail
        if (edit.isEditingThumbnail && edit.selectedFile) {
          const formData = new FormData();
          formData.append("thumbnail", edit.selectedFile);

          const result = await uploadBangunanThumbnail(
            Number(features.selectedFeature.properties.id),
            edit.selectedFile,
            token
          );

          // Update local state
          if (features.selectedFeature) {
            features.selectedFeature.properties = {
              ...features.selectedFeature.properties,
              thumbnail: result.thumbnailPath,
            };
          }
        }

        // Handle update jumlah lantai

        // Handle upload lantai - removed karena sekarang menggunakan tombol simpan individual
        // Upload lantai gambar sekarang ditangani oleh handleSaveLantaiImage

        // Reset edit mode
        edit.setIsEditingName(false);
        edit.setIsEditingThumbnail(false);
        edit.setIsEditingLantai(false);

        edit.setIsEditingInteraksi(false);
        edit.setEditName("");

        edit.setEditInteraksi("");
        edit.setSelectedFile(null);
        lantai.setLantaiFiles({});
        // Clean up file preview URLs
        if (edit.filePreviewUrl) {
          URL.revokeObjectURL(edit.filePreviewUrl);
          edit.setFilePreviewUrl(null);
        }
        // Clean up lantai preview URLs
        Object.values(lantai.lantaiPreviewUrls).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        lantai.setLantaiPreviewUrls({});

        // Tampilkan notifikasi
        showNotification(
          "success",
          "Berhasil diperbarui",
          "Berhasil menyimpan perubahan!"
        );

        // Refresh data bangunan
        if (mapRefs.bangunanLayerRef.current) {
          // Trigger re-render dengan data baru
          const currentFeatures = [...features.bangunanFeatures];
          const updatedIndex = currentFeatures.findIndex(
            (f) => f.properties?.id === features.selectedFeature?.properties?.id
          );
          if (updatedIndex !== -1) {
            currentFeatures[updatedIndex] = features.selectedFeature;
            features.setBangunanFeatures(currentFeatures);
          }
        }
      } catch (error) {
        showNotification(
          "error",
          "Gagal diperbarui",
          "Gagal menyimpan perubahan. Silakan coba lagi."
        );
      } finally {
        loading.setIsSaving(false);
      }
    };

    // Fungsi untuk cancel edit
    const handleCancelEdit = () => {
      edit.setIsEditingName(false);
      edit.setIsEditingThumbnail(false);
      edit.setIsEditingLantai(false);
      edit.setIsEditingInteraksi(false);
      edit.setEditName("");
      edit.setEditInteraksi("");
      edit.setSelectedFile(null);
      lantai.setLantaiFiles({});
      lantai.setSavedLantaiFiles({});
      // REMOVED: ui.setShowTambahLantaiModal(false) - modal no longer exists
      lantai.setTambahLantaiFile(null);
      lantai.setTambahLantaiPreviewUrl(null);
      // Clean up file preview URL
      if (edit.filePreviewUrl) {
        URL.revokeObjectURL(edit.filePreviewUrl);
        edit.setFilePreviewUrl(null);
      }
      // Clean up lantai preview URLs
      Object.values(lantai.lantaiPreviewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      lantai.setLantaiPreviewUrls({});
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
            const bangunanLayer = mapRefs.bangunanLayerRef.current;
            if (bangunanLayer) {
              bangunanLayer.eachLayer((layer: L.Layer) => {
                if (
                  (layer as any).feature &&
                  (layer as any).feature.geometry &&
                  (layer as any).feature.geometry.type === "Polygon" &&
                  (layer as any).feature.properties?.id === Number(featureId)
                ) {
                  const map = mapRefs.leafletMapRef.current;
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
            const selectedRuangan = features.ruanganFeatures.find(
              (r) => r.properties?.id === Number(featureId)
            );

            if (selectedRuangan) {
              // Cari bangunan yang berisi ruangan ini
              const bangunanId = selectedRuangan.properties?.bangunan_id;
              const bangunan = features.bangunanFeatures.find(
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
                  const map = mapRefs.leafletMapRef.current;
                  if (map) {
                    map.fitBounds(bounds, {
                      padding: [50, 50],
                      animate: true,
                      duration: 0.8,
                    });
                    const onMoveEnd = () => {
                      features.setSelectedFeature(bangunan);
                      ui.setCardVisible(true);
                      // Highlight permanen sudah ditangani oleh useEffect berdasarkan features.selectedFeature
                      // Langsung buka modal detail bangunan dengan ruangan yang dipilih
                      openBuildingDetailModal(selectedRuangan);
                      map.off("moveend", onMoveEnd);
                    };
                    map.on("moveend", onMoveEnd);
                  }
                } else {
                  // Jika tidak ada geometry, langsung buka modal
                  features.setSelectedFeature(bangunan);
                  ui.setCardVisible(true);
                  // Highlight permanen sudah ditangani oleh useEffect berdasarkan features.selectedFeature
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
      // Layer visibility control functions
      toggleJalurLayer,
      toggleTitikLayer,
      toggleBangunanLayer,

      highlightFeature: (
        featureType: string,
        featureId: number,
        featureName: string
      ) => {
        // Implementation

        if (featureType === "bangunan") {
          // Jika container detail bangunan sedang aktif, berikan efek shake
          if (mapRefs.isHighlightActiveRef.current) {
            // Tambahkan efek shake pada container detail bangunan yang sedang aktif
            animation.setIsContainerShaking(true);
            setTimeout(() => animation.setIsContainerShaking(false), 600);
            return;
          }

          // Highlight bangunan menggunakan fungsi helper
          highlightBangunan(featureId);

          // Pan ke lokasi bangunan dengan zoom smooth
          const bangunanLayer = mapRefs.bangunanLayerRef.current;
          if (bangunanLayer) {
            bangunanLayer.eachLayer((layer: L.Layer) => {
              if (
                (layer as any).feature &&
                (layer as any).feature.geometry &&
                (layer as any).feature.geometry.type === "Polygon" &&
                (layer as any).feature.properties?.id === featureId
              ) {
                const map = mapRefs.leafletMapRef.current;
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
          const selectedRuangan = features.ruanganFeatures.find(
            (r) => r.properties?.id === featureId
          );

          if (selectedRuangan) {
            // Cari bangunan yang berisi ruangan ini
            const bangunanId = selectedRuangan.properties?.bangunan_id;
            const bangunan = features.bangunanFeatures.find(
              (b) => b.properties?.id === Number(bangunanId)
            );

            if (bangunan && bangunan.geometry) {
              // Jika container detail bangunan sedang aktif, berikan efek shake
              if (mapRefs.isHighlightActiveRef.current) {
                // Tambahkan efek shake pada container detail bangunan yang sedang aktif
                animation.setIsContainerShaking(true);
                setTimeout(() => animation.setIsContainerShaking(false), 600);
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
                const map = mapRefs.leafletMapRef.current;
                if (map) {
                  map.fitBounds(bounds, {
                    padding: [50, 50],
                    animate: true,
                    duration: 0.8,
                  });
                  const onMoveEnd = () => {
                    features.setSelectedFeature(bangunan);
                    ui.setCardVisible(true);
                    // Highlight permanen sudah ditangani oleh useEffect berdasarkan features.selectedFeature
                    // Langsung buka modal detail bangunan dengan ruangan yang dipilih
                    openBuildingDetailModal(selectedRuangan);
                    map.off("moveend", onMoveEnd);
                  };
                  map.on("moveend", onMoveEnd);
                }
              } else {
                // Jika tidak ada geometry, langsung buka modal
                features.setSelectedFeature(bangunan);
                ui.setCardVisible(true);
                // Highlight permanen sudah ditangani oleh useEffect berdasarkan features.selectedFeature
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

    // Saat ui.cardVisible berubah ke true, trigger animasi fade-in
    useEffect(() => {
      if (ui.cardVisible) {
        setTimeout(() => animation.setCardAnimation(true), 10);
      } else {
        animation.setCardAnimation(false);
      }
    }, [ui.cardVisible]);

    // Highlight merah persist selama card detail bangunan terbuka
    useEffect(() => {
      const bangunanLayer = mapRefs.bangunanLayerRef.current;
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
      if (ui.cardVisible && features.selectedFeature?.properties?.id) {
        const featureId = Number(features.selectedFeature.properties.id);
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
        if (highlight.searchHighlightedId) {
          highlight.setSearchHighlightedId(null);
        }
      } else if (!ui.cardVisible && highlight.searchHighlightedId) {
        // Jika card ditutup dan ada search highlight, biarkan highlight tetap
        // Highlight akan di-reset saat ada pencarian baru atau highlight baru
      }
    }, [ui.cardVisible, features.selectedFeature, highlight.searchHighlightedId]);

    // Fungsi untuk dapatkan koordinat centroid dari featureId (bangunan/ruangan)
    const getCentroidById = (type: "bangunan" | "ruangan", id: string) => {
      let feature = null;
      if (type === "bangunan") {
        feature = features.bangunanFeatures.find(
          (b: FeatureType) => b.properties.id == id
        );
      } else if (type === "ruangan") {
        feature = features.ruanganFeatures.find(
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
      const map = mapRefs.leafletMapRef.current;
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
      if (mapRefs.navigationMarkerRef.current) {
        console.log(`🔍 [DEBUG] Removing previous marker`);
        map.removeLayer(mapRefs.navigationMarkerRef.current);
        mapRefs.navigationMarkerRef.current = null;
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

        mapRefs.navigationMarkerRef.current = navigationMarker;

        // PERBAIKAN: Hapus destination marker terpisah karena sekarang hanya ada 1 marker
        if (destinationMarker && map.hasLayer(destinationMarker)) {
          map.removeLayer(destinationMarker);
          setDestinationMarker(null);
        }

        // Zoom ke posisi marker dengan smooth dan tahan di tengah ketika zooming
        mapRefs.isZoomingRef.current = true;
        map.setView(markerPosition, 19, { animate: true, duration: 0.8 });
        map.once("moveend", () => {
          mapRefs.isZoomingRef.current = false;
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
          mapRefs.navigationMarkerRef.current &&
          map.hasLayer(mapRefs.navigationMarkerRef.current)
        ) {
          map.removeLayer(mapRefs.navigationMarkerRef.current);
          mapRefs.navigationMarkerRef.current = null;
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
      if (!ui.cardVisible && mapRefs.leafletMapRef.current) {
        // Reset edit mode
        edit.setIsEditingName(false);
        edit.setIsEditingThumbnail(false);
        edit.setEditName("");
        edit.setEditThumbnail("");

        // Hapus route line jika ada
        if (routeLine) {
          mapRefs.leafletMapRef.current.removeLayer(routeLine);
          setRouteLine(null);
          setRouteDistance(null);
        }

        // Hapus alternative route lines jika ada
        if (alternativeRouteLines.length > 0) {
          alternativeRouteLines.forEach((layer) => {
            if (mapRefs.leafletMapRef.current) {
              mapRefs.leafletMapRef.current.removeLayer(layer);
            }
          });
          setAlternativeRouteLines([]);
        }

        // Hapus navigation marker jika ada
        if (mapRefs.navigationMarkerRef.current) {
          mapRefs.leafletMapRef.current.removeLayer(mapRefs.navigationMarkerRef.current);
          mapRefs.navigationMarkerRef.current = null;
        }

        // Hapus GPS marker jika ada
        if (mapRefs.userMarkerRef.current) {
          mapRefs.leafletMapRef.current.removeLayer(mapRefs.userMarkerRef.current);
          mapRefs.userMarkerRef.current = null;
          setUserLocation(null); // Reset GPS location state
        }
      }
    }, [ui.cardVisible]);

    // Debug: log kategori setiap kali features.selectedFeature berubah
    useEffect(() => {
      if (features.selectedFeature) {
        console.log(
          "DEBUG features.selectedFeature kategori:",
          features.selectedFeature?.properties?.kategori
        );
      }
    }, [features.selectedFeature]);

    // useEffect untuk membuat pane khusus dengan z-index yang benar
    useEffect(() => {
      if (mapRefs.leafletMapRef.current) {
        const map = mapRefs.leafletMapRef.current;

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
      loading.setIsCalculatingRoute(true);
      let startLatLng: [number, number] | null = null;
      let endLatLng: [number, number] | null = null;
      setRouteDistance(null);

      // PERBAIKAN: Cleanup routes sebelumnya
      if (!mapRefs.isGpsRecalcRef.current) {
        if (routeLine && mapRefs.leafletMapRef.current) {
          mapRefs.leafletMapRef.current.removeLayer(routeLine);
          setRouteLine(null);
        }
        if (alternativeRouteLines.length > 0) {
          alternativeRouteLines.forEach((layer) => {
            if (mapRefs.leafletMapRef.current) {
              mapRefs.leafletMapRef.current.removeLayer(layer);
            }
          });
          setAlternativeRouteLines([]);
        }
      }

      // Titik awal
      if (routing.routeStartType === "my-location") {
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
              ui.setShowRouteModal(false);
              loading.setIsCalculatingRoute(false);
              return;
            }
            const points = convertTitikToPoints();
            let filteredJalurFeatures = features.jalurFeatures;
            if (transportMode === "jalan_kaki") {
              const pejalanSegments = features.jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "pejalan"
              );
              const bothSegments = features.jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "both"
              );
              filteredJalurFeatures = [...pejalanSegments, ...bothSegments];
            } else if (transportMode === "kendaraan") {
              // Untuk kendaraan, terapkan logika oneway
              const bothSegments = features.jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "both"
              );
              const pejalanSegments = features.jalurFeatures.filter(
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
              if (mapRefs.leafletMapRef.current) {
                geoJsonLayer.addTo(mapRefs.leafletMapRef.current);
                if (!mapRefs.isGpsRecalcRef.current) {
                  mapRefs.leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
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
              routing.setIsNavigationActive(true);
            } else {
              showNotification(
                "error",
                "Rute Tidak Ditemukan",
                "Tidak ditemukan rute yang valid dari lokasi Anda ke tujuan. Pastikan Anda berada di area yang terhubung ke jalur kampus."
              );
              loading.setIsCalculatingRoute(false);
            }
            return;
          } else {
            console.log(
              "📍 [GPS-ROUTING] Routing via gerbang terdekat (di luar kampus)"
            );
          }
        } catch (error) {
          setIsGettingLocation(false);
          loading.setIsCalculatingRoute(false);
          console.error("GPS Error in handleRouteSubmit:", error);
          if (features.titikFeatures.length > 0) {
            const firstTitik = features.titikFeatures[0];
            routing.setRouteStartType("titik");
            routing.setRouteStartId(
              String(firstTitik.id || firstTitik.properties?.OBJECTID)
            );
          }
          return;
        }
      } else if (routing.routeStartType === "titik" && routing.routeStartId) {
        // Cari titik dari geojson
        const titik = features.titikFeatures.find(
          (t: any) =>
            String(t.id || t.properties?.OBJECTID) === String(routing.routeStartId)
        );
        if (titik && titik.geometry && titik.geometry.coordinates) {
          const coords = titik.geometry.coordinates;
          startLatLng = [coords[1], coords[0]];
        } else {
          showNotification(
            "error",
            "Error",
            `Titik awal dengan ID ${routing.routeStartId} tidak ditemukan.`
          );
          ui.setShowRouteModal(false);
          loading.setIsCalculatingRoute(false);
          return;
        }
      } else if (routing.routeStartType) {
        // Jika bangunan, ambil centroid bangunan
        const bangunanCentroid = getCentroidById("bangunan", routing.routeStartType);
        if (bangunanCentroid) {
          startLatLng = bangunanCentroid as [number, number];
        } else {
          showNotification(
            "error",
            "Error",
            `Bangunan dengan ID ${routing.routeStartType} tidak ditemukan.`
          );
          ui.setShowRouteModal(false);
          loading.setIsCalculatingRoute(false);
          return;
        }
      }

      // Titik tujuan
      if (routing.routeEndType === "bangunan" && routing.routeEndId) {
        const bangunanCentroid = getCentroidById("bangunan", routing.routeEndId);
        if (bangunanCentroid) {
          endLatLng = bangunanCentroid as [number, number];
        } else {
          showNotification(
            "error",
            "Error",
            `Bangunan dengan ID ${routing.routeEndId} tidak ditemukan.`
          );
          ui.setShowRouteModal(false);
          loading.setIsCalculatingRoute(false);
          return;
        }
      } else if (routing.routeEndType === "titik" && routing.routeEndSearchText) {
        // Cari titik tujuan dari geojson
        const tujuan = convertTitikToPoints().find(
          (p) => p.name === routing.routeEndSearchText
        );
        if (tujuan) {
          endLatLng = tujuan.coordinates;
        } else {
          showNotification(
            "error",
            "Error",
            `Titik tujuan "${routing.routeEndSearchText}" tidak ditemukan.`
          );
          ui.setShowRouteModal(false);
          loading.setIsCalculatingRoute(false);
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
        ui.setShowRouteModal(false);
        loading.setIsCalculatingRoute(false);
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
        ui.setShowRouteModal(false);
        loading.setIsCalculatingRoute(false);
        return;
      }

      // Routing dengan logika khusus untuk "Lokasi Saya"
      if (startLatLng && endLatLng && mapRefs.leafletMapRef.current) {
        if (!mapRefs.isGpsRecalcRef.current && routeLine) {
          mapRefs.leafletMapRef.current.removeLayer(routeLine);
        }

        const points = convertTitikToPoints();
        let finalRouteSegments: any[] = [];
        let totalDistance = 0;

        // Jika titik awal adalah "Lokasi Saya", route via gerbang terbaik yang terhubung ke tujuan
        if (routing.routeStartType === "my-location") {
          try {
            const bestGateInfo = await findAllRoutesToBuilding(
              startLatLng,
              endLatLng,
              undefined,
              convertTitikToPoints(),
              features.jalurFeatures,
              features.titikFeatures
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
                // HILANGKAN GARIS MAGENTA DEBUG - tidak diperlukan untuk user
                // if (mapRefs.leafletMapRef.current) {
                //   const line = addRouteLine(
                //     [
                //       [gpsLat, gpsLng],
                //       [gateLat, gateLng],
                //     ],
                //     {
                //       color: "#FF00FF",
                //       weight: 8,
                //       opacity: 0.8,
                //       dashArray: "10, 5",
                //     }
                //   );
                //   setTimeout(() => {
                //     removeRouteLine(line as any);
                //   }, 10000);
                // }
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
                  loading.setIsCalculatingRoute(false);
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
                if (mapRefs.leafletMapRef.current) {
                  mainRouteLayer.addTo(mapRefs.leafletMapRef.current);
                  if (!mapRefs.isGpsRecalcRef.current) {
                    mapRefs.leafletMapRef.current.fitBounds(
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

                if (allRoutes.length > 1) {
                  console.log(
                    `🔄 Ditemukan ${
                      allRoutes.length - 1
                    } rute alternatif, tetapi tidak ditampilkan untuk menghindari kebingungan visual`
                  );
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
                if (mapRefs.leafletMapRef.current) {
                  mapRefs.leafletMapRef.current.fitBounds(bounds, {
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
                routing.setIsNavigationActive(true);
              } else {
                showNotification(
                  "error",
                  "Rute Tidak Ditemukan",
                  "Tidak ditemukan rute dari gerbang terdekat ke tujuan."
                );
                loading.setIsCalculatingRoute(false);
              }
            } else {
              showNotification(
                "error",
                "Gerbang Tidak Ditemukan",
                "Tidak ditemukan gerbang terdekat."
              );
              loading.setIsCalculatingRoute(false);
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
            let filteredJalurFeatures = features.jalurFeatures;
            if (transportMode === "jalan_kaki") {
              // Untuk pejalan kaki, prioritaskan jalur "pejalan", jika tidak ada baru pakai "both"
              const pejalanSegments = features.jalurFeatures.filter(
                (segment: any) => segment.properties?.Mode === "pejalan"
              );
              const bothSegments = features.jalurFeatures.filter(
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
              filteredJalurFeatures = features.jalurFeatures;
              console.log(
                `🏍️ Mode kendaraan: ${filteredJalurFeatures.length} segmen (algoritma cerdas untuk meminimalkan penggunaan jalur pejalan)`
              );
            }

            // PERBAIKAN: Cek apakah tujuan adalah gedung dengan multiple pintu
            let nearestPoint: Point | null = null;
            if (routing.routeEndType === "titik" && routing.routeEndSearchText) {
              // Cari semua titik dengan nama yang sama
              const allPoints = convertTitikToPoints();
              console.log(
                `🔍 [DEBUG] Total points available: ${allPoints.length}`
              );
              console.log(`🔍 [DEBUG] Searching for: "${routing.routeEndSearchText}"`);

              const sameNamePoints = allPoints.filter(
                (p) => p.name === routing.routeEndSearchText
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
                  `🔍 [DEBUG] No points found for "${routing.routeEndSearchText}"`
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
              if (mapRefs.leafletMapRef.current) {
                geoJsonLayer.addTo(mapRefs.leafletMapRef.current);
                mapRefs.leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
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
              mapRefs.leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
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
              routing.setIsNavigationActive(true);
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
      ui.setShowRouteModal(false);
      loading.setIsCalculatingRoute(false);
      // reset flag recalc setelah selesai
      mapRefs.isGpsRecalcRef.current = false;
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
          if (mapRefs.userMarkerRef.current) {
            const currentLatLng = mapRefs.userMarkerRef.current.getLatLng();
            const distance = currentLatLng.distanceTo(newLatLng);

            // Update marker setiap kali GPS berubah (tanpa batasan jarak)
            mapRefs.userMarkerRef.current.setLatLng(newLatLng);
            mapRefs.userMarkerRef.current.setIcon(createUserMarkerIcon(newHeading));
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
          if (routing.isNavigationActive && routing.routeStartType === "my-location") {
            // tandai recalc dari GPS agar tidak hapus routeLine lebih dulu
            mapRefs.isGpsRecalcRef.current = true;
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
    }, [routing.isNavigationActive, routing.routeStartType, routeSteps.length]);

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
        const titik = features.titikFeatures.find(
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
          loading.setIsCalculatingRoute(false);
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
          loading.setIsCalculatingRoute(false);
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
          loading.setIsCalculatingRoute(false);
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
        loading.setIsCalculatingRoute(false);
        return;
      }

      console.log("✅ Koordinat valid, memulai routing:", {
        startLatLng,
        endLatLng,
      });

      // Routing dengan logika khusus untuk "Lokasi Saya"
      if (startLatLng && endLatLng && mapRefs.leafletMapRef.current) {
        if (routeLine) {
          mapRefs.leafletMapRef.current.removeLayer(routeLine);
        }

        const points = convertTitikToPoints();
        let finalRouteSegments: any[] = [];
        let totalDistance = 0;

        // Jika titik awal adalah "Lokasi Saya", route via gerbang terbaik yang terhubung ke tujuan
        if (startType === "my-location") {
          // Dapatkan nama gedung dari endType jika ada
          let buildingName: string | undefined;
          if (endType === "bangunan" && endId) {
            const bangunan = features.bangunanFeatures.find(
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
            features.jalurFeatures,
            features.titikFeatures
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
              loading.setIsCalculatingRoute(false);
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
              // HILANGKAN GARIS MAGENTA DEBUG - tidak diperlukan untuk user
              // if (mapRefs.leafletMapRef.current) {
              //   const line = addRouteLine(
              //     [
              //       [gpsLat, gpsLng],
              //       [gateLat, gateLng],
              //     ],
              //     {
              //       color: "#FF00FF",
              //       weight: 8,
              //       opacity: 0.8,
              //       dashArray: "10, 5",
              //     }
              //   );
              //   setTimeout(() => removeRouteLine(line as any), 10000);
              // }
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
              if (mapRefs.leafletMapRef.current) {
                console.log("🗺️ Menambahkan layer ke map");
                geoJsonLayer.addTo(mapRefs.leafletMapRef.current);

                try {
                  const bounds = geoJsonLayer.getBounds();
                  console.log("🗺️ Bounds:", bounds);
                  mapRefs.leafletMapRef.current.fitBounds(bounds, {
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
                console.error("❌ mapRefs.leafletMapRef.current is null");
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
              mapRefs.leafletMapRef.current.fitBounds(bounds, {
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
              loading.setIsCalculatingRoute(false);
              return;
            }
          } else {
            console.log("❌ Tidak ada gerbang yang terhubung ke tujuan");
            showNotification(
              "error",
              "Tidak Ada Rute",
              "Tidak ada gerbang yang terhubung ke tujuan. Silakan coba lokasi lain."
            );
            loading.setIsCalculatingRoute(false);
            return;
          }
        } else {
          // Routing biasa (bukan dari "Lokasi Saya")
          const routeResult = findRoute(
            startLatLng,
            endLatLng,
            points,
            features.jalurFeatures,
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
            if (mapRefs.leafletMapRef.current) {
              geoJsonLayer.addTo(mapRefs.leafletMapRef.current);
              mapRefs.leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
                padding: [40, 40],
                maxZoom: 19,
                animate: true,
                duration: 1.5, // Smooth animation duration
              });
            }
            setRouteLine(geoJsonLayer);

            // Smooth zoom animation
            mapRefs.leafletMapRef.current.fitBounds(geoJsonLayer.getBounds(), {
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
      if (mapRefs.leafletMapRef.current) {
        const map = mapRefs.leafletMapRef.current;

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
          cursor: drawing.drawingMode ? "crosshair" : "default", // Set cursor crosshair saat drawing mode aktif
        }}
      >
        <MapControlsPanel
          isDark={!!isDark}
          isSatellite={!!config.isSatellite}
          layerVisible={!!config.layerVisible}
          isDashboard={isDashboard}
          onZoomIn={() => {
            const map = mapRefs.leafletMapRef.current;
            if (map) map.setZoom(Math.min(map.getZoom() + 1, 19));
          }}
          onZoomOut={() => {
            const map = mapRefs.leafletMapRef.current;
            if (map) map.setZoom(Math.max(map.getZoom() - 1, map.getMinZoom()));
          }}
          onReset={handleResetZoom}
          onLocateMe={handleLocateMe}
          onToggleLayer={handleToggleLayer}
          onToggleBasemap={handleToggleBasemap}
          jalurVisible={layerVisibility.jalurLayerVisible}
          titikVisible={layerVisibility.titikLayerVisible}
          bangunanVisible={layerVisibility.bangunanLayerVisible}
          onToggleJalur={toggleJalurLayer}
          onToggleTitik={toggleTitikLayer}
          onToggleBangunan={toggleBangunanLayer}
          searchText={searchText}
          onSearchTextChange={(value) => {
            setSearchText(value);
            setShowSearchResults(true);
            if (value.trim() === "" && highlight.searchHighlightedId) {
              resetBangunanHighlight();
              highlight.setSearchHighlightedId(null);
            }
          }}
          showSearchResults={showSearchResults}
          onToggleSearchResults={(show) => setShowSearchResults(show)}
          isLoadingData={loading.isLoadingData}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult as any}
          isHighlightActive={!!highlight.isHighlightActive}
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
            routing.setIsNavigationActive(false);
            setTotalWalkingTime(null);
            setTotalVehicleTime(null);
            if (destinationMarker && mapRefs.leafletMapRef.current) {
              mapRefs.leafletMapRef.current.removeLayer(destinationMarker);
              setDestinationMarker(null);
            }
            if (routeLine && mapRefs.leafletMapRef.current) {
              mapRefs.leafletMapRef.current.removeLayer(routeLine);
              setRouteLine(null);
            }
            if (mapRefs.navigationMarkerRef.current && mapRefs.leafletMapRef.current) {
              mapRefs.leafletMapRef.current.removeLayer(mapRefs.navigationMarkerRef.current);
              mapRefs.navigationMarkerRef.current = null;
            }
            if (features.selectedFeature && features.selectedFeature.properties?.id) {
              highlight.setIsHighlightActive(true);
              const bangunanLayer = mapRefs.bangunanLayerRef.current;
              if (bangunanLayer) {
                bangunanLayer.eachLayer((layer: L.Layer) => {
                  if (
                    (layer as any).feature &&
                    (layer as any).feature.geometry &&
                    (layer as any).feature.geometry.type === "Polygon" &&
                    (layer as any).feature.properties?.id ===
                      Number(features.selectedFeature?.properties?.id)
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
              if (mapRefs.leafletMapRef.current && features.selectedFeature.geometry) {
                const centroid = getFeatureCentroid(features.selectedFeature);
                const currentZoom = mapRefs.leafletMapRef.current.getZoom();
                mapRefs.leafletMapRef.current.setView(centroid, currentZoom, {
                  animate: true,
                  duration: 1,
                });
              }
            }
            if (isMobile && features.selectedFeature) {
              ui.setCardVisible(true);
              setTimeout(() => animation.setCardAnimation(true), 50);
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
        {features.selectedFeature && ui.cardVisible && (
          <BuildingDetailModal
            isDark={!!isDark}
            isDashboard={!!isDashboard}
            isLoggedIn={isLoggedIn}
            selectedFeature={features.selectedFeature}
            isContainerShaking={animation.isContainerShaking}
            drawingMode={drawing.drawingMode}
            onClose={() => {
              ui.setCardVisible(false);
              highlight.setIsHighlightActive(false);
              edit.setIsEditingName(false);
              edit.setIsEditingThumbnail(false);
              edit.setIsEditingInteraksi(false);
              edit.setEditName("");
              edit.setEditThumbnail("");
              edit.setEditInteraksi("");
              // Hapus highlight seperti saat klik bangunan (prioritas ke yang sedang ditampilkan)
              if (features.selectedFeature?.properties?.id) {
                clearBangunanHighlightById(features.selectedFeature.properties.id);
              }
              if (highlight.searchHighlightedId) {
                resetBangunanHighlight();
                highlight.setSearchHighlightedId(null);
              }
              if (routing.isNavigationActive) {
                setRouteSteps([]);
                setActiveStepIndex(0);
                setHasReachedDestination(false);
                routing.setIsNavigationActive(false);
                if (routeLine && mapRefs.leafletMapRef.current) {
                  mapRefs.leafletMapRef.current.removeLayer(routeLine);
                  setRouteLine(null);
                }
                if (mapRefs.navigationMarkerRef.current && mapRefs.leafletMapRef.current) {
                  mapRefs.leafletMapRef.current.removeLayer(
                    mapRefs.navigationMarkerRef.current
                  );
                  mapRefs.navigationMarkerRef.current = null;
                }
              }
              // Pastikan style layer bangunan kembali default
              if (mapRefs.bangunanLayerRef.current) {
                mapRefs.bangunanLayerRef.current.resetStyle();
              }
              setTimeout(() => features.setSelectedFeature(null), 350);
            }}
            onOpenDetail={() => openBuildingDetailModal()}
            onEditThumbnail={handleEditThumbnail}
            onEditLantai={handleEditLantai}
            onEditNameAndInteraksi={() => {
              // Buka modal edit nama dan interaksi
              edit.setIsEditingName(true);
              edit.setIsEditingInteraksi(true);
              edit.setEditName(features.selectedFeature?.properties?.nama || "");
              edit.setEditInteraksi(
                features.selectedFeature?.properties?.interaksi || "Noninteraktif"
              );
            }}
            onSetRouteToBuilding={() => {
              routing.setRouteEndType("bangunan");
              routing.setRouteEndId(String(features.selectedFeature?.properties?.id ?? ""));
              setTimeout(() => ui.setShowRouteModal(true), 10);
            }}
          />
        )}

        {/* Modal Edit Bangunan */}
        {(edit.isEditingName ||
          edit.isEditingThumbnail ||
          edit.isEditingLantai ||
          edit.isEditingInteraksi) && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[50]"
            style={{
              cursor: drawing.drawingMode ? "crosshair" : "default", // Set cursor crosshair saat drawing mode aktif
            }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              data-modal="edit-modal"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit{" "}
                  {edit.isEditingName && edit.isEditingInteraksi
                    ? "Nama & Interaksi"
                    : edit.isEditingName
                    ? "Nama"
                    : edit.isEditingThumbnail
                    ? "Thumbnail"
                    : edit.isEditingInteraksi
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
                {edit.isEditingThumbnail && (
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
                            edit.setSelectedFile(file);
                            // Create preview URL for the selected file
                            const url = URL.createObjectURL(file);
                            edit.setFilePreviewUrl(url);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />

                      {/* Preview file yang dipilih */}
                      {edit.selectedFile && edit.filePreviewUrl && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={edit.filePreviewUrl}
                              alt="File preview"
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {edit.selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(edit.selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                edit.setSelectedFile(null);
                                edit.setFilePreviewUrl(null);
                                if (edit.filePreviewUrl) {
                                  URL.revokeObjectURL(edit.filePreviewUrl);
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
                      {features.selectedFeature?.properties?.thumbnail && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Thumbnail saat ini:
                          </p>
                          <img
                            src={`${
                              features.selectedFeature?.properties?.thumbnail?.startsWith(
                                "http"
                              )
                                ? ""
                                : "/"
                            }${
                              features.selectedFeature?.properties?.thumbnail
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

                {edit.isEditingName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Bangunan
                    </label>
                    <input
                      type="text"
                      value={edit.editName}
                      onChange={(e) => edit.setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Masukkan nama bangunan"
                      autoFocus
                    />
                    {/* Validation message removed - nama is now optional */}
                  </div>
                )}

                {edit.isEditingInteraksi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status Interaksi
                    </label>
                    <select
                      value={edit.editInteraksi}
                      onChange={(e) => edit.setEditInteraksi(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Interaktif">Interaktif</option>
                      <option value="Noninteraktif">Noninteraktif</option>
                    </select>
                    {/* Validation message removed - interaksi is now optional */}
                  </div>
                )}

                {edit.isEditingLantai && (
                  <EditLantaiImageUploader
                    visible={true}
                    isDark={isDark}
                    lantaiCount={features.selectedFeature?.properties?.lantai || 0}
                    selectedLantaiFilter={lantai.selectedLantaiFilter}
                    onChangeLantaiFilter={lantai.setSelectedLantaiFilter}
                    lantaiGambarData={lantai.lantaiGambarData}
                    lantaiFiles={lantai.lantaiFiles}
                    lantaiPreviewUrls={lantai.lantaiPreviewUrls}
                    onChooseFile={(lantaiNumber: number, file: File) => {
                      lantai.setLantaiFiles((prev) => ({
                        ...prev,
                        [lantaiNumber]: file,
                      }));
                      const url = URL.createObjectURL(file);
                      lantai.setLantaiPreviewUrls((prev) => ({
                        ...prev,
                        [lantaiNumber]: url,
                      }));
                    }}
                    onSave={handleSaveLantaiImage}
                    onDelete={handleDeleteLantaiImage}
                    onEditRuangan={handleEditRuangan}
                    onEditExistingRuangan={handleEditExistingRuangan}
                    onDeleteRuangan={handleDeleteRuangan}
                    onBuatRuangan={(lantaiNumber: number) => {
                      lantai.setSelectedLantaiForRuangan(lantaiNumber);
                      ruangan.setRuanganForm((prev) => ({
                        ...prev,
                        nomor_lantai: lantaiNumber,
                        posisi_x: null,
                        posisi_y: null,
                      }));
                      // REMOVED: ui.setShowRuanganModal(true) - modal no longer exists
                    }}
                    savedLantaiFiles={lantai.savedLantaiFiles}
                    ruanganList={ruangan.ruanganList}
                    onDeleteLantai={handleDeleteLantai}
                    onEditLantai={(lantaiNumber) => {
                      // REMOVED: Modal edit lantai no longer exists
                      // Just set the lantai for potential future use
                      lantai.setSelectedLantaiForEdit(lantaiNumber);
                    }}
                  />
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={(() => {
                      let disabled = loading.isSaving;

                      // Nama and Interaksi are now optional - removed validation

                      if (edit.isEditingThumbnail) {
                        disabled = disabled || !edit.selectedFile;
                      }

                      if (edit.isEditingLantai) {
                        // Lantai editing tidak memerlukan validasi khusus karena menggunakan tombol simpan individual
                        // disabled = disabled || false; // Selalu false
                      }

                      // Interaksi is now optional - removed validation
                      // if (edit.isEditingInteraksi) {
                      //   disabled = disabled || !edit.editInteraksi;
                      // }

                      // Combined validation for nama and interaksi is now optional
                      // if (edit.isEditingName && edit.isEditingInteraksi) {
                      //   disabled =
                      //     disabled || !edit.editName.trim() || !edit.editInteraksi;
                      // }

                      return disabled;
                    })()}
                    className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading.isSaving ? (
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
          ref={mapRefs.mapRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 300,
            zIndex: 1,
            cursor: drawing.drawingMode ? "crosshair" : "default", // Set cursor crosshair saat drawing mode aktif
            display: ui.showBuildingDetailCanvas ? "none" : "block",
            touchAction: "none",
            WebkitTouchCallout: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          className="w-full h-full"
        />

        {/* Geoman.js Drawing Sidebar - Only show in dashboard mode */}
        <DrawingSidebar
          isDark={!!isDark}
          isDashboard={isDashboard}
          onDrawingModeChange={handleDrawingModeChange}
          externalActiveMode={drawing.drawingMode}
          isConfirmationActive={
            drawing.isEditingShape || drawing.showDragConfirmation || ui.showShapeSwitchModal
          }
        />

        {/* Edit Confirmation Buttons - Only show when editing a shape */}
        {drawing.isEditingShape && (
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            <button
              onClick={handleSaveEditConfirmation}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
              title="Simpan perubahan"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Simpan
            </button>
            <button
              onClick={handleCancelEditConfirmation}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
              title="Batalkan perubahan"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Batal
            </button>
          </div>
        )}

        {/* Shape Switch Confirmation Modal */}
        {ui.showShapeSwitchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Konfirmasi Ganti Shape
                  </h3>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Anda sedang mengedit shape lain. Apakah Anda yakin ingin
                  beralih ke shape baru?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Shape yang sedang aktif akan dikembalikan ke warna aslinya.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelShapeSwitch}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmShapeSwitch}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                >
                  Ya, Ganti Shape
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drag Confirmation Buttons - Only show when dragging a shape */}
        {drawing.showDragConfirmation && (
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            <button
              onClick={handleConfirmDrag}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
              title="Simpan posisi"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Simpan
            </button>
            <button
              onClick={handleCancelDrag}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
              title="Batalkan perpindahan"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Batal
            </button>
          </div>
        )}

        {ui.showBuildingDetailCanvas && (
          <div
            className={`absolute inset-0 w-full h-full flex flex-col z-[20] bg-white dark:bg-gray-900 transition-opacity duration-300 ${
              animation.isBuildingDetailFadingOut
                ? "opacity-0"
                : animation.isBuildingDetailFadingIn
                ? "opacity-0 animate-fade-in"
                : "opacity-100"
            }`}
            style={{
              cursor: drawing.drawingMode ? "crosshair" : "default", // Set cursor crosshair saat drawing mode aktif
            }}
          >
            <iframe
              src={`/building-details/index.html?id=${
                features.selectedFeature?.properties?.id || "45"
              }&apiUrl=${encodeURIComponent(
                process.env.NEXT_PUBLIC_API_BASE_URL as string
              )}`}
              title="Building Detail"
              className="w-full h-full border-0"
              style={{
                minHeight: "300px",
                cursor: drawing.drawingMode ? "crosshair" : "default", // Set cursor crosshair saat drawing mode aktif
              }}
            />
          </div>
        )}

        {/* MODAL RUTE (di dalam canvas) */}
        {ui.showRouteModal && (
          <div
            data-modal="route-modal"
            className="absolute inset-0 z-[25] flex items-center justify-center"
            style={{
              cursor: drawing.drawingMode ? "crosshair" : "default", // Set cursor crosshair saat drawing mode aktif
            }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => ui.setShowRouteModal(false)}
            />
            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-[26] animate-fadeInUp">
              {/* Tombol tutup */}
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl focus:outline-none"
                onClick={() => ui.setShowRouteModal(false)}
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
                        routing.setIsStartDropdownOpen(!routing.isStartDropdownOpen)
                      }
                    >
                      <span>
                        {routing.routeStartType === "my-location"
                          ? isGettingLocation
                            ? "📍 Mendapatkan Lokasi..."
                            : "📍 Lokasi Saya"
                          : (() => {
                              const selectedTitik = features.titikFeatures.find(
                                (t: any) =>
                                  String(t.id || t.properties?.OBJECTID) ===
                                  String(routing.routeStartId)
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
                          routing.isStartDropdownOpen ? "rotate-180" : ""
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

                    {routing.isStartDropdownOpen && (
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
                            routing.setRouteStartType("my-location");
                            routing.setRouteStartId("");
                            routing.setIsStartDropdownOpen(false);
                          }}
                        >
                          {isGettingLocation
                            ? "📍 Mendapatkan Lokasi..."
                            : "📍 Lokasi Saya"}
                        </button>
                        {features.titikFeatures
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
                                routing.setRouteStartType("titik");
                                routing.setRouteStartId(
                                  String(t.id || t.properties?.OBJECTID)
                                );
                                routing.setIsStartDropdownOpen(false);
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
                  {routing.routeEndType === "bangunan" && routing.routeEndId ? (
                    // Tampilkan bangunan yang dipilih (dari klik bangunan)
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">
                        {(() => {
                          const b = features.bangunanFeatures.find(
                            (b: FeatureType) => b.properties.id == routing.routeEndId
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
                        value={routing.routeEndSearchText}
                        onChange={(e) => {
                          const searchText = e.target.value;
                          routing.setRouteEndSearchText(searchText);
                          if (searchText.trim()) {
                            const results = searchTitikByName(searchText);
                            routing.setRouteEndSearchResults(results);
                          } else {
                            routing.setRouteEndSearchResults([]);
                          }
                        }}
                        placeholder="Cari nama titik tujuan..."
                      />
                      {/* Dropdown hasil pencarian */}
                      {routing.routeEndSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                          {routing.routeEndSearchResults.map((point) => (
                            <button
                              key={point.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                              onClick={() => {
                                routing.setRouteEndSearchText(point.name);
                                routing.setRouteEndType("titik");
                                routing.setRouteEndSearchResults([]);
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
                  disabled={isGettingLocation || loading.isCalculatingRoute}
                  className={`w-full py-2 rounded-lg font-bold mt-2 transition-all ${
                    isGettingLocation || loading.isCalculatingRoute
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {isGettingLocation ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mendapatkan Lokasi GPS...
                    </div>
                  ) : loading.isCalculatingRoute ? (
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
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-md mx-4 transition-all duration-500 ${
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


        {/* Custom Confirmation Dialog */}
        {confirmationDialog && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] transition-all duration-300 ${
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

