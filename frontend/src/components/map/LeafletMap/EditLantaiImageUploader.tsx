import React, { useState } from "react";

/**
 * EditLantaiImageUploader
 *
 * Komponen untuk mengelola gambar denah tiap lantai pada suatu bangunan.
 * Menampilkan list lantai dengan tombol tambah lantai yang akan mengubah tabel bangunan kolom lantai menjadi +1.
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
  onAddLantai?: () => void;
  onEditRuangan: (lantaiNumber: number) => void;
  onEditExistingRuangan: (ruangan: any) => void;
  onBuatRuangan: (lantaiNumber: number) => void;
  onDeleteRuangan: (ruangan: any) => void; // Tambahan untuk hapus ruangan
  savedLantaiFiles: Record<number, boolean>;
  ruanganList: any[]; // Tambahan untuk data ruangan
  onDeleteLantai: (lantaiNumber: number) => void; // Tambahan untuk hapus lantai
  onEditLantai: (lantaiNumber: number) => void; // Tambahan untuk edit lantai
  isSaving?: boolean; // Tambahan untuk loading state
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
    onAddLantai,
    onEditRuangan,
    onEditExistingRuangan,
    onBuatRuangan,
    onDeleteRuangan,
    savedLantaiFiles,
    ruanganList,
    onDeleteLantai,
    onEditLantai,
    isSaving = false,
  } = props;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [showSvgPreview, setShowSvgPreview] = useState<number | null>(null);
  const [showRoomListModal, setShowRoomListModal] = useState<number | null>(
    null
  );

  if (!visible) return null;

  // Fungsi untuk menghitung jumlah ruangan per lantai
  const getRuanganCountByLantai = (lantaiNumber: number) => {
    return ruanganList.filter(
      (ruangan) => Number(ruangan.nomor_lantai) === lantaiNumber
    ).length;
  };

  // Fungsi untuk menampilkan preview SVG dalam modal
  const handleShowSvgPreview = (lantaiNumber: number) => {
    setShowSvgPreview(lantaiNumber);
  };

  // Fungsi untuk menampilkan konfirmasi hapus lantai
  const handleShowDeleteConfirm = (lantaiNumber: number) => {
    setShowDeleteConfirm(lantaiNumber);
  };

  // Fungsi untuk membatalkan hapus lantai
  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Fungsi untuk konfirmasi hapus lantai
  const handleConfirmDelete = (lantaiNumber: number) => {
    onDeleteLantai(lantaiNumber);
    setShowDeleteConfirm(null);
  };

  // Fungsi untuk mendapatkan ruangan berdasarkan lantai
  const getRuanganByLantai = (lantaiNumber: number) => {
    return ruanganList.filter(
      (ruangan) => Number(ruangan.nomor_lantai) === lantaiNumber
    );
  };

  // Fungsi untuk menampilkan modal list ruangan
  const handleShowRoomList = (lantaiNumber: number) => {
    setShowRoomListModal(lantaiNumber);
  };

  // Fungsi untuk menutup modal list ruangan
  const handleCloseRoomList = () => {
    setShowRoomListModal(null);
  };

  // Fungsi untuk langsung buka modal edit ruangan
  const handleFloorClick = (lantaiNumber: number) => {
    handleShowRoomList(lantaiNumber);
  };

  // Fungsi untuk edit lantai
  const handleEditLantai = (lantaiNumber: number) => {
    onEditLantai(lantaiNumber);
  };

  return (
    <div>
      {/* Header dengan tombol tambah lantai */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {lantaiCount || 0} Lantai
          </p>
        </div>
        <div className="flex gap-2">
          {onAddLantai && (
            <button
              onClick={onAddLantai}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Tambah Lantai Baru"
            >
              <i className="fas fa-plus text-sm"></i>
              Tambah Lantai
            </button>
          )}
        </div>
      </div>

      {/* List Lantai */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-0.5 mr-2"></i>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">
              Klik pada lantai untuk melihat daftar ruangan
            </p>
            <p className="mt-1 text-xs">
              Setiap lantai dapat diklik untuk menampilkan ruangan yang ada di
              lantai tersebut
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 h-80 overflow-y-auto pr-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
        {Array.from({ length: lantaiCount || 0 }, (_, index) => {
          const lantaiNumber = index + 1;
          const existingLantai = lantaiGambarData.find((l) => {
            const match = (l?.nama_file || "").match(/Lt(\d+)\.svg/i);
            const extractedNumber = match ? parseInt(match[1]) : null;
            return extractedNumber === lantaiNumber;
          });

          const ruanganCount = getRuanganCountByLantai(lantaiNumber);

          return (
            <div
              key={lantaiNumber}
              className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4 transition-all hover:border-primary dark:hover:border-primary-dark cursor-pointer"
              onClick={() => handleFloorClick(lantaiNumber)}
            >
              {/* Lantai Header dengan Layout Baru */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      existingLantai
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {lantaiNumber}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Lantai {lantaiNumber}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {ruanganCount} Ruangan
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {existingLantai ? "SVG tersedia" : "Belum ada SVG"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview SVG yang bisa diklik */}
                {existingLantai && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowSvgPreview(lantaiNumber);
                      }}
                      className="w-16 h-16 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:border-primary dark:hover:border-primary-dark transition-colors cursor-pointer"
                      title="Klik untuk lihat SVG"
                    >
                      <img
                        src={`${
                          existingLantai.path_file.startsWith("http")
                            ? ""
                            : process.env.NEXT_PUBLIC_API_BASE_URL
                        }${
                          existingLantai.path_file.startsWith("/") ? "" : "/"
                        }${existingLantai.path_file}?v=${Date.now()}`}
                        alt={`Lantai ${lantaiNumber}`}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {/* Tombol Edit Lantai */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLantai(lantaiNumber);
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit gambar lantai"
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>

                    {/* Tombol Hapus Lantai */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowDeleteConfirm(lantaiNumber);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Hapus lantai dan semua ruangan"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {(!lantaiCount || lantaiCount === 0) && (
        <div className="text-center py-8">
          <i className="fas fa-building text-gray-400 text-4xl mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            Belum ada lantai yang ditambahkan
          </p>
          {onAddLantai && (
            <button
              onClick={onAddLantai}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tambah Lantai Pertama
            </button>
          )}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Lantai */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-start mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl mt-0.5 mr-3"></i>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Hapus Lantai {showDeleteConfirm}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apakah Anda yakin ingin menghapus lantai {showDeleteConfirm}?
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 mt-0.5 mr-2"></i>
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">PERINGATAN!</p>
                  <p className="mt-1">
                    Semua ruangan di lantai {showDeleteConfirm} (
                    {getRuanganCountByLantai(showDeleteConfirm)} ruangan) dan
                    gallery-nya akan dihapus secara permanen!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmDelete(showDeleteConfirm)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal List Ruangan */}
      {showRoomListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 h-[600px] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Ruangan - Lantai {showRoomListModal}
              </h3>
              <button
                onClick={handleCloseRoomList}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              {/* Tombol Tambah Ruangan */}
              <div className="mb-3 flex justify-end flex-shrink-0">
                <button
                  onClick={() => {
                    onBuatRuangan(showRoomListModal);
                    handleCloseRoomList();
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md shadow-sm transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-plus text-xs"></i>
                  Tambah Ruangan
                </button>
              </div>

              {/* List Ruangan */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {getRuanganByLantai(showRoomListModal).length > 0 ? (
                  getRuanganByLantai(showRoomListModal).map((ruangan) => (
                    <div
                      key={ruangan.id_ruangan}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {ruangan.nama_ruangan}
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {ruangan.nama_jurusan && (
                              <span className="mr-3">
                                <i className="fas fa-building mr-1"></i>
                                {ruangan.nama_jurusan}
                              </span>
                            )}
                            {ruangan.nama_prodi && (
                              <span>
                                <i className="fas fa-graduation-cap mr-1"></i>
                                {ruangan.nama_prodi}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            Pin Style: {ruangan.pin_style}
                            {ruangan.posisi_x && ruangan.posisi_y && (
                              <span className="ml-3">
                                <i className="fas fa-crosshairs mr-1"></i>
                                Posisi: X: {ruangan.posisi_x}, Y:{" "}
                                {ruangan.posisi_y}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onEditExistingRuangan(ruangan);
                              handleCloseRoomList();
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteRuangan(ruangan)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-door-open text-4xl mb-3"></i>
                    <p>Belum ada ruangan di lantai ini</p>
                    <p className="text-sm mt-1">
                      Klik "Tambah Ruangan Baru" untuk membuat ruangan pertama
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview SVG */}
      {showSvgPreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] cursor-pointer"
          onClick={() => setShowSvgPreview(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setShowSvgPreview(null)}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
              >
                ×
              </button>
              <img
                src={`${
                  lantaiGambarData
                    .find((l) => {
                      const match = (l?.nama_file || "").match(/Lt(\d+)\.svg/i);
                      const extractedNumber = match ? parseInt(match[1]) : null;
                      return extractedNumber === showSvgPreview;
                    })
                    ?.path_file.startsWith("http")
                    ? ""
                    : process.env.NEXT_PUBLIC_API_BASE_URL
                }${
                  lantaiGambarData
                    .find((l) => {
                      const match = (l?.nama_file || "").match(/Lt(\d+)?.svg/i);
                      const extractedNumber = match ? parseInt(match[1]) : null;
                      return extractedNumber === showSvgPreview;
                    })
                    ?.path_file.startsWith("/")
                    ? ""
                    : "/"
                }${
                  lantaiGambarData.find((l) => {
                    const match = (l?.nama_file || "").match(/Lt(\d+)?.svg/i);
                    const extractedNumber = match ? parseInt(match[1]) : null;
                    return extractedNumber === showSvgPreview;
                  })?.path_file
                }?v=${Date.now()}`}
                alt={`Lantai ${showSvgPreview}`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
