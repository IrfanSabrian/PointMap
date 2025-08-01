# Fitur Mode Transportasi

## Deskripsi

Fitur ini memungkinkan pengguna untuk memilih mode transportasi saat melakukan routing: **Jalan Kaki** atau **Kendaraan**.

## Cara Kerja

### Mode Jalan Kaki

- ✅ **Prioritas jalur "pejalan"** untuk rute yang lebih langsung
- ✅ Jika tidak ada jalur "pejalan", baru pakai jalur "both"
- ✅ **Jalur oneway**: Bisa digunakan dari kedua arah (merah→hijau dan hijau→merah)
- ✅ Instruksi: "Jalan X meter"
- ✅ Waktu dihitung berdasarkan kecepatan jalan kaki (~4 km/h)
- ✅ Icon: `faWalking` (🚶)

### Mode Kendaraan

- 🏍️ **WAJIB pakai jalur "both"** untuk perjalanan utama
- 🏍️ **Bisa pakai jalur "pejalan"** hanya untuk:
  - **Rute pejalan kaki** dari titik awal ke jalur "both" terdekat (jika mulai dari area pejalan)
  - **Rute pejalan kaki** dari jalur "both" terdekat ke tujuan (jika tujuan di area pejalan)
- 🏍️ **TIDAK boleh pakai jalur "pejalan"** untuk perjalanan utama
- 🏍️ **Jalur oneway**: Hanya berlaku untuk kendaraan, hanya boleh dari hijau→merah, dilarang dari merah→hijau
- 🏍️ Instruksi: "X meter" (tanpa kata "jalan")
- 🏍️ Waktu dihitung berdasarkan kecepatan kendaraan (~20 km/h)
- 🏍️ Icon: `faMotorcycle` (🏍️)

## Implementasi Teknis

### 1. State Management

```typescript
// useRouting.ts
export type TransportMode = "jalan_kaki" | "kendaraan";
const [transportMode, setTransportMode] = useState<TransportMode>("jalan_kaki");
```

### 2. UI Pemilihan Mode

- Tombol toggle dengan icon FontAwesome
- Mode aktif ditandai dengan warna primary
- Icon: `faWalking` untuk jalan kaki, `faMotorcycle` untuk kendaraan

### 3. Filtering Jalur

```typescript
// Filter jalur berdasarkan mode transportasi
if (transportMode === "jalan_kaki") {
  // Untuk pejalan kaki, prioritaskan jalur "pejalan", jika tidak ada baru pakai "both"
  const pejalanSegments = jalurFeatures.filter(
    (segment: any) => segment.properties?.Mode === "pejalan"
  );
  const bothSegments = jalurFeatures.filter(
    (segment: any) => segment.properties?.Mode === "both"
  );

  // Gabungkan dengan prioritas jalur pejalan
  filteredJalurFeatures = [...pejalanSegments, ...bothSegments];
} else if (transportMode === "kendaraan") {
  // Untuk kendaraan, WAJIB pakai jalur "both" saja untuk perjalanan utama
  // Jalur "pejalan" hanya untuk akses keluar/masuk area pejalan
  filteredJalurFeatures = jalurFeatures.filter(
    (segment: any) => segment.properties?.Mode === "both"
  );
}
```

### 4. Logika Jalur Oneway

```typescript
// Di findShortestRouteDijkstra - Menangani jalur oneway
const isOneWay = route.properties?.arah === "oneway";

if (transportMode === "kendaraan" && isOneWay) {
  // Untuk kendaraan, jalur oneway hanya boleh dari hijau (end) ke merah (start)
  // TIDAK BOLEH dari merah (start) ke hijau (end) - harus mutar
  edges.push({
    from: end,
    to: start,
    route,
    length: routeLength,
  });
  console.log(
    `🚫 Jalur oneway ${route.id}: hanya arah hijau→merah untuk kendaraan (dilarang merah→hijau)`
  );
} else {
  // Untuk pejalan kaki atau jalur non-oneway: bidirectional
  edges.push({
    from: start,
    to: end,
    route,
    length: routeLength,
  });
  edges.push({
    from: end,
    to: start,
    route,
    length: routeLength,
  });
}
```

### 5. Logika Akses Jalur Pejalan (Kendaraan)

```typescript
// Cek apakah kendaraan perlu akses ke jalur "both"
if (transportMode === "kendaraan" && startPoint && endPoint) {
  // Cek apakah titik awal berada di area pejalan kaki
  const startInPedestrianArea = routeSegments.some((segment) => {
    if (segment.properties?.Mode === "pejalan") {
      // Cek apakah titik awal dekat dengan segmen pejalan
      return isNearSegment(startPoint, segment);
    }
    return false;
  });

  // Cek apakah titik tujuan berada di area pejalan kaki
  const endInPedestrianArea = routeSegments.some((segment) => {
    if (segment.properties?.Mode === "pejalan") {
      // Cek apakah titik tujuan dekat dengan segmen pejalan
      return isNearSegment(endPoint, segment);
    }
    return false;
  });

  if (startInPedestrianArea) {
    // Cari jalur "both" terdekat dari titik awal
    const nearestBoth = findNearestBothSegment(startPoint, routeSegments);
    if (nearestBoth) {
      // Cari jalur pejalan kaki yang mengarah dari titik awal ke jalur "both" terdekat
      const pedestrianSegmentsToBoth = routeSegments.filter((segment) => {
        if (segment.properties?.Mode === "pejalan") {
          // Cek apakah segmen ini dekat dengan titik awal
          const isNearStart = isNearSegment(startPoint, segment);
          // Cek apakah segmen ini mengarah ke jalur "both" terdekat
          const isTowardsBoth = isNearSegment(
            segment,
            nearestBoth.nearestPoint
          );
          return isNearStart && isTowardsBoth;
        }
        return false;
      });

      // Tambahkan jalur pejalan kaki ke jalur "both" di awal, lalu segmen akses
      const finalSegments = [];
      if (pedestrianSegmentsToBoth.length > 0) {
        finalSegments.push(...pedestrianSegmentsToBoth);
      }
      finalSegments.push(accessSegment);
      finalSegments.push(...routeSegments);
      processedSegments = finalSegments;
    }
  }

  if (endInPedestrianArea) {
    // Cari jalur "both" terdekat ke titik tujuan
    const nearestBoth = findNearestBothSegment(endPoint, routeSegments);
    if (nearestBoth) {
      // Cari jalur pejalan kaki yang mengarah ke titik tujuan (untuk menuju tujuan)
      const pedestrianSegmentsToDestination = routeSegments.filter(
        (segment) => {
          if (segment.properties?.Mode === "pejalan") {
            // Cek apakah segmen ini dekat dengan titik tujuan
            return isNearSegment(endPoint, segment);
          }
          return false;
        }
      );

      // Tambahkan segmen akses dan jalur pejalan ke tujuan
      const finalSegments = [...routeSegments, accessSegment];
      if (pedestrianSegmentsToDestination.length > 0) {
        finalSegments.push(...pedestrianSegmentsToDestination);
      }
      processedSegments = finalSegments;
    }
  }
}
```

### 6. Validasi Titik Awal dan Tujuan

```typescript
// Validasi titik awal dan tujuan sama
const distance = calculateDistance(startLatLng, endLatLng);
if (distance < 10) {
  // Jika jarak kurang dari 10 meter, dianggap sama
  alert(
    "Titik awal dan tujuan tidak boleh sama. Silakan pilih tujuan yang berbeda."
  );
  setShowRouteModal(false);
  setIsCalculatingRoute(false);
  return;
}
```

### 7. Instruksi Navigasi

```typescript
// getStepInstruction dengan mode transportasi
export function getStepInstruction(idx, steps, transportMode) {
  // Instruksi berbeda untuk setiap mode
  // Logika belok konsisten dengan logika penggabungan segmen (sudut > 30°)

  // Instruksi khusus untuk kendaraan akses jalur pejalan
  if (isAccessSegment) {
    if (accessType === "start") {
      return `Keluar dari area pejalan kaki ke jalur kendaraan. ${distanceText}`;
    } else if (accessType === "end") {
      return `Masuk ke area pejalan kaki dari jalur kendaraan. ${distanceText}`;
    }
  }

  // Instruksi untuk kendaraan menggunakan jalur pejalan kaki
  const isPedestrianSegment = step.raw?.properties?.Mode === "pejalan";
  if (isPedestrianSegment) {
    // Cek apakah ini jalur pejalan kaki ke tujuan (step sebelum terakhir)
    if (idx === steps.length - 2) {
      return `Lanjut dengan jalan kaki ke tujuan. ${distanceText}`;
    }
    // Cek apakah ini jalur pejalan kaki ke jalur "both" (step awal)
    else if (idx === 0) {
      return `Mulai dengan jalan kaki menuju jalur kendaraan. ${distanceText}`;
    }
  }
}
```

## Struktur Data GeoJSON

### Properti Jalur

```json
{
  "properties": {
    "Mode": "both" | "pejalan",
    "arah": "oneway" | "twoway",     // Arah jalur (oneway = satu arah)
    "waktu_kaki": 16.54,            // detik
    "waktu_kendara": 1.65,          // detik
    "panjang": 22.98                // meter
  }
}
```

### Jalur Oneway

- **Kolom "arah"**: `"oneway"` untuk jalur satu arah
- **Titik merah**: Titik awal (start point) dari garis di ArcGIS
- **Titik hijau**: Titik akhir (end point) dari garis di ArcGIS
- **Arah yang diizinkan**: Dari titik hijau → ke titik merah
- **Arah yang dilarang**: Dari titik merah → ke titik hijau

**Perilaku Mode Transportasi:**

**Mode Jalan Kaki:**

- ✅ Jalur oneway bisa digunakan dari kedua arah (merah→hijau dan hijau→merah)
- ✅ Tidak ada batasan arah

**Mode Kendaraan:**

- ✅ Jalur oneway hanya boleh dari arah yang benar (hijau→merah)
- 🚫 **DILARANG** menggunakan jalur oneway dari arah sebaliknya (merah→hijau)
- 🔄 **Harus mutar** untuk mencari rute alternatif jika arah salah
- 🚫 **Jalur oneway hanya berlaku untuk kendaraan**

## Kecepatan Transportasi

- **Jalan Kaki**: 4 km/h = 1.11 m/s
- **Kendaraan**: 20 km/h = 5.56 m/s

## Contoh Instruksi

### Mode Jalan Kaki

- "Mulai perjalanan. Lurus, jalan 50 meter"
- "Belok kiri, jalan 30 meter"
- "Sampai tujuan"

### Mode Kendaraan

- "Mulai dengan jalan kaki menuju jalur kendaraan. 25 meter" _(jika mulai dari area pejalan)_
- "Keluar dari area pejalan kaki ke jalur kendaraan. 15 meter"
- "Mulai perjalanan dengan kendaraan. Lurus, 100 meter"
- "Belok kiri, 50 meter"
- "Masuk ke area pejalan kaki dari jalur kendaraan. 20 meter" _(jika tujuan di area pejalan)_
- "Lanjut dengan jalan kaki ke tujuan. 30 meter" _(lanjut ke tujuan)_
- "Sampai tujuan"

## Logika Belok

- **Konsisten dengan penggabungan segmen**: Sudut > 30° = ada belokan
- **Belok kiri**: Sudut > 30°
- **Belok kanan**: Sudut < -30°
- **Lurus**: Sudut antara -30° sampai 30°

## Urutan Titik dalam UI

### Titik Awal

1. **📍 Lokasi Saya** (selalu di atas)
2. **🚪 Gerbang** (urut alfabetis)
3. **📍 Titik lainnya** (urut alfabetis)

### Titik Tujuan

- Input pencarian dengan hasil yang difilter
- Tidak menampilkan titik yang sudah dipilih sebagai tujuan

## Validasi

- **Titik awal dan tujuan sama**: Jika jarak < 10 meter, akan muncul pesan error
- **Titik tidak valid**: Jika koordinat tidak ditemukan atau tidak valid
- **Data tidak lengkap**: Jika titik awal atau tujuan tidak dipilih

## Fitur Tambahan

- Waktu total ditampilkan sesuai mode transportasi di UI navigasi
- Icon transportasi di UI navigasi (`faWalking` / `faMotorcycle`)
- Logika routing yang berbeda untuk setiap mode
- **Mode pejalan kaki**: Prioritas jalur "pejalan", fallback ke "both"
- **Mode kendaraan**: Wajib jalur "both" untuk perjalanan utama, jalur "pejalan" untuk rute ke/dari jalur "both"
- **Rute pejalan kaki**: Kendaraan menggunakan rute pejalan kaki untuk menuju ke jalur "both" terdekat
- **Jalur oneway**: Kendaraan hanya boleh menggunakan jalur oneway dari arah yang benar (hijau→merah)
- **Validasi lengkap**: Mencegah routing ke titik yang sama atau tidak valid
- **Instruksi tanpa waktu**: Fokus pada jarak dan arah, bukan waktu
