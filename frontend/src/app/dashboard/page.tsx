"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useTheme } from "next-themes";
import ParticlesCustom from "@/components/ParticlesCustom";
import { updateBangunan, uploadBangunanThumbnail } from "@/services/bangunan";
import dynamic from "next/dynamic";

interface Bangunan {
  id_bangunan: number;
  nama: string;
  interaksi: string;
  lantai: number;
  geometri: string;
  thumbnail?: string;
}

interface Ruangan {
  id_ruangan: number;
  nama_ruangan: string;
  nomor_lantai: number;
  id_bangunan: number;
  nama_jurusan?: string;
  nama_prodi?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const navbarTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(Date.now());
  const [cuaca, setCuaca] = useState<string | null>(null);
  const [hari, setHari] = useState("");
  const [tanggal, setTanggal] = useState("");
  const mapArea = useRef<HTMLDivElement>(null);

  // Data states
  const [bangunan, setBangunan] = useState<Bangunan[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<Record<string, any> | null>(null);

  // Modal states
  const [selectedBangunan, setSelectedBangunan] = useState<Bangunan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCanvasModal, setShowCanvasModal] = useState(false); // Show Leaflet canvas with edit form
  const [editNama, setEditNama] = useState("");
  const [editInteraksi, setEditInteraksi] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { theme, setTheme } = useTheme();
  const [weatherDesc, setWeatherDesc] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const weatherDescID = (desc: string) => {
    const map: Record<string, string> = {
      "clear sky": "Cerah",
      "few clouds": "Sedikit berawan",
      "scattered clouds": "Berawan",
      "broken clouds": "Berawan Tebal",
      "shower rain": "Hujan Gerimis",
      rain: "Hujan",
      thunderstorm: "Badai Petir",
      snow: "Salju",
      mist: "Berkabut",
      "overcast clouds": "Mendung",
      "light rain": "Hujan Ringan",
      "moderate rain": "Hujan Sedang",
      "heavy intensity rain": "Hujan Lebat",
      "very heavy rain": "Hujan Sangat Lebat",
      "extreme rain": "Hujan Ekstrem",
      "light intensity shower rain": "Gerimis Ringan",
      "heavy intensity shower rain": "Gerimis Lebat",
      "ragged shower rain": "Gerimis Tidak Merata",
    };
    return map[desc?.toLowerCase()] || desc;
  };

  useEffect(() => {
    // Only set isDark if theme is not undefined (theme has loaded)
    if (theme !== undefined) {
      setIsDark(theme === "dark");
      if (theme === "dark") {
        console.log("Dark mode aktif");
      } else if (theme === "light") {
        console.log("Light mode aktif");
      }
    }

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Get user info
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserInfo(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [theme, router]);

  // Cuaca Pontianak dengan OpenWeatherMap
  const fetchCuaca = async () => {
    const apiKeys = [
      "3de9464f7cd6c93edc45ca3b8f2188fd",
      "4f5c8b9a1d2e3f4a5b6c7d8e9f0a1b2c",
      "5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    ];

    for (const apiKey of apiKeys) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Pontianak,ID&appid=${apiKey}&units=metric`
        );
        if (response.ok) {
          const data = await response.json();
          setCuaca(Math.round(data.main.temp).toString());
          setWeatherDesc(data.weather[0].description);
          setWeatherIcon(
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
          );
          break;
        }
      } catch (error) {
        console.error(`Error fetching weather with key ${apiKey}:`, error);
      }
    }
  };

  const getTanggal = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const tanggalLengkap = now.toLocaleDateString("id-ID", options);
    const [hariStr, tanggalStr] = tanggalLengkap.split(", ");
    setHari(hariStr);
    setTanggal(tanggalStr);
  };

  const toggleDark = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleMouseEnter = () => {
    if (navbarTimeout.current) {
      clearTimeout(navbarTimeout.current);
    }
    setShowNavbar(true);
  };

  const handleMouseLeave = () => {
    if (navbarTimeout.current) {
      clearTimeout(navbarTimeout.current);
    }
    navbarTimeout.current = setTimeout(() => {
      if (isScrolled) {
        setShowNavbar(false);
      }
    }, 2000);
  };

  // Fetch data dari API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [bangunanRes, ruanganRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan`, {
          headers,
        }),
      ]);

      if (bangunanRes.ok) {
        const bangunanData = await bangunanRes.json();
        setBangunan(bangunanData);
      }

      if (ruanganRes.ok) {
        const ruanganData = await ruanganRes.json();
        setRuangan(ruanganData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Handle Save Edit Bangunan (nama, interaksi, thumbnail only - dari canvas modal)
  const handleSaveEditBangunan = async () => {
    if (!selectedBangunan) return;
    
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Save nama dan interaksi only
      await updateBangunan(
        selectedBangunan.id_bangunan,
        { 
          nama: editNama, 
          interaksi: editInteraksi
        },
        token
      );

      // Upload thumbnail if changed
      if (thumbnailFile) {
        const result = await uploadBangunanThumbnail(
          selectedBangunan.id_bangunan,
          thumbnailFile,
          token
        );
        
        // Update local state with all changes including thumbnail
        setBangunan(prev => prev.map(b => 
          b.id_bangunan === selectedBangunan.id_bangunan 
            ? { ...b, nama: editNama, interaksi: editInteraksi, thumbnail: result.thumbnail }
            : b
        ));
      } else {
        // Update local state without thumbnail change
        setBangunan(prev => prev.map(b => 
          b.id_bangunan === selectedBangunan.id_bangunan 
            ? { ...b, nama: editNama, interaksi: editInteraksi }
            : b
        ));
      }

      setShowCanvasModal(false);
      setSelectedBangunan(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    } catch (error) {
      console.error("Error saving bangunan:", error);
      alert("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle View Detail
  const handleViewDetail = (gedung: Bangunan) => {
    setSelectedBangunan(gedung);
    setShowDetailModal(true);
  };

  // Handle Show Canvas
  const handleShowCanvas = (gedung: Bangunan) => {
    setSelectedBangunan(gedung);
    setEditNama(gedung.nama || "");
    setEditInteraksi(gedung.interaksi || "Noninteraktif");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShowCanvasModal(true);
  };

  useEffect(() => {
    fetchCuaca();
    getTanggal();
    fetchData();

    const interval = setInterval(() => {
      fetchCuaca();
      getTanggal();
    }, 300000); // Update setiap 5 menit

    return () => clearInterval(interval);
  }, []);

  // Initialize Leaflet map untuk canvas modal
  useEffect(() => {
    if (!showCanvasModal || !selectedBangunan || !mapContainerRef.current) return;

    // Dynamic import Leaflet untuk avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      // @ts-ignore - CSS import for runtime
      await import("leaflet/dist/leaflet.css");

      // Clear existing map if any
      const container = mapContainerRef.current;
      if (!container) return;
      
      container.innerHTML = '';

      try {
        // Parse geometry
        const geometry = JSON.parse(selectedBangunan.geometri);
        
        // Extract coordinates untuk center map
        let center: [number, number] = [-0.026887, 109.342487]; // Default center
        
        if (geometry.type === "Polygon" && geometry.coordinates && geometry.coordinates[0]) {
          const coords = geometry.coordinates[0];
          // Calculate centroid
          const lats = coords.map((c: number[]) => c[1]);
          const lngs = coords.map((c: number[]) => c[0]);
          center = [
            lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
            lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length
          ];
        }

        // Create map with limited zoom
        const map = L.map(container, {
          center: center,
          zoom: 18,
          minZoom: 15,
          maxZoom: 19, // Limit to avoid "data not available" message
          zoomControl: true,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: false,
          boxZoom: false,
        });

        // Add Esri Satellite tile layer (same as main page)
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19, // Same as map maxZoom
        }).addTo(map);

        // Add building shape (read-only, no click interaction)
        const geoJsonLayer = L.geoJSON(geometry, {
          style: {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.8,
            fillColor: "#60a5fa",
            fillOpacity: 0.4,
          },
          interactive: false, // Disable all interactions
        }).addTo(map);

        // Fit bounds to show the entire building
        map.fitBounds(geoJsonLayer.getBounds(), {
          padding: [50, 50],
        });

        // Cleanup function
        return () => {
          map.remove();
        };
      } catch (error) {
        console.error("Error rendering map:", error);
        container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Error loading map</div>';
      }
    };

    initMap();
  }, [showCanvasModal, selectedBangunan]);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();

      // Update scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      // Update navbar visibility
      if (currentScrollY > 100) {
        setIsScrolled(true);
        if (
          scrollDirection === "down" &&
          currentTime - lastScrollTime.current > 100
        ) {
          setShowNavbar(false);
        } else if (scrollDirection === "up") {
          setShowNavbar(true);
        }
      } else {
        setIsScrolled(false);
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
      lastScrollTime.current = currentTime;
    };

    const scrollHandler = () => {
      let ticking = false;
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    const navbar = document.getElementById("navbar-main");
    if (navbar) {
      navbar.addEventListener("mouseenter", handleMouseEnter);
      navbar.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("scroll", scrollHandler);
      const navbar = document.getElementById("navbar-main");
      if (navbar) {
        navbar.removeEventListener("mouseenter", handleMouseEnter);
        navbar.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (navbarTimeout.current) {
        clearTimeout(navbarTimeout.current);
      }
    };
  }, [lastScrollY, scrollDirection]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors ${
          isDark ?? false
            ? "bg-background-dark"
            : "bg-gradient-to-tr from-background via-surface to-accent"
        } ${isDark ?? false ? "dark" : ""}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-primary dark:text-primary-dark">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ?? false
          ? "bg-background-dark"
          : "bg-gradient-to-tr from-background via-surface to-accent"
      } ${isDark ?? false ? "dark" : ""}`}
    >
      {/* Area hover atas untuk munculkan navbar */}
      <div
        className="fixed top-0 left-0 w-full h-8 z-40"
        style={{ pointerEvents: "auto" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* NAVBAR */}
      <nav
        id="navbar-main"
        className={`flex items-center justify-between px-4 lg:px-10 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 group/navbar ${
          isScrolled
            ? "bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        } ${
          showNavbar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          !isScrolled
            ? "group-hover/navbar:translate-y-0 group-hover/navbar:opacity-100 group-hover/navbar:pointer-events-auto"
            : ""
        } pointer-events-auto hover:shadow-2xl hover:scale-[1.01] focus-within:shadow-2xl focus-within:scale-[1.01] transition-all duration-300`}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Logo kiri */}
        <div className="flex items-center gap-3">
          <div
            className="w-auto h-12 lg:h-16 cursor-pointer transition-transform duration-200 active:scale-95 hover:scale-105"
            onClick={() => {
              const logo = document.getElementById("logo-navbar");
              if (logo) {
                logo.classList.add("animate-bounceIn");
                setTimeout(
                  () => logo.classList.remove("animate-bounceIn"),
                  600
                );
              }
            }}
          >
            <img
              id="logo-navbar"
              src="/logo.svg"
              alt="Logo"
              className="w-full h-full select-none"
            />
          </div>
        </div>

        {/* Kontrol kanan: cuaca & tanggal, darkmode, logout */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Cuaca & tanggal - tampil di tablet dan desktop */}
          {cuaca && weatherDesc && weatherIcon && hari && tanggal ? (
            <div className="hidden lg:flex items-center gap-8 animate-fadeInUp">
              {/* Cuaca */}
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center">
                  <img
                    src={weatherIcon}
                    alt="icon cuaca"
                    className="w-7 h-7"
                    style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
                  />
                </span>
                <div className="flex flex-col items-start">
                  <span
                    className="text-xl font-bold leading-none text-primary dark:text-primary-dark"
                    style={{
                      color: isDark ? "#3a86ff" : "#1d3557", // Navy blue for light mode
                    }}
                  >
                    {cuaca}
                  </span>
                  <span className="text-xs font-medium capitalize text-muted dark:text-muted-dark leading-none">
                    {weatherDescID(weatherDesc)}
                  </span>
                </div>
              </div>
              {/* Tanggal */}
              <span className="text-base lg:text-lg font-bold text-muted dark:text-muted-dark whitespace-nowrap">
                {hari}, {tanggal}
              </span>
            </div>
          ) : (
            <div className="hidden lg:block" style={{ width: 220 }} />
          )}

          {/* Cuaca mobile - hanya icon dan suhu */}
          {cuaca && weatherIcon ? (
            <div className="lg:hidden flex items-center gap-1">
              <span className="w-6 h-6 flex items-center justify-center">
                <img
                  src={weatherIcon}
                  alt="icon cuaca"
                  className="w-5 h-5"
                  style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
                />
              </span>
              <span
                className="text-sm font-bold text-primary dark:text-primary-dark"
                style={{
                  color: isDark ? "#3a86ff" : "#1d3557", // Navy blue for light mode
                }}
              >
                {cuaca}
              </span>
            </div>
          ) : null}

          {/* Tombol darkmode */}
          <button
            onClick={() => {
              const icon = document.getElementById("icon-darkmode");
              if (icon) {
                icon.classList.add("animate-spin-fast");
                setTimeout(
                  () => icon.classList.remove("animate-spin-fast"),
                  500
                );
              }
              toggleDark();
            }}
            className="rounded-full p-2 hover:bg-primary/20 dark:hover:bg-primary-dark/20 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-primary-dark/40 transition-colors duration-200"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <FiMoon id="icon-darkmode" className="w-5 h-5 text-accent-dark" />
            ) : (
              <FiSun
                id="icon-darkmode"
                className="w-5 h-5"
                style={{ color: "#1d3557" }} // Navy blue for light mode
              />
            )}
          </button>

          {/* User Menu */}
          <div className="relative group">
            <button
              className="rounded-lg bg-primary text-white font-semibold text-sm shadow-lg hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 transition-all duration-200 hover:scale-110 hover:shadow-2xl flex items-center gap-2 focus:scale-105 focus:shadow-2xl px-3 py-2"
              title="User Menu"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">
                  {userInfo?.username?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <span className="hidden lg:inline">
                {userInfo?.username || "Admin"}
              </span>
              <svg
                className="w-4 h-4 transition-transform group-hover:rotate-180"
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

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-60">
              <div className="py-1">
                <div className="px-4 py-1 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-semibold">
                    {userInfo?.username || "Admin"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-1 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* BUILDINGS GRID AREA - Full Screen */}
      <section
        ref={mapArea}
        className="w-full min-h-screen pt-20 lg:pt-24 pb-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-primary/5 via-surface to-accent/5 dark:from-background-dark dark:via-surface-dark dark:to-primary-dark/10 relative overflow-y-auto"
        style={{ position: "relative" }}
      >
        {/* Partikel Custom Polkadot/Bintang */}
        <ParticlesCustom isDark={isDark ?? false} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-dark mb-2">
              Daftar Gedung
            </h1>
            <p className="text-muted dark:text-muted-dark">
              Politeknik Negeri Pontianak
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Gedung: </span>
                <span className="text-lg font-bold text-primary dark:text-primary-dark">
                  {bangunan.length}
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Ruangan: </span>
                <span className="text-lg font-bold text-primary dark:text-primary-dark">
                  {ruangan.length}
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-primary dark:text-primary-dark">
                  Loading Gedung...
                </p>
              </div>
            </div>
          ) : bangunan.length === 0 ? (
            /* Empty State */
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Belum Ada Gedung
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Data gedung akan muncul di sini
                </p>
              </div>
            </div>
          ) : (
            /* Buildings Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bangunan.map((gedung) => {
                const jumlahRuangan = ruangan.filter(
                  (r) => r.id_bangunan === gedung.id_bangunan
                ).length;

                const thumbnailUrl = gedung.thumbnail
                  ? `${gedung.thumbnail.startsWith("http") ? "" : "/"}${gedung.thumbnail}?v=${Date.now()}`
                  : gedung.id_bangunan
                  ? `/img/${gedung.id_bangunan}/thumbnail.jpg?v=${Date.now()}`
                  : "/img/default/thumbnail.jpg";

                return (
                  <div
                    key={gedung.id_bangunan}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                  >
                    {/* Card Header with Building Thumbnail */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={thumbnailUrl}
                        alt={gedung.nama}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/img/default/thumbnail.jpg";
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      
                      {/* Building Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                          {gedung.nama}
                        </h3>
                      </div>


                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="space-y-3">
                        {/* Jumlah Lantai */}
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <div className="w-8 h-8 bg-primary/10 dark:bg-primary-dark/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-primary dark:text-primary-dark"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Jumlah Lantai
                            </p>
                            <p className="font-semibold">
                              {gedung.lantai} Lantai
                            </p>
                          </div>
                        </div>

                        {/* Jumlah Ruangan */}
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <div className="w-8 h-8 bg-accent/10 dark:bg-accent-dark/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-accent dark:text-accent-dark"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Jumlah Ruangan
                            </p>
                            <p className="font-semibold">
                              {jumlahRuangan} Ruangan
                            </p>
                          </div>
                        </div>

                        {/* Status Interaksi */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {gedung.interaksi || "Noninteraktif"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Action Buttons */}
                    <div className="px-6 pb-6 flex gap-2">
                      {/* Edit Bangunan */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowCanvas(gedung);
                        }}
                        className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 group-hover:shadow-lg"
                      >
                        Edit Bangunan
                      </button>
                      
                      {/* Edit Ruangan */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(gedung);
                        }}
                        className="flex-1 py-2 bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark rounded-lg font-medium text-sm hover:bg-primary hover:text-white dark:hover:bg-primary-dark dark:hover:text-white transition-all duration-300 group-hover:shadow-lg"
                      >
                        Edit Ruangan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail Gedung - Management Interface */}
      {showDetailModal && selectedBangunan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedBangunan.nama || "Gedung Tanpa Nama"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Management Lantai & Ruangan
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBangunan(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ×
              </button>
            </div>

            {/* Content - 2 Column Layout */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 p-6">
              {/* Left Column - Lantai Management + Canvas */}
              <div className="w-full md:w-1/2 flex flex-col gap-4 overflow-hidden">
                {/* Lantai List */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Daftar Lantai
                    </h4>
                    <button
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      title="Tambah Lantai"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah
                    </button>
                  </div>
                  <div className="p-4 space-y-2 max-h-[200px] overflow-y-auto">
                    {Array.from({ length: selectedBangunan.lantai }, (_, i) => i + 1).map((lantai) => (
                      <div
                        key={lantai}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary-dark transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 dark:bg-primary-dark/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-primary dark:text-primary-dark">
                              {lantai}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Lantai {lantai}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {ruangan.filter((r) => r.id_bangunan === selectedBangunan.id_bangunan && r.nomor_lantai === lantai).length} ruangan
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit Gambar Lantai"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Hapus Lantai"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canvas/Map Preview */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Peta Bangunan
                    </h4>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {selectedBangunan.thumbnail ? (
                        <img
                          src={
                            selectedBangunan.thumbnail.startsWith("http")
                              ? selectedBangunan.thumbnail
                              : `/${selectedBangunan.thumbnail}`
                          }
                          alt="Building Map"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/img/default/thumbnail.jpg";
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Peta bangunan akan ditampilkan di sini
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Ruangan Management */}
              <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      Daftar Ruangan
                      <span className="ml-2 px-2 py-0.5 bg-primary dark:bg-primary-dark text-white text-xs rounded-full">
                        {ruangan.filter((r) => r.id_bangunan === selectedBangunan.id_bangunan).length}
                      </span>
                    </h4>
                    <button
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      title="Tambah Ruangan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah
                    </button>
                  </div>
                  
                  {/* Ruangan List - Grouped by Lantai */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {(() => {
                      const gedungRuangan = ruangan.filter((r) => r.id_bangunan === selectedBangunan.id_bangunan);
                      
                      if (gedungRuangan.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="text-5xl mb-3">📭</div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada ruangan</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                              Klik tombol "Tambah" untuk menambah ruangan baru
                            </p>
                          </div>
                        );
                      }

                      // Group by lantai
                      const ruanganByLantai: Record<number, typeof gedungRuangan> = {};
                      gedungRuangan.forEach((r) => {
                        if (!ruanganByLantai[r.nomor_lantai]) {
                          ruanganByLantai[r.nomor_lantai] = [];
                        }
                        ruanganByLantai[r.nomor_lantai].push(r);
                      });

                      const sortedLantai = Object.keys(ruanganByLantai)
                        .map(Number)
                        .sort((a, b) => a - b);

                      return (
                        <div className="space-y-3">
                          {sortedLantai.map((lantai) => (
                            <div key={lantai} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Lantai {lantai}
                                <span className="ml-auto text-xs bg-primary dark:bg-primary-dark text-white px-2 py-0.5 rounded-full">
                                  {ruanganByLantai[lantai].length}
                                </span>
                              </div>
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {ruanganByLantai[lantai].map((room) => (
                                  <div key={room.id_ruangan} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                          {room.nama_ruangan}
                                        </p>
                                        {(room.nama_jurusan || room.nama_prodi) && (
                                          <div className="mt-1 space-y-0.5">
                                            {room.nama_jurusan && (
                                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                <span className="font-medium">Jurusan:</span> {room.nama_jurusan}
                                              </p>
                                            )}
                                            {room.nama_prodi && (
                                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                <span className="font-medium">Prodi:</span> {room.nama_prodi}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                          title="Edit Ruangan"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                          title="Hapus Ruangan"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBangunan(null);
                }}
                className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Tutup
              </button>
              <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Canvas - Show Leaflet with Building Shape + Edit Form */}
      {showCanvasModal && selectedBangunan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Gedung & Preview Peta
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedBangunan.nama}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCanvasModal(false);
                  setSelectedBangunan(null);
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl"
              >
                ×
              </button>
            </div>

            {/* Content - 2 Columns */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 p-6">
              {/* LEFT - Map Canvas */}
              <div className="flex-1 min-h-[400px]">
                <div 
                  ref={mapContainerRef}
                  id="canvas-map"
                  className="w-full h-full rounded-lg border-2 border-gray-300 dark:border-gray-600 leaflet-canvas-map"
                />
              </div>

              {/* RIGHT - Edit Form */}
              <div className="w-full md:w-96 flex flex-col gap-4 overflow-y-auto">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Edit Informasi
                </h4>

                {/* Nama Gedung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Gedung
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan nama gedung"
                  />
                </div>

                {/* Status Interaksi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status Interaksi
                  </label>
                  <select
                    value={editInteraksi}
                    onChange={(e) => setEditInteraksi(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                  >
                    <option value="Interaktif">Interaktif</option>
                    <option value="Noninteraktif">Noninteraktif</option>
                  </select>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail Gedung
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    {thumbnailPreview ? (
                      <div className="space-y-3">
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                          }}
                          className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Hapus Gambar
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 dark:text-gray-500 mb-3 block"></i>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Klik untuk memilih thumbnail baru
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailFileChange}
                          className="hidden"
                          id="thumbnail-upload-canvas"
                        />
                        <label
                          htmlFor="thumbnail-upload-canvas"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-folder-open mr-2"></i>
                          Pilih File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCanvasModal(false);
                  setSelectedBangunan(null);
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditBangunan}
                disabled={isSaving || !editNama || !editNama.trim()}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
