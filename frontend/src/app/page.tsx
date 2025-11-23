/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSun, FiMoon } from "react-icons/fi";
import { FaBuilding, FaDoorOpen, FaLayerGroup, FaImages } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "next-themes";
import React from "react";
import ParticlesCustom from "@/components/ParticlesCustom";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cuaca, setCuaca] = useState<string | null>(null);
  const [hari, setHari] = useState("");
  const [tanggal, setTanggal] = useState("");
  const mapArea = useRef<HTMLDivElement>(null);
  const [isEnglish, setIsEnglish] = useState(false);
  const [stats, setStats] = useState({
    bangunan: 0,
    ruangan: 0,
    lantai: 0,
    gallery: 0,
  });



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
      // tambahkan mapping lain jika perlu
    };
    return map[desc?.toLowerCase()] || desc;
  };

  useEffect(() => {
    setIsClient(true);
    // Set default theme to light mode if theme is undefined
    if (theme === undefined) {
      setIsDark(false); // Default to light mode
    } else {
      setIsDark(theme === "dark");
      if (theme === "dark") {
        console.log("Dark mode aktif");
      } else if (theme === "light") {
        console.log("Light mode aktif");
      }
    }

    // Check Google Translate cookie to sync toggle state
    const cookies = document.cookie.split(';');
    const googtransCookie = cookies.find(c => c.trim().startsWith('googtrans='));
    if (googtransCookie) {
      const value = googtransCookie.split('=')[1];
      // Cookie format is /id/en for translation to English
      setIsEnglish(value === '/id/en');
    }
  }, [theme]);

  const fetchCuaca = async () => {
    const apiKeys = [
      "3de9464f7cd6c93edc45ca3b8f2188fd",
      "6bab95d7682c72e011f702d3b9443257",
    ];
    let temp = null;
    let desc = "";
    let icon = "";
    for (const key of apiKeys) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Pontianak,id&appid=${key}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.main && typeof data.main.temp === "number") {
          temp = Math.round(data.main.temp) + "°C";
          desc =
            data.weather && data.weather[0]?.description
              ? data.weather[0].description
              : "";
          icon =
            data.weather && data.weather[0]?.icon
              ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
              : "";
          break;
        }
      } catch (e) {
        /* next key */
      }
    }
    setCuaca(temp || "N/A");
    setWeatherDesc(desc);
    setWeatherIcon(icon);
  };

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiUrl) return;
      const res = await fetch(`${apiUrl}/`);
      const data = await res.json();
      if (data.status === "API aktif & koneksi DB OK") {
        setStats({
          bangunan: data.jumlah_bangunan,
          ruangan: data.jumlah_ruangan,
          lantai: data.jumlah_lantai_gambar,
          gallery: data.jumlah_ruangan_gallery,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const getTanggal = () => {
    const d = new Date();
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const hariArr = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    setHari(hariArr[d.getDay()]);
    setTanggal(d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear());
  };

  const toggleDark = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    const newLang = !isEnglish;
    setIsEnglish(newLang);
    
    // Give Google Translate time to initialize
    setTimeout(() => {
      // Method 1: Try to find and trigger the dropdown
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = newLang ? 'en' : 'id';
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
        return;
      }

      // Method 2: Try to manipulate Google Translate cookie directly
      const domain = window.location.hostname;
      
      if (newLang) {
        // Set cookie to translate to English
        document.cookie = `googtrans=/id/en; path=/`;
        document.cookie = `googtrans=/id/en; path=/; domain=${domain}`;
      } else {
        // Remove translation cookie to restore Indonesian
        document.cookie = `googtrans=; path=/; max-age=0`;
        document.cookie = `googtrans=; path=/; domain=${domain}; max-age=0`;
        // Also try the /auto/auto format which resets translation
        document.cookie = `googtrans=/auto/auto; path=/`;
        document.cookie = `googtrans=/auto/auto; path=/; domain=${domain}`;
      }
      
      // Reload page to apply translation
      window.location.reload();
    }, 100);
  };

  const scrollToMap = () => {
    mapArea.current?.scrollIntoView({ behavior: "smooth" });
  };



  useEffect(() => {
    fetchCuaca();
    fetchStats();
    getTanggal();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ?? false
          ? "bg-background-dark"
          : "bg-gradient-to-tr from-background via-surface to-accent"
      } ${isDark ?? false ? "dark" : ""}`}
    >
      {/* Area hover atas untuk munculkan navbar - hanya aktif di luar hero section */}


      {/* NAVBAR */}
      <nav
        id="navbar-main"
        className={`navbar ${
          isScrolled ? "navbar-scrolled" : "navbar-transparent"
        } flex items-center justify-between px-4 lg:px-10 py-2 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? isDark
              ? "bg-gray-900/70 backdrop-blur-md shadow-lg"
              : "bg-white/70 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Logo kiri */}
        <div className="flex items-center gap-3">
          <div
            className="w-auto h-10 lg:h-12 cursor-pointer transition-transform duration-200 active:scale-95 hover:scale-105"
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

        {/* Kontrol kanan: cuaca & tanggal, darkmode, login */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Cuaca & tanggal - tampil di tablet dan desktop */}
          {isClient &&
          cuaca &&
          weatherDesc &&
          weatherIcon &&
          hari &&
          tanggal ? (
            <div className="hidden lg:flex items-center gap-8 animate-fadeInUp">
              {/* Cuaca */}
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center">
                  <img
                    src={weatherIcon}
                    alt="icon cuaca"
                    className="w-7 h-7"
                    style={{
                      filter:
                        isDark || !isScrolled
                          ? "brightness(0) invert(1)"
                          : "none",
                    }}
                  />
                </span>
                <div className="flex flex-col items-start">
                  <span
                    className="text-xl font-bold leading-none text-primary dark:text-primary-dark"
                    style={{
                      color: isDark || !isScrolled ? "#ffffff" : "#1d3557",
                    }}
                  >
                    {cuaca}
                  </span>
                  <span
                    className="text-xs font-medium capitalize text-gray-600 dark:text-gray-400 leading-none"
                    style={{
                      color: isDark || !isScrolled ? "#e5e7eb" : "#4b5563",
                    }}
                  >
                    {weatherDescID(weatherDesc)}
                  </span>
                </div>
              </div>
              {/* Tanggal */}
              <span
                className="text-base lg:text-lg font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                style={{
                  color: isDark || !isScrolled ? "#f3f4f6" : "#374151",
                }}
              >
                {hari}, {tanggal}
              </span>
            </div>
          ) : (
            <div className="hidden lg:block" style={{ width: 220 }} />
          )}

          {/* Cuaca mobile - hanya icon dan suhu */}
          {isClient && cuaca && weatherIcon ? (
            <div className="lg:hidden flex items-center gap-1">
              <span className="w-6 h-6 flex items-center justify-center">
                <img
                  src={weatherIcon}
                  alt="icon cuaca"
                  className="w-5 h-5"
                  style={{
                    filter:
                      isDark || !isScrolled ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </span>
              <span
                className="text-sm font-bold text-primary dark:text-primary-dark"
                style={{
                  color: isDark || !isScrolled ? "#ffffff" : "#1d3557",
                }}
              >
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
            {isDark ? (
              <FiMoon
                id="icon-darkmode"
                className="w-5 h-5"
                style={{ color: isDark || !isScrolled ? "#ffffff" : "#60a5fa" }}
              />
            ) : (
              <FiSun
                id="icon-darkmode"
                className="w-5 h-5"
                style={{ color: !isScrolled ? "#ffffff" : "#1d3557" }}
              />
            )}
          </button>

          {/* Language Toggle Switch */}
          <div
            className="relative w-14 h-7 bg-gray-200 rounded-full cursor-pointer flex items-center px-1 transition-colors duration-300"
            onClick={toggleLanguage}
            style={{
              backgroundColor: isDark || !isScrolled ? "rgba(255,255,255,0.2)" : "#e5e7eb",
            }}
            title={isEnglish ? "Switch to Indonesia" : "Switch to English"}
          >
            {/* Flag Circle */}
            <div
              className={`absolute w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center overflow-hidden bg-white ${
                isEnglish ? "translate-x-7" : "translate-x-0"
              }`}
            >
              <img
                src={
                  isEnglish
                    ? "/flags/usa.svg"
                    : "/flags/indonesia.svg"
                }
                alt={isEnglish ? "English" : "Indonesia"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Hidden Google Translate Element */}
          <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px' }}></div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section relative flex flex-col lg:flex-row items-center justify-between min-h-screen w-full pt-24 sm:pt-28 lg:pt-32 pb-8 lg:pb-0 px-4 sm:px-6 lg:px-16 overflow-hidden gap-8 lg:gap-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/Slider/Background1.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center px-4 h-full">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            PointMap
          </h1>
          <p className="text-xl md:text-2xl text-blue-300 mb-6 font-medium drop-shadow-md">
            Polnep Interactive Map
          </p>
          <p className="text-gray-200 text-lg max-w-2xl mb-12 leading-relaxed drop-shadow-sm">
            Sarana pemetaan digital interaktif yang mendukung kegiatan eksplorasi
            dan navigasi kawasan kampus Politeknik Negeri Pontianak secara
            informatif dan terarah.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white text-2xl">
                <FaBuilding />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">
                  {stats.bangunan}
                </h3>
                <p className="text-xs text-gray-300 uppercase tracking-wider">
                  Bangunan
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white text-2xl">
                <FaDoorOpen />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">
                  {stats.ruangan}
                </h3>
                <p className="text-xs text-gray-300 uppercase tracking-wider">
                  Ruangan
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white text-2xl">
                <FaLayerGroup />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">
                  {stats.lantai}
                </h3>
                <p className="text-xs text-gray-300 uppercase tracking-wider">
                  Lantai
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white text-2xl">
                <FaImages />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">
                  {stats.gallery}
                </h3>
                <p className="text-xs text-gray-300 uppercase tracking-wider">
                  Galeri
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Scroll absolut di tengah bawah hero section */}
        <button
          onClick={scrollToMap}
          className="scroll-button absolute left-1/2 -translate-x-1/2 bottom-8 sm:bottom-10 lg:bottom-6 z-30 flex flex-col items-center group focus:outline-none"
          style={{ background: "none", border: "none" }}
          aria-label="Scroll ke bawah"
        >
          <span
            className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-dark font-medium transition-colors"
            style={{
              color: isDark ? "#d1d5db" : "#374151",
            }}
          >
            Scroll
          </span>
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-dark animate-bounce mt-0.5 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              color: isDark ? "#d1d5db" : "#374151",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </section>

      {/* MAP / CANVAS AREA */}
      <section
        ref={mapArea}
        className="w-full h-[90vh] min-h-0 min-w-0 py-2 md:py-4 lg:py-6 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center overflow-hidden bg-primary/10 dark:bg-primary/20 border-none rounded-none shadow-none relative"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="w-full">
          <div className="bg-primary text-white text-lg md:text-xl font-bold text-left py-3 px-6 shadow rounded-t-2xl flex items-center justify-between border border-primary/20 dark:border-transparent">
            <span>Polnep Interactive Map</span>
          </div>
        </div>

        <div
          className={`w-full h-[300px] md:h-[500px] lg:h-[600px] relative bg-white rounded-b-2xl overflow-hidden transition-all duration-200`}
          style={{ minHeight: 300, height: "100%", maxHeight: 600 }}
        >
          <LeafletMap
            initialLat={-0.0545}
            initialLng={109.3465}
            initialZoom={17}
            className="w-full h-full"
            isDark={isDark ?? false}
            isDashboard={false}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface dark:bg-surface-dark/90 border-t border-primary/20 dark:border-primary-dark/30 shadow-inner shadow-primary/5 dark:shadow-primary-dark/10 px-4 py-10 md:py-12 transition-colors backdrop-blur-md">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* Kiri: Logo & deskripsi */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <a
              href="https://pointmap.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <img
                src="/logo.svg"
                alt="Logo PointMap"
                className="h-14 select-none mb-2"
              />
            </a>
            <a
              href="https://pointmap.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:text-accent dark:hover:text-accent-dark transition-colors"
            >
              <span className="font-bold text-lg text-primary dark:text-primary-dark">
                PointMap
              </span>
            </a>
            <span
              className="text-xs text-muted dark:text-muted-dark text-center md:text-left max-w-xs"
              style={{
                color: isDark ? "#b8c1ec" : "#1d3557",
              }}
            >
              Polnep Interactive Map - Navigasi digital kampus Politeknik Negeri
              Pontianak.
            </span>
          </div>
          {/* Tengah: Ikuti Kami */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-semibold text-base text-accent dark:text-accent-dark mb-1">
              Ikuti Kami
            </span>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/mediapolnep/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="hover:scale-110 transition-transform"
              >
                <svg
                  className="w-6 h-6 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary-dark"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@mediapolnep"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="hover:scale-110 transition-transform"
              >
                <svg
                  className="w-6 h-6 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary-dark"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@mediapolnep"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                className="hover:scale-110 transition-transform"
              >
                <svg
                  className="w-6 h-6 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary-dark"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.7-1.35 3.85-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a
                href="mailto:kampus@polnep.ac.id"
                title="Email"
                className="hover:scale-110 transition-transform"
              >
                <svg
                  className="w-6 h-6 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary-dark"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13L4 6.01V6h16zM4 20v-9.99l7.29 6.71c.39.36 1.02.36 1.41 0L20 10.01V20H4z" />
                </svg>
              </a>
            </div>
            <span className="text-xs text-muted dark:text-muted-dark mt-2">
              kampus@polnep.ac.id
            </span>
          </div>
          {/* Kanan: Kontak & Lokasi */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <span className="font-semibold text-base text-accent dark:text-accent-dark mb-1">
              Kontak & Lokasi
            </span>
            <span className="text-xs text-muted dark:text-muted-dark">
              Jl. Ahmad Yani, Pontianak, Kalimantan Barat
            </span>
            <span className="text-xs text-muted dark:text-muted-dark">
              Jam Operasional: 07.00 - 17.00 WIB
            </span>
            <a
              href="https://maps.app.goo.gl/4hSueu7RmXbesVe19"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary dark:text-primary-dark underline hover:text-accent dark:hover:text-accent-dark transition-colors"
            >
              Lihat di Google Maps
            </a>
            <div className="mt-2 w-full max-w-xs">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.748123456789!2d109.3465!3d-0.0545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMDMnMTYuMiJTIDEwOcKwMjAnNDcuNCJF!5e0!3m2!1sen!2sid!4v1234567890123"
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
                title="Lokasi Politeknik Negeri Pontianak"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-muted dark:text-muted-dark/80">
          {isClient
            ? `© ${new Date().getFullYear()} Politeknik Negeri Pontianak. Hak Cipta Dilindungi.`
            : null}
        </div>
      </footer>
    </div>
  );
}
