# API Documentation - PointMap Backend

## 📁 Struktur Folder & File

```
backend/
├── config/
│   └── db.js                    # Konfigurasi database MySQL dengan Sequelize
├── controllers/                 # Logic bisnis untuk setiap resource
│   ├── auth.js                  # Login, logout, verifikasi token
│   ├── bangunan.js              # CRUD untuk data bangunan
│   ├── ruangan.js               # CRUD untuk data ruangan
│   ├── lantaiGambar.js          # CRUD untuk gambar lantai
│   └── ruanganGallery.js        # CRUD untuk gallery ruangan
├── middlewares/
│   └── auth.js                  # Middleware untuk verifikasi JWT token
├── models/                      # Definisi model database dengan Sequelize
│   ├── index.js                 # Relasi antar model
│   ├── Admin.js                 # Model tabel admin
│   ├── Bangunan.js              # Model tabel bangunan
│   ├── Ruangan.js               # Model tabel ruangan
│   ├── LantaiGambar.js          # Model tabel lantai_gambar
│   └── RuanganGallery.js        # Model tabel ruangan_gallery
├── routes/                      # Definisi endpoint API
│   ├── auth.js                  # Route untuk authentication
│   ├── bangunan.js              # Route untuk bangunan
│   ├── ruangan.js               # Route untuk ruangan
│   ├── lantaiGambar.js          # Route untuk lantai gambar
│   └── ruanganGallery.js        # Route untuk ruangan gallery
├── tools/
│   └── hash_password.js         # Tool untuk hash password admin
├── server.js                    # Entry point aplikasi Express
├── package.json                 # Dependencies dan scripts
└── API_DOCUMENTATION.md         # Dokumentasi ini
```

## 🔧 Cara Kerja Sistem

### 1. **Database Connection (config/db.js)**

```javascript
// Menggunakan Sequelize ORM untuk koneksi MySQL
// Environment variables: DB_NAME, DB_USER, DB_PASS, DB_HOST
// Dialect: mysql
```

### 2. **Model Definition (models/)**

- Setiap file model mendefinisikan struktur tabel database
- Menggunakan `sequelize.define()` untuk mapping tabel ke object JavaScript
- Relasi antar tabel didefinisikan di `models/index.js`

### 3. **Controller Logic (controllers/)**

- Berisi fungsi-fungsi untuk handle request HTTP
- Menggunakan model untuk operasi database
- Return response dalam format JSON

### 4. **Route Definition (routes/)**

- Mendefinisikan endpoint URL dan HTTP method
- Menggunakan middleware `auth` untuk proteksi endpoint
- Memanggil fungsi controller yang sesuai

### 5. **Authentication Flow (middlewares/auth.js)**

- Verifikasi JWT token dari header `Authorization: Bearer <token>`
- Token berisi data user (id, username)
- Jika valid, data user disimpan di `req.user`

## 🚀 Base URL

```
http://localhost:3001/api
```

## 📋 Endpoints & Cara Kerja

### 🔐 Authentication

#### `POST /auth/login`

**Cara Kerja:**

1. Terima `username` dan `password` dari request body
2. Cari admin di database berdasarkan username
3. Bandingkan password dengan hash menggunakan `bcrypt.compare()`
4. Jika valid, generate JWT token dengan payload `{id, username}`
5. Return token dan data user

**Request:**

```json
{
  "username": "adminpolnep",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "adminpolnep"
  }
}
```

#### `GET /auth/verify`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Jika valid, return data user dari `req.user`

#### `POST /auth/logout`

**Cara Kerja:**

1. Hanya return message logout (token dihapus di frontend)

### 🏢 Bangunan (Edit Only)

#### `GET /bangunan`

**Cara Kerja:**

1. Query semua data dari tabel `bangunan`
2. Return array of objects

#### `GET /bangunan/geojson`

**Cara Kerja:**

1. Query semua bangunan
2. Parse kolom `geometri` (JSON string) menjadi object
3. Format ulang menjadi GeoJSON FeatureCollection
4. Return untuk keperluan mapping

#### `PUT /bangunan/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data bangunan berdasarkan ID
3. Fields yang bisa diupdate: `nama`, `interaksi`, `lantai`, `thumbnail`
4. Return data yang sudah diupdate

### 🏠 Ruangan (Edit Only)

#### `GET /ruangan`

**Cara Kerja:**

1. Query semua ruangan dengan `ORDER BY nama_ruangan ASC`
2. Data sudah lengkap dengan `nama_jurusan` dan `nama_prodi` (string)

#### `GET /ruangan/bangunan/:id_bangunan`

**Cara Kerja:**

1. Query ruangan berdasarkan `id_bangunan`
2. Kelompokkan hasil berdasarkan `nomor_lantai`
3. Return object dengan key lantai: `{"1": [...], "2": [...]}`

#### `PUT /ruangan/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data ruangan berdasarkan ID
3. Fields: `nama_ruangan`, `nomor_lantai`, `id_bangunan`, `nama_jurusan`, `nama_prodi`

### 🗺️ Lantai Gambar (Full CRUD)

#### `GET /lantai-gambar`

**Cara Kerja:**

1. Query semua data dengan include relasi `Bangunan`
2. Return data lengkap dengan info bangunan

#### `POST /lantai-gambar`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Insert data baru ke tabel `lantai_gambar`
3. Fields: `id_bangunan`, `nama_file`, `path_file`

#### `PUT /lantai-gambar/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data berdasarkan ID
3. Return data yang sudah diupdate

#### `DELETE /lantai-gambar/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Hapus data berdasarkan ID
3. Return data yang sudah dihapus

### 🖼️ Ruangan Gallery (Full CRUD)

#### `GET /ruangan-gallery`

**Cara Kerja:**

1. Query semua data dengan include relasi `Ruangan`
2. Return data lengkap dengan info ruangan

#### `POST /ruangan-gallery`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Insert data baru ke tabel `ruangan_gallery`
3. Fields: `id_ruangan`, `nama_file`, `path_file`

#### `PUT /ruangan-gallery/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data berdasarkan ID
3. Return data yang sudah diupdate

#### `DELETE /ruangan-gallery/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Hapus data berdasarkan ID
3. Return data yang sudah dihapus

## 🔗 Database Relasi

```javascript
// Di models/index.js
Ruangan.belongsTo(Bangunan, { foreignKey: "id_bangunan", as: "bangunan" });
Bangunan.hasMany(Ruangan, { foreignKey: "id_bangunan", as: "ruangan" });

LantaiGambar.belongsTo(Bangunan, { foreignKey: "id_bangunan", as: "bangunan" });
Bangunan.hasMany(LantaiGambar, {
  foreignKey: "id_bangunan",
  as: "lantai_gambar",
});

RuanganGallery.belongsTo(Ruangan, { foreignKey: "id_ruangan", as: "ruangan" });
Ruangan.hasMany(RuanganGallery, { foreignKey: "id_ruangan", as: "gallery" });
```

## 🛡️ Security Features

### JWT Authentication

- Token expires dalam 2 jam
- Secret key dari environment variable `JWT_SECRET`
- Middleware `auth` untuk proteksi endpoint

### Password Hashing

- Menggunakan `bcrypt` dengan salt rounds 10
- Password admin di-hash sebelum disimpan ke database

### CORS

- Mengizinkan cross-origin requests
- Diperlukan untuk frontend yang berbeda domain

## 📊 Response Format

### Success Response

```json
{
  "message": "Data berhasil diperbarui",
  "data": {
    // data object
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

### Authentication Error

```json
{
  "error": "Akses ditolak",
  "message": "Token tidak ditemukan dalam header Authorization"
}
```

## 🎯 Konsep Penting

### 1. **MVC Pattern**

- **Model**: Definisi struktur data (models/)
- **View**: Response JSON (controllers/)
- **Controller**: Logic bisnis (controllers/)

### 2. **Middleware Pattern**

- `auth` middleware untuk proteksi endpoint
- `cors` middleware untuk cross-origin
- `express.json()` untuk parse JSON body

### 3. **RESTful API**

- GET: Read data
- POST: Create data
- PUT: Update data
- DELETE: Delete data

### 4. **Database Optimization**

- Relasi untuk menghindari data redundancy
- Index pada foreign key untuk performa query
- Soft delete pattern (jika diperlukan)

### 5. **Error Handling**

- Try-catch di setiap controller
- Consistent error response format
- Proper HTTP status codes

## 🚀 Cara Menjalankan

1. **Install dependencies:**

```bash
npm install
```

2. **Setup environment variables (.env):**

```
DB_NAME=pointmap
DB_USER=root
DB_PASS=password
DB_HOST=localhost
JWT_SECRET=your_secret_key
PORT=3001
```

3. **Jalankan server:**

```bash
npm start
```

4. **Test API:**

```bash
curl http://localhost:3001/api
```

## 📚 Learning Points

- **Sequelize ORM**: Mapping database ke JavaScript objects
- **JWT Authentication**: Stateless authentication
- **Express Middleware**: Modular request processing
- **RESTful API Design**: Standard HTTP methods
- **Error Handling**: Proper error responses
- **Database Relations**: Foreign key relationships
- **Environment Variables**: Configuration management
