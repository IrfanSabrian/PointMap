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
    posisi_x: initialData?.posisi_x || null,
    posisi_y: initialData?.posisi_y || null,
  });

  const [currentFloorImage, setCurrentFloorImage] = useState<string | null>(
    null
  );

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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar/bangunan/${formData.id_bangunan}`
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
    if (!lantaiList.length) {
      setCurrentFloorImage(null);
      return;
    }
    // Try to find image matching the floor number
    // Convention: nama_file contains "Lt{number}" or we just rely on order?
    // The previous controller logic generated nama_file as `Lt${nomor_lantai}.svg`
    // So we search for that.
    const expectedName = `Lt${formData.nomor_lantai}.svg`;
    const image = lantaiList.find((l) => l.nama_file === expectedName);

    if (image) {
      setCurrentFloorImage(image.path_file);
    } else {
      setCurrentFloorImage(null);
    }
  }, [formData.nomor_lantai, lantaiList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nama_ruangan ||
      !formData.id_bangunan ||
      !formData.nomor_lantai
    ) {
      alert("Mohon lengkapi data wajib (Nama, Gedung, Lantai)");
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
        if (onSuccess) {
          onSuccess();
        } else {
          alert("Data ruangan berhasil disimpan");
          router.push("/dashboard/ruangan");
        }
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan: ${err.message || err.error}`);
      }
    } catch (error) {
      console.error("Error saving ruangan:", error);
      alert("Terjadi kesalahan saat menyimpan");
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

    // Ambil bounding rect dari GAMBAR, bukan dari container
    const rect = e.currentTarget.getBoundingClientRect();

    // Hitung koordinat relatif terhadap gambar yang sebenarnya
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData({
      ...formData,
      posisi_x: x,
      posisi_y: y,
    });
  };

  const selectedBangunan = bangunanList.find(
    (b) => b.id_bangunan == formData.id_bangunan
  );
  const maxLantai = selectedBangunan ? selectedBangunan.lantai : 10; // default 10 if not found

  return (
    // No header if inside modal

    <div className="w-full h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column: Form Inputs */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full overflow-hidden">
        {/* Header - Fixed if not canceled */}
        {!onCancel && (
          <div className="flex items-center gap-4 mb-2 shrink-0">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold font-gray-800 dark:text-white">
              {isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
            </h1>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold mb-3 border-b pb-2 flex items-center gap-2 text-gray-800 dark:text-white">
              <FaDoorOpen className="text-primary" /> Detail Ruangan
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500 uppercase">
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
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm appearance-none"
                    required
                  >
                    <option value="">-- Pilih Gedung --</option>
                    {bangunanList.map((b) => (
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
                  <label className="block text-xs font-semibold mb-1 text-gray-500 uppercase">
                    Lantai *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.nomor_lantai}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nomor_lantai: parseInt(e.target.value),
                        })
                      }
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm appearance-none"
                      disabled={
                        !formData.id_bangunan || lantaiList.length === 0
                      }
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {lantaiList.map((l) => (
                        <option
                          key={l.id_lantai_gambar}
                          value={l.nama_file.replace(/\D/g, "")}
                        >
                          Lantai {l.nama_file.replace(/\D/g, "")}
                        </option>
                      ))}
                    </select>
                    <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500 uppercase">
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
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

              <div className="flex bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg gap-3 items-center">
                <FaMapMarkerAlt className="text-blue-500 text-xl" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-bold">Posisi Pin:</p>
                  {formData.posisi_x ? (
                    <p>
                      X: {Math.round(formData.posisi_x)}%, Y:{" "}
                      {Math.round(formData.posisi_y)}%
                    </p>
                  ) : (
                    <p>Belum diset (Klik di denah)</p>
                  )}
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
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
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
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900/50 dark:to-gray-800/50 shrink-0">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary animate-bounce" /> Plot
            Lokasi Ruangan
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            {formData.posisi_x && formData.posisi_y ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                ✓ Pin telah diset
              </span>
            ) : (
              <span className="text-orange-500 dark:text-orange-400 font-medium">
                ⚠ Klik denah untuk mengatur pin
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden relative flex items-center justify-center p-4">
          {currentFloorImage ? (
            <div
              className="relative inline-block shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
              style={{ maxHeight: "100%", maxWidth: "100%" }}
              title="Klik untuk mengatur posisi pin ruangan"
            >
              {/* Overlay instruction - shown on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none flex items-start justify-center pt-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                  Klik untuk menandai lokasi
                </div>
              </div>

              <img
                src={
                  currentFloorImage.startsWith("http")
                    ? currentFloorImage
                    : currentFloorImage.startsWith("/img")
                    ? currentFloorImage // Path dari public folder Next.js
                    : `${
                        process.env.NEXT_PUBLIC_API_BASE_URL || ""
                      }/${currentFloorImage.replace(/^\//, "")}`
                }
                alt="Denah Lantai"
                className="block max-w-full max-h-full h-auto w-auto object-contain cursor-crosshair"
                style={{ maxHeight: "80vh" }}
                onClick={handleImageClick}
                onError={(e) => {
                  console.error("Failed to load image:", currentFloorImage);
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              {formData.posisi_x && formData.posisi_y && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 animate-pulse cursor-pointer"
                  style={{
                    left: `${formData.posisi_x}%`,
                    top: `${formData.posisi_y}%`,
                  }}
                  title={`Posisi: X=${Math.round(
                    formData.posisi_x
                  )}%, Y=${Math.round(formData.posisi_y)}%`}
                >
                  <FaMapMarkerAlt
                    className={`text-4xl drop-shadow-lg hover:scale-125 transition-transform ${
                      formData.pin_style === "blue"
                        ? "text-blue-500"
                        : formData.pin_style === "green"
                        ? "text-green-500"
                        : formData.pin_style === "yellow"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  />
                  {/* Pin label */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {formData.nama_ruangan || "Ruangan"}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <FaLayerGroup className="text-6xl mx-auto mb-3 opacity-30" />
              <p>Pilih Gedung dan Lantai untuk memuat denah</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
