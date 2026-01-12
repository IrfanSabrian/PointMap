"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBuilding,
  FaDoorOpen,
  FaLayerGroup,
  FaImages,
  FaPlus,
  FaMapMarkedAlt,
  FaChartBar,
} from "react-icons/fa";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    bangunan: 0,
    ruangan: 0,
    lantai: 0,
    gallery: 0,
  });

  const [recentBuildings, setRecentBuildings] = useState<any[]>([]);
  const [topBuildings, setTopBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  const paginatedBuildings = recentBuildings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Fetch Stats and Data for Widgets
  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiUrl) return;

      // 1. Fetch General Stats
      const resStats = await fetch(`${apiUrl}/`);
      const dataStats = await resStats.json();
      if (dataStats.status === "API aktif & koneksi DB OK") {
        setStats({
          bangunan: dataStats.jumlah_bangunan,
          ruangan: dataStats.jumlah_ruangan,
          lantai: dataStats.jumlah_lantai_gambar,
          gallery: dataStats.jumlah_ruangan_gallery,
        });
      }

      // 2. Fetch Buildings for "Recent" and "Top" widgets
      // Note: Assuming /api/bangunan returns all buildings.
      // In a real large app, you'd want specific endpoints (e.g., /api/bangunan?limit=5&sort=desc)
      const resBuildings = await fetch(`${apiUrl}/api/bangunan`);
      if (resBuildings.ok) {
        const buildings = await resBuildings.json();

        // Sorting for Recent (assuming higher ID = newer)
        const sorted = [...buildings].sort(
          (a: any, b: any) => b.id_bangunan - a.id_bangunan
        );
        // Store ALL buildings for pagination
        setRecentBuildings(sorted);

        // Sorting for "Most Interactive" or just random for display
        setTopBuildings(buildings.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const quickActions = [
    {
      title: "Tambah Gedung",
      desc: "Gambar poligon baru",
      icon: FaBuilding,
      href: "/dashboard/bangunan/tambah",
      color: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Tambah Ruangan",
      desc: "Pin lokasi ruangan",
      icon: FaDoorOpen,
      href: "/dashboard/ruangan/tambah",
      color: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Upload Galeri",
      desc: "Foto interior ruangan",
      icon: FaImages,
      href: "/dashboard/ruangan",
      color: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Lihat Peta",
      desc: "Preview tampilan user",
      icon: FaMapMarkedAlt,
      href: "/", // Assuming clean redirect or open new tab?
      color: "bg-purple-50",
      textColor: "text-purple-600",
      external: true,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in-up pb-4 h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
      {/* Header Section - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Selamat datang kembali,{" "}
            <span className="font-semibold text-blue-600">
              {(() => {
                if (typeof window === "undefined") return "Admin";
                try {
                  const token = localStorage.getItem("token");
                  if (!token) return "Admin";
                  const payload = JSON.parse(atob(token.split(".")[1]));
                  return (
                    payload.username || payload.nama || payload.email || "Admin"
                  );
                } catch {
                  return "Admin";
                }
              })()}
            </span>
            ! Inilah ringkasan sistem Anda hari ini.
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          Last Updated:{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        {statItems.map((item, index) => (
          <div
            key={item.label}
            className="group bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">
                  {item.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {isLoading ? "..." : item.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Main Content: Recent Buildings - Informational Only */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaBuilding className="text-blue-500" /> Gedung Terbaru
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                >
                  ←
                </button>
                <span className="text-xs self-center px-1">
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
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                >
                  →
                </button>
              </div>
              <Link
                href="/dashboard/bangunan"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline ml-2"
              >
                Lihat Semua
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : paginatedBuildings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedBuildings.map((b) => (
                  <div
                    key={b.id_bangunan}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all group flex gap-3 items-start"
                  >
                    {/* Thumbnail */}
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
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              b.nama
                            )}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800">
                          <FaBuilding className="text-xl opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Info Content */}
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
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                            <FaLayerGroup className="text-blue-500" />
                            <span>{b.lantai ? `${b.lantai} Lt` : "-"}</span>
                          </div>

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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-3">
                  <FaBuilding className="text-xl text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Belum ada data gedung
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions & Chart */}
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group text-center"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${action.color} ${action.textColor} flex items-center justify-center text-sm shadow-sm`}
                  >
                    <action.icon />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white text-xs group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Real Statistics Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <FaChartBar className="text-purple-500" /> Statistik Sistem
            </h3>
            <div className="space-y-4 flex-1">
              {/* Interactive Buildings Stats */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                  <span>Gedung Interaktif</span>
                  <span>
                    {recentBuildings.length > 0
                      ? Math.round(
                          (recentBuildings.filter(
                            (b) => b.interaksi === "Interaktif"
                          ).length /
                            recentBuildings.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
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
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {
                    recentBuildings.filter((b) => b.interaksi === "Interaktif")
                      .length
                  }{" "}
                  dari {recentBuildings.length} gedung aktif
                </p>
              </div>

              {/* Floor Plan Completeness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                  <span>Kelengkapan Denah</span>
                  <span>
                    {(() => {
                      const totalFloors = recentBuildings.reduce(
                        (sum, b) => sum + (parseInt(b.lantai) || 0),
                        0
                      );
                      if (totalFloors === 0) return 0;
                      return Math.round((stats.lantai / totalFloors) * 100);
                    })()}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(() => {
                        const totalFloors = recentBuildings.reduce(
                          (sum, b) => sum + (parseInt(b.lantai) || 0),
                          0
                        );
                        if (totalFloors === 0) return 0;
                        return Math.min(
                          100,
                          (stats.lantai / totalFloors) * 100
                        );
                      })()}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {stats.lantai} denah terupload dari estimasi{" "}
                  {recentBuildings.reduce(
                    (sum, b) => sum + (parseInt(b.lantai) || 0),
                    0
                  )}{" "}
                  lantai
                </p>
              </div>

              {/* Room Density */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                  <span>Rata-rata Ruangan/Gedung</span>
                  <span>
                    {recentBuildings.length > 0
                      ? (stats.ruangan / recentBuildings.length).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        100,
                        (stats.ruangan / (recentBuildings.length * 10 || 1)) *
                          100
                      )}%`, // Assume avg 10 rooms map to 100%
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 bg-white/20 p-1 rounded-full">
                    <FaChartBar className="text-[10px]" />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-90 font-semibold mb-0.5 uppercase tracking-wide">
                      Insight Sistem
                    </p>
                    <p className="text-xs font-medium leading-relaxed">
                      {stats.bangunan === 0
                        ? "Sistem masih kosong. Mulai dengan menambahkan gedung baru!"
                        : stats.ruangan < stats.bangunan
                        ? "Perbanyak data ruangan untuk memaksimalkan fitur pencarian."
                        : "Sistem berjalan baik. Terus lengkapi galeri ruangan Anda!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
