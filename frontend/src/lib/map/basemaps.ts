/**
 * Daftar pilihan basemap (tanpa API key) untuk Leaflet.
 * key digunakan oleh `LeafletMap.tsx` untuk memilih tile layer.
 */
export const BASEMAPS = [
  {
    key: "esri_satellite",
    label: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  {
    key: "esri_topo",
    label: "Esri Topographic",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
  },
  // Dark basemap to use when isDark is true (no API key required)
  {
    key: "alidade_smooth_dark",
    label: "Dark (Carto)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
  },
  {
    key: "osm",
    label: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
];
