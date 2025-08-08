/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSun, FiMoon } from "react-icons/fi";
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
  const [showNavbar, setShowNavbar] = useState(true);
  const [isInHeroSection, setIsInHeroSection] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const navbarTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(Date.now());
  const [cuaca, setCuaca] = useState<string | null>(null);
  const [hari, setHari] = useState("");
  const [tanggal, setTanggal] = useState("");
  const mapArea = useRef<HTMLDivElement>(null);

  // Konfigurasi slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    fade: true,
    arrows: false,
    pauseOnHover: true,
    dotsClass: "slick-dots hero-dots",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          autoplaySpeed: 4000,
          speed: 1000,
        },
      },
    ],
  };

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
  }, [theme]);

  // Cuaca Pontianak dengan OpenWeatherMap
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

  const scrollToMap = () => {
    mapArea.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fungsi untuk mendapatkan semua gambar dari folder Slider secara dinamis
  const getAllSliderImages = () => {
    const images = [
      "/Slider/Background1.jpg",
      "/Slider/Background2.jpg",
      "/Slider/Background3.jpg",
      "/Slider/Background4.jpg",
    ];
    return images;
  };

  const sliderImages = getAllSliderImages();

  const handleMouseEnter = () => {
    if (navbarTimeout.current) {
      clearTimeout(navbarTimeout.current);
    }
    setShowNavbar(true);
  };

  const handleMouseLeave = () => {
    if (!isInHeroSection && scrollDirection === "down") {
      navbarTimeout.current = setTimeout(() => {
        setShowNavbar(false);
      }, 5000);
    }
  };

  useEffect(() => {
    fetchCuaca();
    getTanggal();

    const handleScroll = () => {
      const currentTime = Date.now();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const threshold = windowHeight * 0.75;

      // Menentukan arah scroll
      const newScrollDirection = scrollY > lastScrollY ? "down" : "up";
      setScrollDirection(newScrollDirection);
      setLastScrollY(scrollY);

      setIsScrolled(scrollY > 50);
      setIsInHeroSection(scrollY < windowHeight * 0.8);

      // Reset timeout setiap kali scroll
      if (navbarTimeout.current) {
        clearTimeout(navbarTimeout.current);
      }

      // Jika di hero section, navbar selalu tampil
      if (scrollY < threshold) {
        setShowNavbar(true);
        return;
      }

      // Update tampilan navbar berdasarkan arah scroll
      if (newScrollDirection === "up") {
        setShowNavbar(true);
        lastScrollTime.current = currentTime;
      } else {
        // Jika scroll ke bawah, sembunyikan navbar setelah 100ms
        if (currentTime - lastScrollTime.current > 100) {
          setShowNavbar(false);
        }
      }

      // Set timeout untuk menyembunyikan navbar setelah 5 detik tidak ada aktivitas scroll
      navbarTimeout.current = setTimeout(() => {
        if (scrollY > threshold && !isInHeroSection) {
          setShowNavbar(false);
        }
      }, 5000);
    };

    // Throttle scroll event untuk performa
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
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
  }, [lastScrollY, scrollDirection, isInHeroSection]);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ?? false
          ? "bg-background-dark"
          : "bg-gradient-to-tr from-background via-surface to-accent"
      } ${isDark ?? false ? "dark" : ""}`}
    >
      {/* Area hover atas untuk munculkan navbar - hanya aktif di luar hero section */}
      {!isInHeroSection && (
        <div
          className="fixed top-0 left-0 w-full h-8 z-40"
          style={{ pointerEvents: "auto" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* NAVBAR */}
      <nav
        id="navbar-main"
        className={`navbar ${
          isScrolled ? "navbar-scrolled" : "navbar-transparent"
        } flex items-center justify-between px-4 lg:px-10 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 group/navbar ${
          isScrolled
            ? isDark
              ? "bg-gray-900/90 backdrop-blur-md shadow-lg"
              : "bg-white/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        } ${
          showNavbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          !isInHeroSection
            ? "group-hover/navbar:translate-y-0 group-hover/navbar:opacity-100 group-hover/navbar:pointer-events-auto"
            : ""
        } hover:shadow-2xl hover:scale-[1.01] focus-within:shadow-2xl focus-within:scale-[1.01] transition-all duration-300`}
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
                    style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
                  />
                </span>
                <div className="flex flex-col items-start">
                  <span
                    className="text-xl font-bold leading-none text-primary dark:text-primary-dark"
                    style={{
                      color: isDark ? "#60a5fa" : "#3b82f6", // Explicit color based on theme
                    }}
                  >
                    {cuaca}
                  </span>
                  <span
                    className="text-xs font-medium capitalize text-gray-600 dark:text-gray-400 leading-none"
                    style={{
                      color: isDark ? "#9ca3af" : "#4b5563", // Explicit color based on theme
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
                  color: isDark ? "#d1d5db" : "#374151", // Explicit color based on theme
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
                  style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
                />
              </span>
              <span
                className="text-sm font-bold text-primary dark:text-primary-dark"
                style={{
                  color: isDark ? "#60a5fa" : "#3b82f6", // Explicit color based on theme
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
                style={{ color: "#60a5fa" }} // Explicit color for dark mode
              />
            ) : (
              <FiSun
                id="icon-darkmode"
                className="w-5 h-5"
                style={{ color: "#3b82f6" }} // Explicit color for light mode
              />
            )}
          </button>

          {/* Tombol Login - tablet dan desktop dengan teks, mobile hanya icon */}
          <Link
            href="/login"
            className="rounded-lg bg-primary text-white font-semibold text-sm shadow-lg hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-200 hover:scale-110 hover:shadow-2xl flex items-center gap-2 focus:scale-105 focus:shadow-2xl px-2 py-2 lg:px-4 lg:py-2"
            title="Login"
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden lg:inline">Login</span>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section relative flex flex-col lg:flex-row items-center justify-between min-h-screen w-full pt-24 sm:pt-28 lg:pt-32 pb-8 lg:pb-0 px-4 sm:px-6 lg:px-16 overflow-hidden gap-8 lg:gap-12">
        <div className="w-full max-w-screen-sm lg:max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Partikel Custom Polkadot/Bintang */}
          <ParticlesCustom isDark={isDark ?? false} />

          {/* Kiri: Text Content */}
          <div className="hero-content flex-1 z-10 flex flex-col items-center lg:items-start justify-center max-w-2xl text-center lg:text-left animate-fadeInUp order-2 lg:order-1 mt-8 lg:mt-0">
            <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-semibold leading-tight mb-4 lg:mb-6 text-gray-900 dark:text-white animate-slideInLeft cursor-default flex flex-wrap gap-1 justify-center lg:justify-start">
              {"PointMap".split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-block transition-all duration-300 hover:scale-125 hover:text-primary dark:hover:text-primary-dark hover:drop-shadow-lg hover:animate-bounce"
                  style={{
                    transitionDelay: `${i * 40}ms`,
                    color: isDark ? "#ffffff" : "#111827", // Explicit color based on theme
                  }}
                >
                  {char}
                </span>
              ))}
            </h1>
            <p
              className="hero-subtitle text-base sm:text-lg lg:text-xl xl:text-2xl text-primary/80 dark:text-primary-dark/80 my-4 lg:my-4 font-heading font-medium animate-fadeInUp animation-delay-200 hover:text-primary dark:hover:text-primary-dark transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                color: isDark
                  ? "rgba(96, 165, 250, 0.8)"
                  : "rgba(59, 130, 246, 0.8)", // Explicit color based on theme
              }}
            >
              Polnep Interactive Map
            </p>
            <p
              className="hero-description max-w-xl text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 dark:text-gray-300 mb-8 lg:mb-8 animate-fadeInUp animation-delay-400 leading-relaxed hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-300 px-2 lg:px-0"
              style={{
                color: isDark ? "#d1d5db" : "#374151", // Explicit color based on theme
              }}
            >
              Sarana pemetaan digital interaktif yang mendukung kegiatan
              eksplorasi dan navigasi kawasan kampus Politeknik Negeri Pontianak
              secara informatif dan terarah.
            </p>
            <button
              onClick={scrollToMap}
              className="hero-button group px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-primary text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl shadow-lg hover:bg-gradient-to-r hover:from-primary hover:to-accent dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-bounceIn animation-delay-600 relative overflow-hidden hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent/40"
              style={{ position: "relative" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Jelajahi Peta
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <span className="absolute left-0 top-0 w-full h-full pointer-events-none ripple-effect"></span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>

          {/* Kanan: Image Slider */}
          <div className="hero-slider flex-1 flex items-center justify-center relative w-full aspect-[16/9] max-w-xs sm:max-w-md lg:max-w-2xl animate-fadeInRight order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="relative w-full h-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-[0_8px_32px_0_rgba(30,41,59,0.25)] lg:shadow-[0_16px_64px_0_rgba(30,41,59,0.35)] bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md z-20 -translate-y-2 lg:-translate-y-8 transition-all duration-500 floating-anim">
              <Slider {...sliderSettings} className="w-full h-full">
                {sliderImages.map((image, index) => (
                  <div
                    key={index}
                    className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                    style={{ minHeight: "100%" }}
                  >
                    <img
                      src={image}
                      alt={`Background ${index + 1}`}
                      className="h-full w-full object-cover transition-all duration-700 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl hover:scale-105 hover:-translate-y-1 group-hover:scale-105 group-hover:-translate-y-1"
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                      onError={(e) => {
                        console.error(`Error loading image: ${image}`);
                        e.currentTarget.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully: ${image}`);
                      }}
                    />
                  </div>
                ))}
              </Slider>
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none group-hover:from-black/10 transition-all duration-300" />

              {/* Floating elements untuk interaktivitas */}
              <div className="absolute top-3 left-3 lg:top-4 lg:left-4 w-2 h-2 lg:w-3 lg:h-3 bg-white/30 rounded-full animate-pulse group-hover:bg-white/50 transition-colors duration-300"></div>
              <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white/40 rounded-full animate-ping group-hover:bg-white/60 transition-colors duration-300"></div>
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
              color: isDark ? "#d1d5db" : "#374151", // Explicit color based on theme
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
              color: isDark ? "#d1d5db" : "#374151", // Explicit color based on theme
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
        className="w-full h-screen min-h-0 min-w-0 py-2 md:py-4 lg:py-6 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center overflow-hidden bg-primary/10 dark:bg-primary/20 border-none rounded-none shadow-none relative"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="w-full">
          <div className="bg-primary text-white text-lg md:text-xl font-bold text-left py-3 px-6 shadow rounded-t-2xl flex items-center justify-between">
            <span>Polnep Interactive Map</span>
          </div>
        </div>

        <div
          className={`w-full h-[320px] md:h-[540px] lg:h-[700px] relative bg-white rounded-b-2xl overflow-hidden transition-all duration-200`}
          style={{ minHeight: 320, height: "100%", maxHeight: 700 }}
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
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Kiri: Logo & deskripsi */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img
              src="/logo.svg"
              alt="Logo PointMap"
              className="h-14 select-none mb-2"
            />
            <span className="font-bold text-lg text-primary dark:text-primary-dark">
              PointMap
            </span>
            <span className="text-xs text-muted dark:text-muted-dark text-center md:text-left max-w-xs">
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
                href="#"
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
                href="#"
                title="LinkedIn"
                className="hover:scale-110 transition-transform"
              >
                <svg
                  className="w-6 h-6 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-primary-dark"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75s1.75.79 1.75 1.75s-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47c-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.85-1.54c3.05 0 3.62 2.01 3.62 4.62v4.69z" />
                </svg>
              </a>
              <a
                href="#"
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
              polnep@ac.id
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
              href="https://maps.app.goo.gl/2Qw1v8k8k8k8k8k8A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary dark:text-primary-dark underline hover:text-accent dark:hover:text-accent-dark transition-colors"
            >
              Lihat di Google Maps
            </a>
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
