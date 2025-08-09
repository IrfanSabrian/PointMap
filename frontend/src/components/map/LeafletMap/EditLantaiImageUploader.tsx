import React from "react";

/**
 * EditLantaiImageUploader
 *
 * Komponen upload gambar denah tiap lantai pada suatu bangunan.
 */

type Props = {
  visible: boolean;
  isDark: boolean;
  lantaiCount: number;
  selectedLantaiFilter: number;
  onChangeLantaiFilter: (lantai: number) => void;
  lantaiGambarData: Array<any>;
  lantaiFiles: Record<number, File | null>;
  lantaiPreviewUrls: Record<number, string | null>;
  onChooseFile: (lantaiNumber: number, file: File) => void;
  onSave: (lantaiNumber: number) => void;
  onDelete: (lantaiGambarId: number) => void;
  onOpenLantaiCount: () => void;
};

export default function EditLantaiImageUploader(props: Props) {
  const {
    visible,
    isDark,
    lantaiCount,
    selectedLantaiFilter,
    onChangeLantaiFilter,
    lantaiGambarData,
    lantaiFiles,
    lantaiPreviewUrls,
    onChooseFile,
    onSave,
    onDelete,
    onOpenLantaiCount,
  } = props;

  if (!visible) return null;

  const existingLantai = lantaiGambarData.find((l) => {
    const match = (l?.nama_file || "").match(/Lt(\d+)\.svg/i);
    const extractedNumber = match ? parseInt(match[1]) : null;
    return extractedNumber === selectedLantaiFilter;
  });

  const file = lantaiFiles[selectedLantaiFilter] || null;
  const previewUrl = lantaiPreviewUrls[selectedLantaiFilter] || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Edit Lantai Bangunan - {lantaiCount || 0} Lantai
          </label>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Filter Lantai:
            </label>
            <select
              value={selectedLantaiFilter}
              onChange={(e) => onChangeLantaiFilter(parseInt(e.target.value))}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary"
            >
              {Array.from({ length: lantaiCount || 0 }, (_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Lantai {idx + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={onOpenLantaiCount}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors flex items-center gap-1"
          title="Atur Jumlah Lantai"
        >
          <i className="fas fa-cog text-xs"></i>
          Atur Lantai
        </button>
      </div>

      {/* Canvas/Preview SVG Lantai */}
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
        {!existingLantai ? (
          <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-gray-400 text-3xl mb-2"></i>
              <p className="text-gray-500 dark:text-gray-400">
                Gambar SVG untuk lantai {selectedLantaiFilter} tidak ditemukan
              </p>
            </div>
          </div>
        ) : (
          <img
            src={`${existingLantai.path_file.startsWith("http") ? "" : "/"}${
              existingLantai.path_file
            }?v=${Date.now()}`}
            alt={`Lantai ${selectedLantaiFilter}`}
            className="w-full h-auto"
          />
        )}
      </div>

      {/* Upload kontrol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upload SVG Lantai {selectedLantaiFilter}
          </label>
          <input
            type="file"
            accept="image/svg+xml"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChooseFile(selectedLantaiFilter, f);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {file && previewUrl && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview lantai"
                  className="w-12 h-12 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => onChooseFile(selectedLantaiFilter, file)}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={() => onSave(selectedLantaiFilter)}
            disabled={!file}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan
          </button>

          {existingLantai?.id && (
            <button
              onClick={() => onDelete(existingLantai.id)}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
