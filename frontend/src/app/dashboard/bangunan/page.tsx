"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Modal from "@/components/dashboard/Modal";
import BangunanForm from "@/components/dashboard/BangunanForm";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaImages,
  FaList,
  FaThLarge,
  FaBuilding,
  FaLayerGroup,
} from "react-icons/fa";
import { useCampus } from "@/hooks/useCampus";
import { useToast } from "@/components/ToastProvider";

// Pagination Component
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
    <div className="flex justify-center mt-6 gap-2">
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

export default function BangunanPage() {
  const [bangunan, setBangunan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid"); // Default to grid for better aesthetics
  const { selectedCampus } = useCampus();
  const { showToast } = useToast();

  // Image cache busting - update this timestamp when data changes
  const [imageCacheBuster, setImageCacheBuster] = useState(Date.now());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch ALL buildings once on mount
  useEffect(() => {
    const fetchBangunan = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`,
        );
        if (res.ok) {
          const data = await res.json();
          console.log("✅ [BANGUNAN] Loaded", data.length, "buildings");
          setBangunan(data);
        }
      } catch (error) {
        console.error("❌ [BANGUNAN] Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBangunan();
  }, []); // Fetch once on mount only

  // Check for edit query param
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && bangunan.length > 0) {
      const targetBangunan = bangunan.find(
        (b) => b.id_bangunan === parseInt(editId) || b.id_bangunan === editId,
      );
      if (targetBangunan) {
        handleOpenEdit(targetBangunan);
        // Clear param so it doesn't reopen on refresh/navigation
        router.replace("/dashboard/bangunan", { scroll: false });
      }
    }
  }, [bangunan, searchParams]);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "add" | "edit";
    data?: any;
  }>({ isOpen: false, type: "add" });

  const handleOpenAdd = () => {
    setModalState({ isOpen: true, type: "add", data: null });
  };

  const handleOpenEdit = (bangunanData: any) => {
    setModalState({ isOpen: true, type: "edit", data: bangunanData });
  };

  const handleCloseModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleSuccess = async () => {
    // Refresh data with cache busting BEFORE closing modal
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan?_t=${timestamp}`,
        {
          cache: "no-store", // Disable Next.js caching
        },
      );

      if (res.ok) {
        const data = await res.json();
        setBangunan(data);
        // Update image cache buster to force reload images
        setImageCacheBuster(Date.now());
        console.log("✅ Data refreshed after save:", data.length, "buildings");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      showToast("Gagal memuat data terbaru", "error");
    } finally {
      // Close modal only AFTER data is refreshed
      handleCloseModal();
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${deleteModal.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setBangunan(bangunan.filter((b) => b.id_bangunan !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
        showToast("Gedung berhasil dihapus", "success");
      } else {
        const err = await res.json();

        // Handle dependency error with detailed message
        if (err.dependencies) {
          const { lantai, ruangan, galeri } = err.dependencies;
          let detailMsg = "Gedung masih memiliki data:\n";
          if (galeri > 0) detailMsg += `${galeri} Foto Galeri\n`;
          if (ruangan > 0) detailMsg += `${ruangan} Ruangan\n`;
          if (lantai > 0) detailMsg += `${lantai} Lantai`;

          showToast(detailMsg, "error");
        } else {
          showToast(`Gagal menghapus: ${err.message || err.error}`, "error");
        }

        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error("Error deleting building:", error);
      showToast("Terjadi kesalahan saat menghapus", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // CLIENT-SIDE FILTERING: Filter by campus AND search
  // This will re-run whenever selectedCampus.name or searchTerm changes
  const filteredBangunan = useMemo(() => {
    console.log(
      "🔍 [FILTER] Campus:",
      selectedCampus.name,
      "| Search:",
      searchTerm || "none",
    );

    const result = bangunan.filter((b) => {
      const matchesCampus = b.kategori_kampus === selectedCampus.name;
      const matchesSearch = b.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCampus && matchesSearch;
    });

    console.log("✅ [FILTER] Result:", result.length, "buildings");
    return result;
  }, [bangunan, selectedCampus.name, searchTerm]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBangunan.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaBuilding className="text-primary" /> Manajemen Gedung
        </h1>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
        >
          <FaPlus /> Tambah Gedung
        </button>
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Cari nama gedung..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
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
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p>Memuat data...</p>
        </div>
      ) : filteredBangunan.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
          <FaBuilding className="mx-auto text-4xl mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            Tidak ada data gedung ditemukan.
          </p>
          <p className="text-sm">
            Coba kata kunci lain atau tambahkan gedung baru.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in-up">
          {currentItems.map((b) => (
            <div
              key={b.id_bangunan}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {b.thumbnail ? (
                  <img
                    src={(() => {
                      let baseUrl = b.thumbnail.startsWith("http")
                        ? b.thumbnail
                        : b.thumbnail.startsWith("/img") ||
                            b.thumbnail.startsWith("img") ||
                            b.thumbnail.startsWith("/building-details") ||
                            b.thumbnail.startsWith("building-details")
                          ? b.thumbnail
                          : `${
                              process.env.NEXT_PUBLIC_API_BASE_URL
                            }/${b.thumbnail.replace(/^\//, "")}`;
                      // Add cache buster to force reload
                      const separator = baseUrl.includes("?") ? "&" : "?";
                      return `${baseUrl}${separator}_t=${imageCacheBuster}`;
                    })()}
                    alt={b.nama}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800">
                    <FaImages className="text-4xl" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full shadow-sm ${
                      b.interaksi === "Interaktif"
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {b.interaksi || "Noninteraktif"}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <h3
                  className="text-sm font-bold text-gray-800 dark:text-white mb-1 line-clamp-1"
                  title={b.nama}
                >
                  {b.nama}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                    <FaLayerGroup className="text-xs" /> {b.lantai} Lantai
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <FaEdit className="text-xs" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id_bangunan)}
                    className="w-8 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 py-1.5 rounded-lg transition-colors flex items-center justify-center"
                    title="Hapus"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Thumbnail</th>
                  <th className="p-4 font-semibold">Nama Gedung</th>
                  <th className="p-4 font-semibold">Lantai</th>
                  <th className="p-4 font-semibold">Interaksi</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((b) => (
                  <tr
                    key={b.id_bangunan}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <td className="p-4">{b.id_bangunan}</td>
                    <td className="p-4">
                      {b.thumbnail ? (
                        <img
                          src={(() => {
                            let baseUrl = b.thumbnail.startsWith("http")
                              ? b.thumbnail
                              : b.thumbnail.startsWith("/img") ||
                                  b.thumbnail.startsWith("img") ||
                                  b.thumbnail.startsWith("/building-details") ||
                                  b.thumbnail.startsWith("building-details")
                                ? b.thumbnail
                                : `${
                                    process.env.NEXT_PUBLIC_API_BASE_URL
                                  }/${b.thumbnail.replace(/^\//, "")}`;
                            // Add cache buster to force reload
                            const separator = baseUrl.includes("?") ? "&" : "?";
                            return `${baseUrl}${separator}_t=${imageCacheBuster}`;
                          })()}
                          alt={b.nama}
                          className="w-12 h-12 object-cover rounded-md bg-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                          <FaImages />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium">{b.nama}</td>
                    <td className="p-4">{b.lantai}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          b.interaksi === "Interaktif"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {b.interaksi || "Noninteraktif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Gedung"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id_bangunan)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus Gedung"
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
        totalItems={filteredBangunan.length}
        onPageChange={setCurrentPage}
      />

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
                Hapus Gedung?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Apakah Anda yakin ingin menghapus gedung ini? Tindakan ini tidak
                dapat dibatalkan dan akan menghapus semua data terkait.
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
      {/* Modal Form */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        title={
          modalState.type === "add" ? "Tambah Gedung Baru" : "Edit Data Gedung"
        }
        size="full"
      >
        <BangunanForm
          isEdit={modalState.type === "edit"}
          initialData={modalState.data}
          onSuccess={handleSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
