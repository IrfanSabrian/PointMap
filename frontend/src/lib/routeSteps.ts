// src/lib/routeSteps.ts
import L from "leaflet";

// Fungsi untuk menghitung sudut antara dua segmen (untuk instruksi belok)
export function getAngleBetweenSegments(
  seg1: [number, number][],
  seg2: [number, number][]
) {
  if (!seg1.length || !seg2.length) return 0;
  const [x1, y1] = seg1[seg1.length - 2] || seg1[0];
  const [x2, y2] = seg1[seg1.length - 1];
  const [x3, y3] = seg2[1] || seg2[0];
  // v1: seg1, v2: seg2
  const v1 = [x2 - x1, y2 - y1];
  const v2 = [x3 - x2, y3 - y2];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const det = v1[0] * v2[1] - v1[1] * v2[0];
  const angle = Math.atan2(det, dot) * (180 / Math.PI);
  return angle;
}

// Fungsi untuk generate instruksi step
export function getStepInstruction(idx: number, steps: any[]) {
  if (steps[idx].type === "osrm") {
    return `Jalan ${Math.round(steps[idx].distance)} meter (jalan luar kampus)`;
  }
  if (idx === 0) return `Mulai, jalan ${Math.round(steps[idx].distance)} meter`;
  // Cek belok/lurus
  const prev = steps[idx - 1];
  const curr = steps[idx];
  const angle = getAngleBetweenSegments(prev.coordinates, curr.coordinates);
  if (angle > 30) return `Belok kiri, jalan ${Math.round(curr.distance)} meter`;
  if (angle < -30)
    return `Belok kanan, jalan ${Math.round(curr.distance)} meter`;
  return `Lurus, jalan ${Math.round(curr.distance)} meter`;
}

// Fungsi untuk parsing routeSegments menjadi steps
export function parseRouteSteps(routeSegments: any[]) {
  const steps = routeSegments.map((seg, idx) => {
    let distance = 0;
    if (seg.properties && seg.properties.Panjang) {
      distance = Number(seg.properties.Panjang);
    } else if (seg.geometry && seg.geometry.coordinates) {
      // Hitung jarak total polyline
      const coords = seg.geometry.coordinates;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        // Haversine
        const R = 6371000;
        const dLat = ((curr[1] - prev[1]) * Math.PI) / 180;
        const dLng = ((curr[0] - prev[0]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((prev[1] * Math.PI) / 180) *
            Math.cos((curr[1] * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance += R * c;
      }
    }
    return {
      coordinates: seg.geometry.coordinates.map((c: any) => [c[1], c[0]]), // [lat, lng]
      start: [seg.geometry.coordinates[0][1], seg.geometry.coordinates[0][0]],
      distance,
      type: seg.properties?.routeType?.includes("osrm") ? "osrm" : "geojson",
      raw: seg,
    };
  });
  return steps;
}

// handleRouteSubmit sebaiknya tetap di komponen agar bisa akses state, tapi logic parsing dan instruksi dipisah di sini.
