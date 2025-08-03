"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { LeafletMapRef } from "@/components/LeafletMap";
import ParticlesCustom from "@/components/ParticlesCustom";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

interface Bangunan {
  id_bangunan: number;
  nama: string;
  interaksi: string;
  lantai: number;
  geometri: string;
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
  const [isDark, setIsDark] = useState(false);
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

  // Ref untuk LeafletMap component
  const mapRef = useRef<LeafletMapRef | null>(null);

  // Data states
  const [bangunan, setBangunan] = useState<Bangunan[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  const { theme, setTheme } = useTheme();
  const [weatherDesc, setWeatherDesc] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");

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
    setIsDark(theme === "dark");
    if (theme === "dark") {
      console.log("Dark mode aktif");
    } else if (theme === "light") {
      console.log("Light mode aktif");
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
        fetch("http://localhost:3001/api/bangunan", { headers }),
        fetch("http://localhost:3001/api/ruangan", { headers }),
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
          isDark
            ? "bg-background-dark"
            : "bg-gradient-to-tr from-background via-surface to-accent"
        } ${isDark ? "dark" : ""}`}
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
        isDark
          ? "bg-background-dark"
          : "bg-gradient-to-tr from-background via-surface to-accent"
      } ${isDark ? "dark" : ""}`}
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
                  <span className="text-xl font-bold leading-none text-primary dark:text-primary-dark">
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
              <span className="text-sm font-bold text-primary dark:text-primary-dark">
                {cuaca}
              </span>
            </div>
          ) : null}

          {/* Tombol darkmode */}
          <button
            onClick={(e) => {
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
              <FiSun id="icon-darkmode" className="w-5 h-5 text-primary" />
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

      {/* MAP / CANVAS AREA - Full Screen */}
      <section
        ref={mapArea}
        className="w-full h-screen min-h-0 min-w-0 pt-12 lg:pt-12 flex flex-col items-center justify-center overflow-hidden bg-primary/10 dark:bg-primary/20 border-none rounded-none shadow-none relative"
        style={{ position: "relative" }}
      >
        {/* Partikel Custom Polkadot/Bintang */}
        <ParticlesCustom isDark={isDark} />

        <div className="w-full h-full relative">
          <div className="bg-primary text-white text-lg md:text-xl font-bold text-left py-3 px-6 shadow rounded-t-2xl flex items-center justify-between mt-20 lg:mt-20">
            <span>Dashboard - Polnep Interactive Map</span>
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>

          <div
            className={`w-full h-full relative bg-white rounded-b-2xl overflow-hidden transition-all duration-200`}
            style={{ height: "calc(100vh - 180px)" }}
          >
            <LeafletMap
              ref={mapRef}
              initialLat={-0.0545}
              initialLng={109.3465}
              initialZoom={17}
              className="w-full h-full"
              isDark={isDark}
              isDashboard={true}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
