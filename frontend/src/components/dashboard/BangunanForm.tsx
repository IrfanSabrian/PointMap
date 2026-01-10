"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  FaSave,
  FaArrowLeft,
  FaDrawPolygon,
  FaEraser,
  FaImages,
} from "react-icons/fa";

// Import LeafletMap dynamically to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-gray-100 animate-pulse rounded-lg">
      Loading Map...
    </div>
  ),
});

interface BangunanFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function BangunanForm({
  initialData,
  isEdit = false,
}: BangunanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<any>(null); // Ref to access LeafletMap methods

  const [formData, setFormData] = useState({
    nama: initialData?.nama || "",
    interaksi: initialData?.interaksi || "Noninteraktif",
    lantai: initialData?.lantai || 1,
    geometri: initialData?.geometri || null,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail || null
  );

  // State for drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnGeoJSON, setDrawnGeoJSON] = useState<any>(
    initialData?.geometri
      ? typeof initialData.geometri === "string"
        ? JSON.parse(initialData.geometri)
        : initialData.geometri
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama) {
      alert("Nama gedung wajib diisi");
      return;
    }

    if (!drawnGeoJSON) {
      alert("Harap gambar gedung di peta terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${initialData.id_bangunan}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`;

      const method = isEdit ? "PUT" : "POST";

      const bodyData = {
        ...formData,
        geometri: JSON.stringify(drawnGeoJSON),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      const data = await res.json();
      const newId = isEdit ? initialData.id_bangunan : data.data.id_bangunan;

      // Upload thumbnail if exists
      if (thumbnail) {
        const formDataUpload = new FormData();
        formDataUpload.append("thumbnail", thumbnail);

        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${newId}/upload-thumbnail`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataUpload,
          }
        );
      }

      alert("Data berhasil disimpan!");
      router.push("/dashboard/bangunan");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback to receive drawn geometry from LeafletMap
  // We need to implement this capability in LeafletMap component
  const handleMapReady = (mapInstance: any) => {
    // This function will be passed to LeafletMap to hook into Geoman events
    // But since LeafletMap is complex, we might need a different approach.
    // Ideally LeafletMap should expose an `onDrawCreate` prop.
  };

  return (
    <div className="w-full px-4 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-gray-800 dark:text-white">
          {isEdit ? "Edit Gedung" : "Tambah Gedung Baru"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">
              Informasi Dasar
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Gedung
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  placeholder="Contoh: Gedung AB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status Interaksi
                </label>
                <select
                  value={formData.interaksi}
                  onChange={(e) =>
                    setFormData({ ...formData, interaksi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                >
                  <option value="Noninteraktif">Noninteraktif</option>
                  <option value="Interaktif">Interaktif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Jumlah Lantai
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lantai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lantai: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Thumbnail
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer block"
                  >
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="py-4">
                        <FaImages className="mx-auto text-3xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Klik untuk upload foto
                        </span>
                      </div>
                    )}
                  </label>
                </div>
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
                    <FaSave /> Simpan Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Map Drawing Area */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FaDrawPolygon /> Area Gedung
              </h3>
              <div className="text-sm text-gray-500">
                Gunakan alat gambar di peta untuk menentukan area gedung
              </div>
            </div>

            <div className="flex-1 relative">
              {/* IMPORTANT: We need to pass drawing props to LeafletMap or use a simpler map for this form */}
              {/* Using the existing LeafletMap might be complex because it has too much logic for viewing. */}
              {/* However, reusing it ensures consistency. We need to Enable Drawing Mode. */}
              <LeafletMap
                isDashboard={true} // Reusing dashboard prop to potentially enable edit controls
                initialFeature={drawnGeoJSON}
                onGeometryChange={(geo) => setDrawnGeoJSON(geo)}
              />

              {/* Instructions Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur p-3 rounded-lg text-xs z-[1000] border border-gray-200 dark:border-gray-700">
                <p>
                  <strong>Cara Menggambar:</strong>
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>
                    Klik ikon <strong>Polygon</strong> (segi lima) di toolbar
                    peta.
                  </li>
                  <li>
                    Klik pada peta untuk membuat titik-titik sudut gedung.
                  </li>
                  <li>Klik titik awal lagi untuk menutup bentuk.</li>
                  <li>
                    Klik ikon <strong>Edit</strong> untuk mengubah bentuk yang
                    sudah ada.
                  </li>
                  <li>
                    Klik ikon <strong>Hapus</strong> untuk menghapus bentuk.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
