"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaArrowLeft, FaMapMarkerAlt } from "react-icons/fa";

interface RuanganFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function RuanganForm({
  initialData,
  isEdit = false,
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

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentFloorImage) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData({
      ...formData,
      posisi_x: parseFloat(x.toFixed(2)),
      posisi_y: parseFloat(y.toFixed(2)),
    });
  };

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
        alert("Data berhasil disimpan");
        router.push("/dashboard/ruangan");
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan: ${err.message || err.error}`);
      }
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const selectedBangunan = bangunanList.find(
    (b) => b.id_bangunan == formData.id_bangunan
  );
  const maxLantai = selectedBangunan ? selectedBangunan.lantai : 10; // default 10 if not found

  return (
    <div className="w-full px-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-gray-800 dark:text-white">
          {isEdit ? "Edit Ruangan" : "Tambah Ruangan Baru"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Fields */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">
              Informasi Ruangan
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  value={formData.nama_ruangan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_ruangan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  placeholder="Contoh: R. 101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Gedung *
                </label>
                <select
                  value={formData.id_bangunan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_bangunan: e.target.value,
                      nomor_lantai: 1,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  required
                >
                  <option value="">-- Pilih Gedung --</option>
                  {bangunanList.map((b) => (
                    <option key={b.id_bangunan} value={b.id_bangunan}>
                      {b.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Lantai *
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxLantai}
                  value={formData.nomor_lantai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nomor_lantai: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max lantai: {maxLantai}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Jurusan
                </label>
                <input
                  type="text"
                  value={formData.nama_jurusan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_jurusan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Program Studi
                </label>
                <input
                  type="text"
                  value={formData.nama_prodi}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_prodi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Pin Style
                </label>
                <select
                  value={formData.pin_style}
                  onChange={(e) =>
                    setFormData({ ...formData, pin_style: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                >
                  <option value="default">Default</option>
                  <option value="ruang_kelas">Ruang Kelas</option>
                  <option value="laboratorium">Laboratorium</option>
                  <option value="kantor">Kantor</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
        </div>

        {/* Position Picker */}
        <div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Posisi Pin
            </h3>

            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative border border-gray-300 dark:border-gray-600 min-h-[300px] flex items-center justify-center">
              {currentFloorImage ? (
                <div
                  className="relative w-full h-full cursor-crosshair"
                  onClick={handleImageClick}
                >
                  <img
                    src={currentFloorImage}
                    alt="Denah Lantai"
                    className="w-full h-full object-contain"
                  />
                  {/* Marker */}
                  {formData.posisi_x !== null && formData.posisi_y !== null && (
                    <div
                      className="absolute w-6 h-6 text-red-600 -ml-3 -mt-6 transform transition-all duration-200"
                      style={{
                        left: `${formData.posisi_x}%`,
                        top: `${formData.posisi_y}%`,
                      }}
                    >
                      <FaMapMarkerAlt className="w-full h-full drop-shadow-md" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 p-4">
                  {formData.id_bangunan
                    ? "Gambar denah untuk lantai ini belum tersedia. Silakan upload di menu Manajemen Lantai."
                    : "Pilih Gedung terlebih dahulu."}
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Klik pada gambar denah untuk menentukan posisi pin ruangan.</p>
              {formData.posisi_x && (
                <p className="font-mono mt-1 text-xs">
                  X: {formData.posisi_x}%, Y: {formData.posisi_y}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
