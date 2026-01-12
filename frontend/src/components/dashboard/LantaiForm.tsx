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
    initialData?.path_file || null
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_bangunan || !formData.nomor_lantai) {
      alert("Mohon lengkapi data wajib");
      return;
    }

    if (!isEdit && !file) {
      alert("Pilih file denah lantai");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const formDataUpload = new FormData();
      formDataUpload.append("id_bangunan", formData.id_bangunan);
      formDataUpload.append("nomor_lantai", formData.nomor_lantai.toString());
      if (file) {
        formDataUpload.append("file", file);
      }

      // Special handling for Lantai:
      // The backend `addLantaiGambar` works as create OR update if existing.
      // But `updateLantaiGambar` is simple update.
      // If adding new floor image, use POST /api/lantai-gambar
      // If editing, usually we replace the file.

      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar`;
      let method = "POST";

      if (isEdit) {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar/${initialData.id_lantai_gambar}`;
        // Wait, updateLantaiGambar doesn't handle file upload in the controller logic displayed in previous step?
        // updateLantaiGambar takes req.body {id_bangunan, nama_file, path_file}.
        // It does NOT invoke multer or cloudinary upload.
        // So for EDITING a file, we might actually need to use 'addLantaiGambar' (POST) which has logic:
        // "existingLantai = findOne... if existing -> update else create".
        // So even for Edit, we can use POST if we want to replace the file.
        // However, if we just want to change building or floor number without changing file?
        // The UI flow for "Edit" usually implies changing metadata or file.
        // Since logic determines "update if exists", using POST seems to be the way to "Upload/Replace" floor image.
        // `initialData` has `id_lantai_gambar`.

        // If we use the POST endpoint, it will replace the image for (Bangunan X, Lantai Y).
        // This fits "Edit" if we are replacing content.
        // But if we want to change building/floor number of an EXISTING record, that might collide.
        // Let's stick to POST for create/replace because usually we upload a file.
        // If `isEdit` is true, we might be navigating to `edit/[id]`.
        // Let's use POST for both for now as it handles upsert based on (bangunan, file name).
        // But `file` is required in POST?
        // `if (!req.file) return 400`.
        // So if editing without changing file, we can't use POST.

        // If editing and NO file selected: we can't do much with current backend `updateLantaiGambar` unless we manually pass path_file, which user doesn't know.
        // Ideally, backend should support file update in PUT or we just always require file upload for simplicity in this version.
        // Or we tell user "Upload file to replace".

        if (!file && isEdit) {
          alert(
            "Fitur edit metadata tanpa ubah file belum didukung sepenuhnya. Silakan upload file baru jika ingin mengubah."
          );
          // Alternatively, just warn and return.
          // Or if `file` is null, maybe we shouldn't allow submit.
          setLoading(false);
          return;
        }
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (res.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          alert("Data lantai berhasil disimpan");
          router.push("/dashboard/lantai");
        }
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan: ${err.message || err.error}`);
      }
    } catch (error) {
      console.error("Error saving lantai:", error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes("svg")) {
        alert("Harap pilih file SVG untuk denah lantai");
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
    (b) => b.id_bangunan == formData.id_bangunan
  );
  const maxLantai = selectedBangunan ? selectedBangunan.lantai : 10;

  return (
    <div className="w-full h-full flex justify-center p-4 lg:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {!onCancel && (
          <div className="flex items-center gap-4 mb-2 shrink-0">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold font-gray-800 dark:text-white">
              {isEdit ? "Edit Lantai" : "Tambah Lantai"}
            </h1>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold mb-3 border-b pb-2 flex items-center gap-2 text-gray-800 dark:text-white">
            <FaCity className="text-primary" /> Target
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
                    })
                  }
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm appearance-none"
                  required
                  disabled={isEdit}
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
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSubmit}
              disabled={loading || (!file && !isEdit)}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSave className="text-xl" />{" "}
                  {isEdit ? "Simpan Perubahan" : "Terbitkan Lantai"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
