# Fitur Real-Time Update untuk LeafletMap

## Deskripsi

Fitur ini memungkinkan peta Leaflet untuk otomatis memperbarui data bangunan ketika ada perubahan yang dibuat melalui dashboard (tambah atau edit bangunan).

## Cara Kerja

### 1. Auto-Refresh dengan Polling (5 detik)

- LeafletMap akan otomatis mengecek data bangunan setiap 5 detik
- Polling hanya aktif di halaman utama (bukan dashboard atau mode edit)
- Menggunakan `loadBangunanData()` yang di-wrap dengan `useCallback`

### 2. Event-Based Update

- Ketika user menyimpan data bangunan (tambah/edit) di `BangunanForm`
- Form akan dispatch custom event: `window.dispatchEvent(new CustomEvent("bangunan-data-changed"))`
- LeafletMap mendengarkan event tersebut dan langsung refresh data
- Menampilkan notifikasi sukses kepada user

### 3. Manual Refresh via Ref

- Parent component dapat memanggil `mapRef.current?.refreshBangunanData()`
- Berguna untuk kasus-kasus khusus yang memerlukan refresh manual

## Implementasi

### Di LeafletMap.tsx

```typescript
// 1. State untuk tracking update
const [lastDataUpdate, setLastDataUpdate] = useState<number>(Date.now());

// 2. Function untuk load data (dengan useCallback)
const loadBangunanData = useCallback(() => {
  // ... fetch dan update data
}, [initialFeature]);

// 3. Auto-refresh dengan polling
useEffect(() => {
  if (initialFeature || isDashboard) return;
  const refreshInterval = setInterval(() => {
    loadBangunanData();
  }, 5000);
  return () => clearInterval(refreshInterval);
}, [loadBangunanData, initialFeature, isDashboard]);

// 4. Event listener untuk perubahan dari dashboard
useEffect(() => {
  const handleDataChange = () => {
    loadBangunanData();
    showNotification("success", "Data Diperbarui", "Perubahan data gedung telah dimuat");
  };
  window.addEventListener("bangunan-data-changed", handleDataChange);
  return () => window.removeEventListener("bangunan-data-changed", handleDataChange);
}, [loadBangunanData]);

// 5. Expose method via ref
useImperativeHandle(ref, () => ({
  refreshBangunanData: () => {
    loadBangunanData();
    showNotification("success", "Data Diperbarui", "Data bangunan telah diperbarui dari server");
  },
  // ... other methods
}), [loadBangunanData, ...]);
```

### Di BangunanForm.tsx

```typescript
// Setelah data berhasil disimpan
alert("Data berhasil disimpan!");

// Dispatch event
window.dispatchEvent(new CustomEvent("bangunan-data-changed"));

// Panggil callback
if (onSuccess) {
  onSuccess();
} else {
  router.push("/dashboard/bangunan");
}
```

## Keuntungan

1. **User Experience yang Lebih Baik**

   - User tidak perlu refresh halaman manual
   - Perubahan langsung terlihat di peta
   - Feedback visual dengan notifikasi

2. **Konsistensi Data**

   - Data di peta selalu sinkron dengan database
   - Multiple user dapat melihat perubahan secara real-time

3. **Fleksibilitas**
   - 3 cara update: polling, event, manual
   - Dapat disesuaikan untuk kebutuhan yang berbeda

## Catatan Teknis

- Polling interval: 5000ms (5 detik) - dapat disesuaikan
- Polling dinonaktifkan saat:
  - `isDashboard === true` (sedang di dashboard)
  - `initialFeature` ada (sedang edit satu bangunan)
- Event name: `"bangunan-data-changed"`
- Ref methods: `refreshBangunanData()`, `highlightFeature()`, `toggleBangunanLayer()`

## Testing

Untuk test fitur ini:

1. Buka halaman utama dengan peta
2. Di tab/window lain, buka dashboard dan tambah bangunan baru
3. Simpan bangunan
4. Kembali ke halaman peta
5. Perhatikan:
   - Notifikasi "Data Diperbarui" muncul
   - Bangunan baru langsung terlihat di peta
   - Tidak perlu refresh manual

## Future Improvements

1. WebSocket untuk real-time yang lebih efisien
2. Optimistic updates
3. Undo/redo functionality
4. Conflict resolution untuk multiple editors
