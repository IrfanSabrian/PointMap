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
  FaCity,
  FaMapMarkedAlt,
  FaImage,
  FaUpload,
} from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";
import { useCampus } from "@/hooks/useCampus";

// Import MapEditor for drawing building polygons
const MapEditor = dynamic(() => import("@/components/MapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-900 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  ),
});

interface BangunanFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BangunanForm({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
}: BangunanFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<any>(null); // Ref to access LeafletMap methods
  const { selectedCampus } = useCampus();

  const [formData, setFormData] = useState({
    nama: initialData?.nama || "",
    interaksi: initialData?.interaksi || "Noninteraktif",
    lantai: initialData?.lantai || 1,
    kategori_kampus: initialData?.kategori_kampus || selectedCampus.name,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail || null,
  );

  // State for drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnGeoJSON, setDrawnGeoJSON] = useState<any>(() => {
    if (!initialData?.geometri) return null;

    try {
      const geometri =
        typeof initialData.geometri === "string"
          ? JSON.parse(initialData.geometri)
          : initialData.geometri;

      // Jika geometri sudah dalam format Feature, return as is
      if (geometri.type === "Feature") {
        return geometri;
      }

      // Jika geometri dalam format geometry saja (Polygon/MultiPolygon),
      // wrap menjadi Feature untuk MapEditor
      if (geometri.type === "Polygon" || geometri.type === "MultiPolygon") {
        return {
          type: "Feature",
          properties: {},
          geometry: geometri,
        };
      }

      return geometri;
    } catch (e) {
      console.error("Error parsing initial geometry:", e);
      return null;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama) {
      showToast("Nama gedung wajib diisi", "warning");
      return;
    }

    if (!drawnGeoJSON) {
      showToast("Harap gambar gedung di peta terlebih dahulu", "warning");
      return;
    }

    // Validate geometry structure
    if (!drawnGeoJSON.type || !drawnGeoJSON.geometry) {
      showToast(
        "Geometry tidak valid. Pastikan Anda telah menggambar polygon gedung dengan benar.",
        "error",
      );
      console.error("Invalid geometry structure:", drawnGeoJSON);
      return;
    }

    // Validate geometry type
    if (
      drawnGeoJSON.geometry.type !== "Polygon" &&
      drawnGeoJSON.geometry.type !== "MultiPolygon"
    ) {
      showToast(
        "Tipe geometry harus berupa Polygon atau MultiPolygon",
        "error",
      );
      console.error("Invalid geometry type:", drawnGeoJSON.geometry.type);
      return;
    }

    // Validate coordinates exist
    if (
      !drawnGeoJSON.geometry.coordinates ||
      drawnGeoJSON.geometry.coordinates.length === 0
    ) {
      showToast(
        "Koordinat geometry kosong. Pastikan polygon telah digambar dengan benar.",
        "error",
      );
      console.error("Missing coordinates:", drawnGeoJSON.geometry);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${initialData.id_bangunan}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan`;

      const method = isEdit ? "PUT" : "POST";

      console.log("🏗️ Building operation:", {
        mode: isEdit ? "EDIT" : "ADD",
        id: initialData?.id_bangunan,
        url: url,
        method: method,
      });

      // Extract geometry dari Feature GeoJSON
      // Jika drawnGeoJSON adalah Feature, ambil hanya geometry-nya
      let geometryToSave;
      if (drawnGeoJSON.type === "Feature" && drawnGeoJSON.geometry) {
        geometryToSave = drawnGeoJSON.geometry;
      } else if (
        drawnGeoJSON.type === "Polygon" ||
        drawnGeoJSON.type === "MultiPolygon"
      ) {
        geometryToSave = drawnGeoJSON;
      } else {
        showToast("Format geometry tidak valid", "error");
        console.error("Invalid geometry format:", drawnGeoJSON);
        setLoading(false);
        return;
      }

      // Prepare geometry string (hanya geometry, bukan Feature)
      const geometriString = JSON.stringify(geometryToSave);

      const bodyData = {
        ...formData,
        geometri: geometriString,
      };

      // Log data for debugging
      console.log("📝 Saving building with data:", {
        nama: bodyData.nama,
        interaksi: bodyData.interaksi,
        lantai: bodyData.lantai,
        kategori_kampus: bodyData.kategori_kampus,
        geometri: geometryToSave, // Log as object for better readability
      });
      console.log("🗺️ Full body data keys:", Object.keys(bodyData));
      console.log("🗺️ Geometry string length:", geometriString.length);
      console.log("🗺️ Geometry type:", geometryToSave.type);
      console.log(
        "🗺️ Coordinates count:",
        geometryToSave.coordinates[0]?.length || 0,
      );

      // Validate token exists
      if (!token) {
        showToast("Sesi Anda telah berakhir. Silakan login kembali.", "error");
        window.location.href = "/login";
        setLoading(false);
        return;
      }

      console.log("🔑 Token exists:", token ? "Yes" : "No");

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("❌ Failed to save building:", res.status, errorBody);

        // Handle authentication errors
        if (res.status === 401 || res.status === 403) {
          showToast(
            "Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.",
            "error",
          );
          localStorage.removeItem("token");
          window.location.href = "/login";
          setLoading(false);
          return;
        }

        throw new Error(`Gagal menyimpan data: ${res.status} - ${errorBody}`);
      }

      const data = await res.json();
      console.log("✅ Save response:", data);

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
          },
        );
      }

      showToast("Data gedung berhasil disimpan!", "success");

      // Dispatch event untuk memberitahu komponen lain bahwa data bangunan telah berubah
      window.dispatchEvent(new CustomEvent("bangunan-data-changed"));

      // Call onSuccess callback if provided (for modal usage)
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/bangunan");
      }
    } catch (error) {
      console.error("Error saving:", error);
      showToast("Terjadi kesalahan saat menyimpan data", "error");
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

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
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
    <div className="w-full h-full flex flex-col lg:flex-row gap-3 sm:gap-6">
      {/* Left Column: Form Inputs - Scrollable if needed but optimized to fit */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {!onCancel && (
          <div className="flex items-center gap-2 sm:gap-4 mb-2 shrink-0">
            <button
              onClick={handleBack}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold font-gray-800 dark:text-white">
              {isEdit ? "Edit Gedung" : "Tambah Gedung"}
            </h1>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 border-b pb-1 sm:pb-2 flex items-center gap-2">
            <FaCity className="text-primary" /> Informasi Dasar
          </h3>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                Nama Gedung *
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                placeholder="Contoh: Gedung Rektorat"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                  Lantai *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.lantai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lantai: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-gray-500 uppercase">
                  Interaksi
                </label>
                <select
                  value={formData.interaksi}
                  onChange={(e) =>
                    setFormData({ ...formData, interaksi: e.target.value })
                  }
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                >
                  <option value="Noninteraktif">Non-Interaktif</option>
                  <option value="Interaktif">Interaktif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 border-b pb-1 sm:pb-2 flex items-center gap-2">
            <FaImage className="text-primary" /> Thumbnail
          </h3>
          <div className="flex gap-4 items-start">
            {thumbnailPreview ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                <img
                  src={(() => {
                    if (!thumbnailPreview) return "";
                    // If it's a data URL, use it directly
                    if (thumbnailPreview.startsWith("data:"))
                      return thumbnailPreview;

                    // If it is http/https, use it
                    if (thumbnailPreview.startsWith("http"))
                      return thumbnailPreview;

                    // Otherwise treat as relative path
                    return `/${thumbnailPreview.replace(/^\//, "")}`;
                  })()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                <FaImage className="text-2xl" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide h-24"
              >
                <div className="text-center">
                  <FaUpload className="mx-auto mb-1 text-lg" />
                  {thumbnailPreview ? "Ganti" : "Upload"}
                </div>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-1.5 sm:py-3 px-3 sm:px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow duration-300 flex items-center justify-center gap-2 shrink-0 mt-auto text-xs sm:text-base"
        >
          {loading ? (
            "Menyimpan..."
          ) : (
            <>
              <FaSave /> Simpan Gedung
            </>
          )}
        </button>
      </div>

      {/* Right Column: Map Editor - Takes remaining space */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:border-gray-900/50 shrink-0">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FaDrawPolygon className="text-primary" /> Editor Geometri
          </h3>
          <div className="flex items-center gap-3">
            {/* Geometry Status Indicator */}
            <div className="flex items-center gap-2">
              {drawnGeoJSON &&
              drawnGeoJSON.geometry &&
              drawnGeoJSON.geometry.coordinates ? (
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    Geometry Valid
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    ({drawnGeoJSON.geometry.type})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    Belum Digambar
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>{" "}
                Gambar Polygon
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>{" "}
                Edit
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative min-h-[300px]">
          <MapEditor
            onGeometryChange={(geo: any) => setDrawnGeoJSON(geo)}
            initialGeometry={drawnGeoJSON}
            isEdit={isEdit}
            campus={selectedCampus}
          />
        </div>

        {/* Overlay removed as per user request to avoid distraction */}
        {/* {!drawnGeoJSON && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400] bg-black/5">
            <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-xl border border-blue-100 text-center max-w-sm">
              <FaMapMarkedAlt className="text-4xl text-blue-500 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Area Belum Digambar</p>
              <p className="text-xs text-gray-600 mt-1">
                Gunakan toolbar peta untuk menggambar area gedung.
              </p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
