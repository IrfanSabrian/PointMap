# Update API Building Details

## Perubahan yang Dilakukan

### 1. Update API Base URL

**Sebelum:**

```javascript
const API_BASE_URL = "http://localhost:3001/api";
```

**Sesudah:**

```javascript
const API_BASE_URL = "https://pointmap-production.up.railway.app/api";
```

### 2. Update Fetch Requests dengan CORS Configuration

Semua fetch requests diupdate dengan konfigurasi CORS yang tepat:

```javascript
// Sebelum
const response = await fetch(`${API_BASE_URL}/bangunan/${buildingId}`);

// Sesudah
const response = await fetch(`${API_BASE_URL}/bangunan/${buildingId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
});
```

### 3. Endpoints yang Diupdate

1. **Bangunan Data:**

   ```javascript
   fetch(`${API_BASE_URL}/bangunan/${buildingId}`, {
     method: "GET",
     headers: { "Content-Type": "application/json" },
     credentials: "include",
   });
   ```

2. **Ruangan 3D Data:**

   ```javascript
   fetch(`${API_BASE_URL}/ruangan/bangunan/${buildingId}/3d`, {
     method: "GET",
     headers: { "Content-Type": "application/json" },
     credentials: "include",
   });
   ```

3. **Lantai Gambar Data:**

   ```javascript
   fetch(`${API_BASE_URL}/lantai-gambar/bangunan/${buildingId}`, {
     method: "GET",
     headers: { "Content-Type": "application/json" },
     credentials: "include",
   });
   ```

4. **Ruangan Gallery Data:**
   ```javascript
   fetch(`${API_BASE_URL}/ruangan-gallery`, {
     method: "GET",
     headers: { "Content-Type": "application/json" },
     credentials: "include",
   });
   ```

## Testing

### 1. Test API di Browser Console

Buka browser console di halaman building-details dan jalankan:

```javascript
// Test semua API endpoints
testBuildingDetailsAPI();

// Test CORS headers
testCORSHeaders();
```

### 2. Test Manual di Browser

1. Buka `https://pointmap.vercel.app/building-details?id=1&name=Test`
2. Periksa browser console untuk error
3. Periksa Network tab untuk melihat request/response

### 3. Test dengan curl

```bash
# Test bangunan endpoint
curl -X GET \
  -H "Content-Type: application/json" \
  https://pointmap-production.up.railway.app/api/bangunan/1

# Test ruangan 3D endpoint
curl -X GET \
  -H "Content-Type: application/json" \
  https://pointmap-production.up.railway.app/api/ruangan/bangunan/1/3d

# Test CORS headers
curl -X OPTIONS \
  -H "Origin: https://pointmap.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://pointmap-production.up.railway.app/api/bangunan/1
```

## Troubleshooting

### Jika Masih Error CORS:

1. **Periksa Railway Logs:**

   ```bash
   railway logs
   ```

2. **Test API Manual:**

   ```bash
   railway run node backend/test-cors-detailed.js
   ```

3. **Periksa Browser Network Tab:**
   - Buka Developer Tools
   - Lihat Network tab
   - Periksa request headers dan response headers

### Expected Response Headers:

```
Access-Control-Allow-Origin: https://pointmap.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, ngrok-skip-browser-warning, User-Agent, Origin, Referer
Access-Control-Allow-Credentials: true
```

## Deployment

### Commit dan Deploy:

```bash
git add .
git commit -m "feat: update building-details to use Railway API with CORS support"
git push origin main
```

### Verifikasi:

1. Tunggu Vercel deploy selesai (2-5 menit)
2. Test halaman building-details
3. Periksa browser console untuk memastikan tidak ada error

## Monitoring

### Check API Status:

```javascript
// Di browser console
fetch("https://pointmap-production.up.railway.app/api/bangunan/1")
  .then((response) => response.json())
  .then((data) => console.log("API Status:", data))
  .catch((error) => console.error("API Error:", error));
```

### Check CORS Status:

```javascript
// Di browser console
fetch("https://pointmap-production.up.railway.app/api/bangunan/1", {
  method: "OPTIONS",
  headers: {
    Origin: "https://pointmap.vercel.app",
    "Access-Control-Request-Method": "GET",
  },
}).then((response) => {
  console.log("CORS Headers:", {
    "Access-Control-Allow-Origin": response.headers.get(
      "Access-Control-Allow-Origin"
    ),
    "Access-Control-Allow-Methods": response.headers.get(
      "Access-Control-Allow-Methods"
    ),
    "Access-Control-Allow-Headers": response.headers.get(
      "Access-Control-Allow-Headers"
    ),
  });
});
```

**Setelah deploy, building-details seharusnya bisa mengakses API Railway dengan normal!** 🎯
