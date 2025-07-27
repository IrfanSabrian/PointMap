# Sistem Routing PointMap - Menggunakan Multiple Jalur GeoJSON

## Overview

Sistem routing ini menggunakan jalur dari file `Jalur WGS_1984.geojson` yang sudah disediakan untuk mencari dan menampilkan rute lengkap dari titik awal ke titik akhir dengan menggabungkan multiple jalur yang terhubung, bukan hanya satu jalur saja.

## Fitur Utama

### 1. **Penggunaan Multiple Jalur GeoJSON**

- **File**: `/geojson/Jalur WGS_1984.geojson`
- **Format**: LineString dengan koordinat [longitude, latitude]
- **Properties**: `OBJECTID`, `panjang`, `Mode`
- **Total Jalur**: 147 jalur yang tersedia
- **Menampilkan**: Rute lengkap dengan menggabungkan multiple jalur yang terhubung

### 2. **Titik Awal (Start Point)**

- **Lokasi Saya**: Menggunakan GPS user
- **Titik Pilihan**: Dipilih dari daftar titik GeoJSON yang tersedia

### 3. **Titik Tujuan (End Point)**

- **Bangunan**: Dipilih dari bangunan yang diklik di peta
- **Titik Pencarian**: Dicari berdasarkan nama dari GeoJSON titik

### 4. **Algoritma Routing Multi-Jalur**

- **Connected Route Finding**: Mencari jalur yang terhubung dengan titik awal dan akhir
- **Path Traversal**: Menjelajahi jalur yang terhubung untuk mencari rute lengkap
- **Smart Direction**: Menentukan arah jalur yang benar
- **Coordinate Merging**: Menggabungkan koordinat dari multiple jalur
- **Fallback**: Garis lurus hanya jika tidak ada jalur yang cocok

## Komponen Utama

### 1. **Routing Utility (`src/lib/routing.ts`)**

```typescript
// Interface utama
interface Point {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
}

interface Route {
  id: string;
  startPoint: string;
  endPoint: string;
  coordinates: [number, number][];
  distance: number;
  routeIds: string[]; // ID jalur yang digunakan
}
```

### 2. **Fungsi Utama**

- `calculateDistance()`: Menghitung jarak menggunakan Haversine formula
- `findNearestPoint()`: Mencari titik terdekat dari koordinat (max 100m)
- `getRouteCoordinates()`: Mengkonversi koordinat jalur ke format [lat, lng]
- `findConnectedRoutes()`: Mencari jalur yang terhubung dengan titik
- `findConnectedRouteToRoute()`: Mencari jalur yang terhubung dengan jalur lain
- `findCompleteRoute()`: Mencari rute lengkap menggunakan multiple jalur
- `findPathToDestination()`: Mencari path dari jalur tertentu ke tujuan
- `buildCompleteCoordinates()`: Membangun koordinat lengkap dari path
- `calculatePathDistance()`: Menghitung total jarak path
- `findRoute()`: Fungsi utama untuk mencari rute

## Cara Kerja

### 1. **Multi-Jalur Route Finding**

1. Cari jalur yang terhubung dengan titik awal (dalam 50 meter)
2. Cari jalur yang terhubung dengan titik akhir (dalam 50 meter)
3. Mulai dari jalur awal, jelajahi jalur yang terhubung
4. Lanjutkan sampai menemukan jalur yang terhubung dengan tujuan
5. Gabungkan semua jalur yang dilalui untuk membuat rute lengkap

### 2. **Path Traversal Algorithm**

```typescript
// Algoritma untuk menjelajahi jalur yang terhubung
function findPathToDestination(
  currentRoute,
  destination,
  allRoutes,
  maxSteps,
  visitedRoutes,
  currentPath
) {
  // Cek apakah sudah mencapai maksimal langkah
  if (maxSteps <= 0) return null;

  // Cek apakah jalur ini sudah dikunjungi
  if (visitedRoutes.has(currentRoute.id)) return null;

  // Tambahkan jalur ini ke path
  const newPath = [...currentPath, currentRoute];
  const newVisited = new Set(visitedRoutes);
  newVisited.add(currentRoute.id);

  // Cek apakah jalur ini terhubung dengan tujuan
  const routeEnd = getRouteEnd(currentRoute);
  const distanceToDestination = calculateDistance(routeEnd, destination);

  // Jika sudah dekat dengan tujuan, return path ini
  if (distanceToDestination < 50) {
    return buildCompletePath(newPath, destination);
  }

  // Cari jalur yang terhubung dengan jalur ini
  const connectedRoutes = findConnectedRouteToRoute(currentRoute, allRoutes);

  // Coba setiap jalur yang terhubung
  for (const connectedRoute of connectedRoutes.slice(0, 3)) {
    const result = findPathToDestination(
      connectedRoute,
      destination,
      allRoutes,
      maxSteps - 1,
      newVisited,
      newPath
    );
    if (result) return result;
  }

  return null;
}
```

### 3. **Coordinate Merging**

```typescript
// Menggabungkan koordinat dari multiple jalur
function buildCompleteCoordinates(path, destination) {
  let allCoordinates = [];

  for (let i = 0; i < path.length; i++) {
    const route = path[i];
    const routeCoords = getRouteCoordinates(route);

    if (i === 0) {
      // Jalur pertama, gunakan semua koordinat
      allCoordinates = [...routeCoords];
    } else {
      // Jalur berikutnya, skip koordinat pertama jika sama dengan akhir jalur sebelumnya
      const prevEnd = getRouteEnd(path[i - 1]);
      const currentStart = routeCoords[0];

      if (calculateDistance(prevEnd, currentStart) < 10) {
        allCoordinates.push(...routeCoords.slice(1));
      } else {
        allCoordinates.push(...routeCoords);
      }
    }
  }

  // Tambahkan koordinat tujuan jika tidak sama dengan akhir path
  const pathEnd = allCoordinates[allCoordinates.length - 1];
  if (calculateDistance(pathEnd, destination) > 10) {
    allCoordinates.push(destination);
  }

  return allCoordinates;
}
```

### 4. **Smart Direction Detection**

```typescript
// Cek apakah titik terhubung dengan awal atau akhir jalur
const startPoint = routeCoords[0];
const endPoint = routeCoords[routeCoords.length - 1];

const distanceToStart = calculateDistance(point, startPoint);
const distanceToEnd = calculateDistance(point, endPoint);

// Tentukan koneksi terdekat
const isStartConnected = distanceToStart < distanceToEnd;
```

## Struktur Data Jalur

### Contoh Jalur dari GeoJSON:

```json
{
  "type": "Feature",
  "id": 1,
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [109.34672805400004, -0.053895148999970388],
      [109.34688324300004, -0.054032165999956305]
    ]
  },
  "properties": {
    "OBJECTID": 1,
    "panjang": 63.946785351543518,
    "Mode": "both"
  }
}
```

### Proses Konversi:

```typescript
// Dari GeoJSON [lng, lat] ke Leaflet [lat, lng]
function getRouteCoordinates(route) {
  if (route.geometry?.type === "LineString" && route.geometry?.coordinates) {
    return route.geometry.coordinates.map(
      (coord) => [coord[1], coord[0]] // Convert [lng, lat] to [lat, lng]
    );
  }
  return [];
}
```

## Algoritma Routing Detail

### 1. **findConnectedRoutes()**

```typescript
// Mencari jalur yang terhubung dengan titik
function findConnectedRoutes(point, routes, maxDistance = 50) {
  const connectedRoutes = [];

  for (const route of routes) {
    const routeCoords = getRouteCoordinates(route);
    if (routeCoords.length === 0) continue;

    const startPoint = routeCoords[0];
    const endPoint = routeCoords[routeCoords.length - 1];

    const distanceToStart = calculateDistance(point, startPoint);
    const distanceToEnd = calculateDistance(point, endPoint);

    if (distanceToStart < maxDistance || distanceToEnd < maxDistance) {
      connectedRoutes.push({
        ...route,
        distanceToPoint: Math.min(distanceToStart, distanceToEnd),
        isStartConnected: distanceToStart < distanceToEnd,
        routeCoords: routeCoords,
      });
    }
  }

  return connectedRoutes.sort((a, b) => a.distanceToPoint - b.distanceToPoint);
}
```

### 2. **findConnectedRouteToRoute()**

```typescript
// Mencari jalur yang terhubung dengan jalur lain
function findConnectedRouteToRoute(route, routes, maxDistance = 30) {
  const connectedRoutes = [];
  const routeCoords = getRouteCoordinates(route);

  if (routeCoords.length === 0) return connectedRoutes;

  const routeEnd = routeCoords[routeCoords.length - 1];

  for (const otherRoute of routes) {
    if (otherRoute.id === route.id) continue; // Skip diri sendiri

    const otherCoords = getRouteCoordinates(otherRoute);
    if (otherCoords.length === 0) continue;

    const otherStart = otherCoords[0];
    const otherEnd = otherCoords[otherCoords.length - 1];

    // Cek koneksi dari akhir jalur ini ke jalur lain
    const endToOtherStart = calculateDistance(routeEnd, otherStart);
    const endToOtherEnd = calculateDistance(routeEnd, otherEnd);

    if (endToOtherStart < maxDistance || endToOtherEnd < maxDistance) {
      connectedRoutes.push({
        ...otherRoute,
        distanceToRoute: Math.min(endToOtherStart, endToOtherEnd),
        isStartConnected: endToOtherStart < endToOtherEnd,
        routeCoords: otherCoords,
      });
    }
  }

  return connectedRoutes.sort((a, b) => a.distanceToRoute - b.distanceToRoute);
}
```

### 3. **findCompleteRoute()**

```typescript
// Mencari rute lengkap menggunakan multiple jalur
function findCompleteRoute(startCoord, endCoord, routes, maxSteps = 10) {
  const startRoutes = findConnectedRoutes(startCoord, routes);
  const endRoutes = findConnectedRoutes(endCoord, routes);

  if (startRoutes.length === 0 || endRoutes.length === 0) {
    return null;
  }

  // Coba setiap jalur awal
  for (const startRoute of startRoutes.slice(0, 3)) {
    const path = findPathToDestination(startRoute, endCoord, routes, maxSteps);
    if (path) {
      return path;
    }
  }

  return null;
}
```

## Penggunaan

### 1. **Memilih Titik Awal**

```typescript
// Dari dropdown di modal routing
<select value={routeStartType} onChange={handleStartTypeChange}>
  <option value="my-location">Lokasi Saya</option>
  {titikFeatures.map((titik) => (
    <option value={titik.id}>{titik.properties.Nama}</option>
  ))}
</select>
```

### 2. **Mencari Titik Tujuan**

```typescript
// Input pencarian dengan autocomplete
<input
  value={routeEndSearchText}
  onChange={handleEndSearchChange}
  placeholder="Cari nama titik tujuan..."
/>
```

### 3. **Menjalankan Routing**

```typescript
// Panggil fungsi routing
const routeResult = findRoute(
  startCoordinates,
  endCoordinates,
  points,
  jalurFeatures
);

// Hasil akan berisi:
// - coordinates: Array koordinat lengkap dari titik awal ke akhir
// - distance: Total jarak rute
// - routeIds: ID jalur yang digunakan (bisa multiple jalur)
```

## Optimasi

### 1. **Performance**

- Proximity threshold 50 meter untuk menghubungkan titik dengan jalur
- Proximity threshold 30 meter untuk menghubungkan jalur dengan jalur
- Maksimal 10 langkah untuk menghindari infinite loop
- Maksimum 100 meter untuk mencari titik terdekat
- Efficient coordinate conversion dan merging

### 2. **Accuracy**

- Menggunakan panjang jalur dari properties `panjang`
- Haversine formula untuk jarak yang akurat
- Support untuk jalur dengan multiple koordinat
- Smart direction detection
- Coordinate deduplication saat merging

### 3. **User Experience**

- Real-time search dengan dropdown
- Visual feedback saat routing
- Console logging untuk debugging
- Fallback ke garis lurus jika tidak ada jalur
- Informasi detail jalur yang digunakan

## Debugging

### 1. **Console Logs**

```javascript
// Di browser console:
console.log("Mencari rute dari", startLatLng, "ke", endLatLng);
console.log("Jalur yang tersedia:", jalurFeatures.length);

// Saat routing berhasil:
console.log("✅ Rute lengkap ditemukan:", {
  totalCoordinates: polylineCoords.length,
  distance: Math.round(totalDistance),
  routeIds: routeResult.routeIds,
  routeCount: routeResult.routeIds.length,
});

// Detail setiap jalur yang digunakan:
console.log("  Jalur 1: ID 1, Panjang: 63.95m");
console.log("  Jalur 2: ID 5, Panjang: 45.23m");
console.log("  Jalur 3: ID 12, Panjang: 78.91m");
```

### 2. **Route Information**

- Total jalur: 147 jalur
- Format koordinat: [longitude, latitude]
- Properties: OBJECTID, panjang, Mode
- Route IDs: ID jalur yang digunakan dalam rute (bisa multiple)
- Coordinate count: Total koordinat dalam rute lengkap

### 3. **Common Issues**

- **Koordinat tidak cocok**: Pastikan format [lng, lat] vs [lat, lng]
- **Jalur tidak ditemukan**: Cek proximity threshold (50m untuk titik, 30m untuk jalur)
- **Rute tidak lengkap**: Pastikan ada jalur yang terhubung
- **Infinite loop**: Cek maxSteps parameter (default 10)

## Hasil Akhir

Sistem routing yang telah diimplementasikan:

✅ **Menggunakan multiple jalur GeoJSON yang sebenarnya**  
✅ **Menampilkan rute lengkap dari titik awal ke titik akhir**  
✅ **Tidak lagi menggunakan garis lurus**  
✅ **Mengikuti jalur yang sudah ditentukan**  
✅ **Menghitung jarak berdasarkan panjang jalur**  
✅ **Support untuk multiple koordinat dalam satu jalur**  
✅ **Smart direction detection**  
✅ **Path traversal untuk rute kompleks**  
✅ **Coordinate merging untuk rute lengkap**  
✅ **Fallback yang graceful jika jalur tidak ditemukan**  
✅ **Console logging untuk debugging detail**

Sistem ini sekarang benar-benar menggunakan multiple jalur dari file `Jalur WGS_1984.geojson` dan menampilkan rute lengkap dari titik awal ke titik akhir dengan menggabungkan jalur-jalur yang terhubung! 🎯
