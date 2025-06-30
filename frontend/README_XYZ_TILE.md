# Cara Menambahkan XYZ Tile ke Canvas

Dokumen ini menjelaskan cara mengimplementasikan XYZ tile layer pada canvas HTML5 untuk aplikasi peta interaktif.

## Apa itu XYZ Tile?

XYZ tile adalah sistem koordinat untuk peta web yang membagi peta dunia menjadi kotak-kotak (tiles) berdasarkan level zoom. Setiap tile memiliki koordinat (x, y, z) dimana:

- `x`: posisi horizontal tile
- `y`: posisi vertikal tile
- `z`: level zoom

## Komponen yang Tersedia

### 1. XYZMap (Basic)

Komponen dasar untuk menampilkan XYZ tile dengan fitur:

- Zoom in/out
- Pan (drag)
- Loading indicator
- Reset view

### 2. AdvancedXYZMap

Komponen lanjutan dengan fitur tambahan:

- Multiple tile providers (OpenStreetMap, Satellite, Terrain, CartoDB)
- Layer switching
- Koordinat lat/lng display
- Error handling dengan retry mechanism
- Attribution display

## Cara Penggunaan

### Import Komponen

```typescript
import XYZMap from "@/components/XYZMap";
import AdvancedXYZMap from "@/components/AdvancedXYZMap";
```

### Penggunaan Dasar

```tsx
// XYZ Map Basic
<XYZMap
  initialZoom={10}
  className="w-full h-full"
/>

// XYZ Map Advanced
<AdvancedXYZMap
  initialZoom={10}
  initialLat={-0.0000}  // Koordinat Pontianak
  initialLng={109.3333}
  className="w-full h-full"
/>
```

## Implementasi Manual

Jika ingin mengimplementasikan XYZ tile secara manual, berikut langkah-langkahnya:

### 1. Setup Canvas

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const [zoom, setZoom] = useState(10);
const [position, setPosition] = useState({ x: 0, y: 0 });
const [tiles, setTiles] = useState<Tile[]>([]);
```

### 2. Hitung Tile Coordinates

```typescript
const getTileCoordinates = () => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Konversi pixel ke tile coordinates
  const tileX = Math.floor((centerX - position.x) / 256);
  const tileY = Math.floor((centerY - position.y) / 256);

  // Hitung jumlah tile yang dibutuhkan
  const tilesX = Math.ceil(canvas.width / 256) + 2;
  const tilesY = Math.ceil(canvas.height / 256) + 2;

  const tileCoords: Tile[] = [];

  for (
    let x = tileX - Math.floor(tilesX / 2);
    x <= tileX + Math.floor(tilesX / 2);
    x++
  ) {
    for (
      let y = tileY - Math.floor(tilesY / 2);
      y <= tileY + Math.floor(tilesY / 2);
      y++
    ) {
      if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
        tileCoords.push({
          x,
          y,
          z: zoom,
          url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
          loaded: false,
        });
      }
    }
  }

  return tileCoords;
};
```

### 3. Load Tile Images

```typescript
const loadTile = (tile: Tile): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      tile.image = img;
      tile.loaded = true;
      resolve();
    };

    img.onerror = () => {
      reject(new Error(`Failed to load tile: ${tile.url}`));
    };

    img.src = tile.url;
  });
};
```

### 4. Render Tiles ke Canvas

```typescript
const renderTiles = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  tiles.forEach((tile) => {
    if (tile.loaded && tile.image) {
      const tileX = centerX + tile.x * 256 - position.x;
      const tileY = centerY + tile.y * 256 - position.y;

      ctx.drawImage(tile.image, tileX, tileY, 256, 256);
    }
  });
};
```

### 5. Event Handlers

```typescript
// Mouse events untuk pan
const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  setStartPos({
    x: e.clientX - position.x,
    y: e.clientY - position.y,
  });
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;

  setPosition({
    x: e.clientX - startPos.x,
    y: e.clientY - startPos.y,
  });
};

// Wheel event untuk zoom
const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();

  const zoomIntensity = 0.1;
  const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
  const newZoom = Math.min(Math.max(minZoom, zoom + delta), maxZoom);

  if (newZoom !== zoom) {
    setZoom(newZoom);
  }
};
```

## Tile Providers

### OpenStreetMap

```
URL: https://tile.openstreetmap.org/{z}/{x}/{y}.png
Max Zoom: 19
Attribution: © OpenStreetMap contributors
```

### Satellite (Esri)

```
URL: https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
Max Zoom: 19
Attribution: © Esri
```

### Terrain (Stamen)

```
URL: https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png
Max Zoom: 18
Attribution: © Stamen Design
```

### CartoDB Light

```
URL: https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png
Max Zoom: 19
Attribution: © CartoDB
```

## Konversi Koordinat

### Lat/Lng ke Tile Coordinates

```typescript
const latLngToTile = (lat: number, lng: number, zoom: number) => {
  const n = Math.pow(2, zoom);
  const xtile = Math.floor(((lng + 180) / 360) * n);
  const ytile = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      n
  );
  return { x: xtile, y: ytile };
};
```

### Tile Coordinates ke Lat/Lng

```typescript
const tileToLatLng = (x: number, y: number, zoom: number) => {
  const n = Math.pow(2, zoom);
  const lng = (x / n) * 360 - 180;
  const lat =
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  return { lat, lng };
};
```

## Best Practices

1. **Caching**: Implementasikan caching untuk tile yang sudah di-load
2. **Error Handling**: Tambahkan retry mechanism untuk tile yang gagal load
3. **Loading States**: Tampilkan loading indicator saat tile sedang di-load
4. **Responsive**: Pastikan canvas responsive terhadap ukuran container
5. **Performance**: Batasi jumlah tile yang di-load sesuai dengan viewport
6. **Attribution**: Selalu tampilkan attribution sesuai dengan tile provider

## Troubleshooting

### CORS Error

Pastikan tile provider mendukung CORS atau gunakan proxy server.

### Tile Tidak Muncul

- Periksa URL tile provider
- Pastikan koordinat tile valid
- Cek network tab untuk error loading

### Performance Issues

- Kurangi jumlah tile yang di-load
- Implementasikan tile caching
- Gunakan `requestAnimationFrame` untuk smooth rendering

## Contoh Lengkap

Lihat file `XYZMap.tsx` dan `AdvancedXYZMap.tsx` untuk implementasi lengkap dengan semua fitur yang disebutkan di atas.
