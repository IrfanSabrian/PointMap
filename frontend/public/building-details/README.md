# Building Details - Sistem Dinamis

## Deskripsi

Sistem building-details yang dinamis mengambil data ruangan dari database dan menampilkan informasi bangunan berdasarkan ID bangunan yang dipilih.

## Fitur

- **Dinamis berdasarkan database**: Jumlah lantai dan ruangan diambil dari tabel `ruangan`
- **Multi-bangunan**: Mendukung berbagai bangunan dengan ID berbeda
- **Peta lantai dinamis**: Gambar SVG yang berbeda untuk setiap bangunan
- **Informasi ruangan real-time**: Data ruangan langsung dari database
- **Modal Info User-Friendly**: Menampilkan informasi yang ramah pengguna jika data ruangan kosong

## Struktur Data

### Database Schema

```sql
-- Tabel ruangan
CREATE TABLE ruangan (
    id_ruangan INT AUTO_INCREMENT PRIMARY KEY,
    nama_ruangan VARCHAR(100) NOT NULL,
    nomor_lantai INT NOT NULL,
    id_bangunan INT NOT NULL,
    id_prodi INT,
    deskripsi VARCHAR(100),
    FOREIGN KEY (id_bangunan) REFERENCES bangunan(id_bangunan),
    FOREIGN KEY (id_prodi) REFERENCES prodi(id_prodi)
);
```

### API Endpoints

- `GET /api/bangunan/:id` - Mendapatkan data bangunan berdasarkan ID
- `GET /api/ruangan/bangunan/:id_bangunan` - Mendapatkan ruangan berdasarkan ID bangunan

## Cara Kerja

### 1. Load Data

```javascript
// Ambil ID bangunan dari parameter URL
const buildingId = getUrlParameter("id") || "45";

// Ambil data bangunan dan ruangan
const buildingResponse = await fetch(`${API_BASE_URL}/bangunan/${buildingId}`);
const ruanganResponse = await fetch(
  `${API_BASE_URL}/ruangan/bangunan/${buildingId}`
);
```

### 2. Render Dinamis

- **Levels**: Dibuat berdasarkan data lantai dari database
- **Pins**: Setiap ruangan mendapat pin dengan ID unik
- **Content**: Informasi ruangan dari database (nama, deskripsi, lantai)
- **Spaces List**: Daftar ruangan dikelompokkan per lantai

### 3. Modal Info (Data Ruangan Kosong)

- **Kondisi**: Jika data ruangan kosong atau tidak ditemukan
- **Tampilan**: Modal informasi yang ramah pengguna
- **Pesan**: Memberitahu bahwa bangunan sudah terdaftar tapi belum ada data ruangan
- **Aksi**: Tombol tutup yang kembali ke peta utama

### 4. Peta Lantai

- **Gedung Lab TI (ID: 45)**: `../img/Gedung Lab Teknik Informatika/lantai/Lt1.svg`, `../img/Gedung Lab Teknik Informatika/lantai/Lt2.svg`, `../img/Gedung Lab Teknik Informatika/lantai/Lt3.svg`
- **Jurusan Teknik Mesin (ID: 3)**: `../img/Jurusan Teknik Mesin/lantai/Lt1.svg`, `../img/Jurusan Teknik Mesin/lantai/Lt2.svg`, `../img/Jurusan Teknik Mesin/lantai/Lt3.svg`
- **Fallback System**:
  - Jika SVG lantai tidak ditemukan di folder bangunan, gunakan `../img/default/lantai/Lt{lantai}.svg`
  - Jika file default lantai tidak ada, gunakan `../img/default/lantai/default.svg`

## Penggunaan

### Dari LeafletMap

```javascript
// Buka building-details dengan ID bangunan
<iframe
  src={`/building-details/index.html?id=${selectedFeature?.properties?.id}`}
/>
```

### Akses Langsung

```
/building-details/index.html?id=45  // Gedung Lab TI
/building-details/index.html?id=3   // Jurusan Teknik Mesin
```

## Struktur File

```
building-details/
├── index.html          # File utama dengan JavaScript dinamis
├── css/
│   └── style.css       # Styling untuk loading dan error states
├── js/
│   ├── main.js         # JavaScript utama
│   ├── classie.js      # Utility functions
│   ├── list.min.js     # Search functionality
│   └── modernizr-custom.js # Browser compatibility
```

## Struktur Folder Gambar (Baru)

```
public/
├── img/
│   ├── Gedung Lab Teknik Informatika/
│   │   ├── thumbnail.jpg           # Thumbnail bangunan
│   │   ├── lantai/
│   │   │   ├── Lt1.svg            # Lantai 1
│   │   │   ├── Lt2.svg            # Lantai 2
│   │   │   └── Lt3.svg            # Lantai 3
│   │   └── ruangan/
│   │       └── thumbnail.jpg      # Thumbnail ruangan
│   ├── Jurusan Teknik Mesin/
│   │   ├── thumbnail.jpg           # Thumbnail bangunan
│   │   ├── lantai/
│   │   │   ├── Lt1.svg            # Lantai 1
│   │   │   ├── Lt2.svg            # Lantai 2
│   │   │   └── Lt3.svg            # Lantai 3
│   │   └── ruangan/
│   │       └── thumbnail.jpg      # Thumbnail ruangan
│   └── default/
│       ├── thumbnail.jpg           # Thumbnail default
│       └── lantai/
│           ├── Lt1.svg            # Peta default lantai 1
│           ├── Lt2.svg            # Peta default lantai 2
│           ├── Lt3.svg            # Peta default lantai 3
│           └── default.svg        # Peta default fallback
│   ├── main.js        # Logika interaksi
│   ├── classie.js     # Utility functions
│   ├── list.min.js    # Search functionality
│   └── modernizr-custom.js
└── README.md          # Dokumentasi ini
```

## Data Testing

### Gedung Lab Teknik Informatika (ID: 45)

- **Lantai 1**: TI-14, TI-15, TI-16
- **Lantai 2**: TI-11, TI-12, TI-13
- **Lantai 3**: TI-17, TI-18, TI-19, TI-20

### Jurusan Teknik Mesin (ID: 3)

- **Lantai 1**: TM-01, TM-02, TM-03
- **Lantai 2**: TM-04, TM-05, TM-06
- **Lantai 3**: TM-07, TM-08

## Error Handling

- **Loading State**: Menampilkan spinner saat memuat data
- **Info Modal**: Menampilkan modal informasi jika data ruangan kosong (tidak redirect ke error page)
- **Error State**: Menampilkan pesan error jika gagal memuat data (hanya untuk error API/server)
- **Fallback Image System**:
  - Level 1: Coba SVG lantai dari folder bangunan (`../img/{nama}/lantai/Lt{lantai}.svg`)
  - Level 2: Jika tidak ada, gunakan SVG lantai default (`../img/default/lantai/Lt{lantai}.svg`)
  - Level 3: Jika tidak ada, gunakan SVG default (`../img/default/lantai/default.svg`)
- **API Error**: Menampilkan pesan error jika API tidak tersedia

## Responsive Design

- Mendukung berbagai ukuran layar
- Loading dan error states responsive
- Peta lantai menyesuaikan ukuran container

## Browser Support

- Modern browsers dengan ES6+ support
- Fetch API untuk HTTP requests
- CSS Grid dan Flexbox untuk layout
