# CORS Fix untuk Ngrok Header

## Masalah CORS dengan Ngrok

Error yang muncul:
```
Access to fetch at 'https://pointmap-production.up.railway.app/api/bangunan/geojson' 
from origin 'https://pointmap.vercel.app' has been blocked by CORS policy: 
Request header field ngrok-skip-browser-warning is not allowed by Access-Control-Allow-Headers 
in preflight response.
```

## Penyebab Masalah

Header `ngrok-skip-browser-warning` ditambahkan oleh ngrok atau proxy lain yang tidak diizinkan dalam CORS configuration.

## Solusi yang Diterapkan

### 1. Update CORS Configuration

```javascript
const corsOptions = {
  origin: [
    "https://pointmap.vercel.app",
    "https://pointmap-production.up.railway.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "ngrok-skip-browser-warning",  // ✅ Added
    "User-Agent",                  // ✅ Added
    "Origin",                      // ✅ Added
    "Referer"                      // ✅ Added
  ],
  optionsSuccessStatus: 200,
};
```

### 2. Remove Ngrok Headers Middleware

```javascript
// Remove ngrok headers if present
app.use((req, res, next) => {
  // Remove ngrok headers that might cause CORS issues
  delete req.headers['ngrok-skip-browser-warning'];
  delete req.headers['ngrok-trace-id'];
  next();
});
```

## Testing

### Test CORS dengan Ngrok Header:

```bash
# Test via Railway CLI
railway run node backend/test-cors-detailed.js

# Test via curl
curl -X OPTIONS \
  -H "Origin: https://pointmap.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, ngrok-skip-browser-warning" \
  -H "ngrok-skip-browser-warning: true" \
  https://pointmap-production.up.railway.app/api/bangunan/geojson
```

### Test di Browser Console:

```javascript
// Test fetch dengan ngrok header
fetch('https://pointmap-production.up.railway.app/api/bangunan/geojson', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Deployment

### Commit dan Deploy:

```bash
git add .
git commit -m "fix: add ngrok header support to CORS configuration"
git push origin main
```

### Verifikasi di Railway:

1. Tunggu deploy selesai (2-5 menit)
2. Test frontend di `https://pointmap.vercel.app`
3. Periksa browser console untuk memastikan tidak ada error CORS

## Troubleshooting

### Jika Masih Error CORS:

1. **Periksa Railway Logs:**
   ```bash
   railway logs
   ```

2. **Test Manual:**
   ```bash
   railway run node backend/test-cors-detailed.js
   ```

3. **Periksa Browser Network Tab:**
   - Buka Developer Tools
   - Lihat Network tab
   - Periksa request headers dan response headers

### Alternative Solutions:

1. **Disable Ngrok Header di Frontend:**
   ```javascript
   // Remove ngrok header from fetch requests
   const response = await fetch(url, {
     headers: {
       'Content-Type': 'application/json'
       // Remove ngrok-skip-browser-warning
     }
   });
   ```

2. **Use Proxy in Frontend:**
   ```javascript
   // Create API route in Next.js to proxy requests
   // pages/api/proxy.js
   export default async function handler(req, res) {
     const response = await fetch('https://pointmap-production.up.railway.app' + req.url, {
       method: req.method,
       headers: {
         'Content-Type': 'application/json'
       }
     });
     const data = await response.json();
     res.json(data);
   }
   ```

## Monitoring

### Check CORS Headers:

```bash
# Test CORS headers
curl -I -X OPTIONS \
  -H "Origin: https://pointmap.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: ngrok-skip-browser-warning" \
  https://pointmap-production.up.railway.app/api/bangunan/geojson
```

### Expected Response Headers:

```
Access-Control-Allow-Origin: https://pointmap.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, ngrok-skip-browser-warning, User-Agent, Origin, Referer
Access-Control-Allow-Credentials: true
```

**Setelah deploy, CORS error dengan ngrok header seharusnya sudah teratasi!** 🎯
