"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSun, FiMoon, FiChevronDown } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "next-themes";

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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Konfigurasi slider
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
  };

  const backgroundImages = [
    "/Slider/Background1.jpg",
    "/Slider/Background2.jpg",
    "/Slider/Background3.jpg",
    "/Slider/Background4.jpg",
  ];

  // State untuk search bar
  const [searchText, setSearchText] = useState("");

  const { theme, setTheme } = useTheme();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
    for (const key of apiKeys) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Pontianak,id&appid=${key}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.main && typeof data.main.temp === "number") {
          temp = Math.round(data.main.temp) + "°C";
          break;
        }
      } catch (e) {
        /* next key */
      }
    }
    setCuaca(temp || "N/A");
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

  // Ganti toggleDark agar hanya update localStorage dan reload halaman
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

    // Load SVG image
    const img = new Image();
    img.src = "/maps.svg";
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error("Error loading image:", e);
    };

    // Set canvas size
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

  // Render ulang canvas setelah gambar selesai di-load
  useEffect(() => {
    if (isImageLoaded) drawImage();
  }, [isImageLoaded, position, scale]);

  // Draw image function
  const drawImage = () => {
    if (!ctx || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Calculate center position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Move to center and apply transformations
    ctx.translate(position.x + centerX, position.y + centerY);
    ctx.scale(scale, scale);

    // Calculate image dimensions to fill canvas
    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas
      drawHeight = canvas.width / imgAspectRatio;
    } else {
      // Image is taller than canvas
      drawWidth = canvas.height * imgAspectRatio;
    }

    // Draw image centered
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Restore context state
    ctx.restore();
  };

  // Update drawing when position or scale changes
  useEffect(() => {
    drawImage();
  }, [position, scale]);

  // Prevent scroll saat di area canvas
  useEffect(() => {
    const preventDefault = (e: WheelEvent) => {
      if (!isHovering) return;

      e.preventDefault();
      e.stopPropagation();

      // Handle zoom
      const zoomIntensity = 0.05; // Diperlambat dari 0.1 menjadi 0.05
      const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
      const newScale = Math.min(Math.max(0.5, scale + delta), 4);

      // Get mouse position relative to canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // Calculate mouse position relative to canvas center
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate offset from center
      const mouseOffsetX = mouseX - centerX;
      const mouseOffsetY = mouseY - centerY;

      // Calculate new position to zoom towards mouse
      const scaleChange = newScale - scale;
      const newPosition = {
        x: position.x - (mouseOffsetX * scaleChange) / scale,
        y: position.y - (mouseOffsetY * scaleChange) / scale,
      };

      setPosition(newPosition);
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

  // Handle mouse events
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };

  // Handle mouse down untuk memulai drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // Jika klik pada input, jangan drag
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

  // Handle mouse move untuk drag
  const handleMouseMove = (e: React.MouseEvent) => {
    // Jika drag dan mouse di input, abaikan
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (!isDragging || !isHovering) return;
    e.preventDefault();
    e.stopPropagation();
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  // Handle mouse up untuk mengakhiri drag
  const handleMouseUp = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (!isHovering) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  useEffect(() => {
    fetchCuaca();
    getTanggal();

    // Event listener untuk scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // Hanya sembunyikan navbar jika sudah di-scroll ke bawah
      if (scrollY > 100) {
        setShowNavbar(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
          setShowNavbar(false);
        }, 3000); // 3 detik
      } else {
        // Jika di atas, selalu tampilkan navbar
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
        className={`flex items-center justify-between px-10 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 dark:bg-surface-dark/90 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        } ${
          showNavbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Logo kiri */}
        <div className="flex items-center gap-3">
          <div className="w-auto h-16">
            <img src="/logo.svg" alt="Logo" className="w-full h-full" />
          </div>
        </div>
        {/* Tengah: Menu navigasi */}
        <ul className="hidden md:flex items-center gap-6 text-base font-bold tracking-wide text-[#1a1a1a] dark:text-white">
          <li>
            <a
              href="#"
              className="hover:text-primary dark:hover:text-primary-dark transition"
            >
              Beranda
            </a>
          </li>
          <li>
            <a
              href="#map"
              onClick={(e) => {
                e.preventDefault();
                scrollToMap();
              }}
              className="hover:text-primary dark:hover:text-primary-dark transition"
            >
              Peta
            </a>
          </li>
          <li>
            <a
              href="#fasilitas"
              className="hover:text-primary dark:hover:text-primary-dark transition"
            >
              Fasilitas
            </a>
          </li>
          <li>
            <a
              href="#kontak"
              className="hover:text-primary dark:hover:text-primary-dark transition"
            >
              Kontak
            </a>
          </li>
        </ul>
        {/* Kanan: Cuaca, hari, dark mode, login */}
        {isClient ? (
          <div className="flex items-center gap-3 text-muted dark:text-muted-dark text-sm font-semibold">
            {cuaca && hari && tanggal && (
              <>
                <span>{cuaca}&nbsp;|</span>
                <span>
                  {hari}, {tanggal}
                </span>
              </>
            )}
            <button
              onClick={toggleDark}
              className="rounded-full p-2 hover:bg-primary/20 dark:hover:bg-primary-dark/20 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-primary-dark/40 transition"
            >
              {theme === "dark" ? (
                <FiMoon className="w-6 h-6 text-accent-dark" />
              ) : (
                <FiSun className="w-6 h-6 text-primary" />
              )}
            </button>
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-md bg-primary text-white font-semibold text-sm shadow hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary/80 transition-colors duration-150"
            >
              Login
            </Link>
          </div>
        ) : (
          <div style={{ width: 180, height: 32 }} />
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center justify-between min-h-screen w-full pt-24 md:pt-32 pb-0 px-4 md:px-16 overflow-hidden">
        {/* Kiri: Text */}
        <div className="flex-1 z-10 flex flex-col items-start justify-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-[#1a1a1a] dark:text-white">
            PointMap
          </h1>
          <p className="text-xl md:text-2xl text-primary/80 dark:text-primary-dark/80 my-4 font-heading">
            Polnep Interactive Map
          </p>
          <p className="max-w-xl text-lg md:text-xl text-muted dark:text-muted-dark mb-8">
            Navigasi digital untuk menjelajahi setiap sudut kampus Politeknik
            Negeri Pontianak. Temukan gedung, ruang kelas, dan fasilitas lainnya
            dengan mudah.
          </p>
        </div>
        {/* Kanan: 3D Illustration Placeholder */}
        <div className="flex-1 flex items-center justify-center relative h-[400px] md:h-[500px]">
          {/* Nanti masukkan 3D illustration di sini */}
          <div className="absolute inset-0 right-[-10vw] md:right-[-5vw] w-[120%] h-full bg-gradient-to-br from-[#2563eb] via-[#3a86ff] to-[#1d3557] rounded-l-full z-0" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {/* Tempatkan 3D illustration di sini */}
          </div>
        </div>
      </section>

      {/* MAP / CANVAS AREA */}
      <section
        ref={mapArea}
        className="w-full h-screen min-h-0 min-w-0 py-2 md:py-4 lg:py-6 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center overflow-hidden bg-primary/10 dark:bg-primary/20 border-none rounded-none shadow-none relative"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Judul di atas canvas */}
        <div className="w-full">
          <div className="bg-primary text-white text-lg md:text-xl font-bold text-left py-3 px-6 shadow rounded-t-2xl">
            Polnep Interactive Map
          </div>
        </div>
        {/* Canvas Container */}
        <div
          className="w-full h-[350px] md:h-[600px] relative bg-white rounded-b-2xl overflow-hidden"
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
              cursor: isDragging ? "grabbing" : isHovering ? "grab" : "default",
              borderBottomLeftRadius: "1rem",
              borderBottomRightRadius: "1rem",
              display: "block",
            }}
          />

          {/* Search Bar - Moved to top left */}
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

          {/* Zoom Controls */}
          <div className="absolute right-8 bottom-8 z-50 flex flex-col gap-2">
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.2, 4))}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
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
              onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
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
