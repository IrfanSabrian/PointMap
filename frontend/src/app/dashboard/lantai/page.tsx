"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/dashboard/Modal";
import LantaiForm from "@/components/dashboard/LantaiForm";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaList,
  FaThLarge,
  FaLayerGroup,
} from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";
import { useCampus } from "@/hooks/useCampus";

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

export default function LantaiPage() {
  const { showToast } = useToast();
  const [lantai, setLantai] = useState<any[]>([]);
  const [allLantai, setAllLantai] = useState<any[]>([]); // Store ALL lantai
  const [filteredLantai, setFilteredLantai] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bangunanList, setBangunanList] = useState<any[]>([]);
  const [selectedBangunan, setSelectedBangunan] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const { selectedCampus } = useCampus();

  // Image cache busting - update this timestamp when data changes
  const [imageCacheBuster, setImageCacheBuster] = useState(Date.now());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch ALL data once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resLantai, resBangunan] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`),
        ]);

        if (resLantai.ok && resBangunan.ok) {
          const dataLantai = await resLantai.json();
          const dataBangunan = await resBangunan.json();

          setAllLantai(dataLantai);
          setBangunanList(dataBangunan);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Fetch once on mount only

  // CLIENT-SIDE FILTERING: by campus and selected building
  useEffect(() => {
    // Filter bangunan by campus first
    const campusBangunan = bangunanList.filter(
      (b) => b.kategori_kampus === selectedCampus.name,
    );
    const campusBangunanIds = campusBangunan.map((b) => b.id_bangunan);

    // Filter lantai by campus bangunan
    let result = allLantai.filter((l) =>
      campusBangunanIds.includes(l.id_bangunan),
    );

    // Then filter by selected building if any
    if (selectedBangunan) {
      result = result.filter((l) => l.id_bangunan == selectedBangunan);
    }

    setFilteredLantai(result);
    setCurrentPage(1); // Reset page on filter
  }, [selectedCampus.name, selectedBangunan, allLantai, bangunanList]);

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar/${deleteModal.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setAllLantai(
          allLantai.filter((l) => l.id_lantai_gambar !== deleteModal.id),
        );
        setDeleteModal({ isOpen: false, id: null });
        showToast("Gambar lantai berhasil dihapus", "success");
      } else {
        const err = await res.json();

        // Handle dependency error with detailed message
        if (err.dependencies) {
          const { ruangan, galeri } = err.dependencies;
          let detailMsg = "Lantai masih memiliki data:\n";
          if (galeri > 0) detailMsg += `${galeri} Foto Galeri\n`;
          if (ruangan > 0) detailMsg += `${ruangan} Ruangan`;

          showToast(detailMsg, "error");
        } else {
          showToast(`Gagal menghapus: ${err.message || err.error}`, "error");
        }

        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error("Error deleting floor image:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLantai.slice(indexOfFirstItem, indexOfLastItem);

  const handleSuccess = async () => {
    // Refresh data with cache busting BEFORE closing modal
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar?_t=${timestamp}`,
        {
          cache: "no-store", // Disable Next.js caching
        },
      );

      if (res.ok) {
        const data = await res.json();
        setAllLantai(data); // Update source of truth, useEffect will handle filtering
        // Update image cache buster to force reload images
        setImageCacheBuster(Date.now());
        console.log("✅ Data refreshed after save:", data.length, "lantai");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      showToast("Gagal memuat data terbaru", "error");
    } finally {
      // Close modal only AFTER data is refreshed
      handleCloseModal();
    }
  };

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaLayerGroup className="text-primary" /> Manajemen Lantai
        </h1>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
        >
          <FaPlus /> Tambah Lantai
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex-1 w-full">
          <select
            className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
            value={selectedBangunan}
            onChange={(e) => setSelectedBangunan(e.target.value)}
          >
            <option value="">Semua Gedung</option>
            {bangunanList
              .filter((b) => b.kategori_kampus === selectedCampus.name)
              .map((b) => (
                <option key={b.id_bangunan} value={b.id_bangunan}>
                  {b.nama}
                </option>
              ))}
          </select>
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

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 min-h-[300px]">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p>Memuat data...</p>
        </div>
      ) : filteredLantai.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
          <p className="text-lg font-medium">
            Tidak ada data lantai ditemukan.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in-up">
          {currentItems.map((l) => (
            <div
              key={l.id_lantai_gambar}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group overflow-hidden"
            >
              <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700/50 relative flex items-center justify-center p-3 border-b border-gray-100 dark:border-gray-700">
                <img
                  src={`${l.path_file}?_t=${imageCacheBuster}`}
                  alt={l.nama_file}
                  className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {l.nama_file.replace(".svg", "").replace("Lt", "Lantai ")}
                </div>
              </div>

              <div className="p-3">
                <h3
                  className="text-sm font-bold text-gray-800 dark:text-white mb-3 truncate"
                  title={l.bangunan?.nama || "Unknown"}
                >
                  {l.bangunan?.nama || "Unknown"}
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(l)}
                    className="flex-1 text-center py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-medium transition-colors"
                  >
                    <FaEdit className="inline mr-1 text-xs" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(l.id_lantai_gambar)}
                    className="w-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
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
                  <th className="p-4 font-semibold">Gedung</th>
                  <th className="p-4 font-semibold">File</th>
                  <th className="p-4 font-semibold">Preview</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((l) => (
                  <tr
                    key={l.id_lantai_gambar}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <td className="p-4 font-medium">
                      {l.bangunan?.nama || "-"}
                    </td>
                    <td className="p-4 font-mono text-sm">{l.nama_file}</td>
                    <td className="p-4">
                      <img
                        src={l.path_file}
                        alt={l.nama_file}
                        className="h-10 w-auto object-contain bg-gray-100 dark:bg-gray-900 rounded p-1 border"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Upload Ulang"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id_lantai_gambar)}
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
        totalItems={filteredLantai.length}
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
                Hapus Gambar Lantai?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Apakah Anda yakin ingin menghapus gambar ini? Tindakan ini tidak
                dapat dibatalkan.
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
          modalState.type === "add" ? "Tambah Data Lantai" : "Edit Data Lantai"
        }
        size="full"
      >
        <LantaiForm
          isEdit={modalState.type === "edit"}
          initialData={modalState.data}
          onSuccess={handleSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
