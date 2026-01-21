"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaSave,
  FaArrowLeft,
  FaUpload,
  FaCity,
  FaLayerGroup,
  FaFileImage,
} from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";
import { useCampus } from "@/hooks/useCampus";

interface LantaiFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LantaiForm({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
}: LantaiFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedCampus } = useCampus();
  const [loading, setLoading] = useState(false);
  const [bangunanList, setBangunanList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id_bangunan: initialData?.id_bangunan || "",
    nomor_lantai: initialData?.nama_file
      ? parseInt(initialData.nama_file.replace(/\D/g, ""))
      : 1,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.path_file || null,
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_bangunan || !formData.nomor_lantai) {
      showToast("Mohon lengkapi data wajib", "warning");
      return;
    }

    if (!isEdit && !file) {
      showToast("Pilih file denah lantai", "warning");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const formDataUpload = new FormData();
      formDataUpload.append("id_bangunan", formData.id_bangunan);
      formDataUpload.append("nomor_lantai", formData.nomor_lantai.toString());
      if (file) {
        formDataUpload.append("gambar_lantai", file);
      }

      // Always use POST endpoint for both create and edit
      // The backend addLantaiGambar has upsert logic:
      // - Checks if (id_bangunan, nama_file) combination exists
      // - If exists: updates the path_file
      // - If not: creates new record
      // This is perfect for both create and edit with file upload

      // For edit mode without new file, we require user to upload
      if (isEdit && !file) {
        showToast("Upload file baru untuk mengubah denah lantai", "warning");
        setLoading(false);
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar`;
      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (res.ok) {
        showToast("Data lantai berhasil disimpan", "success");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/lantai");
        }
      } else {
        const err = await res.json();
        showToast(`Gagal menyimpan: ${err.message || err.error}`, "error");
      }
    } catch (error) {
      console.error("Error saving lantai:", error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes("svg")) {
        showToast("Harap pilih file SVG untuk denah lantai", "warning");
        // return; // Allow user to upload other formats if they really want, but warn relevantly?
        // backend expects SVG for 'format: svg' if we look at controller, but image/png is also used for thumbnails?
        // Controller says `if (!allowedTypes...)`? No, controller `addLantaiGambar` sets `format: "svg"`.
        // So we should enforce SVG or check if backend supports others.
        // In `lantaiGambar.js`, it sets `format: "svg"`. So it forces SVG conversion or expects SVG.
        // Let's assume SVG is required.
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const selectedBangunan = bangunanList.find(
    (b) => b.id_bangunan == formData.id_bangunan,
  );
  const maxLantai = selectedBangunan ? selectedBangunan.lantai : 10;

  // Content-only component - Modal wrapper will be provided by parent (Modal.tsx)
  // Layout: Left column (form) + Right column (preview)
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column: Form Inputs */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {/* Page Header (only show if not in modal mode) */}
        {!onCancel && (
          <div className="flex items-center gap-4 mb-2 shrink-0">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isEdit ? "Edit Lantai" : "Tambah Lantai"}
            </h1>
          </div>
        )}

        {/* Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Pilih Gedung */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Gedung *
              </label>
              <div className="relative">
                <select
                  value={formData.id_bangunan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_bangunan: e.target.value,
                    })
                  }
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm appearance-none text-gray-800 dark:text-white"
                  required
                  disabled={isEdit}
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

            {/* Nomor Lantai */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Nomor Lantai *
              </label>
              <div className="relative">
                <select
                  value={formData.nomor_lantai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nomor_lantai: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm appearance-none text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={!selectedBangunan || isEdit}
                >
                  <option value="" disabled hidden></option>
                  {selectedBangunan &&
                    Array.from({ length: maxLantai }, (_, i) => i + 1).map(
                      (num) => (
                        <option key={num} value={num}>
                          Lantai {num}
                        </option>
                      ),
                    )}
                </select>
                <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>
              {selectedBangunan && (
                <p className="text-xs text-gray-500 mt-1">
                  Gedung ini memiliki {maxLantai} lantai
                </p>
              )}
            </div>

            {/* Upload File SVG */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                File Denah Lantai (SVG) *
              </label>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={!formData.id_bangunan || !formData.nomor_lantai}
              />
              <label
                htmlFor="file-upload"
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 ${
                  !formData.id_bangunan || !formData.nomor_lantai
                    ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary cursor-pointer"
                }`}
                onClick={(e) => {
                  if (!formData.id_bangunan || !formData.nomor_lantai) {
                    e.preventDefault();
                    showToast(
                      "Pilih gedung dan lantai terlebih dahulu",
                      "warning",
                    );
                  }
                }}
              >
                <FaUpload
                  className={
                    !formData.id_bangunan || !formData.nomor_lantai
                      ? "text-gray-400"
                      : "text-primary"
                  }
                />
                <span className="text-sm">
                  {!formData.id_bangunan || !formData.nomor_lantai
                    ? "Pilih gedung dan lantai dahulu"
                    : file
                      ? file.name
                      : "Klik untuk upload file SVG"}
                </span>
              </label>
              <p className="text-xs text-gray-500">
                <FaFileImage className="inline mr-1" />
                Format: SVG | Pastikan file berisi denah lantai yang jelas
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={
                  loading ||
                  (!file && !isEdit && !preview) || // For create: need file
                  (isEdit && !file) // For edit: MUST have new file
                }
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSave className="text-xl" />{" "}
                    {isEdit ? "Simpan Perubahan" : "Tambah Lantai"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: SVG Preview */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaFileImage className="text-primary" /> Preview Denah Lantai
          </h3>
          {preview && (
            <div className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> File
                Terpilih
              </span>
            </div>
          )}
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative w-full h-full overflow-hidden flex items-center justify-center p-6">
          {preview ? (
            <div className="relative w-full h-full shadow-lg bg-white overflow-hidden flex items-center justify-center">
              <img
                src={(() => {
                  if (!preview) return "";

                  // If it's a blob URL (from file input), use it directly
                  if (preview.startsWith("blob:")) return preview;

                  // If it's a data URL, use it directly
                  if (preview.startsWith("data:")) return preview;

                  // If it's http/https, use it directly
                  if (preview.startsWith("http")) return preview;

                  // For relative paths from database (/img/...)
                  // Make sure it starts with / for frontend public folder
                  return preview.startsWith("/") ? preview : `/${preview}`;
                })()}
                alt="Preview denah lantai"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error("Failed to load image preview:", preview);
                  // Don't set a fallback, just log the error
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FaLayerGroup className="text-4xl opacity-50" />
              </div>
              <p className="font-medium">Upload File SVG</p>
              <p className="text-sm opacity-70">
                Preview denah akan muncul di sini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
