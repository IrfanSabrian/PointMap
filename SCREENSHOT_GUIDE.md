# PANDUAN SCREENSHOT UNTUK DOKUMENTASI BAB IV

## Screenshot yang Diperlukan untuk BAB IV

### 4.2.1 Implementasi Sistem

#### 1. Halaman Utama (Dashboard)

**File:** `screenshot_dashboard.png`
**Deskripsi:** Tampilan utama sistem PointMap dengan daftar bangunan
**Fitur yang ditampilkan:**

- List bangunan dengan thumbnail
- Search functionality
- Responsive design
- Navigation menu

#### 2. Detail Bangunan dengan Interactive Map

**File:** `screenshot_building_detail.png`
**Deskripsi:** Halaman detail bangunan dengan denah interaktif
**Fitur yang ditampilkan:**

- SVG-based interactive map
- Pin ruangan yang dapat diklik
- Sidebar dengan daftar ruangan
- Hover effects pada pin

#### 3. Modal Edit Ruangan

**File:** `screenshot_edit_room_modal.png`
**Deskripsi:** Modal untuk mengedit data ruangan
**Fitur yang ditampilkan:**

- Form input untuk nama ruangan, lantai, jurusan, prodi
- Tombol hapus ruangan (merah)
- Validasi input
- Responsive form design

#### 4. Gallery Management

**File:** `screenshot_gallery_management.png`
**Deskripsi:** Modal untuk mengelola gallery ruangan
**Fitur yang ditampilkan:**

- File upload dengan drag & drop
- Progress indicator untuk upload
- Preview gambar sebelum upload
- Current gallery images
- Multiple file selection

#### 5. Upload Progress Indicator

**File:** `screenshot_upload_progress.png`
**Deskripsi:** Progress bar untuk upload multiple files
**Fitur yang ditampilkan:**

- Individual progress untuk setiap file
- Status upload (Uploading, Success, Failed)
- File name display
- Progress bar dengan animasi

#### 6. Notification System

**File:** `screenshot_notifications.png`
**Deskripsi:** Sistem notifikasi real-time
**Fitur yang ditampilkan:**

- Success notification (hijau)
- Error notification (merah)
- Info notification (biru)
- Auto-dismiss functionality

#### 7. Authentication Login

**File:** `screenshot_login.png`
**Deskripsi:** Halaman login untuk admin
**Fitur yang ditampilkan:**

- Login form dengan username/password
- Remember me functionality
- Error handling
- Secure form design

#### 8. Database Structure (phpMyAdmin)

**File:** `screenshot_database_structure.png`
**Deskripsi:** Struktur database di phpMyAdmin
**Fitur yang ditampilkan:**

- Tabel bangunan, ruangan, ruangan_gallery, lantai_gambar
- Relasi antar tabel
- Auto-increment settings
- Foreign key constraints

#### 9. API Testing (Postman/Insomnia)

**File:** `screenshot_api_testing.png`
**Deskripsi:** Testing API endpoints
**Fitur yang ditampilkan:**

- GET /api/ruangan endpoint
- POST /api/ruangan endpoint
- Authentication headers
- Response data format

#### 10. Auto-Increment Reset Script

**File:** `screenshot_auto_increment_script.png`
**Deskripsi:** Terminal output saat menjalankan reset script
**Fitur yang ditampilkan:**

- Console output dengan emoji
- Progress messages
- Final status report
- Error handling (jika ada)

### 4.3.2 Pengujian Sistem

#### 11. Unit Testing Results

**File:** `screenshot_unit_testing.png`
**Deskripsi:** Hasil pengujian unit test
**Fitur yang ditampilkan:**

- Test results dengan pass/fail
- Coverage percentage
- Test execution time
- Error details (jika ada)

#### 12. Performance Testing

**File:** `screenshot_performance_testing.png`
**Deskripsi:** Hasil pengujian performa
**Fitur yang ditampilkan:**

- Response time metrics
- Throughput data
- Memory usage
- CPU utilization

#### 13. Cross-Browser Testing

**File:** `screenshot_cross_browser.png`
**Deskripsi:** Testing di berbagai browser
**Fitur yang ditampilkan:**

- Chrome, Firefox, Safari, Edge
- Responsive design testing
- Feature compatibility
- Performance comparison

### 4.4.1 Analisis Hasil

#### 14. System Architecture Diagram

**File:** `diagram_system_architecture.png`
**Deskripsi:** Diagram arsitektur sistem
**Komponen yang ditampilkan:**

- Frontend (HTML/CSS/JS)
- Backend (Node.js/Express)
- Database (MySQL)
- File Storage
- Authentication (JWT)

#### 15. Database ERD

**File:** `diagram_database_erd.png`
**Deskripsi:** Entity Relationship Diagram
**Komponen yang ditampilkan:**

- Tabel dan relasi
- Primary/Foreign keys
- Cardinality
- Attributes

#### 16. API Flow Diagram

**File:** `diagram_api_flow.png`
**Deskripsi:** Flow diagram untuk API calls
**Komponen yang ditampilkan:**

- Client request flow
- Authentication process
- Database operations
- Response handling

## Tips untuk Screenshot

### 1. Kualitas Gambar

- Gunakan resolusi tinggi (1920x1080 minimum)
- Pastikan text terbaca dengan jelas
- Gunakan format PNG untuk kualitas terbaik

### 2. Konsistensi

- Gunakan browser yang sama untuk semua screenshot
- Konsisten dalam ukuran window
- Gunakan tema yang sama (light/dark mode)

### 3. Anotasi

- Tambahkan panah atau kotak untuk highlight fitur penting
- Gunakan label untuk menjelaskan elemen
- Tambahkan caption yang deskriptif

### 4. Responsive Design

- Ambil screenshot di berbagai ukuran layar
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### 5. Error Handling

- Screenshot error messages
- Show validation errors
- Display loading states

## Format Penamaan File

```
screenshot_[section]_[feature]_[description].png
```

Contoh:

- `screenshot_4.2.1_dashboard_main.png`
- `screenshot_4.2.2_edit_room_modal.png`
- `screenshot_4.3.1_unit_testing_results.png`
- `screenshot_4.4.1_system_architecture.png`

## Lokasi Penyimpanan

Buat folder struktur:

```
documentation/
├── screenshots/
│   ├── bab4/
│   │   ├── 4.2_implementation/
│   │   ├── 4.3_testing/
│   │   └── 4.4_analysis/
│   └── diagrams/
└── reports/
```

## Checklist Screenshot

- [ ] Dashboard utama
- [ ] Interactive map
- [ ] Modal edit ruangan
- [ ] Gallery management
- [ ] Upload progress
- [ ] Notifications
- [ ] Login page
- [ ] Database structure
- [ ] API testing
- [ ] Auto-increment script
- [ ] Unit testing results
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] System architecture diagram
- [ ] Database ERD
- [ ] API flow diagram
