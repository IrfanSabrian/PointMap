"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSave,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCity,
  FaLayerGroup,
  FaDoorOpen,
} from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";
import { useCampus } from "@/hooks/useCampus";

interface RuanganFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RuanganForm({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
}: RuanganFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedCampus } = useCampus();
  const [loading, setLoading] = useState(false);
  const [bangunanList, setBangunanList] = useState<any[]>([]);
  const [lantaiList, setLantaiList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama_ruangan: initialData?.nama_ruangan || "",
    nomor_lantai: initialData?.nomor_lantai || 1,
    id_bangunan: initialData?.id_bangunan || "",
    nama_jurusan: initialData?.nama_jurusan || "",
    nama_prodi: initialData?.nama_prodi || "",
    fungsi: initialData?.fungsi || "",
    pin_style: initialData?.pin_style || "default",
    posisi_x:
      initialData?.posisi_x !== undefined && initialData?.posisi_x !== null
        ? parseFloat(initialData.posisi_x)
        : null,
    posisi_y:
      initialData?.posisi_y !== undefined && initialData?.posisi_y !== null
        ? parseFloat(initialData.posisi_y)
        : null,
  });

  const [currentFloorImage, setCurrentFloorImage] = useState<string | null>(
    null,
  );
  const [imageError, setImageError] = useState(false);

  // State untuk tracking dimensi gambar yang ditampilkan
  const [imageDimensions, setImageDimensions] = useState<{
    displayedWidth: number;
    displayedHeight: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  // Fetch Buildings
  useEffect(() => {
    const fetchBangunan = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`,
        );
        if (res.ok) {
          const data = await res.json();
          setBangunanList(data);
        }
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    };
    fetchBangunan();
  }, []);

  // Fetch Floor Images when Building changes
  useEffect(() => {
    if (!formData.id_bangunan) {
      setLantaiList([]);
      setCurrentFloorImage(null);
      return;
    }

    const fetchLantaiGambar = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar/bangunan/${formData.id_bangunan}`,
        );
        if (res.ok) {
          const data = await res.json();
          setLantaiList(data);
        } else {
          setLantaiList([]);
        }
      } catch (error) {
        console.error("Error fetching floor images:", error);
        setLantaiList([]);
      }
    };
    fetchLantaiGambar();
  }, [formData.id_bangunan]);

  // Update image when floor or list changes
  useEffect(() => {
    setImageError(false);
    if (!lantaiList.length) {
      console.log(
        "⚠️ No floor images available for building",
        formData.id_bangunan,
      );
      setCurrentFloorImage(null);
      return;
    }
    const floorNum = formData.nomor_lantai;

    console.log("🔍 Debug Floor Selection:");
    console.log("   - Building ID:", formData.id_bangunan);
    console.log("   - Target Floor:", floorNum);
    console.log(
      "   - Available Files:",
      lantaiList.map((l) => l.nama_file),
    );

    let image = lantaiList.find((l) => l.nama_file === `Lt${floorNum}.svg`);

    if (!image) {
      // Fallback: Find any file that contains "Lt{floorNum}"
      const regex = new RegExp(`Lt\\s*${floorNum}(\\D|$)`, "i");
      image = lantaiList.find((l) => regex.test(l.nama_file));
    }

    console.log("   - Matched File:", image ? image.nama_file : "NONE");
    console.log("   - Path:", image ? image.path_file : "N/A");

    if (image) {
      setCurrentFloorImage(image.path_file);
      // Reset dimensions saat gambar berubah, akan dihitung ulang di onLoad
      setImageDimensions(null);
    } else {
      setCurrentFloorImage(null);
      setImageDimensions(null);
    }
  }, [formData.nomor_lantai, lantaiList, formData.id_bangunan]);

  // Update handleImageLoad to be available for useEffect
  // Handler untuk menghitung dimensi gambar saat dimuat
  const handleImageLoad = (
    e:
      | React.SyntheticEvent<HTMLImageElement>
      | { currentTarget: HTMLImageElement },
  ) => {
    const img = e.currentTarget;
    const containerRect = img.getBoundingClientRect();

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!naturalWidth || !naturalHeight) return;

    const containerAspectRatio = containerRect.width / containerRect.height;
    const imageAspectRatio = naturalWidth / naturalHeight;

    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imageAspectRatio > containerAspectRatio) {
      displayedWidth = containerRect.width;
      displayedHeight = containerRect.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerRect.height - displayedHeight) / 2;
    } else {
      displayedHeight = containerRect.height;
      displayedWidth = containerRect.height * imageAspectRatio;
      offsetX = (containerRect.width - displayedWidth) / 2;
      offsetY = 0;
    }

    setImageDimensions({
      displayedWidth,
      displayedHeight,
      offsetX,
      offsetY,
    });
  };

  // Ensure image dimensions are calculated if image is already loaded (cached)
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete && currentFloorImage) {
      handleImageLoad({ currentTarget: imageRef.current });
    }
  }, [currentFloorImage]);

  // Recalculate dimensions saat window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        handleImageLoad({ currentTarget: imageRef.current } as any);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nama_ruangan ||
      !formData.id_bangunan ||
      !formData.nomor_lantai
    ) {
      showToast("Mohon lengkapi data wajib (Nama, Gedung, Lantai)", "warning");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan/${initialData.id_ruangan}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Data ruangan berhasil disimpan", "success");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/ruangan");
        }
      } else {
        const err = await res.json();
        showToast(`Gagal menyimpan: ${err.message || err.error}`, "error");
      }
    } catch (error) {
      console.error("Error saving ruangan:", error);
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Handler untuk click pada GAMBAR itu sendiri, bukan container
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!currentFloorImage) return;

    const img = e.currentTarget;
    const containerRect = img.getBoundingClientRect();

    // Dapatkan ukuran natural dari gambar
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      console.warn("Image natural dimensions not available");
      return;
    }

    // Hitung aspect ratio
    const containerAspectRatio = containerRect.width / containerRect.height;
    const imageAspectRatio = naturalWidth / naturalHeight;

    // Tentukan ukuran gambar yang sebenarnya ditampilkan (object-contain)
    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imageAspectRatio > containerAspectRatio) {
      // Gambar lebih lebar, fit by width
      displayedWidth = containerRect.width;
      displayedHeight = containerRect.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerRect.height - displayedHeight) / 2;
    } else {
      // Gambar lebih tinggi, fit by height
      displayedHeight = containerRect.height;
      displayedWidth = containerRect.height * imageAspectRatio;
      offsetX = (containerRect.width - displayedWidth) / 2;
      offsetY = 0;
    }

    // Hitung posisi click relatif terhadap container
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    // Hitung posisi relatif terhadap gambar yang sebenarnya ditampilkan
    const relativeX = clickX - offsetX;
    const relativeY = clickY - offsetY;

    // Cek apakah klik berada di dalam area gambar yang sebenarnya
    if (
      relativeX < 0 ||
      relativeX > displayedWidth ||
      relativeY < 0 ||
      relativeY > displayedHeight
    ) {
      console.warn("Click outside image bounds");
      return;
    }

    // Konversi ke persentase relatif terhadap gambar yang ditampilkan
    const x = (relativeX / displayedWidth) * 100;
    const y = (relativeY / displayedHeight) * 100;

    console.log("📍 Pin Position Set:", { x, y });
    console.log("  - Natural Size:", { naturalWidth, naturalHeight });
    console.log("  - Displayed Size:", { displayedWidth, displayedHeight });
    console.log("  - Offset:", { offsetX, offsetY });
    console.log("  - Click Position:", { clickX, clickY });
    console.log("  - Relative to Image:", { relativeX, relativeY });

    setFormData({
      ...formData,
      posisi_x: x,
      posisi_y: y,
    });

    // Update image dimensions untuk positioning pin marker
    setImageDimensions({
      displayedWidth,
      displayedHeight,
      offsetX,
      offsetY,
    });
  };

  const selectedBangunan = bangunanList.find(
    (b) => b.id_bangunan == formData.id_bangunan,
  );
  const maxLantai = selectedBangunan ? selectedBangunan.lantai : 10; // default 10 if not found

  return (
    // No header if inside modal

    <div className="w-full h-full flex flex-col lg:flex-row gap-3 sm:gap-6">
      {/* Left Column: Form Inputs */}
      <div className="w-full lg:w-1/3 flex flex-col gap-2 sm:gap-4 h-full overflow-hidden">
        {/* Header - Fixed if not canceled */}
        {!onCancel && (
          <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-2 shrink-0">
            <button
              onClick={handleBack}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold font-gray-800 dark:text-white">
              {isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
            </h1>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 border-b pb-1 sm:pb-2 flex items-center gap-2 text-gray-800 dark:text-white">
              <FaDoorOpen className="text-primary" /> Detail Ruangan
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                  Gedung *
                </label>
                <div className="relative">
                  <select
                    value={formData.id_bangunan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        id_bangunan: e.target.value,
                        nomor_lantai: 1,
                      })
                    }
                    className="w-full pl-8 sm:pl-9 pr-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm appearance-none"
                    required
                  >
                    <option value="" disabled hidden></option>
                    {bangunanList
                      .filter((b) => b.kategori_kampus === selectedCampus.name)
                      .map((b) => (
                        <option key={b.id_bangunan} value={b.id_bangunan}>
                          {b.nama}
                        </option>
                      ))}
                  </select>
                  <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                    Lantai *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.nomor_lantai}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData({
                          ...formData,
                          nomor_lantai: isNaN(val) ? 0 : val,
                        });
                      }}
                      className="w-full pl-8 sm:pl-9 pr-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm appearance-none"
                      disabled={
                        !formData.id_bangunan || lantaiList.length === 0
                      }
                      required
                    >
                      <option value="" disabled hidden></option>
                      {lantaiList.map((l) => {
                        // Extract number: Try to find 'Lt' followed by dots/digits, or just digits
                        const match =
                          l.nama_file.match(/Lt\s*(\d+)/i) ||
                          l.nama_file.match(/(\d+)/);
                        const floorNum = match ? match[1] : null;
                        const label = floorNum
                          ? `Lantai ${floorNum}`
                          : l.nama_file;
                        const val = floorNum ? floorNum : "0";

                        return (
                          <option key={l.id_lantai_gambar} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                    <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={formData.pin_style}
                      onChange={(e) =>
                        setFormData({ ...formData, pin_style: e.target.value })
                      }
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm appearance-none"
                    >
                      <option value="default">Default</option>
                      <option value="ruang_kelas">Ruang Kelas</option>
                      <option value="laboratorium">
                        Laboratorium / Ruang Praktik
                      </option>
                      <option value="ruang_dosen">Ruang Dosen</option>
                      <option value="ruang_rapat">Ruang Rapat</option>
                      <option value="toilet">Toilet</option>
                      <option value="ruang_peralatan">Ruang Peralatan</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span
                        className={`block w-3 h-3 rounded-full ${
                          formData.pin_style === "laboratorium"
                            ? "bg-[#1976d2]"
                            : formData.pin_style === "ruang_dosen"
                              ? "bg-[#2e7d32]"
                              : formData.pin_style === "ruang_rapat"
                                ? "bg-[#f57c00]"
                                : formData.pin_style === "ruang_kelas"
                                  ? "bg-[#d32f2f]"
                                  : formData.pin_style === "toilet"
                                    ? "bg-[#00796b]"
                                    : formData.pin_style === "ruang_peralatan"
                                      ? "bg-[#ffb74d]"
                                      : "bg-[#9e9e9e]"
                        }`}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                  Nama Ruangan *
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
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Contoh: Lab Komputer 1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500 uppercase">
                  Fungsi / Deskripsi
                </label>
                <textarea
                  value={formData.fungsi}
                  onChange={(e) =>
                    setFormData({ ...formData, fungsi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                  rows={2}
                  placeholder="Deskripsi singkat..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-500 uppercase">
                    Jurusan
                  </label>
                  <input
                    type="text"
                    value={formData.nama_jurusan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_jurusan: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-500 uppercase">
                    Prodi
                  </label>
                  <input
                    type="text"
                    value={formData.nama_prodi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_prodi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="pt-2 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-1.5 sm:py-3 px-3 sm:px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow duration-300 flex items-center justify-center gap-2 text-xs sm:text-base"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <FaSave /> Simpan Ruangan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Floor Plan Interaction */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" /> Plot Lokasi Ruangan
          </h3>
          <div className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {formData.posisi_x && formData.posisi_y ? (
              <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Pin
                Diset
              </span>
            ) : (
              <span className="text-orange-500 dark:text-orange-400 font-medium">
                Klik denah untuk set lokasi
              </span>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative w-full h-full overflow-hidden flex items-center justify-center p-6">
          {currentFloorImage ? (
            <div className="relative aspect-[3/2] w-full max-h-full shadow-lg bg-white overflow-hidden mx-auto">
              {/* Image */}
              <img
                src={(() => {
                  const path = currentFloorImage;
                  if (!path) return "";

                  let finalPath = path;

                  // Case 1: External URL
                  if (path.startsWith("http")) {
                    finalPath = path;
                  }
                  // Case 2: Legacy Frontend Paths (../img, ./img, img/)
                  else if (
                    path.match(/^(\.\.?\/)*img\//) ||
                    path.startsWith("/img/")
                  ) {
                    const clean = path.replace(/^(\.\.?\/)+/, "");
                    finalPath = clean.startsWith("/") ? clean : `/${clean}`;
                  }
                  // Case 3: Backend Uploads (default)
                  else {
                    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
                    const cleanPath = path.startsWith("/")
                      ? path.substring(1)
                      : path;
                    finalPath = `${baseUrl}/${cleanPath}`;
                  }

                  return finalPath;
                })()}
                alt="Denah Lantai"
                ref={imageRef}
                className="w-full h-full object-contain cursor-crosshair select-none"
                onClick={handleImageClick}
                onLoad={handleImageLoad}
                draggable={false}
                onError={(e) => {
                  console.error("Failed to load image:", currentFloorImage);
                }}
              />

              {/* Visual guide untuk area gambar yang sebenarnya */}
              {imageDimensions && (
                <div
                  className="absolute pointer-events-none border-2 border-dashed border-blue-300 dark:border-blue-600"
                  style={{
                    left: `${imageDimensions.offsetX}px`,
                    top: `${imageDimensions.offsetY}px`,
                    width: `${imageDimensions.displayedWidth}px`,
                    height: `${imageDimensions.displayedHeight}px`,
                  }}
                  title="Area gambar yang valid untuk penempatan pin"
                />
              )}

              {/* Pin Marker */}
              {formData.posisi_x && formData.posisi_y && imageDimensions && (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-200 ease-out"
                  style={{
                    left: `${
                      imageDimensions.offsetX +
                      (formData.posisi_x / 100) * imageDimensions.displayedWidth
                    }px`,
                    top: `${
                      imageDimensions.offsetY +
                      (formData.posisi_y / 100) *
                        imageDimensions.displayedHeight
                    }px`,
                    transform: "translate(-50%, -100%)", // Anchor point at bottom center
                  }}
                >
                  {/* Pin match public view style */}
                  <div className="relative group">
                    <div
                      className={`relative flex items-center justify-center ${
                        formData.pin_style === "laboratorium"
                          ? "text-[#1976d2]"
                          : formData.pin_style === "ruang_dosen"
                            ? "text-[#2e7d32]"
                            : formData.pin_style === "ruang_rapat"
                              ? "text-[#f57c00]"
                              : formData.pin_style === "ruang_kelas"
                                ? "text-[#d32f2f]"
                                : formData.pin_style === "toilet"
                                  ? "text-[#00796b]"
                                  : formData.pin_style === "ruang_peralatan"
                                    ? "text-[#ffb74d]"
                                    : "text-[#9e9e9e]"
                      }`}
                    >
                      {/* Icon Container similar to public view */}
                      <span className="block transform -translate-y-[10%]">
                        <FaMapMarkerAlt className="text-3xl drop-shadow-md filter" />
                      </span>

                      {/* Pulse effect for better visibility in editor */}
                      <div className="absolute inset-0 bg-current opacity-20 rounded-full animate-ping scale-50"></div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Posisi: {Math.round(formData.posisi_x)}%,{" "}
                      {Math.round(formData.posisi_y)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FaLayerGroup className="text-4xl opacity-50" />
              </div>
              <p className="font-medium">Pilih Gedung & Lantai</p>
              <p className="text-sm opacity-70">
                Denah lantai akan muncul di sini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
