"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaSave,
  FaArrowLeft,
  FaUpload,
  FaImages,
  FaTrash,
  FaPlus,
  FaCity,
  FaDoorOpen,
} from "react-icons/fa";

interface GaleriFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GaleriForm({ onSuccess, onCancel }: GaleriFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [bangunanList, setBangunanList] = useState<any[]>([]);
  const [ruanganList, setRuanganList] = useState<any[]>([]);

  const [selectedBangunan, setSelectedBangunan] = useState("");
  const [selectedRuangan, setSelectedRuangan] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Fetch Buildings
  useEffect(() => {
    const fetchBangunan = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`
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

  // Fetch Rooms when Building changes
  useEffect(() => {
    if (!selectedBangunan) {
      setRuanganList([]);
      setSelectedRuangan("");
      return;
    }

    const fetchRuangan = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan/bangunan/${selectedBangunan}`
        );
        if (res.ok) {
          const data = await res.json(); // returns { 1: [...], 2: [...] }
          // Flatten it
          const flatList: any[] = [];
          Object.values(data).forEach((floorRooms: any) => {
            flatList.push(...floorRooms);
          });
          setRuanganList(flatList);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRuangan();
  }, [selectedBangunan]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Generate previews
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRuangan || files.length === 0) {
      alert("Pilih ruangan dan minimal satu foto");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("ruanganId", selectedRuangan);

      files.forEach((file) => {
        formData.append("gallery", file);
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gallery/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        if (onSuccess) onSuccess();
        else {
          alert("Foto berhasil diupload");
          router.push("/dashboard/galeri");
        }
      } else {
        const err = await res.json();
        alert(`Gagal upload: ${err.message || err.error}`);
      }
    } catch (error) {
      console.error("Error uploading gallery:", error);
      alert("Terjadi kesalahan saat upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar: Selection */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="font-semibold text-lg border-b pb-3 mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
            <FaCity className="text-primary" /> Target Upload
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Gedung *
              </label>
              <div className="relative">
                <select
                  value={selectedBangunan}
                  onChange={(e) => setSelectedBangunan(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none"
                  required
                >
                  <option value="">-- Pilih Gedung --</option>
                  {bangunanList.map((b) => (
                    <option key={b.id_bangunan} value={b.id_bangunan}>
                      {b.nama}
                    </option>
                  ))}
                </select>
                <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Ruangan *
              </label>
              <div className="relative">
                <select
                  value={selectedRuangan}
                  onChange={(e) => setSelectedRuangan(e.target.value)}
                  disabled={!selectedBangunan}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Pilih Ruangan --</option>
                  {ruanganList.map((r) => (
                    <option key={r.id_ruangan} value={r.id_ruangan}>
                      {r.nama_ruangan}{" "}
                      {r.nomor_lantai ? `(Lt. ${r.nomor_lantai})` : ""}
                    </option>
                  ))}
                </select>
                <FaDoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 shrink-0">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <FaUpload /> Tips Upload
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-disc list-inside">
            <li>Gunakan foto berkualitas tinggi (HD).</li>
            <li>Pastikan pencahayaan ruangan cukup.</li>
            <li>Ambil foto dari berbagai sudut ruangan.</li>
            <li>Mendukung format JPG, PNG, WEBP.</li>
          </ul>
        </div>
      </div>

      {/* Right Content: Upload & Preview */}
      <div className="w-full lg:w-2/3 h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 dark:bg-primary/10 rounded-xl transition-all duration-300 group relative min-h-[200px] flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                disabled={!selectedRuangan}
                id="file-dropzone"
              />
              <div
                className={`text-center p-8 transition-opacity ${
                  !selectedRuangan ? "opacity-50 grayscale" : "opacity-100"
                }`}
              >
                <div className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <FaPlus className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">
                  {selectedRuangan
                    ? "Klik atau Tarik Foto ke Sini"
                    : "Pilih Ruangan Terlebih Dahulu"}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Mendukung upload banyak file sekaligus. Maksimal 5MB per file.
                </p>
              </div>
            </div>
          </div>

          {/* Preview Grid */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
                <FaImages className="text-primary" /> Preview Foto
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full ml-2">
                  {files.length} item
                </span>
              </h3>
              {files.length > 0 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                      Uploading...
                    </span>
                  ) : (
                    <>
                      {" "}
                      <FaSave /> Simpan Galeri{" "}
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1">
              {previews.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                  <FaImages className="text-5xl mb-3 opacity-30" />
                  <p>Belum ada foto yang dipilih</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={src}
                        alt={`Preview ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => removeFile(idx)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition transform hover:scale-110"
                          title="Hapus foto"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
