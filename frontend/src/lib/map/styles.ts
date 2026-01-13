import L from "leaflet";

/**
 * Konfigurasi style per kategori fitur (GeoJSON → Leaflet PathOptions)
 */

export const kategoriStyle: Record<string, L.PathOptions> = {
  Bangunan: {
    color: "#1e40af",
    weight: 2,
    fillColor: "#3b82f6",
    fillOpacity: 0.4,
  },
};

/** Style default untuk fitur yang tidak memiliki kategori. */
export const defaultStyle: L.PathOptions = {
  color: "#adb5bd",
  weight: 1,
  fillColor: "#adb5bd",
  fillOpacity: 0.4,
};
