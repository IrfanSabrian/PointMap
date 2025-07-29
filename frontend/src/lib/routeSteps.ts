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

// Fungsi untuk menghitung sudut belok yang lebih presisi
function calculatePreciseTurnAngle(prevStep: any, currStep: any): number {
  if (!prevStep.coordinates || !currStep.coordinates) return 0;
  if (prevStep.coordinates.length < 2 || currStep.coordinates.length < 2)
    return 0;

  // Ambil beberapa titik untuk perhitungan yang stabil
  const prevCoords = prevStep.coordinates;
  const currCoords = currStep.coordinates;

  // Untuk step sebelumnya: ambil arah dari beberapa titik terakhir
  const prevLen = prevCoords.length;
  const prevPointCount = Math.min(5, prevLen); // Ambil 5 titik terakhir
  const prevStartIdx = Math.max(0, prevLen - prevPointCount);
  const prevStart = prevCoords[prevStartIdx];
  const prevEnd = prevCoords[prevLen - 1];

  // Untuk step saat ini: ambil arah dari beberapa titik pertama
  const currLen = currCoords.length;
  const currPointCount = Math.min(5, currLen); // Ambil 5 titik pertama
  const currEndIdx = Math.min(currPointCount - 1, currLen - 1);
  const currStart = currCoords[0];
  const currEnd = currCoords[currEndIdx];

  // Hitung vektor arah dengan jarak yang lebih panjang
  const prevVector = [prevEnd[1] - prevStart[1], prevEnd[0] - prevStart[0]]; // [lat, lng]
  const currVector = [currEnd[1] - currStart[1], currEnd[0] - currStart[0]]; // [lat, lng]

  // Normalisasi
  const prevLen2 = Math.sqrt(
    prevVector[0] * prevVector[0] + prevVector[1] * prevVector[1]
  );
  const currLen2 = Math.sqrt(
    currVector[0] * currVector[0] + currVector[1] * currVector[1]
  );

  if (prevLen2 === 0 || currLen2 === 0) return 0;

  prevVector[0] /= prevLen2;
  prevVector[1] /= prevLen2;
  currVector[0] /= currLen2;
  currVector[1] /= currLen2;

  // Hitung sudut dengan cross product untuk menentukan arah
  const cross = prevVector[0] * currVector[1] - prevVector[1] * currVector[0];
  const dot = prevVector[0] * currVector[0] + prevVector[1] * currVector[1];

  const angle = Math.atan2(cross, dot) * (180 / Math.PI);

  return angle;
}

// Fungsi untuk mendapatkan bearing dari step
function getStepBearing(step: any): number {
  if (!step.coordinates || step.coordinates.length < 2) return 0;

  const coords = step.coordinates;
  const len = coords.length;

  // Ambil beberapa titik untuk bearing yang stabil
  const pointCount = Math.min(3, len);
  const startIdx = Math.max(0, len - pointCount - 1);
  const start = coords[startIdx];
  const end = coords[len - 1];

  return calculateBearing(start, end);
}

// Fungsi untuk menormalisasi perbedaan bearing
function normalizeBearingDifference(diff: number): number {
  // Normalisasi ke range -180 sampai 180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

// Fungsi untuk parsing routeSegments SEDERHANA - 1 segmen = 1 step
export function parseRouteSteps(
  routeSegments: any[],
  startPoint?: [number, number],
  endPoint?: [number, number]
) {
  if (!routeSegments || routeSegments.length === 0) return [];

  console.log(
    `📋 Parsing sederhana: ${routeSegments.length} segmen = ${routeSegments.length} steps`
  );

  // Buat 1 step untuk setiap segmen
  const simpleSteps: any[] = [];

  for (let i = 0; i < routeSegments.length; i++) {
    const segment = routeSegments[i];
    const step = createStepFromSingleSegment(segment);

    // Tandai jenis step
    (step as any).stepType =
      i === 0 ? "start" : i === routeSegments.length - 1 ? "end" : "middle";
    (step as any).segmentIndex = i;

    console.log(
      `  📍 Step ${i + 1}: ${(step as any).stepType}, ${step.distance.toFixed(
        1
      )}m`
    );

    simpleSteps.push(step);
  }

  // Override start point untuk step pertama
  if (startPoint && simpleSteps.length > 0) {
    simpleSteps[0].start = startPoint;
    simpleSteps[0].coordinates = [
      startPoint,
      ...simpleSteps[0].coordinates.slice(1),
    ];
  }

  // Override end point untuk step terakhir
  if (endPoint && simpleSteps.length > 0) {
    const lastStep = simpleSteps[simpleSteps.length - 1];
    lastStep.coordinates = [...lastStep.coordinates.slice(0, -1), endPoint];
  }

  console.log(`✅ Total simple steps: ${simpleSteps.length}`);
  return simpleSteps;
}

// Fungsi untuk membuat step dari 1 segmen saja
function createStepFromSingleSegment(segment: any) {
  let distance = 0;

  // Hitung jarak dari properties atau koordinat
  if (segment.properties && segment.properties.panjang) {
    distance = Number(segment.properties.panjang);
  } else if (segment.geometry && segment.geometry.coordinates) {
    const coords = segment.geometry.coordinates;
    for (let i = 1; i < coords.length; i++) {
      const prev: [number, number] = [coords[i - 1][1], coords[i - 1][0]];
      const curr: [number, number] = [coords[i][1], coords[i][0]];
      distance += calculateDistance(prev, curr);
    }
  }

  // Konversi koordinat dari [lng, lat] ke [lat, lng]
  const coordinates = segment.geometry.coordinates.map((c: any) => [
    c[1],
    c[0],
  ]);

  return {
    coordinates: coordinates,
    start: coordinates[0],
    distance: distance,
    type: segment.properties?.routeType?.includes("osrm") ? "osrm" : "geojson",
    raw: segment,
    segmentCount: 1,
  };
}

// Fungsi untuk generate instruksi sederhana berdasarkan posisi step
export function getStepInstruction(idx: number, steps: any[]) {
  const step = steps[idx];
  const distanceText = `${Math.round(step.distance)} meter`;

  if (step.type === "osrm") {
    return `Jalan ${distanceText} (jalan luar kampus)`;
  }

  // Ambil metadata step
  const stepType = (step as any).stepType || "unknown";
  const segmentIndex = (step as any).segmentIndex || 0;

  console.log(
    `📋 Step ${idx + 1}: stepType=${stepType}, segmentIndex=${segmentIndex}`
  );

  // Step pertama: selalu "Mulai"
  if (idx === 0 || stepType === "start") {
    return `Mulai, jalan ${distanceText}`;
  }

  // Step terakhir: sampai tujuan tanpa jarak
  if (idx === steps.length - 1 || stepType === "end") {
    return `Sampai tujuan`;
  }

  // Step tengah: deteksi arah berdasarkan step sebelumnya
  if (idx > 0 && steps[idx - 1]) {
    const prev = steps[idx - 1];
    const curr = steps[idx];

    // Hitung sudut belok antar step
    const stepAngle = calculatePreciseTurnAngle(prev, curr);

    console.log(
      `📍 Step ${idx + 1}: Angle = ${stepAngle.toFixed(
        1
      )}°, Distance = ${Math.round(step.distance)}m`
    );

    // Deteksi arah belok
    if (stepAngle > 20) {
      return `Belok kiri, jalan ${distanceText}`;
    } else if (stepAngle < -20) {
      return `Belok kanan, jalan ${distanceText}`;
    } else {
      return `Lurus, jalan ${distanceText}`;
    }
  }

  return `Lurus, jalan ${distanceText}`;
}

// Fungsi untuk menghitung sudut belok yang lebih akurat
function calculateImprovedTurnAngle(seg1: any, seg2: any): number {
  if (!seg1.geometry?.coordinates || !seg2.geometry?.coordinates) return 0;

  const coords1 = seg1.geometry.coordinates;
  const coords2 = seg2.geometry.coordinates;

  if (coords1.length < 2 || coords2.length < 2) return 0;

  // Ambil lebih banyak titik untuk perhitungan yang stabil
  const seg1Length = coords1.length;
  const seg2Length = coords2.length;

  // Untuk segmen 1: ambil beberapa titik terakhir untuk mendapat arah yang stabil
  const pointCount = Math.min(3, seg1Length);
  const startIdx1 = Math.max(0, seg1Length - pointCount - 1);
  const p1Start = coords1[startIdx1];
  const p1End = coords1[seg1Length - 1];

  // Untuk segmen 2: ambil beberapa titik pertama untuk mendapat arah yang stabil
  const pointCount2 = Math.min(3, seg2Length);
  const endIdx2 = Math.min(pointCount2, seg2Length - 1);
  const p2Start = coords2[0];
  const p2End = coords2[endIdx2];

  // Hitung vektor arah dengan jarak yang lebih panjang
  const v1 = [p1End[0] - p1Start[0], p1End[1] - p1Start[1]];
  const v2 = [p2End[0] - p2Start[0], p2End[1] - p2Start[1]];

  // Normalisasi vektor
  const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

  if (len1 === 0 || len2 === 0) return 0;

  v1[0] /= len1;
  v1[1] /= len1;
  v2[0] /= len2;
  v2[1] /= len2;

  // Hitung sudut dengan dot product dan cross product
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const cross = v1[0] * v2[1] - v1[1] * v2[0];

  const angle = Math.atan2(cross, dot) * (180 / Math.PI);

  return angle;
}

// Fungsi untuk mengecek apakah segmen tersambung langsung
function isSegmentsContinuous(seg1: any, seg2: any): boolean {
  if (!seg1.geometry?.coordinates || !seg2.geometry?.coordinates) return false;

  const coords1 = seg1.geometry.coordinates;
  const coords2 = seg2.geometry.coordinates;

  if (coords1.length === 0 || coords2.length === 0) return false;

  // Cek jarak antara akhir segmen 1 dan awal segmen 2
  const end1 = coords1[coords1.length - 1];
  const start2 = coords2[0];

  const distance = calculateDistance(
    [end1[1], end1[0]],
    [start2[1], start2[0]]
  );

  // Jika jarak < 10 meter, dianggap tersambung
  const isContinuous = distance < 10;

  if (isContinuous) {
    // Cek juga arah vektor
    const v1 = getSegmentDirection(seg1);
    const v2 = getSegmentDirection(seg2);

    if (v1 && v2) {
      const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];
      // Jika dot product > 0.7, arah hampir sama
      return dotProduct > 0.7;
    }
  }

  return isContinuous;
}

// Fungsi untuk mendapat arah vektor segmen
function getSegmentDirection(seg: any): [number, number] | null {
  if (!seg.geometry?.coordinates || seg.geometry.coordinates.length < 2)
    return null;

  const coords = seg.geometry.coordinates;
  const start = coords[0];
  const end = coords[coords.length - 1];

  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return null;

  return [dx / len, dy / len];
}

// Fungsi untuk menghitung jarak antara ujung dua segmen
function calculateSegmentDistance(seg1: any, seg2: any): number {
  if (!seg1.geometry?.coordinates || !seg2.geometry?.coordinates)
    return Infinity;

  const coords1 = seg1.geometry.coordinates;
  const coords2 = seg2.geometry.coordinates;

  if (coords1.length === 0 || coords2.length === 0) return Infinity;

  const end1 = coords1[coords1.length - 1];
  const start2 = coords2[0];

  return calculateDistance([end1[1], end1[0]], [start2[1], start2[0]]);
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
