/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSun, FiMoon } from "react-icons/fi";
import {
  FaBuilding,
  FaDoorOpen,
  FaLayerGroup,
  FaImages,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "next-themes";
import React from "react";
import ParticlesCustom from "@/components/ParticlesCustom";
import dynamic from "next/dynamic";
import CampusSelector from "@/components/CampusSelector";
import { DEFAULT_CAMPUS, CAMPUSES } from "@/config/campusConfig";

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
  // Use local state for Homepage to keep it separate from Dashboard context
  const [selectedCampus, setSelectedCampus] = useState(DEFAULT_CAMPUS);

  const { theme, setTheme } = useTheme();
  const [weatherDesc, setWeatherDesc] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");

  /* New Slider Images */
  const heroImages = [
    "/Slider/polnep.webp",
    "/Slider/sanggau.webp",
    "/Slider/kapuashulu.webp",
    "/Slider/sukamara.webp",
  ];
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Switch every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
    const cookies = document.cookie.split(";");
    const googtransCookie = cookies.find((c) =>
      c.trim().startsWith("googtrans=")
    );
    if (googtransCookie) {
      const value = googtransCookie.split("=")[1];
      // Cookie format is /id/en for translation to English
      setIsEnglish(value === "/id/en");
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
      const selectElement = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = newLang ? "en" : "id";
        // Trigger change event
        const event = new Event("change", { bubbles: true });
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
    if (mapArea.current) {
      const top =
        mapArea.current.getBoundingClientRect().top + window.scrollY - 50;
      window.scrollTo({ top, behavior: "smooth" });
    }
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
                      isDark || !isScrolled
                        ? "brightness(0) invert(1)"
                        : "none",
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
              backgroundColor:
                isDark || !isScrolled ? "rgba(255,255,255,0.2)" : "#e5e7eb",
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
                src={isEnglish ? "/flags/usa.svg" : "/flags/indonesia.svg"}
                alt={isEnglish ? "English" : "Indonesia"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Hidden Google Translate Element */}
          <div
            id="google_translate_element"
            style={{ position: "absolute", left: "-9999px" }}
          ></div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section relative flex flex-col justify-between min-h-screen w-full pt-32 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-60">
          <div className="relative w-full h-full">
            {heroImages.map((img, index) => (
              <div
                key={img}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentHeroImage ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={img}
                  alt={`Background ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        </div>

        {/* Vertical Pagination Indicators */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-4">
          {heroImages.map((_, idx) => (
            <div
              key={idx}
              className={`w-1 transition-all duration-300 rounded-full ${
                idx === currentHeroImage
                  ? "h-12 bg-white"
                  : "h-6 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start justify-start text-left">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight max-w-4xl">
            PointMap <br />
            <span className="text-lg md:text-2xl font-normal text-gray-300 block mt-2 tracking-widest uppercase">
              Polnep Interactive Map
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-12 font-light max-w-2xl leading-relaxed">
            Platform peta interaktif untuk menjelajahi setiap sudut kampus.
            Temukan gedung, ruangan, dan fasilitas kampus dengan visualisasi
            peta digital yang presisi dan informatif.
          </p>
        </div>

        {/* Campus Selection Cards */}
        <div className="w-full max-w-7xl mx-auto px-4 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                campus: CAMPUSES[0],
                img: "/Slider/polnep.webp",
                label: "Kampus Utama",
                desc: "Jl. Ahmad Yani",
              },
              {
                campus: CAMPUSES[1],
                img: "/Slider/sanggau.webp",
                label: "PSDKU Sanggau",
                desc: "Kab. Sanggau",
              },
              {
                campus: CAMPUSES[2],
                img: "/Slider/kapuashulu.webp",
                label: "PDD Kapuas Hulu",
                desc: "Kab. Kapuas Hulu",
              },
              {
                campus: CAMPUSES[3],
                img: "/Slider/sukamara.webp",
                label: "PSDKU Sukamara",
                desc: "Kab. Sukamara",
              },
            ].map((item, idx) => (
              <button
                key={item.campus.id}
                onClick={() => {
                  setSelectedCampus(item.campus);
                  setTimeout(scrollToMap, 100);
                }}
                className={`
                    group relative overflow-hidden rounded-xl cursor-pointer text-left h-36 w-full
                    border transition-all duration-300
                    ${
                      selectedCampus.id === item.campus.id
                        ? "border-transparent"
                        : "border-white/10 hover:border-white/30"
                    }
                  `}
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gray-900 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.campus.name}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between items-start relative z-10 pointer-events-none h-full">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1 drop-shadow-md">
                      {item.label}
                    </p>
                    <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md pr-8">
                      {item.campus.shortName
                        .replace("Polnep ", "")
                        .replace("PSDKU ", "")
                        .replace("PDD ", "")}
                    </h3>
                  </div>

                  <p className="text-xs text-white flex items-center gap-2 font-medium drop-shadow-md mt-auto">
                    <FaMapMarkedAlt className="text-white" />
                    {item.desc}
                  </p>
                </div>

                {/* Arrow Icon - Absolute Corner */}
                <div className="absolute top-0 right-0 z-20">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md flex items-center justify-center text-white rounded-bl-xl border-l border-b border-white/20 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAP / CANVAS AREA */}
      <section
        ref={mapArea}
        className="w-full h-[90vh] min-h-0 min-w-0 py-2 md:py-4 lg:py-6 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center overflow-hidden bg-primary/10 dark:bg-primary/20 border-none rounded-none shadow-none relative"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="w-full">
          <div className="bg-primary text-white text-lg md:text-xl font-bold py-3 px-6 shadow rounded-t-2xl flex items-center justify-between border border-primary/20 dark:border-transparent">
            <span>Polnep Interactive Map</span>
            {isClient && (
              <CampusSelector
                selectedCampus={selectedCampus}
                onCampusChange={setSelectedCampus}
                isDark={true}
              />
            )}
          </div>
        </div>

        <div
          className={`w-full h-[300px] md:h-[500px] lg:h-[600px] relative bg-white rounded-b-2xl overflow-hidden transition-all duration-200`}
          style={{ minHeight: 300, height: "100%", maxHeight: 600 }}
        >
          {isClient && (
            <LeafletMap
              initialLat={selectedCampus.latitude}
              initialLng={selectedCampus.longitude}
              initialZoom={selectedCampus.zoom}
              maxZoom={selectedCampus.maxZoom}
              className="w-full h-full"
              isDark={isDark ?? false}
              isDashboard={false}
              campusFilter={selectedCampus.name}
            />
          )}
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
