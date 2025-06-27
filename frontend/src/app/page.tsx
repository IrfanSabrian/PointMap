"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { FiSun, FiMoon } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "next-themes";
import React from "react";
import ParticlesCustom from "@/components/ParticlesCustom";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const [cuaca, setCuaca] = useState<string | null>(null);
  const [hari, setHari] = useState("");
  const [tanggal, setTanggal] = useState("");
  const mapArea = useRef<HTMLDivElement>(null);

  // State untuk zoom dan pan
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isAtBoundary, setIsAtBoundary] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

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
    beforeChange: (current: number, next: number) => {
      console.log(`Changing from slide ${current} to ${next}`);
    },
    afterChange: (current: number) => {
      console.log(`Now on slide ${current}`);
    },
  };

  // Fungsi untuk mendapatkan semua gambar dari folder Slider secara dinamis
  const getAllSliderImages = () => {
    const images = [
      "/Slider/Background1.jpg",
      "/Slider/Background2.jpg",
      "/Slider/Background3.jpg",
      "/Slider/Background4.jpg",
    ];
    console.log("Slider images:", images);
    return images;
  };

  const sliderImages = getAllSliderImages();
  const [searchText, setSearchText] = useState("");
  const { theme, setTheme } = useTheme();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Tambahkan state dan fetch untuk weatherDesc dan weatherIcon di atas useEffect fetchCuaca
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setIsClient(true);
    setIsDark(theme === "dark");
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

  // Initialize canvas dan load image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    setCtx(context);

    const img = new Image();
    img.src = "/maps.svg";
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error("Error loading image:", e);
    };

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (imageRef.current) drawImage();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (isImageLoaded) drawImage();
  }, [isImageLoaded, position, scale]);

  const drawImage = () => {
    if (!ctx || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.translate(position.x + centerX, position.y + centerY);
    ctx.scale(scale, scale);

    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgAspectRatio > canvasAspectRatio) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspectRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspectRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  };

  useEffect(() => {
    drawImage();
  }, [position, scale]);

  // Prevent scroll saat di area canvas
  useEffect(() => {
    const preventDefault = (e: WheelEvent) => {
      if (!isHovering) return;

      e.preventDefault();
      e.stopPropagation();

      const zoomIntensity = 0.05;
      const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
      const newScale = Math.min(Math.max(1, scale + delta), 4);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mouseOffsetX = mouseX - centerX;
      const mouseOffsetY = mouseY - centerY;

      const scaleChange = newScale - scale;
      const newPosition = {
        x: position.x - (mouseOffsetX * scaleChange) / scale,
        y: position.y - (mouseOffsetY * scaleChange) / scale,
      };

      const limitedPosition = constrainPosition(newPosition, newScale);
      setPosition(limitedPosition);
      setScale(newScale);
    };

    const canvasSection = mapArea.current;
    if (canvasSection) {
      canvasSection.addEventListener("wheel", preventDefault, {
        passive: false,
      });
    }

    return () => {
      if (canvasSection) {
        canvasSection.removeEventListener("wheel", preventDefault);
      }
    };
  }, [isHovering, scale, position]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (!isHovering) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (!isDragging || !isHovering) return;
    e.preventDefault();
    e.stopPropagation();

    const newPosition = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    };

    const limitedPosition = constrainPosition(newPosition, scale);
    setPosition(limitedPosition);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (!isHovering) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const constrainPosition = (
    pos: { x: number; y: number },
    currentScale: number
  ) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) return pos;

    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgAspectRatio > canvasAspectRatio) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspectRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspectRatio;
    }

    const maxX = Math.max(0, (drawWidth * currentScale - canvas.width) / 2);
    const maxY = Math.max(0, (drawHeight * currentScale - canvas.height) / 2);

    const constrainedPos = {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y)),
    };

    const isAtBoundary =
      Math.abs(constrainedPos.x) >= maxX - 1 ||
      Math.abs(constrainedPos.y) >= maxY - 1;

    setIsAtBoundary(isAtBoundary);
    return constrainedPos;
  };

  useEffect(() => {
    fetchCuaca();
    getTanggal();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      if (scrollY > 100) {
        setShowNavbar(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
          setShowNavbar(false);
        }, 3000);
      } else {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setShowNavbar(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark
          ? "bg-background-dark"
          : "bg-gradient-to-tr from-background via-surface to-accent"
      } ${isDark ? "dark" : ""}`}
    >
      {/* NAVBAR */}
      <nav
        className={`flex items-center justify-between px-10 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-500 group/navbar ${
          isScrolled
            ? "bg-white/80 dark:bg-surface-dark/90 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        } ${
          showNavbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        } hover:shadow-2xl hover:scale-[1.01] focus-within:shadow-2xl focus-within:scale-[1.01] transition-all duration-300`}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Logo kiri */}
        <div className="flex items-center gap-3">
          <div
            className="w-auto h-16 cursor-pointer transition-transform duration-200 active:scale-95 hover:scale-105"
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
        <div className="flex items-center gap-4">
          {/* Cuaca & tanggal kanan sejajar */}
          {isClient &&
          cuaca &&
          weatherDesc &&
          weatherIcon &&
          hari &&
          tanggal ? (
            <div className="flex items-center gap-8 animate-fadeInUp">
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
              <span className="text-base md:text-lg font-bold text-muted dark:text-muted-dark whitespace-nowrap">
                {hari}, {tanggal}
              </span>
            </div>
          ) : (
            <div style={{ width: 220 }} />
          )}

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

          {/* Tombol Login */}
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm shadow-lg hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-200 hover:scale-110 hover:shadow-2xl flex items-center gap-2 focus:scale-105 focus:shadow-2xl"
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
            Login
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center justify-between min-h-screen w-full pt-24 md:pt-32 pb-0 px-4 md:px-16 overflow-hidden gap-8 md:gap-12">
        {/* Partikel Custom Polkadot/Bintang */}
        <ParticlesCustom isDark={isDark} />
        {/* Kiri: Text Content */}
        <div className="flex-1 z-10 flex flex-col items-center md:items-start justify-center max-w-2xl text-center md:text-left animate-fadeInUp">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-[#1a1a1a] dark:text-white animate-slideInLeft cursor-default flex flex-wrap gap-1">
            {"PointMap".split("").map((char, i) => (
              <span
                key={i}
                className="inline-block transition-all duration-300 hover:scale-125 hover:text-primary dark:hover:text-primary-dark hover:drop-shadow-lg hover:animate-bounce"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {char}
              </span>
            ))}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-primary/80 dark:text-primary-dark/80 my-4 font-heading animate-fadeInUp animation-delay-200 hover:text-primary dark:hover:text-primary-dark transition-all duration-300 hover:scale-105 cursor-pointer">
            Polnep Interactive Map
          </p>
          <p className="max-w-xl text-base sm:text-lg md:text-xl text-muted dark:text-muted-dark mb-8 animate-fadeInUp animation-delay-400 leading-relaxed hover:text-muted/80 dark:hover:text-muted-dark/80 transition-colors duration-300 cursor-pointer hover:underline hover:underline-offset-4">
            Navigasi digital untuk menjelajahi setiap sudut kampus Politeknik
            Negeri Pontianak. Temukan gedung, ruang kelas, dan fasilitas lainnya
            dengan mudah.
          </p>
          <button
            onClick={scrollToMap}
            className="group px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:bg-gradient-to-r hover:from-primary hover:to-accent dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-bounceIn animation-delay-600 relative overflow-hidden hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent/40"
            style={{ position: "relative" }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Jelajahi Peta
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12"
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
        <div className="flex-1 flex items-center justify-center relative h-[200px] sm:h-[250px] md:h-[350px] w-full animate-fadeInRight">
          <div className="relative h-full w-full max-w-2xl overflow-hidden rounded-3xl shadow-[0_16px_64px_0_rgba(30,41,59,0.35)] bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md z-20 -translate-y-4 md:-translate-y-8 transition-all duration-500 floating-anim">
            <Slider {...sliderSettings} className="w-full h-full">
              {sliderImages.map((image, index) => (
                <div
                  key={index}
                  className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                  style={{ minHeight: "200px" }}
                >
                  <img
                    src={image}
                    alt={`Background ${index + 1}`}
                    className="h-full w-auto object-cover transition-all duration-700 rounded-2xl shadow-xl hover:scale-105 hover:-translate-y-1 group-hover:scale-105 group-hover:-translate-y-1"
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
            <div className="absolute top-4 left-4 w-3 h-3 bg-white/30 rounded-full animate-pulse group-hover:bg-white/50 transition-colors duration-300"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-ping group-hover:bg-white/60 transition-colors duration-300"></div>
          </div>
        </div>
      </section>

      {/* MAP / CANVAS AREA */}
      <section
        ref={mapArea}
        className="w-full h-screen min-h-0 min-w-0 py-2 md:py-4 lg:py-6 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center overflow-hidden bg-primary/10 dark:bg-primary/20 border-none rounded-none shadow-none relative"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="w-full">
          <div className="bg-primary text-white text-lg md:text-xl font-bold text-left py-3 px-6 shadow rounded-t-2xl">
            Polnep Interactive Map
          </div>
        </div>
        <div
          className={`w-full h-[350px] md:h-[600px] relative bg-white rounded-b-2xl overflow-hidden transition-all duration-200 ${
            isAtBoundary ? "ring-2 ring-orange-400 ring-opacity-50" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <canvas
            ref={canvasRef}
            id="mapCanvas"
            className="w-full h-full bg-white"
            style={{
              cursor: isDragging
                ? isAtBoundary
                  ? "not-allowed"
                  : "grabbing"
                : isHovering
                ? "grab"
                : "default",
              borderBottomLeftRadius: "1rem",
              borderBottomRightRadius: "1rem",
              display: "block",
            }}
          />

          <div className="absolute left-8 top-8 z-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari lokasi..."
                className="pl-10 pr-4 py-2 rounded-lg bg-white text-dark shadow-lg w-64 border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="absolute right-8 bottom-8 z-50 flex flex-col gap-2">
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.2, 4))}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
              title="Zoom In"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.2, 1))}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
              title="Zoom Out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
              title="Reset View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark py-8 text-center px-4 transition-colors">
        <p className="font-bold text-xl">PointMap</p>
        <p className="text-sm text-accent dark:text-accent-dark/80">
          Polnep Interactive Map
        </p>
        <p className="text-xs mt-4">
          {isClient
            ? `© ${new Date().getFullYear()} Politeknik Negeri Pontianak. Hak Cipta Dilindungi.`
            : null}
        </p>
      </footer>
    </div>
  );
}
