// src/lib/routeSteps.ts

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

// Fungsi untuk menghitung jarak menggunakan Haversine formula
function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const R = 6371000; // Radius bumi dalam meter
  const lat1 = (point1[0] * Math.PI) / 180;
  const lat2 = (point2[0] * Math.PI) / 180;
  const deltaLat = ((point2[0] - point1[0]) * Math.PI) / 180;
  const deltaLng = ((point2[1] - point1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Fungsi untuk generate instruksi step dengan panjang jalur
export function getStepInstruction(idx: number, steps: any[]) {
  const step = steps[idx];
  const distanceText = `${Math.round(step.distance)} meter`;

  if (step.type === "osrm") {
    return `Jalan ${distanceText} (jalan luar kampus)`;
  }

  if (idx === 0) return `Mulai, jalan ${distanceText}`;

  // Cek belok/lurus untuk semua jenis step
  if (idx > 0 && steps[idx - 1]) {
    const prev = steps[idx - 1];
    const curr = steps[idx];
    const angle = getAngleBetweenSegments(prev.coordinates, curr.coordinates);

    if (angle > 30) return `Belok kiri, jalan ${distanceText}`;
    if (angle < -30) return `Belok kanan, jalan ${distanceText}`;
  }

  return `Lurus, jalan ${distanceText}`;
}

// Fungsi untuk parsing routeSegments menjadi steps yang disederhanakan
export function parseRouteSteps(
  routeSegments: any[],
  startPoint?: [number, number],
  endPoint?: [number, number]
) {
  if (!routeSegments || routeSegments.length === 0) return [];

  // Jika hanya 1-2 segmen, jadikan 1 langkah saja
  if (routeSegments.length <= 2) {
    const combinedStep = createCombinedStep(routeSegments)[0];

    // Override start dan end point jika disediakan
    if (startPoint) {
      combinedStep.start = startPoint;
      combinedStep.coordinates = [
        startPoint,
        ...combinedStep.coordinates.slice(1),
      ];
    }
    if (endPoint) {
      combinedStep.coordinates = [
        ...combinedStep.coordinates.slice(0, -1),
        endPoint,
      ];
    }

    return [combinedStep];
  }

  // Untuk jalur yang lebih kompleks, gabungkan segmen lurus
  const combinedSteps: any[] = [];
  let currentGroup: any[] = [routeSegments[0]]; // Mulai dengan segmen pertama

  for (let i = 1; i < routeSegments.length; i++) {
    const prevSeg = routeSegments[i - 1];
    const currSeg = routeSegments[i];

    // Hitung sudut belok antara dua segmen
    const angle = calculateTurnAngle(prevSeg, currSeg);

    // Jika sudut belok kecil (< 25 derajat), gabungkan dengan grup sebelumnya
    if (Math.abs(angle) < 25) {
      currentGroup.push(currSeg);
    } else {
      // Sudut belok besar, buat step dari grup sebelumnya
      if (currentGroup.length > 0) {
        combinedSteps.push(createStepFromGroup(currentGroup));
      }
      // Mulai grup baru
      currentGroup = [currSeg];
    }
  }

  // Tambahkan grup terakhir
  if (currentGroup.length > 0) {
    combinedSteps.push(createStepFromGroup(currentGroup));
  }

  // Override start point untuk step pertama jika disediakan
  if (startPoint && combinedSteps.length > 0) {
    combinedSteps[0].start = startPoint;
    combinedSteps[0].coordinates = [
      startPoint,
      ...combinedSteps[0].coordinates.slice(1),
    ];
  }

  // Override end point untuk step terakhir jika disediakan
  if (endPoint && combinedSteps.length > 0) {
    const lastStep = combinedSteps[combinedSteps.length - 1];
    lastStep.coordinates = [...lastStep.coordinates.slice(0, -1), endPoint];
  }

  return combinedSteps;
}

// Fungsi untuk menghitung sudut belok antara dua segmen
function calculateTurnAngle(seg1: any, seg2: any): number {
  if (!seg1.geometry?.coordinates || !seg2.geometry?.coordinates) return 0;

  const coords1 = seg1.geometry.coordinates;
  const coords2 = seg2.geometry.coordinates;

  if (coords1.length < 2 || coords2.length < 2) return 0;

  // Ambil 2 titik terakhir dari segmen 1 dan 2 titik pertama dari segmen 2
  const p1 = coords1[coords1.length - 2];
  const p2 = coords1[coords1.length - 1]; // Titik sambungan
  const p3 = coords2[1] || coords2[0];

  // Hitung vektor
  const v1 = [p2[0] - p1[0], p2[1] - p1[1]];
  const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

  // Hitung sudut
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const det = v1[0] * v2[1] - v1[1] * v2[0];
  const angle = Math.atan2(det, dot) * (180 / Math.PI);

  return angle;
}

// Fungsi untuk membuat step gabungan dari beberapa segmen
function createCombinedStep(segments: any[]) {
  let totalDistance = 0;
  let allCoordinates: [number, number][] = [];

  segments.forEach((seg) => {
    if (seg.properties && seg.properties.Panjang) {
      totalDistance += Number(seg.properties.Panjang);
    } else if (seg.geometry && seg.geometry.coordinates) {
      // Hitung jarak total polyline
      const coords = seg.geometry.coordinates;
      for (let i = 1; i < coords.length; i++) {
        const prev: [number, number] = [coords[i - 1][1], coords[i - 1][0]];
        const curr: [number, number] = [coords[i][1], coords[i][0]];
        totalDistance += calculateDistance(prev, curr);
      }
    }

    // Gabungkan koordinat
    if (seg.geometry && seg.geometry.coordinates) {
      const segCoords = seg.geometry.coordinates.map((c: any) => [c[1], c[0]]);
      if (allCoordinates.length === 0) {
        allCoordinates = segCoords;
      } else {
        // Skip koordinat pertama jika sama dengan akhir sebelumnya
        const lastCoord = allCoordinates[allCoordinates.length - 1];
        const firstCoord = segCoords[0];
        if (calculateDistance(lastCoord, firstCoord) < 10) {
          allCoordinates.push(...segCoords.slice(1));
        } else {
          allCoordinates.push(...segCoords);
        }
      }
    }
  });

  return [
    {
      coordinates: allCoordinates,
      start: allCoordinates[0],
      distance: totalDistance,
      type: segments.length > 1 ? "combined" : "single",
      raw: segments,
      segmentCount: segments.length,
    },
  ];
}

// Fungsi untuk membuat step dari grup segmen
function createStepFromGroup(group: any[]) {
  if (group.length === 1) {
    // Single segment
    const seg = group[0];
    let distance = 0;
    if (seg.properties && seg.properties.Panjang) {
      distance = Number(seg.properties.Panjang);
    } else if (seg.geometry && seg.geometry.coordinates) {
      const coords = seg.geometry.coordinates;
      for (let i = 1; i < coords.length; i++) {
        const prev: [number, number] = [coords[i - 1][1], coords[i - 1][0]];
        const curr: [number, number] = [coords[i][1], coords[i][0]];
        distance += calculateDistance(prev, curr);
      }
    }

    return {
      coordinates: seg.geometry.coordinates.map((c: any) => [c[1], c[0]]),
      start: [seg.geometry.coordinates[0][1], seg.geometry.coordinates[0][0]],
      distance,
      type: seg.properties?.routeType?.includes("osrm") ? "osrm" : "geojson",
      raw: seg,
      segmentCount: 1,
    };
  } else {
    // Multiple segments - combine them
    return createCombinedStep(group)[0];
  }
}

// Fungsi untuk menghitung arah/bearing dari satu titik ke titik lainnya
export function calculateBearing(
  start: [number, number],
  end: [number, number]
): number {
  const lat1 = (start[0] * Math.PI) / 180;
  const lat2 = (end[0] * Math.PI) / 180;
  const deltaLng = ((end[1] - start[1]) * Math.PI) / 180;

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = Math.atan2(x, y);
  return ((bearing * 180) / Math.PI + 360) % 360; // Normalize to 0-360
}

// Fungsi untuk mendapatkan arah dari step saat ini
export function getStepDirection(step: any): number {
  if (!step.coordinates || step.coordinates.length < 2) return 0;

  const start = step.coordinates[0];
  const end = step.coordinates[step.coordinates.length - 1];

  return calculateBearing(start, end);
}

// handleRouteSubmit sebaiknya tetap di komponen agar bisa akses state, tapi logic parsing dan instruksi dipisah di sini.
