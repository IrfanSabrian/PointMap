# Railway Database Setup Guide

## Masalah: Database Connection Failed

Server Railway crash karena tidak bisa koneksi ke database. Berikut solusi lengkapnya:

## 1. Periksa Database Service di Railway

### Langkah 1: Buka Railway Dashboard
1. Buka [Railway Dashboard](https://railway.app)
2. Pilih project PointMap
3. Periksa apakah ada **MySQL service** yang running

### Langkah 2: Jika Tidak Ada Database Service
1. Klik **"New Service"**
2. Pilih **"Database"** → **"MySQL"**
3. Tunggu sampai service selesai provisioning
4. Catat **connection details** dari service tersebut

## 2. Update Environment Variables

### Jika Database Service Baru Dibuat:
1. Buka tab **"Variables"** di app service
2. Update environment variables dengan credentials dari database service:

```
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASS=[password dari database service]
DB_NAME=railway
```

### Cara Dapat Password Database:
1. Klik database service di Railway
2. Buka tab **"Connect"**
3. Copy **password** dari connection string

## 3. Test Database Connection

### Via Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login dan link project
railway login
railway link

# Test database connection
railway run node backend/debug-db.js
```

### Via Railway Dashboard:
1. Buka tab **"Deployments"**
2. Klik **"Deploy"** untuk restart service
3. Periksa logs untuk melihat error detail

## 4. Troubleshooting

### Error: "Connection refused"
**Solusi:**
- Pastikan database service running
- Periksa DB_HOST dan DB_PORT
- Gunakan `mysql.railway.internal` untuk internal connection

### Error: "Access denied"
**Solusi:**
- Periksa DB_USER dan DB_PASS
- Pastikan credentials benar dari database service
- Reset password database jika perlu

### Error: "Database doesn't exist"
**Solusi:**
- Periksa DB_NAME
- Buat database jika belum ada
- Gunakan nama database yang benar

## 5. Quick Fix Commands

### Set Environment Variables via CLI:
```bash
railway variables set DB_HOST=mysql.railway.internal
railway variables set DB_PORT=3306
railway variables set DB_USER=root
railway variables set DB_PASS=[your_password]
railway variables set DB_NAME=railway
railway variables set NODE_ENV=production
```

### Test Connection:
```bash
railway run node backend/debug-db.js
```

### Restart Service:
```bash
railway up
```

## 6. Alternative: Use Railway's Database URL

Jika Railway menyediakan `DATABASE_URL`:

1. **Update config/db.js:**
```javascript
const dbConfig = process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
      dialect: "mysql",
      // ... rest of config
    }
  : {
      // ... existing config
    };
```

2. **Set Environment Variable:**
```bash
railway variables set DATABASE_URL=mysql://user:pass@host:port/database
```

## 7. Monitoring

### Check Logs:
```bash
railway logs
```

### Check Variables:
```bash
railway variables
```

### Check Services:
- Buka Railway dashboard
- Periksa status semua services
- Pastikan database service running

## 8. Emergency Fallback

Jika database masih bermasalah, gunakan SQLite:

1. **Install SQLite:**
```bash
npm install sqlite3
```

2. **Update config/db.js:**
```javascript
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false
});
```

3. **Deploy:**
```bash
git add .
git commit -m "fallback: use SQLite database"
git push
```

## 9. Verification

Setelah setup, periksa logs untuk memastikan:
```
✅ Koneksi DB berhasil
🚀 Server di http://localhost:8080
📊 Database status: Connected
```

**Langkah paling penting adalah memastikan ada MySQL service yang running di Railway project!** 🎯
