import React from "react";

/**
 * EditRuanganForm
 *
 * Form modal untuk membuat/mengubah data ruangan dan memilih posisi pin di denah lantai.
 */

type RuanganForm = {
  nama_ruangan: string;
  nomor_lantai: number;
  nama_jurusan: string;
  nama_prodi: string;
  pin_style: string;
  posisi_x: number | null;
  posisi_y: number | null;
};

type Props = {
  visible: boolean;
  isDark: boolean;
  selectedRuanganForEdit: any | null;
  selectedLantaiForRuangan: number | null;
  ruanganForm: RuanganForm;
  maxLantai: number;
  isSaving: boolean;
  onChange: (partial: Partial<RuanganForm>) => void;
  onSave: () => void;
  onUpdate: () => void;
  onClose: () => void;
  onOpenPinPicker: () => void;
};

export default function EditRuanganForm(props: Props) {
  const {
    visible,
    isDark,
    selectedRuanganForEdit,
    selectedLantaiForRuangan,
    ruanganForm,
    maxLantai,
    isSaving,
    onChange,
    onSave,
    onUpdate,
    onClose,
    onOpenPinPicker,
  } = props;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 h-[70vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedRuanganForEdit ? "Edit Ruangan" : "Buat Ruangan"}
            {selectedLantaiForRuangan
              ? ` - Lantai ${selectedLantaiForRuangan}`
              : ""}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Ruangan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ruanganForm.nama_ruangan}
                onChange={(e) => onChange({ nama_ruangan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan nama ruangan"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nomor Lantai <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={ruanganForm.nomor_lantai || ""}
                onChange={(e) =>
                  onChange({ nomor_lantai: parseInt(e.target.value) || 1 })
                }
                min={1}
                max={maxLantai || 1}
                disabled={!selectedRuanganForEdit} // Disable when creating new room
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  !selectedRuanganForEdit
                    ? "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maksimal: {maxLantai || 1}
                {!selectedRuanganForEdit &&
                  " (Otomatis sesuai lantai yang dipilih)"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jurusan
              </label>
              <input
                type="text"
                value={ruanganForm.nama_jurusan}
                onChange={(e) => onChange({ nama_jurusan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan nama jurusan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program Studi
              </label>
              <input
                type="text"
                value={ruanganForm.nama_prodi}
                onChange={(e) => onChange({ nama_prodi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan nama program studi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pin Style
              </label>
              <select
                value={ruanganForm.pin_style}
                onChange={(e) => onChange({ pin_style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="default">Default</option>
                <option value="ruang_kelas">Ruang Kelas</option>
                <option value="laboratorium">Laboratorium</option>
                <option value="kantor">Kantor</option>
                <option value="ruang_rapat">Ruang Rapat</option>
                <option value="perpustakaan">Perpustakaan</option>
                <option value="kantin">Kantin</option>
                <option value="toilet">Toilet</option>
                <option value="gudang">Gudang</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Posisi Pin
              </label>
              <button
                type="button"
                onClick={onOpenPinPicker}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-map-marker-alt text-xs"></i>
                {ruanganForm.posisi_x && ruanganForm.posisi_y
                  ? "Ubah Posisi Pin"
                  : "Tentukan Posisi Pin"}
              </button>
              {ruanganForm.posisi_x && ruanganForm.posisi_y && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Posisi pin sudah ditentukan (X: {ruanganForm.posisi_x}, Y:{" "}
                  {ruanganForm.posisi_y})
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Klik untuk memilih posisi pin pada gambar lantai
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 mt-4 px-6 pb-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={selectedRuanganForEdit ? onUpdate : onSave}
            disabled={!ruanganForm.nama_ruangan.trim() || isSaving}
            className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save text-sm"></i>
                {selectedRuanganForEdit ? "Update Ruangan" : "Simpan Ruangan"}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
