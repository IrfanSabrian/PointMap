# API Documentation - PointMap Backend

_Terakhir diperbarui: Desember 2024_

## 📁 Struktur Folder & File

```
backend/
├── config/
│   └── db.js                    # Konfigurasi database MySQL dengan Sequelize
├── controllers/                 # Logic bisnis untuk setiap resource
│   ├── auth.js                  # Login, logout, verifikasi token
│   ├── bangunan.js              # CRUD untuk data bangunan (Edit Only)
│   ├── ruangan.js               # CRUD untuk data ruangan (Full CRUD)
│   ├── lantaiGambar.js          # CRUD untuk gambar lantai (Full CRUD)
│   └── ruanganGallery.js        # CRUD untuk gallery ruangan (Full CRUD)
├── middlewares/
│   ├── auth.js                  # Middleware untuk verifikasi JWT token
│   └── upload.js                # Middleware untuk file upload (multer)
├── models/                      # Definisi model database dengan Sequelize
│   ├── index.js                 # Relasi antar model dan export
│   ├── Admin.js                 # Model tabel admin
│   ├── Bangunan.js              # Model tabel bangunan
│   ├── Ruangan.js               # Model tabel ruangan
│   ├── LantaiGambar.js          # Model tabel lantai_gambar
│   └── RuanganGallery.js        # Model tabel ruangan_gallery
├── routes/                      # Definisi endpoint API
│   ├── auth.js                  # Route untuk authentication
│   ├── bangunan.js              # Route untuk bangunan (Edit Only)
│   ├── ruangan.js               # Route untuk ruangan (Full CRUD)
│   ├── lantaiGambar.js          # Route untuk lantai gambar (Full CRUD)
│   └── ruanganGallery.js        # Route untuk ruangan gallery (Full CRUD)
├── tools/
│   └── hash_password.js         # Tool untuk hash password admin
├── uploads/                     # Folder untuk file upload
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
3. **Public endpoint** - tidak perlu authentication

#### `GET /bangunan/geojson`

**Cara Kerja:**

1. Query semua bangunan
2. Parse kolom `geometri` (JSON string) menjadi object
3. Format ulang menjadi GeoJSON FeatureCollection
4. Return untuk keperluan mapping
5. **Public endpoint** - untuk frontend map rendering

#### `GET /bangunan/:id`

**Cara Kerja:**

1. Query bangunan berdasarkan ID
2. Return single bangunan object
3. **Public endpoint** - untuk detail bangunan

#### `PUT /bangunan/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data bangunan berdasarkan ID
3. Fields yang bisa diupdate: `nama`, `interaksi`, `lantai`, `thumbnail`
4. Return data yang sudah diupdate
5. **Protected endpoint** - admin only

#### `POST /bangunan/:id/upload-thumbnail`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Middleware `upload.single("thumbnail")` handle file upload
3. Upload thumbnail untuk bangunan berdasarkan ID
4. Return success message dengan file info
5. **Protected endpoint** - admin only

### 🏠 Ruangan (Full CRUD)

#### `GET /ruangan`

**Cara Kerja:**

1. Query semua ruangan dengan `ORDER BY nama_ruangan ASC`
2. Data sudah lengkap dengan `nama_jurusan` dan `nama_prodi` (string)
3. **Public endpoint** - untuk listing semua ruangan

#### `GET /ruangan/bangunan/:id_bangunan`

**Cara Kerja:**

1. Query ruangan berdasarkan `id_bangunan`
2. Kelompokkan hasil berdasarkan `nomor_lantai`
3. Return object dengan key lantai: `{"1": [...], "2": [...]}`
4. **Public endpoint** - untuk detail ruangan per bangunan

#### `GET /ruangan/bangunan/:id_bangunan/3d`

**Cara Kerja:**

1. Query ruangan berdasarkan `id_bangunan` khusus untuk tampilan 3D
2. Return data yang dioptimasi untuk rendering 3D
3. **Public endpoint** - untuk building detail 3D view

#### `GET /ruangan/:id`

**Cara Kerja:**

1. Query ruangan berdasarkan ID
2. Return single ruangan object dengan detail lengkap
3. **Public endpoint** - untuk detail ruangan

#### `POST /ruangan`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Create ruangan baru
3. Fields: `nama_ruangan`, `nomor_lantai`, `id_bangunan`, `nama_jurusan`, `nama_prodi`
4. **Protected endpoint** - admin only

#### `PUT /ruangan/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data ruangan berdasarkan ID
3. Fields: `nama_ruangan`, `nomor_lantai`, `id_bangunan`, `nama_jurusan`, `nama_prodi`
4. **Protected endpoint** - admin only

#### `DELETE /ruangan/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Delete ruangan berdasarkan ID
3. Return success message
4. **Protected endpoint** - admin only

### 🗺️ Lantai Gambar (Full CRUD)

#### `GET /lantai-gambar`

**Cara Kerja:**

1. Query semua data dengan include relasi `Bangunan`
2. Return data lengkap dengan info bangunan
3. Ordered by `id_bangunan` dan `nama_file`
4. **Public endpoint** - untuk listing semua lantai gambar

#### `GET /lantai-gambar/bangunan/:id_bangunan`

**Cara Kerja:**

1. Query lantai gambar berdasarkan `id_bangunan`
2. Return array lantai gambar untuk bangunan tertentu
3. **Public endpoint** - untuk floor plans per building

#### `GET /lantai-gambar/:id`

**Cara Kerja:**

1. Query lantai gambar berdasarkan ID
2. Return single lantai gambar object
3. **Public endpoint** - untuk detail lantai gambar

#### `POST /lantai-gambar`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Middleware `upload.single("gambar_lantai")` handle file upload
3. Insert data baru ke tabel `lantai_gambar`
4. Fields: `id_bangunan`, `nama_file`, `path_file`
5. **Protected endpoint** - admin only

#### `PUT /lantai-gambar/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Update data berdasarkan ID
3. Return data yang sudah diupdate
4. **Protected endpoint** - admin only

#### `DELETE /lantai-gambar/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Hapus data berdasarkan ID
3. Return data yang sudah dihapus
4. **Protected endpoint** - admin only

### 🖼️ Ruangan Gallery (Full CRUD)

#### `GET /ruangan-gallery`

**Cara Kerja:**

1. Query semua data dengan include relasi `Ruangan`
2. Return data lengkap dengan info ruangan
3. **Public endpoint** - untuk listing semua gallery ruangan

#### `GET /ruangan-gallery/ruangan/:ruanganId`

**Cara Kerja:**

1. Query gallery berdasarkan `ruanganId`
2. Return array gallery untuk ruangan tertentu
3. **Public endpoint** - untuk gallery per ruangan

#### `GET /ruangan-gallery/:id`

**Cara Kerja:**

1. Query gallery berdasarkan ID
2. Return single gallery object
3. **Public endpoint** - untuk detail gallery

#### `POST /ruangan-gallery/upload`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Middleware `upload.array("gallery", 10)` handle multiple file uploads
3. Upload multiple images untuk gallery ruangan
4. Maximum 10 files per upload
5. Fields: `id_ruangan`, files array
6. **Protected endpoint** - admin only

#### `PUT /ruangan-gallery/reorder`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Reorder gallery images berdasarkan urutan baru
3. Update `urutan` field untuk multiple gallery items
4. **Protected endpoint** - admin only

#### `DELETE /ruangan-gallery/:id`

**Cara Kerja:**

1. Middleware `auth` verifikasi token
2. Hapus gallery berdasarkan ID
3. Return data yang sudah dihapus
4. **Protected endpoint** - admin only

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

- Token expires dalam 1 jam (updated from 2 hours for better security)
- Secret key dari environment variable `JWT_SECRET`
- Middleware `auth` untuk proteksi endpoint
- Bearer token format: `Authorization: Bearer <token>`

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

### 4. **File Upload System**

- Multer middleware untuk handle file uploads
- Support single dan multiple file uploads
- Automatic file validation dan processing
- Upload folder: `uploads/` directory

### 5. **Database Optimization**

- Relasi untuk menghindari data redundancy
- Index pada foreign key untuk performa query
- Ordered queries untuk consistent data display
- Include relasi untuk joined data

### 6. **Error Handling**

- Try-catch di setiap controller
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages untuk debugging

## 🚀 Cara Menjalankan

1. **Install dependencies:**

```bash
cd backend
npm install
```

2. **Setup environment variables (.env):**

```env
DB_NAME=pointmap
DB_USER=root
DB_PASS=password
DB_HOST=localhost
JWT_SECRET=your_secret_key_here
PORT=3001
```

3. **Setup database:**

```bash
# Import database schema
mysql -u root -p pointmap < ../pointmap.sql
```

4. **Jalankan server:**

```bash
npm start
```

5. **Test API:**

```bash
# Test database connection dan API status
curl http://localhost:3001

# Test specific endpoints
curl http://localhost:3001/api/bangunan
curl http://localhost:3001/api/ruangan
```

6. **Create admin user (optional):**

```bash
# Use the hash_password.js tool
node tools/hash_password.js
# Then insert admin user manually ke database
```

## 📚 Learning Points

- **Sequelize ORM**: Mapping database ke JavaScript objects
- **JWT Authentication**: Stateless authentication dengan 1 hour expiry
- **Express Middleware**: Modular request processing (auth, upload, cors)
- **RESTful API Design**: Standard HTTP methods dengan proper status codes
- **File Upload**: Multer untuk single dan multiple file uploads
- **Error Handling**: Proper error responses dengan try-catch
- **Database Relations**: Foreign key relationships dengan includes
- **Environment Variables**: Configuration management untuk security
- **CORS**: Cross-origin resource sharing untuk frontend integration

## 🔗 Integration dengan Frontend

### API Endpoints yang digunakan Frontend:

**Public Endpoints (tidak perlu auth):**

- `GET /bangunan` - Map data untuk building polygons
- `GET /bangunan/geojson` - GeoJSON format untuk Leaflet
- `GET /ruangan/bangunan/:id` - Room data untuk building details
- `GET /lantai-gambar/bangunan/:id` - Floor plans untuk building viewer

**Protected Endpoints (perlu JWT token):**

- `PUT /bangunan/:id` - Edit building information (dashboard)
- `POST /ruangan` - Create new room (dashboard)
- `POST /lantai-gambar` - Upload floor plans (dashboard)
- `POST /ruangan-gallery/upload` - Upload room photos (dashboard)

### Frontend Integration Notes:

1. **Authentication Flow**: Login → JWT token → Store in localStorage → Send in headers
2. **File Uploads**: FormData dengan multipart/form-data
3. **Error Handling**: Frontend menangani 401, 403, 500 status codes
4. **Real-time Updates**: Frontend refresh data setelah CRUD operations

## 🆕 Recent Updates (December 2024)

### New Features Added:

- ✅ **File Upload System**: Multer integration untuk thumbnail dan gallery
- ✅ **Multiple File Upload**: Support untuk gallery dengan max 10 files
- ✅ **Gallery Reordering**: Endpoint untuk mengatur ulang urutan gallery
- ✅ **3D View Support**: Endpoint khusus untuk building detail 3D view
- ✅ **Enhanced Security**: Token expiry dikurangi ke 1 jam
- ✅ **Better File Structure**: Upload folder dan middleware organization
- ✅ **Public/Protected Separation**: Clear distinction antara public dan admin endpoints

### Database Schema Updates:

- `ruangan_gallery` table dengan `urutan` field untuk ordering
- File path storage untuk uploads
- Enhanced foreign key relationships
