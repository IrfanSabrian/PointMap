# Setup Environment Variables

## Backend Setup

1. Copy file `.env.example` ke `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit file `backend/.env` dan isi dengan nilai yang sesuai:
   ```env
   # Database Configuration
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_USER=your_database_username
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   
   # Server Configuration
   PORT=3001
   
   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret_key
   
   # Environment
   NODE_ENV=development
   ```

## Frontend Setup

1. Copy file `.env.example` ke `.env.local`:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Edit file `frontend/.env.local` dan isi dengan nilai yang sesuai:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

## ⚠️ Keamanan

- **JANGAN PERNAH** commit file `.env` atau `.env.local` ke repository
- File environment sudah di-ignore oleh `.gitignore`
- Gunakan `.env.example` sebagai template
- Ganti semua credentials jika file `.env` pernah ter-upload ke repository

## Production Environment

Untuk production, set environment variables di platform hosting Anda:
- Railway: Set environment variables di dashboard Railway
- Vercel: Set environment variables di dashboard Vercel
