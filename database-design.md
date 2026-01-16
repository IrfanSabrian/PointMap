# Desain Basis Data PointMap

## Database Schema (dbdiagram.io)

Kode berikut dapat di-paste ke [dbdiagram.io](https://dbdiagram.io/) untuk visualisasi ERD:

```dbml
Table admin {
  id_admin int [pk, increment, note: 'Primary Key']
  username varchar(50) [unique, not null, note: 'Username admin untuk login']
  password varchar(100) [not null, note: 'Password terenkripsi menggunakan bcrypt']
}

Table bangunan {
  id_bangunan int [pk, increment, note: 'Primary Key']
  nama varchar(100) [note: 'Nama gedung/bangunan']
  interaksi enum('Interaktif','Noninteraktif') [note: 'Tipe interaksi: Interaktif (memiliki data lantai & ruangan) atau Noninteraktif (hanya tampilan)']
  lantai int [note: 'Jumlah lantai pada bangunan']
  geometri text [note: 'Data geometri polygon GeoJSON untuk posisi bangunan di peta']
  thumbnail varchar(500) [note: 'Path file thumbnail gambar bangunan']
  kategori_kampus varchar(100) [default: 'Politeknik Negeri Pontianak', note: 'Nama kampus: Politeknik Negeri Pontianak, PSDKU Sanggau, PDD Kapuas Hulu, PSDKU Sukamara']

  indexes {
    kategori_kampus [name: 'idx_bangunan_kampus']
  }
}

Table lantai_gambar {
  id_lantai_gambar int [pk, increment, note: 'Primary Key']
  id_bangunan int [not null, ref: > bangunan.id_bangunan, note: 'Foreign Key ke tabel bangunan']
  nama_file varchar(255) [not null, note: 'Nama file denah lantai (misal: Lt1.svg, Lt2.svg)']
  path_file varchar(500) [not null, note: 'Path file SVG denah lantai']
  created_at timestamp [default: `current_timestamp()`, note: 'Tanggal dibuat']
}

Table ruangan {
  id_ruangan int [pk, increment, note: 'Primary Key']
  nama_ruangan varchar(100) [not null, note: 'Nama ruangan']
  nomor_lantai int [not null, note: 'Nomor lantai tempat ruangan berada']
  id_bangunan int [not null, ref: > bangunan.id_bangunan, note: 'Foreign Key ke tabel bangunan']
  nama_jurusan varchar(100) [note: 'Nama jurusan yang menempati ruangan (opsional)']
  nama_prodi varchar(100) [note: 'Nama program studi yang menempati ruangan (opsional)']
  pin_style varchar(50) [default: 'default', note: 'Style pin marker pada denah: default, ruang_kelas, kantor, dll']
  posisi_x decimal(10,2) [note: 'Posisi X (horizontal) pin marker pada denah lantai SVG (dalam persen)']
  posisi_y decimal(10,2) [note: 'Posisi Y (vertikal) pin marker pada denah lantai SVG (dalam persen)']
}

Table ruangan_gallery {
  id_gallery int [pk, increment, note: 'Primary Key']
  id_ruangan int [not null, ref: > ruangan.id_ruangan, note: 'Foreign Key ke tabel ruangan']
  nama_file varchar(255) [not null, note: 'Nama file foto galeri']
  path_file varchar(500) [not null, note: 'Path file foto galeri ruangan']
  created_at timestamp [default: `current_timestamp()`, note: 'Tanggal dibuat']
}

// Relasi antar tabel
Ref: lantai_gambar.id_bangunan > bangunan.id_bangunan [delete: cascade]
Ref: ruangan.id_bangunan > bangunan.id_bangunan [delete: cascade]
Ref: ruangan_gallery.id_ruangan > ruangan.id_ruangan [delete: cascade]
```

## Penjelasan Entitas dan Atribut

### 1. Tabel `admin`

Tabel untuk menyimpan data administrator sistem.

**Atribut:**

- `id_admin` (INT, PK, AUTO_INCREMENT): ID unik untuk setiap admin
- `username` (VARCHAR(50), UNIQUE, NOT NULL): Username untuk login
- `password` (VARCHAR(100), NOT NULL): Password terenkripsi menggunakan bcrypt

### 2. Tabel `bangunan`

Tabel untuk menyimpan data gedung/bangunan yang ada di peta kampus.

**Atribut:**

- `id_bangunan` (INT, PK, AUTO_INCREMENT): ID unik untuk setiap bangunan
- `nama` (VARCHAR(100)): Nama gedung/bangunan
- `interaksi` (ENUM): Tipe interaksi bangunan
  - 'Interaktif': Bangunan memiliki data lantai dan ruangan yang dapat diakses
  - 'Noninteraktif': Bangunan hanya ditampilkan di peta tanpa detail internal
- `lantai` (INT): Jumlah lantai pada bangunan
- `geometri` (TEXT): Data geometri dalam format GeoJSON (Polygon) untuk menggambar bangunan di peta
- `thumbnail` (VARCHAR(500)): Path file gambar thumbnail bangunan
- `kategori_kampus` (VARCHAR(100), DEFAULT 'Politeknik Negeri Pontianak'): Nama kampus tempat bangunan berada. Nilai yang mungkin:
  - Politeknik Negeri Pontianak
  - PSDKU Polnep Sanggau
  - PDD Polnep Kapuas Hulu
  - PSDKU Polnep Sukamara

**Index:**

- `idx_bangunan_kampus` pada kolom `kategori_kampus` untuk mempercepat filtering berdasarkan kampus

### 3. Tabel `lantai_gambar`

Tabel untuk menyimpan file denah lantai (SVG) dari setiap bangunan.

**Atribut:**

- `id_lantai_gambar` (INT, PK, AUTO_INCREMENT): ID unik untuk setiap file denah lantai
- `id_bangunan` (INT, FK, NOT NULL): Foreign key ke tabel `bangunan`
- `nama_file` (VARCHAR(255), NOT NULL): Nama file denah (contoh: Lt1.svg, Lt2.svg)
- `path_file` (VARCHAR(500), NOT NULL): Path lengkap file SVG denah lantai
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Tanggal dan waktu file dibuat

**Relasi:**

- Many-to-One dengan `bangunan` (Satu bangunan bisa memiliki banyak lantai)
- ON DELETE CASCADE: Jika bangunan dihapus, semua denah lantainya ikut terhapus

### 4. Tabel `ruangan`

Tabel untuk menyimpan data ruangan yang ada di dalam bangunan.

**Atribut:**

- `id_ruangan` (INT, PK, AUTO_INCREMENT): ID unik untuk setiap ruangan
- `nama_ruangan` (VARCHAR(100), NOT NULL): Nama ruangan
- `nomor_lantai` (INT, NOT NULL): Nomor lantai tempat ruangan berada
- `id_bangunan` (INT, FK, NOT NULL): Foreign key ke tabel `bangunan`
- `nama_jurusan` (VARCHAR(100)): Nama jurusan yang menempati ruangan (opsional)
- `nama_prodi` (VARCHAR(100)): Nama program studi (opsional)
- `pin_style` (VARCHAR(50), DEFAULT 'default'): Style/kategori pin marker pada denah (contoh: default, ruang_kelas, kantor, laboratorium)
- `posisi_x` (DECIMAL(10,2)): Koordinat X (horizontal) pin marker pada denah SVG dalam persen (0-100)
- `posisi_y` (DECIMAL(10,2)): Koordinat Y (vertikal) pin marker pada denah SVG dalam persen (0-100)

**Relasi:**

- Many-to-One dengan `bangunan` (Satu bangunan bisa memiliki banyak ruangan)
- ON DELETE CASCADE: Jika bangunan dihapus, semua ruangannya ikut terhapus

### 5. Tabel `ruangan_gallery`

Tabel untuk menyimpan foto-foto galeri dari setiap ruangan.

**Atribut:**

- `id_gallery` (INT, PK, AUTO_INCREMENT): ID unik untuk setiap foto galeri
- `id_ruangan` (INT, FK, NOT NULL): Foreign key ke tabel `ruangan`
- `nama_file` (VARCHAR(255), NOT NULL): Nama file foto
- `path_file` (VARCHAR(500), NOT NULL): Path lengkap file foto galeri
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Tanggal dan waktu foto diunggah

**Relasi:**

- Many-to-One dengan `ruangan` (Satu ruangan bisa memiliki banyak foto galeri)
- ON DELETE CASCADE: Jika ruangan dihapus, semua foto galerinya ikut terhapus

## Relasi Antar Tabel

```
admin (1)
  (tidak ada relasi dengan tabel lain - standalone untuk autentikasi)

bangunan (1) ----< lantai_gambar (N)
  |
  |----< ruangan (N) ----< ruangan_gallery (N)
```

### Penjelasan Relasi:

1. **bangunan → lantai_gambar** (One-to-Many)

   - Satu bangunan dapat memiliki banyak denah lantai
   - Cascade delete: Menghapus bangunan akan menghapus semua denah lantainya

2. **bangunan → ruangan** (One-to-Many)

   - Satu bangunan dapat memiliki banyak ruangan
   - Cascade delete: Menghapus bangunan akan menghapus semua ruangannya

3. **ruangan → ruangan_gallery** (One-to-Many)
   - Satu ruangan dapat memiliki banyak foto galeri
   - Cascade delete: Menghapus ruangan akan menghapus semua foto galerinya

## Catatan Penting

1. **Integritas Referensial**: Semua foreign key menggunakan `ON DELETE CASCADE` untuk menjaga konsistensi data
2. **Enkripsi Password**: Password admin dienkripsi menggunakan bcrypt dengan salt rounds 10
3. **GeoJSON Format**: Kolom `geometri` menyimpan data GeoJSON tipe Polygon untuk marking area bangunan di peta
4. **Multi-Campus Support**: Kolom `kategori_kampus` memungkinkan sistem mengelola data dari 4 kampus yang berbeda
5. **Posisi Pin Relatif**: `posisi_x` dan `posisi_y` menggunakan persentase (0-100) agar posisi pin tetap akurat meskipun ukuran denah berubah
