# Struktur Folder Baru - Berdasarkan ID Bangunan

## Overview

Sistem sekarang menggunakan ID bangunan sebagai nama folder untuk menghindari masalah ketika nama bangunan diubah.

## Struktur Folder

```
frontend/public/img/
├── 27/                                    # ID: Gedung Lab Teknik Informatika
│   ├── thumbnail.jpg                      # Thumbnail bangunan
│   ├── lantai/
│   │   ├── Lt1.svg                       # Peta lantai 1
│   │   ├── Lt2.svg                       # Peta lantai 2
│   │   └── Lt3.svg                       # Peta lantai 3
│   └── ruangan/
│       ├── 1/                            # ID ruangan: Ruang TI-11
│       │   └── thumbnail.jpg
│       ├── 2/                            # ID ruangan: Ruang TI-12
│       │   ├── gallery1.jpg
│       │   ├── gallery2.jpg
│       │   └── gallery3.jpg
│       ├── 3/                            # ID ruangan: Ruang TI-13
│       │   └── thumbnail.jpg
│       └── 4/                            # ID ruangan: Ruang TI-14
│           └── thumbnail.jpg
├── 3/                                     # ID: Jurusan Teknik Mesin
│   ├── thumbnail.jpg
│   ├── lantai/
│   └── ruangan/
└── default/                               # Folder default
    ├── thumbnail.jpg
    ├── lantai/
    │   ├── Lt1.svg
    │   ├── Lt2.svg
    │   ├── Lt3.svg
    │   └── default.svg
    └── ruangan/
        └── thumbnail.jpg
```

## Keuntungan Sistem Baru

### ✅ **Konsistensi**

- Nama folder tidak berubah ketika nama bangunan diubah
- Path tetap stabil dan dapat diprediksi

### ✅ **Skalabilitas**

- Mudah menambah bangunan baru tanpa konflik nama
- Sistem dapat menangani banyak bangunan

### ✅ **Maintenance**

- Tidak perlu rename folder manual
- Database dan file system tetap sinkron

### ✅ **Backward Compatibility**

- Fallback ke path lama masih tersedia
- Sistem tetap berfungsi selama transisi

## Migrasi

### 1. Jalankan Script Migrasi

```bash
node migrate_folders.js
```

### 2. Update Database

- Thumbnail: `img/27/thumbnail.jpg`
- Lantai: `img/27/lantai/Lt1.svg`
- Gallery: `img/27/ruangan/2/gallery1.jpg`

### 3. Update Kode

- LeafletMap: Menggunakan `selectedFeature.properties?.id`
- Building-details: Menggunakan `buildingData.id_bangunan`

## Fallback System

### Thumbnail

1. `selectedFeature.properties?.thumbnail` (dari database)
2. `/img/${id_bangunan}/thumbnail.jpg`
3. `/img/default/thumbnail.jpg`

### Lantai

1. `lantaiData.path_file` (dari database)
2. `/img/${id_bangunan}/lantai/Lt${lantai}.svg`
3. `/img/default/lantai/Lt${lantai}.svg`
4. `/img/default/lantai/default.svg`

### Gallery

1. `ruanganGalleryData` (dari database)
2. `/img/${id_bangunan}/ruangan/${id_ruangan}/gallery1.jpg`
3. `/img/default/ruangan/thumbnail.jpg`

## Contoh Penggunaan

### Menambah Bangunan Baru

1. Insert ke tabel `bangunan` dengan ID baru
2. Buat folder `img/{id_bangunan}/`
3. Upload file thumbnail, lantai, dan gallery
4. Insert data ke tabel `lantai_gambar` dan `ruangan_gallery`

### Mengubah Nama Bangunan

1. Update nama di tabel `bangunan`
2. Folder tetap sama (berdasarkan ID)
3. Tidak perlu mengubah path file

### Menambah Ruangan Baru

1. Insert ke tabel `ruangan` dengan ID baru
2. Buat folder `img/{id_bangunan}/ruangan/{id_ruangan}/`
3. Upload file gallery
4. Insert data ke tabel `ruangan_gallery`
