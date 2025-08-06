# Struktur Folder Backend PointMap

## Overview

Backend aplikasi PointMap dibangun menggunakan Node.js dengan Express.js sebagai framework utama, MySQL sebagai database, dan Sequelize sebagai ORM.

## Struktur Folder

### 📁 `config/`

Folder konfigurasi database dan pengaturan aplikasi.

- **`db.js`** - Konfigurasi koneksi database MySQL menggunakan Sequelize

### 📁 `controllers/`

Folder berisi logic bisnis dan handler untuk setiap endpoint API.

- **`auth.js`** - Controller untuk autentikasi (login, register, logout)
- **`bangunan.js`** - Controller untuk manajemen data bangunan
- **`lantaiGambar.js`** - Controller untuk manajemen gambar lantai
- **`maintenance.js`** - Controller untuk fitur maintenance
- **`ruangan.js`** - Controller untuk manajemen data ruangan
- **`ruanganGallery.js`** - Controller untuk galeri gambar ruangan

### 📁 `middlewares/`

Folder berisi middleware untuk validasi dan autentikasi.

- **`auth.js`** - Middleware untuk verifikasi JWT token
- **`upload.js`** - Middleware untuk handling file upload menggunakan Multer

### 📁 `models/`

Folder berisi definisi model database menggunakan Sequelize.

- **`Admin.js`** - Model untuk tabel admin
- **`Bangunan.js`** - Model untuk tabel bangunan
- **`index.js`** - File konfigurasi dan asosiasi model Sequelize
- **`LantaiGambar.js`** - Model untuk tabel gambar lantai
- **`Ruangan.js`** - Model untuk tabel ruangan
- **`RuanganGallery.js`** - Model untuk tabel galeri ruangan

### 📁 `routes/`

Folder berisi definisi routing untuk setiap endpoint API.

- **`auth.js`** - Route untuk autentikasi
- **`bangunan.js`** - Route untuk CRUD bangunan
- **`lantaiGambar.js`** - Route untuk manajemen gambar lantai
- **`maintenance.js`** - Route untuk fitur maintenance
- **`ruangan.js`** - Route untuk CRUD ruangan
- **`ruanganGallery.js`** - Route untuk galeri ruangan

### 📁 `scripts/`

Folder berisi script utilitas.

- **`resetAutoIncrement.js`** - Script untuk reset auto increment database

### 📁 `tools/`

Folder berisi tools pendukung.

- **`hash_password.js`** - Tool untuk hashing password

### 📁 `uploads/`

Folder untuk menyimpan file yang diupload (gambar bangunan, ruangan, dll).

### 📄 File Root

- **`package.json`** - Konfigurasi dependencies dan scripts Node.js
- **`package-lock.json`** - Lock file untuk dependency versions
- **`server.js`** - Entry point aplikasi Express.js

## Dependencies Utama

- **Express.js** - Web framework
- **Sequelize** - ORM untuk database
- **MySQL2** - Driver MySQL
- **JWT** - Autentikasi token
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
