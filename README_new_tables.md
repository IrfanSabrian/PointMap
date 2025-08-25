# Tabel Baru untuk PointMap

## Deskripsi

File ini berisi tabel baru untuk menyimpan data dari GeoJSON files:

- `titik_table.sql` - Tabel untuk data titik (points)
- `jalur_table.sql` - Tabel untuk data jalur (paths/routes)

## Cara Penggunaan

### 1. Jalankan Tabel Titik

```sql
source titik_table.sql;
```

### 2. Jalankan Tabel Jalur

```sql
source jalur_table.sql;
```

## Struktur Tabel

### Tabel `titik`

- `id_titik` - Primary key auto increment
- `nama` - Nama lokasi titik
- `koordinat_x` - Longitude (X coordinate)
- `koordinat_y` - Latitude (Y coordinate)
- `geometri` - GeoJSON geometry dalam format JSON
- `created_at` - Timestamp pembuatan record

### Tabel `jalur`

- `id_jalur` - Primary key auto increment
- `mode` - Mode transportasi ('both' atau 'pejalan')
- `arah` - Arah jalur ('oneway' atau 'twoway')
- `panjang` - Panjang jalur dalam meter
- `waktu_kaki` - Waktu tempuh berjalan kaki (detik)
- `waktu_kendara` - Waktu tempuh kendaraan (detik)
- `geometri` - GeoJSON geometry dalam format JSON
- `created_at` - Timestamp pembuatan record

## Keuntungan Tabel Dinamis

1. **Fleksibel** - Bisa menambah/edit data tanpa mengubah struktur
2. **Scalable** - Mudah menambah field baru sesuai kebutuhan
3. **Maintainable** - Data terpisah dari aplikasi utama
4. **Queryable** - Bisa query data dengan SQL standar

## Contoh Query

### Cari semua titik dengan nama tertentu

```sql
SELECT * FROM titik WHERE nama LIKE '%Gerbang%';
```

### Cari jalur dengan mode tertentu

```sql
SELECT * FROM jalur WHERE mode = 'pejalan';
```

### Hitung total panjang jalur

```sql
SELECT SUM(panjang) as total_panjang FROM jalur;
```
