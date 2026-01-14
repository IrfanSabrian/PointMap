"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/dashboard/Modal";
import RuanganForm from "@/components/dashboard/RuanganForm";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaList,
  FaThLarge,
  FaImages,
  FaTimes, // Added for Modal close
  FaSave,
} from "react-icons/fa";
import { useCampus } from "@/hooks/useCampus";
import { useToast } from "@/components/ToastProvider";

// Interface for Pagination
function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Previous
      </button>
      <span className="flex items-center px-4 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Next
      </button>
    </div>
  );
}

// Modal for Gallery Management
function RoomGalleryModal({
  roomId,
  roomName,
  onClose,
}: {
  roomId: number;
  roomName: string;
  onClose: () => void;
}) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pending Upload State
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan-gallery`
      );
      if (res.ok) {
        const data = await res.json();
        const roomImages = data.filter((img: any) => img.id_ruangan === roomId);
        setImages(roomImages);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // Reset pending on room change
    setPendingFiles([]);
    setPendingPreviews([]);
  }, [roomId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setPendingFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPendingPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      // Reset input value so same file can be selected again if needed (though we append)
      e.target.value = "";
    }
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("ruanganId", roomId.toString());

    pendingFiles.forEach((file) => {
      formData.append("gallery", file);
    });

    try {
      const token = localStorage.getItem("token");
      // Use the correct endpoint for batch upload
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan-gallery/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        showToast("Foto berhasil diupload", "success");
        setPendingFiles([]);
        setPendingPreviews([]);
        fetchImages(); // Refresh list
      } else {
        const err = await res.json();
        showToast(
          `Gagal upload: ${
            err.error ||
            err.message ||
            err.details ||
            "Kesalahan tidak diketahui"
          }`,
          "error"
        );
        console.error("Upload error details:", err);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Terjadi kesalahan saat upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan-gallery/${deleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setImages(images.filter((img) => img.id_gallery !== deleteId));
        setDeleteId(null);
        showToast("Foto berhasil dihapus", "success");
      } else {
        showToast("Gagal menghapus foto", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menghapus", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl relative z-10 animate-scale-in transform transition-all">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Galeri Ruangan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {roomName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
          {/* Section: Existing Images */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Foto Tersimpan
            </h4>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
                <p className="text-gray-500 animate-pulse">Memuat foto...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                <p className="text-sm">Belum ada foto tersimpan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id_gallery}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${
                        img.path_file.startsWith("/") ? "" : "/"
                      }${img.path_file}`}
                      alt="Gallery"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        onClick={() =>
                          window.open(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${
                              img.path_file.startsWith("/") ? "" : "/"
                            }${img.path_file}`,
                            "_blank"
                          )
                        }
                        className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 backdrop-blur-sm transition-all transform hover:scale-110"
                        title="Lihat"
                      >
                        <FaImages />
                      </button>
                      <button
                        onClick={() => setDeleteId(img.id_gallery)}
                        className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 backdrop-blur-sm transition-all transform hover:scale-110"
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Pending Uploads */}
          {pendingFiles.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Siap Diupload ({pendingFiles.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {pendingPreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 shadow-md"
                  >
                    <img
                      src={src}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePending(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Upload Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl flex flex-col sm:flex-row gap-4">
          <label
            className={`flex-1 flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              uploading
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900/50 dark:hover:border-gray-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FaPlus className="text-gray-500 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Tambah Foto
                </p>
                <p className="text-xs text-gray-500">Klik atau Drag & Drop</p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>

          {/* Save Button */}
          {pendingFiles.length > 0 && (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex-none px-8 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div>
                  <span>Mengupload...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Simpan {pendingFiles.length} Foto</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Nested Delete Confirmation for Image */}
        {deleteId && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setDeleteId(null)}
            ></div>
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl p-6 max-w-xs w-full shadow-2xl flex flex-col items-center text-center animate-scale-in">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3 text-red-600">
                <FaTrash />
              </div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Hapus Foto?
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RuanganPage() {
  const [ruangan, setRuangan] = useState<any[]>([]);
  const [filteredRuangan, setFilteredRuangan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bangunanList, setBangunanList] = useState<any[]>([]);
  const [selectedBangunan, setSelectedBangunan] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [lantaiGambar, setLantaiGambar] = useState<any[]>([]); // State untuk menyimpan gambar lantai
  const { selectedCampus } = useCampus();
  const { showToast } = useToast();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "add" | "edit";
    data?: any;
  }>({ isOpen: false, type: "add" });

  const handleOpenAdd = () => {
    setModalState({ isOpen: true, type: "add", data: null });
  };

  const handleOpenEdit = (data: any) => {
    setModalState({ isOpen: true, type: "edit", data });
  };

  const handleCloseModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleSuccess = () => {
    // Refresh data
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan`
      );
      if (res.ok) {
        const data = await res.json();
        const bangunanIds = bangunanList.map((b) => b.id_bangunan);
        const filteredData = data.filter((r: any) =>
          bangunanIds.includes(r.id_bangunan)
        );
        setRuangan(filteredData);
      }
    };
    fetchData();
    handleCloseModal();
  };

  // Gallery Modal State
  const [selectedRoomGallery, setSelectedRoomGallery] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const campusParam = encodeURIComponent(selectedCampus.name);
        console.log("🏢 Ruangan page: Fetching for", selectedCampus.name);
        const [resRuangan, resBangunan, resLantaiGambar] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan`),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan?kampus=${campusParam}`
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar`),
        ]);

        if (resRuangan.ok && resBangunan.ok) {
          const dataRuangan = await resRuangan.json();
          const dataBangunan = await resBangunan.json();
          const dataLantaiGambar = resLantaiGambar.ok
            ? await resLantaiGambar.json()
            : [];

          // Filter ruangan based on bangunan from selected campus
          const bangunanIds = dataBangunan.map((b: any) => b.id_bangunan);
          const filteredRuanganData = dataRuangan.filter((r: any) =>
            bangunanIds.includes(r.id_bangunan)
          );

          setRuangan(filteredRuanganData);
          setFilteredRuangan(filteredRuanganData);
          setBangunanList(dataBangunan);
          setLantaiGambar(dataLantaiGambar);
          console.log("✅ Fetched", filteredRuanganData.length, "ruangan");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCampus.name]); // Fetch when campus name changes

  useEffect(() => {
    let result = ruangan;

    // Filter by Building
    if (selectedBangunan) {
      result = result.filter((r) => r.id_bangunan == selectedBangunan);
    }

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.nama_ruangan.toLowerCase().includes(lower) ||
          r.nama_jurusan?.toLowerCase().includes(lower) ||
          r.nama_prodi?.toLowerCase().includes(lower)
      );
    }

    setFilteredRuangan(result);
    setCurrentPage(1); // Reset page on filter
  }, [searchTerm, selectedBangunan, ruangan]);

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan/${deleteModal.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setRuangan(ruangan.filter((r) => r.id_ruangan !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
        showToast("Ruangan berhasil dihapus", "success");
      } else {
        showToast("Gagal menghapus ruangan", "error");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRuangan.slice(indexOfFirstItem, indexOfLastItem);

  // Helper function untuk mendapatkan gambar lantai
  const getLantaiGambarForRuangan = (
    id_bangunan: number,
    nomor_lantai: number
  ) => {
    const lantaiFile = `Lt${nomor_lantai}.svg`;
    const gambar = lantaiGambar.find(
      (lg) => lg.id_bangunan === id_bangunan && lg.nama_file === lantaiFile
    );
    return gambar?.path_file;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Manajemen Ruangan
        </h1>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
        >
          <FaPlus /> Tambah Ruangan
        </button>
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama ruangan..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
              value={selectedBangunan}
              onChange={(e) => setSelectedBangunan(e.target.value)}
            >
              <option value="">Semua Gedung</option>
              {bangunanList.map((b) => (
                <option key={b.id_bangunan} value={b.id_bangunan}>
                  {b.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
            title="Tampilan Tabel"
          >
            <FaList />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
            title="Tampilan Grid"
          >
            <FaThLarge />
          </button>
        </div>
      </div>

      {/* Content */}
      {/* Removed outer white container for grid view logic */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 min-h-[300px]">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p>Memuat data...</p>
        </div>
      ) : filteredRuangan.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 min-h-[300px] flex flex-col items-center justify-center">
          <FaSearch className="text-4xl mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            Tidak ada data ruangan ditemukan.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
          {currentItems.map((r) => (
            <div
              key={r.id_ruangan}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md mb-2 inline-block">
                    {r.bangunan?.nama || "Unknown"}
                  </span>
                  <h3
                    className="font-bold text-gray-800 dark:text-white text-lg leading-tight line-clamp-1"
                    title={r.nama_ruangan}
                  >
                    {r.nama_ruangan}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                    Lantai {r.nomor_lantai}
                  </span>
                  {r.posisi_x ? (
                    <span
                      className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mt-1"
                      title="Lokasi diset"
                    ></span>
                  ) : (
                    <span
                      className="inline-block w-2.5 h-2.5 bg-red-400 rounded-full mt-1"
                      title="Lokasi belum diset"
                    ></span>
                  )}
                </div>
              </div>

              {/* SVG Lantai Preview */}
              {(() => {
                const lantaiPath = getLantaiGambarForRuangan(
                  r.id_bangunan,
                  r.nomor_lantai
                );
                return lantaiPath ? (
                  <div className="px-4 pt-2 pb-3 bg-white dark:bg-gray-800/50">
                    <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-900/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={
                          lantaiPath.startsWith("/img")
                            ? lantaiPath // Path dari public folder Next.js
                            : `${
                                process.env.NEXT_PUBLIC_API_BASE_URL || ""
                              }/${lantaiPath.replace(/^\//, "")}`
                        }
                        alt={`Lantai ${r.nomor_lantai}`}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          // Hide image if failed to load
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                        Lantai {r.nomor_lantai}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="p-4 flex-1">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-university w-5 text-gray-400"></i>
                    <span className="truncate flex-1" title={r.nama_jurusan}>
                      {r.nama_jurusan || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-graduation-cap w-5 text-gray-400"></i>
                    <span className="truncate flex-1" title={r.nama_prodi}>
                      {r.nama_prodi || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                {/* Galeri Button - Integrated here */}
                <button
                  onClick={() =>
                    setSelectedRoomGallery({
                      id: r.id_ruangan,
                      name: r.nama_ruangan,
                    })
                  }
                  className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                  title="Galeri Ruangan"
                >
                  <FaImages />
                </button>
                <button
                  onClick={() => handleOpenEdit(r)}
                  className="flex-1 text-center py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                >
                  <FaEdit className="inline mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id_ruangan)}
                  className="w-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Nama Ruangan</th>
                  <th className="p-4 font-semibold">Gedung</th>
                  <th className="p-4 font-semibold">Lantai</th>
                  <th className="p-4 font-semibold">Denah Lantai</th>
                  <th className="p-4 font-semibold">Jurusan/Prodi</th>
                  <th className="p-4 font-semibold text-center">Pin</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((r) => (
                  <tr
                    key={r.id_ruangan}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <td className="p-4 font-medium">{r.nama_ruangan}</td>
                    <td className="p-4">{r.bangunan?.nama || "-"}</td>
                    <td className="p-4">Lt. {r.nomor_lantai}</td>
                    <td className="p-4">
                      {(() => {
                        const lantaiPath = getLantaiGambarForRuangan(
                          r.id_bangunan,
                          r.nomor_lantai
                        );
                        return lantaiPath ? (
                          <div className="w-20 h-16 bg-gray-100 dark:bg-gray-900/50 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={
                                lantaiPath.startsWith("/img")
                                  ? lantaiPath // Path dari public folder Next.js
                                  : `${
                                      process.env.NEXT_PUBLIC_API_BASE_URL || ""
                                    }/${lantaiPath.replace(/^\//, "")}`
                              }
                              alt={`Lantai ${r.nomor_lantai}`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{r.nama_jurusan}</div>
                        <div className="text-xs text-gray-500">
                          {r.nama_prodi}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {r.posisi_x ? (
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          Set
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          Unset
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedRoomGallery({
                              id: r.id_ruangan,
                              name: r.nama_ruangan,
                            })
                          }
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Galeri"
                        >
                          <FaImages />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id_ruangan)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredRuangan.length}
        onPageChange={setCurrentPage}
      />

      {/* Modal */}
      {selectedRoomGallery && (
        <RoomGalleryModal
          roomId={selectedRoomGallery.id}
          roomName={selectedRoomGallery.name}
          onClose={() => setSelectedRoomGallery(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative z-10 animate-scale-in transform transition-all">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500 text-2xl">
                <FaTrash />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Ruangan?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Apakah Anda yakin ingin menghapus ruangan ini? Tindakan ini
                tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        title={
          modalState.type === "add"
            ? "Tambah Ruangan Baru"
            : "Edit Data Ruangan"
        }
        size="full"
      >
        <RuanganForm
          isEdit={modalState.type === "edit"}
          initialData={modalState.data}
          onSuccess={handleSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
