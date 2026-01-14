"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBuilding,
  FaDoorOpen,
  FaLayerGroup,
  FaImages,
  FaChartBar,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { useCampus } from "@/hooks/useCampus";

export default function DashboardStats() {
  const { selectedCampus } = useCampus();
  const [stats, setStats] = useState({
    bangunan: 0,
    ruangan: 0,
    lantai: 0,
    gallery: 0,
  });

  const [recentBuildings, setRecentBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 4; // Display 4 items per page as requested

  const paginatedBuildings = recentBuildings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Fetch Stats and Data for Widgets
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiUrl) return;

      // 1. Fetch Buildings (Filtered by Campus)
      const campusQuery = selectedCampus?.name
        ? `?kampus=${encodeURIComponent(selectedCampus.name)}`
        : "";
      const resBuildings = await fetch(`${apiUrl}/api/bangunan${campusQuery}`);

      let localBuildingCount = 0;
      let localFloorCount = 0;
      let buildingIds: number[] = [];

      if (resBuildings.ok) {
        const buildings = await resBuildings.json();
        const sorted = [...buildings].sort(
          (a: any, b: any) => b.id_bangunan - a.id_bangunan
        );
        setRecentBuildings(sorted);

        localBuildingCount = buildings.length;
        localFloorCount = buildings.reduce(
          (sum: number, b: any) => sum + (parseInt(b.lantai) || 0),
          0
        );
        buildingIds = buildings.map((b: any) => b.id_bangunan);
      }

      // 2. Fetch All Rooms and Gallery to manually filter
      const resRuangan = await fetch(`${apiUrl}/api/ruangan`);
      const resGallery = await fetch(`${apiUrl}/api/ruangan-gallery`);

      let localRoomCount = 0;
      let roomIds: number[] = [];

      if (resRuangan.ok) {
        const allRooms = await resRuangan.json();
        // Filter rooms where id_bangunan is in the current campus's building list
        const campusRooms = allRooms.filter((r: any) =>
          buildingIds.includes(r.id_bangunan)
        );
        localRoomCount = campusRooms.length;
        roomIds = campusRooms.map((r: any) => r.id_ruangan);
      }

      let localGalleryCount = 0;
      if (resGallery.ok) {
        const allGallery = await resGallery.json();
        // Filter gallery items where id_ruangan is in the current campus's room list
        const campusGallery = allGallery.filter((g: any) =>
          roomIds.includes(g.id_ruangan)
        );
        localGalleryCount = campusGallery.length;
      }

      setStats({
        bangunan: localBuildingCount,
        ruangan: localRoomCount,
        lantai: localFloorCount,
        gallery: localGalleryCount,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampus]);

  const statItems = [
    {
      label: "Total Gedung",
      value: stats.bangunan,
      icon: FaBuilding,
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30",
    },
    {
      label: "Total Ruangan",
      value: stats.ruangan,
      icon: FaDoorOpen,
      color: "from-green-500 to-green-600",
      shadow: "shadow-green-500/30",
    },
    {
      label: "Total Lantai",
      value: stats.lantai,
      icon: FaLayerGroup,
      color: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/30",
    },
    {
      label: "Total Galeri",
      value: stats.gallery,
      icon: FaImages,
      color: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-500/30",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Section */}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {getGreeting()},{" "}
            <span className="font-semibold text-blue-600">
              {(() => {
                if (typeof window === "undefined") return "Admin";
                try {
                  const token = localStorage.getItem("token");
                  if (!token) return "Admin";
                  const payload = JSON.parse(atob(token.split(".")[1]));
                  return payload.username || payload.nama || "Admin";
                } catch {
                  return "Admin";
                }
              })()}
            </span>
            ! Berikut adalah ringkasan data terkini untuk kampus{" "}
            <span className="text-blue-600 font-semibold">
              {selectedCampus.name}
            </span>
            .
          </p>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {item.value}
                </h3>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg ${item.shadow}`}
                >
                  <item.icon />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main List: Daftar Gedung (Replaced Card View with Table View) */}
        <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaBuilding className="text-blue-500" /> Daftar Gedung (
              {selectedCampus.shortName})
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-0.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-300"
                >
                  ←
                </button>
                <span className="px-3 flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 border-x border-gray-100 dark:border-gray-600">
                  {page} /{" "}
                  {Math.max(
                    1,
                    Math.ceil(recentBuildings.length / itemsPerPage)
                  )}
                </span>
                <button
                  disabled={
                    page >= Math.ceil(recentBuildings.length / itemsPerPage)
                  }
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        Math.ceil(recentBuildings.length / itemsPerPage),
                        p + 1
                      )
                    )
                  }
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-300"
                >
                  →
                </button>
              </div>
              <Link
                href="/dashboard/bangunan"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
                  />
                ))
              ) : paginatedBuildings.length > 0 ? (
                paginatedBuildings.map((b) => (
                  <div
                    key={b.id_bangunan}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all group flex gap-3 items-start"
                  >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm border border-gray-100 dark:border-gray-600">
                      {b.thumbnail ? (
                        <img
                          src={
                            b.thumbnail.startsWith("http")
                              ? b.thumbnail
                              : b.thumbnail.startsWith("/img") ||
                                b.thumbnail.startsWith("img") ||
                                b.thumbnail.startsWith("/building-details") ||
                                b.thumbnail.startsWith("building-details")
                              ? b.thumbnail
                              : `${
                                  process.env.NEXT_PUBLIC_API_BASE_URL
                                }/${b.thumbnail.replace(/^\//, "")}`
                          }
                          alt={b.nama}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800">
                          <FaBuilding className="text-xl opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3
                            className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1"
                            title={b.nama}
                          >
                            {b.nama}
                          </h3>
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[9px] font-mono border border-gray-200 dark:border-gray-600 flex-shrink-0">
                            #{b.id_bangunan}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                          {/* Floors Badge */}
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                            <FaLayerGroup className="text-blue-500" />
                            <span>{b.lantai} Lt</span>
                          </div>
                          {/* Active Status Badge */}
                          <div
                            className={`flex items-center gap-1.5 text-[10px] px-1.5 py-0.5 rounded border ${
                              b.interaksi === "Interaktif"
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.interaksi === "Interaktif"
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-gray-400"
                              }`}
                            />
                            <span>
                              {b.interaksi === "Interaktif"
                                ? "Aktif"
                                : "Non-aktif"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Link
                          href={`/dashboard/bangunan?edit=${b.id_bangunan}`}
                          className="text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Edit Gedung →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Tidak ada data gedung untuk kampus ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Analytics Cards */}
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          {/* Card 1: Digitalisasi Kampus */}
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 overflow-hidden shadow-lg flex-shrink-0">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  {
                    recentBuildings.filter((b) => b.interaksi === "Interaktif")
                      .length
                  }
                  /{recentBuildings.length}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white/80 mb-1">
                Digitalisasi Kampus
              </h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-bold text-white">
                  {recentBuildings.length > 0
                    ? Math.round(
                        (recentBuildings.filter(
                          (b) => b.interaksi === "Interaktif"
                        ).length /
                          recentBuildings.length) *
                          100
                      )
                    : 0}
                </span>
                <span className="text-lg font-semibold text-white/90 mb-1">
                  %
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                <div
                  className="bg-white h-full rounded-full transition-all duration-1000 shadow-lg"
                  style={{
                    width: `${
                      recentBuildings.length > 0
                        ? (recentBuildings.filter(
                            (b) => b.interaksi === "Interaktif"
                          ).length /
                            recentBuildings.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-[9px] text-white/70 mt-2 leading-tight">
                Gedung dengan data interaktif aktif
              </p>
            </div>
          </div>

          {/* Card 2: Visualisasi Gedung */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-pink-100 dark:border-pink-900/30 shadow-sm flex-shrink-0">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Visualisasi Gedung
            </h4>
            <div className="flex items-center gap-4">
              {/* Circular Progress */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      32 *
                      (1 -
                        (recentBuildings.length > 0
                          ? recentBuildings.filter((b) => b.thumbnail).length /
                            recentBuildings.length
                          : 0))
                    }`}
                    className="text-pink-500 dark:text-pink-400 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                    {recentBuildings.length > 0
                      ? Math.round(
                          (recentBuildings.filter((b) => b.thumbnail).length /
                            recentBuildings.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Dengan Foto
                    </span>
                    <span className="font-bold text-pink-600 dark:text-pink-400">
                      {recentBuildings.filter((b) => b.thumbnail).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tanpa Foto
                    </span>
                    <span className="font-bold text-gray-500 dark:text-gray-400">
                      {recentBuildings.length -
                        recentBuildings.filter((b) => b.thumbnail).length}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-tight">
                    Gedung dengan thumbnail visual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
