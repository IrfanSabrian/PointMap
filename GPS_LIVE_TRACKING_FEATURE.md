# Fitur GPS Live Tracking dengan Arah

## Deskripsi

Fitur ini memungkinkan pengguna untuk melihat posisi GPS mereka secara real-time dengan lingkaran dan arah yang mereka hadapi di peta.

## Fitur Utama

### 1. Live GPS Tracking

- Posisi GPS selalu terupdate secara real-time
- Update setiap 3 detik untuk responsivitas yang baik
- Akurasi tinggi dengan `enableHighAccuracy: true`

### 2. Visual Marker dengan Arah

- **Lingkaran Biru**: Menunjukkan posisi pengguna
- **Panah Arah**: Menunjukkan arah yang sedang dihadapi pengguna
- **Animasi Pulse**: Ketika live tracking aktif, tombol GPS akan berkedip

### 3. Device Orientation Support

- Menggunakan `DeviceOrientationEvent` untuk mendapatkan heading
- Support untuk iOS dengan permission request
- Fallback jika device orientation tidak tersedia

## Cara Menggunakan

### 1. Aktifkan Live Tracking

1. Klik tombol GPS (ikon lokasi) di pojok kanan bawah peta
2. Tombol akan berubah menjadi merah dengan animasi pulse
3. Posisi Anda akan muncul di peta dengan lingkaran biru

### 2. Melihat Arah

- Panah di dalam lingkaran menunjukkan arah yang Anda hadapi
- Arah akan terupdate secara real-time saat Anda memutar device
- Jika device orientation tidak tersedia, hanya posisi yang akan ditampilkan

### 3. Hentikan Live Tracking

- Klik tombol GPS lagi untuk menghentikan live tracking
- Tombol akan kembali ke warna normal

## Implementasi Teknis

### Hook: `useGps.ts`

```typescript
// State untuk heading/bearing
const [userHeading, setUserHeading] = useState<number | null>(null);

// Event listener untuk device orientation
const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
  if (event.alpha !== null) {
    const heading = event.alpha;
    setUserHeading(heading);
  }
};
```

### Custom Marker Icon

```typescript
const createUserMarkerIcon = (heading: number | null) => {
  // Canvas untuk menggambar lingkaran dan panah
  const canvas = document.createElement("canvas");
  // ... implementasi drawing
};
```

### CSS Animations

```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Browser Support

### Geolocation

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile)

### Device Orientation

- ✅ Chrome/Edge (mobile)
- ✅ Firefox (mobile)
- ⚠️ Safari (iOS 13+ dengan permission)
- ❌ Desktop browsers (tidak tersedia)

## Permission Requirements

### Geolocation

- Browser akan meminta izin lokasi
- User harus mengizinkan akses lokasi

### Device Orientation (iOS)

- iOS 13+ memerlukan permission khusus
- User harus mengizinkan akses motion & orientation

## Troubleshooting

### GPS Tidak Muncul

1. Pastikan browser mendukung geolocation
2. Izinkan akses lokasi di browser
3. Pastikan GPS device aktif

### Arah Tidak Muncul

1. Pastikan device mendukung orientation
2. Untuk iOS, izinkan akses motion & orientation
3. Coba refresh halaman

### Live Tracking Tidak Berfungsi

1. Periksa console untuk error messages
2. Pastikan tidak ada ad blocker yang memblokir geolocation
3. Coba di browser yang berbeda

## File yang Dimodifikasi

1. `frontend/src/components/useGps.ts` - Hook GPS dengan heading
2. `frontend/src/components/LeafletMap.tsx` - UI dan marker implementation
3. `frontend/src/app/globals.css` - CSS untuk animasi dan styling

## Dependencies

- `@fortawesome/free-solid-svg-icons` - Icon untuk tombol GPS
- `leaflet` - Map library
- Browser APIs: `navigator.geolocation`, `DeviceOrientationEvent`
