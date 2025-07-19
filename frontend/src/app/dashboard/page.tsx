"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiSun,
  FiMoon,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import ParticlesCustom from "@/components/ParticlesCustom";
import { LeafletMapRef } from "@/components/LeafletMap";

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
  id_prodi?: number;
}

interface Jurusan {
  id_jurusan: number;
  nama_jurusan: string;
}

interface Prodi {
  id_prodi: number;
  id_jurusan: number;
  nama_prodi: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("bangunan");
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [highlightedItem, setHighlightedItem] = useState<any>(null);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<any>(null);

  // Ref untuk LeafletMap component
  const mapRef = useRef<LeafletMapRef | null>(null);
  // Ref untuk item yang terselect di sidebar
  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  // Data states
  const [bangunan, setBangunan] = useState<Bangunan[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);
  const [prodi, setProdi] = useState<Prodi[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    interaksi: "Noninteraktif",
    lantai: 1,
    geometri: "",
    nama_ruangan: "",
    nomor_lantai: 1,
    id_bangunan: 1,
    id_prodi: 1,
    nama_jurusan: "",
    nama_prodi: "",
    id_jurusan: 1,
  });

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setIsClient(true);
    setIsDark(theme === "dark");

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Load data
    fetchData();
  }, [theme, router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all data
      const [bangunanRes, ruanganRes, jurusanRes, prodiRes] = await Promise.all(
        [
          fetch("http://localhost:3001/api/bangunan", { headers }),
          fetch("http://localhost:3001/api/ruangan", { headers }),
          fetch("http://localhost:3001/api/jurusan", { headers }),
          fetch("http://localhost:3001/api/prodi", { headers }),
        ]
      );

      if (bangunanRes.ok) setBangunan(await bangunanRes.json());
      if (ruanganRes.ok) setRuangan(await ruanganRes.json());
      if (jurusanRes.ok) setJurusan(await jurusanRes.json());
      if (prodiRes.ok) setProdi(await prodiRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const toggleDark = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleEdit = (item: any, type: string) => {
    setIsEditing(true);
    setEditingItem({ ...item, type });
    setFormData({
      nama:
        item.nama ||
        item.nama_ruangan ||
        item.nama_jurusan ||
        item.nama_prodi ||
        "",
      interaksi: item.interaksi || "Noninteraktif",
      lantai: item.lantai || item.nomor_lantai || 1,
      geometri: item.geometri || "",
      nama_ruangan: item.nama_ruangan || "",
      nomor_lantai: item.nomor_lantai || 1,
      id_bangunan: item.id_bangunan || 1,
      id_prodi: item.id_prodi || 1,
      nama_jurusan: item.nama_jurusan || "",
      nama_prodi: item.nama_prodi || "",
      id_jurusan: item.id_jurusan || 1,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let url = "";
      let method = "POST";
      let data = {};

      switch (editingItem.type) {
        case "bangunan":
          url = "http://localhost:3001/api/bangunan";
          data = {
            nama: formData.nama,
            interaksi: formData.interaksi,
            lantai: formData.lantai,
            geometri: formData.geometri,
          };
          if (editingItem.id_bangunan) {
            url += `/${editingItem.id_bangunan}`;
            method = "PUT";
          }
          break;
        case "ruangan":
          url = "http://localhost:3001/api/ruangan";
          data = {
            nama_ruangan: formData.nama_ruangan,
            nomor_lantai: formData.nomor_lantai,
            id_bangunan: formData.id_bangunan,
            id_prodi: formData.id_prodi,
          };
          if (editingItem.id_ruangan) {
            url += `/${editingItem.id_ruangan}`;
            method = "PUT";
          }
          break;
        case "jurusan":
          url = "http://localhost:3001/api/jurusan";
          data = { nama_jurusan: formData.nama_jurusan };
          if (editingItem.id_jurusan) {
            url += `/${editingItem.id_jurusan}`;
            method = "PUT";
          }
          break;
        case "prodi":
          url = "http://localhost:3001/api/prodi";
          data = {
            nama_prodi: formData.nama_prodi,
            id_jurusan: formData.id_jurusan,
          };
          if (editingItem.id_prodi) {
            url += `/${editingItem.id_prodi}`;
            method = "PUT";
          }
          break;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        setIsEditing(false);
        setEditingItem(null);
        setFormData({
          nama: "",
          interaksi: "Noninteraktif",
          lantai: 1,
          geometri: "",
          nama_ruangan: "",
          nomor_lantai: 1,
          id_bangunan: 1,
          id_prodi: 1,
          nama_jurusan: "",
          nama_prodi: "",
          id_jurusan: 1,
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleDelete = async (id: number, type: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let url = "";
      switch (type) {
        case "bangunan":
          url = `http://localhost:3001/api/bangunan/${id}`;
          break;
        case "ruangan":
          url = `http://localhost:3001/api/ruangan/${id}`;
          break;
        case "jurusan":
          url = `http://localhost:3001/api/jurusan/${id}`;
          break;
        case "prodi":
          url = `http://localhost:3001/api/prodi/${id}`;
          break;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingItem({ type: activeTab });
    setFormData({
      nama: "",
      interaksi: "Noninteraktif",
      lantai: 1,
      geometri: "",
      nama_ruangan: "",
      nomor_lantai: 1,
      id_bangunan: 1,
      id_prodi: 1,
      nama_jurusan: "",
      nama_prodi: "",
      id_jurusan: 1,
    });
  };

  // Fungsi untuk highlight item di peta
  const handleHighlight = (item: any, type: string) => {
    console.log("handleHighlight called:", { item, type });
    setSelectedSidebarItem(item); // Update selected item di sidebar

    if (type === "bangunan") {
      // Untuk bangunan, set highlight dan kirim pesan ke peta
      setHighlightedItem({ ...item, type });

      // Kirim pesan ke LeafletMap untuk highlight
      if (mapRef.current) {
        console.log(
          "mapRef.current exists, calling highlightFeature for building"
        );
        mapRef.current.highlightFeature(type, item.id_bangunan, item.nama);
      } else {
        console.log("mapRef.current is null");
      }
    } else if (type === "ruangan") {
      // Untuk ruangan, kirim pesan ke peta untuk zoom ke bangunan dan highlight
      setHighlightedItem(null); // Clear highlight untuk ruangan

      // Kirim pesan ke LeafletMap untuk handle ruangan seperti pencarian
      if (mapRef.current) {
        console.log("mapRef.current exists, calling highlightFeature for room");
        mapRef.current.highlightFeature(
          type,
          item.id_ruangan,
          item.nama_ruangan
        );
      } else {
        console.log("mapRef.current is null");
      }
    }
  };

  // Clear highlight saat tab berubah (tapi tetap pertahankan selected item)
  useEffect(() => {
    setHighlightedItem(null);
    // Tidak clear selectedSidebarItem agar tetap bisa scroll ke item yang dipilih
  }, [activeTab]);

  // Effect untuk mengirim pesan highlight ke peta (hanya untuk bangunan)
  useEffect(() => {
    if (
      highlightedItem &&
      highlightedItem.type === "bangunan" &&
      mapRef.current
    ) {
      mapRef.current.highlightFeature(
        highlightedItem.type,
        highlightedItem.id_bangunan,
        highlightedItem.nama
      );
    }
  }, [highlightedItem]);

  // Effect untuk mendengarkan pesan klik bangunan dan ruangan dari peta
  useEffect(() => {
    const handleMapClick = (event: MessageEvent) => {
      console.log("Dashboard received message:", event.data);

      if (event.data.type === "building-clicked") {
        const { buildingId, buildingName } = event.data;
        console.log("Building clicked on map:", buildingId, buildingName);

        // Cari bangunan di data
        const clickedBuilding = bangunan.find(
          (b) => b.id_bangunan === buildingId
        );
        if (clickedBuilding) {
          // Update selected item di sidebar
          setSelectedSidebarItem(clickedBuilding);
          setActiveTab("bangunan"); // Pastikan tab bangunan aktif
          setShowSidebar(true); // Buka sidebar jika tertutup

          // Highlight item di sidebar
          setHighlightedItem({ ...clickedBuilding, type: "bangunan" });
        }
      } else if (event.data.type === "room-clicked") {
        const { roomId, roomName } = event.data;
        console.log("Room clicked on map:", roomId, roomName);
        console.log(
          "Available rooms in dashboard:",
          ruangan.map((r) => ({ id: r.id_ruangan, nama: r.nama_ruangan }))
        );

        // Cari ruangan di data
        const clickedRoom = ruangan.find((r) => r.id_ruangan === roomId);
        console.log("Found clicked room:", clickedRoom);
        if (clickedRoom) {
          // Update selected item di sidebar (tanpa highlight merah)
          setSelectedSidebarItem(clickedRoom);
          setActiveTab("ruangan"); // Pastikan tab ruangan aktif
          setShowSidebar(true); // Buka sidebar jika tertutup
          console.log("Updated sidebar for room:", clickedRoom.nama_ruangan);

          // Tidak set highlightedItem untuk ruangan (tidak ada highlight merah)
        } else {
          console.log("Room not found in data:", roomId);
        }
      }
    };

    window.addEventListener("message", handleMapClick);
    return () => window.removeEventListener("message", handleMapClick);
  }, [bangunan, ruangan]);

  // Effect untuk auto-scroll ke item yang terselect
  useEffect(() => {
    if (selectedSidebarItem && selectedItemRef.current) {
      // Tunggu sebentar agar DOM sudah ter-render
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 100);
    }
  }, [selectedSidebarItem]);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark
          ? "bg-background-dark"
          : "bg-gradient-to-tr from-background via-surface to-accent"
      } ${isDark ? "dark" : ""}`}
    >
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-surface-dark/90 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="h-12 select-none" />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDark}
            className="rounded-full p-2 hover:bg-primary/20 dark:hover:bg-primary-dark/20 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-primary-dark/40 transition-colors duration-200"
          >
            {theme === "dark" ? (
              <FiMoon className="w-5 h-5 text-accent-dark" />
            ) : (
              <FiSun className="w-5 h-5 text-primary" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold text-sm shadow-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="h-[calc(100vh-80px)] relative">
        {/* MAIN CONTENT - MAP */}
        <div className="w-full h-full relative">
          <div className="bg-primary text-white text-lg font-bold py-3 px-6 shadow">
            <span>PointMap Dashboard</span>
          </div>
          <div className="h-[calc(100%-60px)] bg-white rounded-b-lg overflow-hidden relative">
            <LeafletMap
              initialLat={-0.0545}
              initialLng={109.3465}
              initialZoom={18}
              className="w-full h-full"
              isDark={isDark}
              ref={mapRef}
            />

            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setShowSidebar(true)}
              className={`absolute z-[9000] p-3 rounded-lg border-2 shadow-xl transition-all duration-300 left-4 top-1/2 -translate-y-1/2
                ${
                  isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-600 shadow-gray-900/50"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300 shadow-gray-500/30"
                }
                ${
                  showSidebar
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100 pointer-events-auto"
                }
              `}
              title="Tampilkan Panel"
            >
              <svg
                className="w-5 h-5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* SIDEBAR - Inside Canvas */}
            <div
              className={`absolute top-0 left-0 h-full w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 z-[9999] ${
                showSidebar ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Header - Sticky */}
              <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4">
                {/* Tombol silang close sidebar */}
                {showSidebar && (
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-2xl focus:outline-none"
                    title="Tutup Panel"
                  >
                    <FiX />
                  </button>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Panel Admin
                </h2>

                {/* Tabs - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { key: "bangunan", label: "Bangunan", icon: "🏛️" },
                    { key: "ruangan", label: "Ruangan", icon: "🏢" },
                    { key: "jurusan", label: "Jurusan", icon: "🎓" },
                    { key: "prodi", label: "Prodi", icon: "📚" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border ${
                        activeTab === tab.key
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Add New Button */}
                <button
                  onClick={handleAddNew}
                  className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Tambah{" "}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>

              {/* Data List - Scrollable */}
              <div className="h-[calc(100%-180px)] overflow-y-auto p-4">
                <div className="space-y-3">
                  {activeTab === "bangunan" &&
                    bangunan.map((item) => (
                      <div
                        key={item.id_bangunan}
                        ref={
                          selectedSidebarItem?.id_bangunan === item.id_bangunan
                            ? selectedItemRef
                            : null
                        }
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border shadow-sm ${
                          selectedSidebarItem?.id_bangunan === item.id_bangunan
                            ? "bg-green-50 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400 shadow-md"
                            : highlightedItem?.id_bangunan ===
                                item.id_bangunan &&
                              highlightedItem?.type === "bangunan"
                            ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400 shadow-md"
                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md"
                        }`}
                        onClick={() => handleHighlight(item, "bangunan")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.nama || "Unnamed"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {item.interaksi} • Lantai {item.lantai}
                            </p>
                          </div>
                          <div
                            className="flex gap-1 ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleEdit(item, "bangunan")}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(item.id_bangunan, "bangunan")
                              }
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {activeTab === "ruangan" &&
                    ruangan.map((item) => (
                      <div
                        key={item.id_ruangan}
                        ref={
                          selectedSidebarItem?.id_ruangan === item.id_ruangan
                            ? selectedItemRef
                            : null
                        }
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border shadow-sm ${
                          selectedSidebarItem?.id_ruangan === item.id_ruangan
                            ? "bg-green-50 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400 shadow-md"
                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md"
                        }`}
                        onClick={() => handleHighlight(item, "ruangan")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.nama_ruangan}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Lantai {item.nomor_lantai} • Bangunan ID:{" "}
                              {item.id_bangunan}
                            </p>
                          </div>
                          <div
                            className="flex gap-1 ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleEdit(item, "ruangan")}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(item.id_ruangan, "ruangan")
                              }
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {activeTab === "jurusan" &&
                    jurusan.map((item) => (
                      <div
                        key={item.id_jurusan}
                        className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.nama_jurusan}
                            </h3>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(item, "jurusan")}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(item.id_jurusan, "jurusan")
                              }
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {activeTab === "prodi" &&
                    prodi.map((item) => (
                      <div
                        key={item.id_prodi}
                        className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.nama_prodi}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Jurusan ID: {item.id_jurusan}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(item, "prodi")}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(item.id_prodi, "prodi")
                              }
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingItem?.id_bangunan ||
                editingItem?.id_ruangan ||
                editingItem?.id_jurusan ||
                editingItem?.id_prodi
                  ? "Edit"
                  : "Tambah"}{" "}
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === "bangunan" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Bangunan
                    </label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interaksi
                    </label>
                    <select
                      value={formData.interaksi}
                      onChange={(e) =>
                        setFormData({ ...formData, interaksi: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Interaktif">Interaktif</option>
                      <option value="Noninteraktif">Noninteraktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jumlah Lantai
                    </label>
                    <input
                      type="number"
                      value={formData.lantai}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lantai: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Geometri (GeoJSON)
                    </label>
                    <textarea
                      value={formData.geometri}
                      onChange={(e) =>
                        setFormData({ ...formData, geometri: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder='{"type":"Polygon","coordinates":[...]}'
                    />
                  </div>
                </>
              )}

              {activeTab === "ruangan" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Ruangan
                    </label>
                    <input
                      type="text"
                      value={formData.nama_ruangan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nama_ruangan: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nomor Lantai
                    </label>
                    <input
                      type="number"
                      value={formData.nomor_lantai}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nomor_lantai: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bangunan
                    </label>
                    <select
                      value={formData.id_bangunan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_bangunan: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {bangunan.map((b) => (
                        <option key={b.id_bangunan} value={b.id_bangunan}>
                          {b.nama || `Bangunan ${b.id_bangunan}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Program Studi
                    </label>
                    <select
                      value={formData.id_prodi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_prodi: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Pilih Prodi</option>
                      {prodi.map((p) => (
                        <option key={p.id_prodi} value={p.id_prodi}>
                          {p.nama_prodi}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "jurusan" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Jurusan
                  </label>
                  <input
                    type="text"
                    value={formData.nama_jurusan}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_jurusan: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === "prodi" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Program Studi
                    </label>
                    <input
                      type="text"
                      value={formData.nama_prodi}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_prodi: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jurusan
                    </label>
                    <select
                      value={formData.id_jurusan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_jurusan: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {jurusan.map((j) => (
                        <option key={j.id_jurusan} value={j.id_jurusan}>
                          {j.nama_jurusan}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Simpan
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
