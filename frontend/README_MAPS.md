# PointMap - Google Maps Integration

Dokumentasi untuk komponen Google Maps di aplikasi PointMap.

## Komponen Peta

### Google Maps

**File:** `src/components/GoogleMapsTile.tsx`

**Fitur:**

- ✅ Peta street view dan satellite view
- ✅ Toggle antara roadmap dan satellite
- ✅ Marker untuk lokasi Polnep
- ✅ Google Maps embed integration
- ✅ Tidak memerlukan API key setup manual

**Cara Penggunaan:**

```tsx
<GoogleMaps
  initialLat={-0.0}
  initialLng={109.3333}
  initialZoom={15}
  className="w-full h-full"
/>
```

**Props:**

- `initialLat`: Latitude awal (default: -0.0)
- `initialLng`: Longitude awal (default: 109.3333)
- `initialZoom`: Level zoom awal (default: 15)
- `className`: CSS class tambahan

**Kontrol:**

- Klik tombol "🌍 Street View" / "🛰️ Satellite View" untuk mengganti tampilan
- Zoom dengan mouse wheel atau tombol zoom di peta
- Pan dengan drag mouse
- Fullscreen dengan tombol di peta

## Implementasi di Halaman Utama

### Render Google Maps

```tsx
<div className="w-full h-full">
  <GoogleMaps
    initialLat={-0.0}
    initialLng={109.3333}
    initialZoom={15}
    className="w-full h-full"
  />
</div>
```

### Header Peta

```tsx
<div className="bg-primary text-white text-lg md:text-xl font-bold text-left py-3 px-6 shadow rounded-t-2xl flex items-center justify-between">
  <span>Polnep Interactive Map</span>

  {/* Map Type Selector - Hanya Google Maps */}
  <div className="flex items-center gap-2">
    <span className="text-sm font-normal">Peta:</span>
    <div className="bg-white text-primary px-3 py-1 rounded-lg text-sm font-medium">
      Google Maps
    </div>
  </div>
</div>
```

## Fitur Toggle Satelit

### Google Maps

- **Roadmap View**: Google Maps street tiles
- **Satellite View**: Google Maps satellite tiles
- Toggle dengan tombol di pojok kiri atas peta
- Menggunakan Google Maps Embed API

## Koordinat Lokasi

**Politeknik Negeri Pontianak:**

- Latitude: -0.0
- Longitude: 109.3333
- Default Zoom: 15

## API Key

Komponen menggunakan API key yang sudah disediakan untuk testing:

```
AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
```

**Untuk Production:**

1. Dapatkan API key dari [Google Cloud Console](https://console.cloud.google.com/)
2. Aktifkan Maps Embed API
3. Ganti API key di komponen `GoogleMapsTile.tsx`

## Troubleshooting

### Peta Tidak Muncul

1. Pastikan koneksi internet stabil
2. Cek apakah iframe tidak diblokir browser
3. Pastikan API key valid dan Maps Embed API aktif

### Toggle Satelit Tidak Berfungsi

1. Pastikan API key memiliki akses ke satellite tiles
2. Cek console browser untuk error

### Performance Issues

1. Google Maps embed sudah dioptimasi untuk performa
2. Loading lazy untuk iframe
3. Minimal dependencies

## Keunggulan Google Maps

### ✅ Kelebihan

- **Familiar**: Interface yang sudah dikenal pengguna
- **Lengkap**: Street view, satellite, terrain
- **Akurat**: Data Google Maps yang terupdate
- **Responsive**: Bekerja baik di semua device
- **Embed**: Tidak perlu setup JavaScript library

### ⚠️ Keterbatasan

- **API Key**: Memerlukan Google Maps API key
- **Quota**: Terbatas pada penggunaan API
- **Dependency**: Bergantung pada Google Maps service

## Lisensi

- **Google Maps**: © Google Maps
- **Maps Embed API**: Tunduk pada Terms of Service Google

## Setup untuk Development

1. **Clone repository**
2. **Install dependencies**: `npm install`
3. **Run development server**: `npm run dev`
4. **Akses peta**: Buka browser dan scroll ke bagian peta

## Setup untuk Production

1. **Dapatkan Google Maps API key**
2. **Aktifkan Maps Embed API**
3. **Update API key di komponen**
4. **Deploy aplikasi**

## Contoh Penggunaan

### Basic Usage

```tsx
import GoogleMaps from "@/components/GoogleMapsTile";

function MyComponent() {
  return (
    <div className="w-full h-96">
      <GoogleMaps initialLat={-0.0} initialLng={109.3333} initialZoom={15} />
    </div>
  );
}
```

### Custom Location

```tsx
<GoogleMaps
  initialLat={-6.2088}
  initialLng={106.8456}
  initialZoom={12}
  className="w-full h-full"
/>
```
