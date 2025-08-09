/** Endpoint GeoJSON bangunan dari backend (dinamis). */
export const geojsonBangunanUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/geojson`;
/** GeoJSON statis untuk layer referensi non-bangunan. */
export const geojsonStatisUrl = "/geojson/Polnep WGS_1984.geojson";
