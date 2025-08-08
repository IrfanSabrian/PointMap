# CORS Troubleshooting Guide

## Masalah CORS yang Ditemui

Error yang muncul:
```
Access to fetch at 'https://pointmap-production.up.railway.app/api/bangunan/geojson' 
from origin 'https://pointmap.vercel.app' has been blocked by CORS policy
```

## Solusi yang Telah Diterapkan

### 1. Konfigurasi CORS di Backend (server.js)

```javascript
const corsOptions = {
  origin: [
    'https://pointmap.vercel.app',
    'https://pointmap-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
```

### 2. CORS di Setiap Route

```javascript
app.use("/api/bangunan", cors(corsOptions), bangunanRoutes);
app.use("/api/ruangan", cors(corsOptions), ruanganRoutes);
// ... dst
```

## Langkah-langkah Deployment

### 1. Deploy Backend ke Railway
```bash
# Commit perubahan
git add .
git commit -m "fix: update CORS configuration for Vercel frontend"
git push origin main
```

### 2. Verifikasi Environment Variables di Railway
Pastikan environment variables sudah benar di Railway dashboard:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `JWT_SECRET`

### 3. Test CORS Configuration
```bash
cd backend
node test-cors.js
```

## Troubleshooting

### Jika Masih Error CORS:

1. **Periksa Domain di CORS Options**
   - Pastikan domain Vercel sudah benar: `https://pointmap.vercel.app`
   - Tambahkan domain jika berbeda

2. **Periksa Railway Environment**
   - Pastikan server sudah restart setelah deploy
   - Periksa logs di Railway dashboard

3. **Test Manual dengan curl**
   ```bash
   # Test OPTIONS request
   curl -X OPTIONS \
     -H "Origin: https://pointmap.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     https://pointmap-production.up.railway.app/api/bangunan/geojson
   ```

4. **Periksa Browser Console**
   - Buka Developer Tools
   - Lihat Network tab
   - Periksa response headers

## Konfigurasi Frontend (Vercel)

### Environment Variables di Vercel:
```
NEXT_PUBLIC_API_BASE_URL=https://pointmap-production.up.railway.app
```

### Jika Menggunakan Custom Domain:
- Tambahkan domain baru ke `corsOptions.origin`
- Deploy ulang backend

## Monitoring

### Railway Logs:
```bash
# Periksa logs di Railway dashboard
# Atau gunakan Railway CLI
railway logs
```

### Vercel Logs:
```bash
# Periksa logs di Vercel dashboard
# Atau gunakan Vercel CLI
vercel logs
```

## Backup Plan

Jika CORS masih bermasalah, pertimbangkan:

1. **Proxy di Frontend**
   - Buat API route di Next.js untuk proxy request
   - Contoh: `/api/proxy/bangunan/geojson`

2. **CORS Proxy Service**
   - Gunakan service seperti cors-anywhere
   - Atau buat proxy server sendiri

3. **Same-Origin Setup**
   - Deploy frontend dan backend di domain yang sama
   - Atau gunakan subdomain
