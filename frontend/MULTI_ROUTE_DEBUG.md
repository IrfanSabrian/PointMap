# 🏢 Multi-Route Debug Guide

## Masalah: Jalur tidak muncul untuk gedung dengan banyak pintu

### Debug Steps:

1. **Cek Console Logs:**

   - Buka Developer Tools (F12)
   - Lihat Console tab
   - Cari log dengan prefix `🏢 [MULTI-ROUTE]`

2. **Expected Logs:**

   ```
   🔍 [DEBUG] Total points available: X
   🔍 [DEBUG] Searching for: "Nama Gedung"
   🔍 [DEBUG] Points with same name: Y
    1. Nama Gedung (ID: 1) at [lat, lng]
    2. Nama Gedung (ID: 2) at [lat, lng]
   🏢 [MULTI-ROUTE] Gedung dengan multiple pintu terdeteksi: Nama Gedung (Y pintu)
   🏢 [MULTI-ROUTE] Calling findMultipleRoutesToBuilding with:
     - startLatLng: [lat, lng]
     - buildingName: "Nama Gedung"
     - points count: X
     - routes count: Z
     - transportMode: jalan_kaki/kendaraan
   🏢 [MULTI-ROUTE] Input data:
     - startCoordinates: [lat, lng]
     - buildingName: "Nama Gedung"
     - points count: X
     - routes count: Z
     - transportMode: jalan_kaki/kendaraan
   🏢 [MULTI-ROUTE] Sample points:
     1. "Point Name" (ID: id) at [lat, lng]
   🏢 [MULTI-ROUTE] Ditemukan Y pintu masuk untuk Nama Gedung
   🔍 [MULTI-ROUTE] Mencari rute ke pintu: Nama Gedung (id)
   🔍 [MULTI-ROUTE] Entrance coordinates: [lat, lng]
   🔍 [MULTI-ROUTE] findRoute result for Nama Gedung: {object}
   ✅ [MULTI-ROUTE] Rute ke Gedung A: Xm (Y segments)
   🏢 [MULTI-ROUTE] Primary route: Nama Gedung (Xm)
   🏢 [MULTI-ROUTE] Alternative routes: Y rute
   🏢 [MULTI-ROUTE] Result: {object}
   🏢 [MULTI-ROUTE] Primary route: Xm, Alternative routes: Y
   🏢 [MULTI-ROUTE] Primary route segments: Z
   ```

3. **Troubleshooting:**

   **Jika tidak ada log sama sekali:**

   - Pastikan `routeEndType === "titik"`
   - Pastikan `routeEndSearchText` tidak kosong
   - Cek apakah `convertTitikToPoints()` mengembalikan data

   **Jika tidak ada points dengan nama yang sama:**

   - Cek apakah nama gedung di GeoJSON sama persis
   - Cek case sensitivity (huruf besar/kecil)
   - Cek apakah ada spasi ekstra

   **Jika findRoute mengembalikan null:**

   - Cek apakah start dan end coordinates valid
   - Cek apakah ada jalur yang terhubung
   - Cek transport mode filtering

   **Jika primary route null:**

   - Cek apakah semua findRoute calls gagal
   - Cek apakah ada error dalam routing algorithm

   **Jika ada error "segments bukan array":**

   - Cek struktur data yang dikirim dari routing function
   - Cek apakah geojsonSegments adalah array
   - Cek apakah ada masalah dengan data format

4. **Data Validation:**

   - Pastikan GeoJSON points memiliki `name` property yang sama
   - Pastikan coordinates dalam format yang benar [lat, lng]
   - Pastikan routes terhubung ke points
   - Pastikan geojsonSegments adalah array of GeoJSON features

5. **Common Issues:**
   - **Nama tidak match:** "Gedung A" vs "Gedung A " (spasi ekstra)
   - **Coordinates format:** Pastikan [lat, lng] bukan [lng, lat]
   - **Missing routes:** Jalur tidak terhubung ke points
   - **Transport mode:** Filtering menghilangkan semua routes
   - **Data structure:** geojsonSegments bukan array atau kosong

### Test Cases:

1. **Single Point Building:**

   - Harus menggunakan routing normal
   - Tidak ada alternative routes

2. **Multiple Points Building:**

   - Harus menggunakan multi-route
   - Primary route dengan instruksi
   - Alternative routes tanpa instruksi

3. **No Routes Found:**
   - Harus menampilkan error message
   - Tidak crash aplikasi

### Expected Behavior:

- **Primary Route:** Biru, tebal, dengan instruksi navigasi
- **Alternative Routes:** Abu-abu, tipis, garis putus-putus, tanpa instruksi
- **Zoom:** Menampilkan semua routes dalam view
- **Cleanup:** Menghapus routes lama saat routing baru

### Error Fixes Applied:

1. **Segments Array Error:**

   - ✅ Added validation for segments data type
   - ✅ Added conversion from single segment object to array
   - ✅ Added debug logging to track data structure
   - ✅ Added fallback handling for invalid data

2. **Data Normalization:**

   - ✅ Normalize stepData before processing
   - ✅ Handle both array and single object formats
   - ✅ Skip invalid steps instead of crashing

3. **Debug Logging:**
   - ✅ Added comprehensive logging for data structure
   - ✅ Track data type and format at each step
   - ✅ Log conversion attempts and results
