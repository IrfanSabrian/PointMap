"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaArrowLeft, FaUpload, FaImages } from "react-icons/fa";

export default function GaleriForm() {
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
        // We can fetch all rooms or filter by building.
        // Assuming there is an endpoint for rooms by building? Yes: /api/ruangan?id_bangunan=... or filter globally.
        // Currently api/ruangan returns all.
        // Or api/ruangan/bangunan/:id ?
        // Let's check api/ruangan endpoints again.
        // In Step 112: `getRuanganByBangunan` exists at `GET /api/ruangan/bangunan/:id_bangunan` (Step 112 lines 51-77).
        // It returns rooms grouped by floor.
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
        alert("Foto berhasil diupload");
        router.push("/dashboard/galeri");
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-gray-800 dark:text-white">
          Upload Galeri Ruangan
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Target Upload
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">Gedung *</label>
              <select
                value={selectedBangunan}
                onChange={(e) => setSelectedBangunan(e.target.value)}
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
                Ruangan *
              </label>
              <select
                value={selectedRuangan}
                onChange={(e) => setSelectedRuangan(e.target.value)}
                disabled={!selectedBangunan}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent disabled:opacity-50"
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
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">
              Pilih Foto
            </h3>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="gallery-upload"
                disabled={!selectedRuangan}
              />
              <label
                htmlFor="gallery-upload"
                className={`cursor-pointer block ${
                  !selectedRuangan ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Klik untuk upload foto (Bisa banyak)
                </span>
              </label>
            </div>

            {!selectedRuangan && (
              <p className="text-xs text-red-500 mt-2">
                * Pilih ruangan terlebih dahulu
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
          <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex justify-between items-center">
            Preview ({files.length})
            {files.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-sm bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark transition"
              >
                {loading ? "Mengupload..." : "Upload Semua"}
              </button>
            )}
          </h3>

          <div className="flex-1 overflow-y-auto">
            {previews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FaImages className="text-4xl mb-2" />
                <p>Belum ada foto dipilih</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={src}
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
