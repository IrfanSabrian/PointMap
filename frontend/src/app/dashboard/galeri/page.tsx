"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/dashboard/Modal";
import GaleriForm from "@/components/dashboard/GaleriForm";
import {
  FaImages,
  FaPlus,
  FaSearch,
  FaTrash,
  FaBuilding,
  FaDoorOpen,
} from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";

export default function GaleriPage() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  // Image cache busting - update this timestamp when data changes
  const [imageCacheBuster, setImageCacheBuster] = useState(Date.now());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 0; // 0 means show all for now? Or implement pagination.
  // Actually, let's implement pagination client side for now.
  const PAGE_SIZE = 12;

  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      const timestamp = new Date().getTime();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan-gallery?_t=${timestamp}`,
      );
      if (res.ok) {
        const data = await res.json();
        // Sort by id descending (newest first) if possible
        data.sort((a: any, b: any) => b.id_gallery - a.id_gallery);
        setGalleryItems(data);
        setFilteredItems(data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    let result = galleryItems;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.deskripsi && item.deskripsi.toLowerCase().includes(lower)) ||
          (item.ruangan?.nama_ruangan &&
            item.ruangan.nama_ruangan.toLowerCase().includes(lower)) ||
          (item.ruangan?.bangunan?.nama &&
            item.ruangan.bangunan.nama.toLowerCase().includes(lower)),
      );
    }
    setFilteredItems(result);
    setCurrentPage(1);
  }, [searchTerm, galleryItems]);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan-gallery/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const newItems = galleryItems.filter((item) => item.id_gallery !== id);
        setGalleryItems(newItems);
        showToast("Foto berhasil dihapus", "success");
      } else {
        showToast("Gagal menghapus foto", "error");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleSuccess = async () => {
    // Refresh data with cache busting BEFORE closing modal
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan-gallery?_t=${timestamp}`,
        {
          cache: "no-store", // Disable Next.js caching
        },
      );
      if (res.ok) {
        const data = await res.json();
        // Sort by id descending (newest first) if possible
        data.sort((a: any, b: any) => b.id_gallery - a.id_gallery);
        setGalleryItems(data);
        setFilteredItems(data);
        // Update image cache buster to force reload images
        setImageCacheBuster(Date.now());
        console.log(
          "✅ Data refreshed after save:",
          data.length,
          "gallery items",
        );
      }
    } catch (error) {
      console.error("Error refreshing gallery:", error);
      showToast("Gagal memuat data terbaru", "error");
    } finally {
      // Close modal only AFTER data is refreshed
      setIsModalOpen(false);
    }
  };

  // Client-side pagination
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaImages className="text-primary" /> Manajemen Galeri
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
        >
          <FaPlus /> Upload Foto
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Cari berdasarkan ruangan, gedung, atau deskripsi..."
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-500">Memuat galeri...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FaImages className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">
            Belum ada foto galeri.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in-up">
            {paginatedItems.map((item) => (
              <div
                key={item.id_gallery}
                className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 aspect-square"
              >
                <img
                  src={`${item.path_file.startsWith("/") ? "" : "/"}${item.path_file}?_t=${imageCacheBuster}`}
                  alt={item.deskripsi || "Foto Ruangan"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <p className="font-bold text-sm truncate">
                    {item.ruangan?.nama_ruangan || "Unknown Room"}
                  </p>
                  <p className="text-xs opacity-80 truncate">
                    {item.ruangan?.bangunan?.nama || "Unknown Building"}
                  </p>
                  <button
                    onClick={() => handleDelete(item.id_gallery)}
                    className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 transform hover:scale-105"
                    title="Hapus"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Galeri Ruangan"
        size="full"
      >
        <GaleriForm
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
