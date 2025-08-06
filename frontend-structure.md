# Struktur Folder Frontend PointMap

## Overview

Frontend aplikasi PointMap dibangun menggunakan Next.js 15 dengan TypeScript, Tailwind CSS untuk styling, dan Leaflet untuk implementasi peta interaktif.

## Struktur Folder

### 📁 `src/`

Folder utama source code aplikasi.

#### 📁 `src/app/`

Folder menggunakan Next.js App Router (App Router).

- **`page.tsx`** - Halaman utama (homepage) aplikasi
- **`layout.tsx`** - Layout utama aplikasi dengan metadata dan providers
- **`layout-metadata.ts`** - Konfigurasi metadata untuk SEO
- **`globals.css`** - Global CSS styles
- **`theme-provider.tsx`** - Provider untuk dark/light theme

##### 📁 `src/app/login/`

Folder untuk halaman login.

- **`page.tsx`** - Halaman login admin

##### 📁 `src/app/dashboard/`

Folder untuk halaman dashboard admin.

- **`page.tsx`** - Dashboard admin untuk manajemen data

#### 📁 `src/components/`

Folder berisi komponen React yang dapat digunakan kembali.

- **`LeafletMap.tsx`** - Komponen peta interaktif menggunakan Leaflet
- **`ParticlesCustom.tsx`** - Komponen animasi particles untuk background
- **`useGps.ts`** - Custom hook untuk GPS functionality
- **`useRouting.ts`** - Custom hook untuk routing dan navigasi

#### 📁 `src/lib/`

Folder berisi utility functions dan konfigurasi.

- **`routeSteps.ts`** - Utility untuk menangani langkah-langkah routing
- **`routing.ts`** - Konfigurasi dan logic untuk routing aplikasi

### 📁 `public/`

Folder untuk static assets.

#### 📁 `public/building-details/`

Folder untuk halaman detail bangunan (standalone).

- **`index.html`** - Halaman detail bangunan
- **`README.md`** - Dokumentasi halaman detail
- **`css/style.css`** - Styles untuk halaman detail
- **`js/`** - JavaScript files untuk halaman detail
  - **`classie.js`** - Utility untuk class manipulation
  - **`list.min.js`** - Library untuk list functionality
  - **`main.js`** - Main JavaScript file
  - **`modernizr-custom.js`** - Modernizr library

#### 📁 `public/geojson/`

Folder berisi file GeoJSON untuk data peta.

- **`Jalur WGS_1984.geojson`** - Data jalur/path dalam format GeoJSON
- **`Polnep WGS_1984.geojson`** - Data polygon area Polnep
- **`Titik WGS_1984.geojson`** - Data titik-titik lokasi

#### 📁 `public/img/`

Folder untuk gambar-gambar aplikasi.

##### 📁 `public/img/default/`

Folder untuk gambar default.

- **`lantai/default.svg`** - Gambar default untuk lantai
- **`ruangan/thumbnail.jpg`** - Thumbnail default untuk ruangan
- **`thumbnail.jpg`** - Thumbnail default

##### 📁 `public/img/[id_bangunan]/`

Folder untuk gambar spesifik bangunan (19, 27, 3, 46).

- **`thumbnail.jpg`** - Thumbnail bangunan
- **`lantai/`** - Folder untuk gambar lantai
  - **`Lt1.svg`**, **`Lt2.svg`**, **`Lt3.svg`** - Gambar lantai
- **`ruangan/[id_ruangan]/`** - Folder untuk gambar ruangan
  - **`gallery1.jpg`**, **`gallery2.jpg`**, **`gallery3.jpg`** - Galeri ruangan

#### 📁 `public/Slider/`

Folder untuk gambar slider homepage.

- **`Background1.jpg`** sampai **`Background4.jpg`** - Gambar background slider

#### 📄 File Root Public

- **`icon.svg`** - Icon aplikasi
- **`logo.svg`** - Logo aplikasi
- **`maps.svg`** - Icon peta

### 📄 File Root

- **`package.json`** - Konfigurasi dependencies dan scripts
- **`package-lock.json`** - Lock file untuk dependency versions
- **`next.config.ts`** - Konfigurasi Next.js
- **`tailwind.config.ts`** - Konfigurasi Tailwind CSS
- **`tsconfig.json`** - Konfigurasi TypeScript
- **`postcss.config.js`** - Konfigurasi PostCSS
- **`eslint.config.mjs`** - Konfigurasi ESLint
- **`README.md`** - Dokumentasi frontend

## Dependencies Utama

- **Next.js 15** - React framework dengan App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet** - Interactive maps library
- **React Icons** - Icon library
- **React Slick** - Carousel component
- **TSParticles** - Particles animation
- **Dijkstrajs** - Pathfinding algorithm
- **Graphlib** - Graph algorithms

## Fitur Utama

- **Interactive Maps** - Peta interaktif dengan Leaflet
- **Pathfinding** - Algoritma routing menggunakan Dijkstra
- **Responsive Design** - Design yang responsif dengan Tailwind CSS
- **Dark/Light Theme** - Toggle theme dengan next-themes
- **Particles Animation** - Background animation dengan TSParticles
- **Image Gallery** - Galeri gambar untuk ruangan dan bangunan
