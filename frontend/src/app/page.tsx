"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSun, FiMoon, FiChevronDown } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cuaca, setCuaca] = useState<string | null>(null);
  const [hari, setHari] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [statistik, setStatistik] = useState({ today: 0, month: 0 });
  const [onlineNow, setOnlineNow] = useState(5);
  const mapArea = useRef<HTMLDivElement>(null);

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
    "/Background1.jpg",
    "/Background2.jpg",
    "/Background3.jpg",
    "/Background4.jpg",
  ];

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

  const fetchStatistik = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/log/statistik");
      const data = await res.json();
      setStatistik({
        today: data.today || 0,
        month: data.month || 0,
      });
    } catch {
      setStatistik({ today: 0, month: 0 });
    }
    setOnlineNow(Math.floor(3 + Math.random() * 6));
  };

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  const scrollToMap = () => {
    mapArea.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchCuaca();
    getTanggal();
    fetchStatistik();

    // Event listener untuk scroll
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-tr from-accent via-white to-toscaLight dark:from-dark dark:via-dark dark:to-primary transition-colors ${
        isDark ? "dark" : ""
      }`}
    >
      {/* NAVBAR */}
      <nav
        className={`flex items-center justify-between px-10 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-dark/90 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-auto h-16">
            <img src="/logo.svg" alt="Logo" className="w-full h-full" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-dark dark:text-accent/90 text-sm font-semibold">
          {cuaca !== null && <span>{cuaca}&nbsp;|</span>}
          <span>
            {hari}, {tanggal}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="rounded-full p-2 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          >
            {!isDark ? (
              <FiSun className="w-6 h-6 text-dark" />
            ) : (
              <FiMoon className="w-6 h-6 text-accent" />
            )}
          </button>
          <Link
            href="/login"
            className="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-dark shadow transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <Slider {...sliderSettings} className="h-full">
            {backgroundImages.map((image, index) => (
              <div key={index} className="relative h-screen">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-white drop-shadow-md font-heading">
            Selamat Datang di
          </p>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white my-2 drop-shadow-lg font-heading">
            PointMap Polnep
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-8 drop-shadow">
            Temukan kampus Politeknik Negeri Pontianak secara interaktif!
            Jelajahi gedung, lab, dan fasilitas favoritmu lewat peta digital
            yang mudah dan selalu update.
          </p>

          {/* BUTTON SCROLL */}
          <button
            onClick={scrollToMap}
            className="bg-accent text-white px-8 py-3 rounded-xl text-lg font-extrabold shadow-lg hover:bg-accent/90 border-b-4 border-primary transition"
          >
            Jelajahi Peta
          </button>
        </div>
      </section>

      {/* MAP / CANVAS AREA */}
      <section
        ref={mapArea}
        className="mt-10 max-w-3xl mx-auto w-full min-h-[340px] flex flex-col items-center justify-center bg-white/70 rounded-2xl shadow-xl border-2 border-accent dark:bg-dark/70"
      >
        <div className="py-14 text-xl text-primary dark:text-tosca font-semibold text-center">
          Pilih lokasi pada peta untuk info detail
          <br />
          <span className="text-xs font-normal text-dark/60 dark:text-accent/70">
            *Map interaktif akan segera tersedia
          </span>
        </div>
      </section>
    </div>
  );
}
