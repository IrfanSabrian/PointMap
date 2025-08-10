import L from "leaflet";

/**
 * Konfigurasi style per kategori fitur (GeoJSON → Leaflet PathOptions)
 */

export const kategoriStyle: Record<string, L.PathOptions> = {
  Bangunan: {
    color: "#1e40af",
    weight: 2,
    fillColor: "#3b82f6",
    fillOpacity: 0.8,
  },
  Trotoar: {
    color: "#374151",
    weight: 1,
    fillColor: "#6b7280",
    fillOpacity: 0.7,
  },
  Jalan: {
    color: "#374151",
    weight: 2,
    fillColor: "#4b5563",
    fillOpacity: 0.8,
  },
  Lahan: {
    color: "#166534",
    weight: 1,
    fillColor: "#22c55e",
    fillOpacity: 0.6,
  },
  Parkir: {
    color: "#6b7280",
    weight: 1,
    fillColor: "#ffffff",
    fillOpacity: 0.5,
  },
  Kanopi: {
    color: "#ea580c",
    weight: 1,
    fillColor: "#fb923c",
    fillOpacity: 0.6,
  },
  Kolam: {
    color: "#0369a1",
    weight: 1,
    fillColor: "#0ea5e9",
    fillOpacity: 0.6,
  },
  Paving: {
    color: "#78716c",
    weight: 1,
    fillColor: "#a8a29e",
    fillOpacity: 0.8,
  },
  Taman: {
    color: "#7c3aed",
    weight: 1,
    fillColor: "#a78bfa",
    fillOpacity: 0.6,
  },
};

/** Style default untuk fitur yang tidak memiliki kategori. */
export const defaultStyle: L.PathOptions = {
  color: "#adb5bd",
  weight: 1,
  fillColor: "#adb5bd",
  fillOpacity: 0.5,
};
