"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaArrowLeft, FaUpload, FaImage } from "react-icons/fa";

interface LantaiFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function LantaiForm({
  initialData,
  isEdit = false,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

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
        alert("Gambar lantai berhasil disimpan");
        router.push("/dashboard/lantai");
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan: ${err.message || err.error}`);
      }
    } catch (error) {
      console.error("Error saving floor:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const selectedBangunan = bangunanList.find(
    (b) => b.id_bangunan == formData.id_bangunan
  );
  const maxLantai = selectedBangunan ? selectedBangunan.lantai : 10;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-gray-800 dark:text-white">
          {isEdit ? "Upload Ulang Lantai" : "Tambah Gambar Lantai"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Gedung *</label>
          <select
            value={formData.id_bangunan}
            onChange={(e) =>
              setFormData({ ...formData, id_bangunan: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
            required
            disabled={isEdit} // Disable changing building/floor on edit to avoid confusion with upsert logic
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
            Nomor Lantai *
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
            disabled={isEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            File Denah (SVG) {isEdit && "(Upload untuk mengganti)"}
          </label>
          <div
            className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
              !formData.id_bangunan ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="file"
              accept=".svg"
              onChange={handleFileChange}
              className="hidden"
              id="floor-upload"
              disabled={!formData.id_bangunan}
            />
            <label htmlFor="floor-upload" className="cursor-pointer block">
              {preview ? (
                <div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-60 mx-auto object-contain mb-2"
                  />
                  <p className="text-sm text-green-600">
                    File terpilih: {file?.name || "Gambar saat ini"}
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    Klik untuk upload file SVG
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Format wajib: .svg
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (!file && !isEdit)}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-4"
        >
          {loading ? (
            "Mengupload..."
          ) : (
            <>
              <FaSave /> {isEdit ? "Update Gambar" : "Upload Gambar"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
