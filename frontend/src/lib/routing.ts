// Utility functions untuk sistem routing menggunakan jalur GeoJSON yang ada
export interface Point {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface Route {
  id: string;
  startPoint: string;
  endPoint: string;
  coordinates: [number, number][];
  distance: number;
}

// Fungsi untuk menghitung jarak antara dua titik (Haversine formula)
export function calculateDistance(
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

// Fungsi untuk mencari titik terdekat dari koordinat
export function findNearestPoint(
  coordinates: [number, number],
  points: Point[],
  maxDistance: number = 100 // meter
): Point | null {
  let nearestPoint: Point | null = null;
  let minDistance = maxDistance;

  for (const point of points) {
    const distance = calculateDistance(coordinates, point.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }

  // Log jika tidak ada titik terdekat
  if (!nearestPoint) {
    console.warn(
      `⚠️ [NEAREST] Tidak ada titik terdekat dari [${coordinates[0].toFixed(
        6
      )}, ${coordinates[1].toFixed(6)}] dalam radius ${maxDistance}m`
    );
  }

  return nearestPoint;
}

// Fungsi untuk mendapatkan koordinat jalur dalam format [lat, lng]
export function getRouteCoordinates(route: any): [number, number][] {
  if (route.geometry?.type === "LineString" && route.geometry?.coordinates) {
    return route.geometry.coordinates.map(
      (coord: number[]) => [coord[1], coord[0]] // Convert [lng, lat] to [lat, lng]
    );
  }

  // Log jika route tidak memiliki koordinat yang valid
  if (!route.geometry) {
    console.warn(`⚠️ [COORDS] Route ${route.id} tidak memiliki geometry`);
  } else if (route.geometry.type !== "LineString") {
    console.warn(
      `⚠️ [COORDS] Route ${route.id} bukan LineString (${route.geometry.type})`
    );
  } else if (!route.geometry.coordinates) {
    console.warn(`⚠️ [COORDS] Route ${route.id} tidak memiliki coordinates`);
  }

  return [];
}

// Fungsi untuk mencari jalur yang terhubung dengan titik
export function findConnectedRoutes(
  point: [number, number],
  routes: any[],
  maxDistance: number = 150 // PERBAIKAN: Tingkatkan jarak maksimal untuk mencari lebih banyak jalur
): any[] {
  const connectedRoutes: any[] = [];

  for (const route of routes) {
    const routeCoords = getRouteCoordinates(route);
    if (routeCoords.length === 0) continue;

    // Cek apakah titik terhubung dengan awal atau akhir jalur
    const startPoint = routeCoords[0];
    const endPoint = routeCoords[routeCoords.length - 1];

    const distanceToStart = calculateDistance(point, startPoint);
    const distanceToEnd = calculateDistance(point, endPoint);

    if (distanceToStart < maxDistance || distanceToEnd < maxDistance) {
      connectedRoutes.push({
        ...route,
        distanceToPoint: Math.min(distanceToStart, distanceToEnd),
        isStartConnected: distanceToStart < distanceToEnd,
        routeCoords: routeCoords,
      });
    }
  }

  const sortedRoutes = connectedRoutes.sort(
    (a, b) => a.distanceToPoint - b.distanceToPoint
  );

  // Log hanya jika tidak ada jalur yang terhubung
  if (sortedRoutes.length === 0) {
    console.warn(
      `⚠️ [CONNECTED] Tidak ada jalur yang terhubung dengan titik [${point[0].toFixed(
        6
      )}, ${point[1].toFixed(6)}] dalam radius ${maxDistance}m`
    );
  }

  return sortedRoutes;
}

// Fungsi untuk mencari jalur yang terhubung dengan jalur lain
export function findConnectedRouteToRoute(
  route: any,
  routes: any[],
  maxDistance: number = 50 // PERBAIKAN: Tingkatkan jarak maksimal untuk mencari lebih banyak jalur terhubung
): any[] {
  const connectedRoutes: any[] = [];
  const routeCoords = getRouteCoordinates(route);

  if (routeCoords.length === 0) return connectedRoutes;

  const routeStart = routeCoords[0];
  const routeEnd = routeCoords[routeCoords.length - 1];

  for (const otherRoute of routes) {
    if (otherRoute.id === route.id) continue; // Skip diri sendiri

    const otherCoords = getRouteCoordinates(otherRoute);
    if (otherCoords.length === 0) continue;

    const otherStart = otherCoords[0];
    const otherEnd = otherCoords[otherCoords.length - 1];

    // Cek koneksi dari akhir jalur ini ke jalur lain
    const endToOtherStart = calculateDistance(routeEnd, otherStart);
    const endToOtherEnd = calculateDistance(routeEnd, otherEnd);

    if (endToOtherStart < maxDistance || endToOtherEnd < maxDistance) {
      connectedRoutes.push({
        ...otherRoute,
        distanceToRoute: Math.min(endToOtherStart, endToOtherEnd),
        isStartConnected: endToOtherStart < endToOtherEnd,
        routeCoords: otherCoords,
      });
    }
  }

  const sortedRoutes = connectedRoutes.sort(
    (a, b) => a.distanceToRoute - b.distanceToRoute
  );

  // Log hanya jika tidak ada jalur yang terhubung
  if (sortedRoutes.length === 0) {
    console.warn(
      `⚠️ [CONNECTED] Jalur ${route.id} tidak terhubung dengan jalur lain dalam radius ${maxDistance}m`
    );
  }

  return sortedRoutes;
}

// Fungsi untuk mencari rute lengkap menggunakan multiple jalur
export function findCompleteRoute(
  startCoord: [number, number],
  endCoord: [number, number],
  routes: any[],
  maxSteps: number = 30 // PERBAIKAN: Tingkatkan maksimal langkah untuk memastikan semua segmen tercakup
): {
  coordinates: [number, number][];
  distance: number;
  routeIds: string[];
  geojsonSegments: any[];
} | null {
  console.log(
    `🚀 [ROUTING] Mulai pencarian rute dari [${startCoord[0].toFixed(
      6
    )}, ${startCoord[1].toFixed(6)}] ke [${endCoord[0].toFixed(
      6
    )}, ${endCoord[1].toFixed(6)}]`
  );

  // Cari jalur yang terhubung dengan titik awal
  const startRoutes = findConnectedRoutes(startCoord, routes);
  const endRoutes = findConnectedRoutes(endCoord, routes);

  console.log(
    `📊 [ROUTING] Jalur terhubung: ${startRoutes.length} start, ${endRoutes.length} end`
  );

  if (startRoutes.length === 0) {
    console.error(
      `❌ [ROUTING] Tidak ada jalur yang terhubung dengan titik awal`
    );
    return null;
  }

  if (endRoutes.length === 0) {
    console.error(
      `❌ [ROUTING] Tidak ada jalur yang terhubung dengan titik tujuan`
    );
    return null;
  }

  // PERBAIKAN: Coba semua jalur awal untuk memastikan tidak ada yang terlewat
  let bestPath: any = null;
  let bestDistance = Infinity;

  for (let i = 0; i < startRoutes.length; i++) {
    const startRoute = startRoutes[i];
    console.log(
      `🔍 [ROUTING] Mencoba jalur awal ${i + 1}/${startRoutes.length}: ${
        startRoute.id
      } (${Math.round(startRoute.distanceToPoint)}m dari start)`
    );

    const path = findPathToDestination(startRoute, endCoord, routes, maxSteps);
    if (path && path.distance < bestDistance) {
      bestPath = path;
      bestDistance = path.distance;
      console.log(
        `✅ [ROUTING] Path baru ditemukan! Total ${
          path.geojsonSegments.length
        } segmen, ${Math.round(path.distance)}m`
      );
    }
  }

  if (bestPath) {
    console.log(
      `🏆 [ROUTING] Path terbaik ditemukan! Total ${
        bestPath.geojsonSegments.length
      } segmen, ${Math.round(bestPath.distance)}m`
    );

    // Debug: tampilkan detail setiap segmen dalam path
    console.log(`🔍 [ROUTING] Detail segmen dalam path:`);
    bestPath.geojsonSegments.forEach((segment: any, idx: number) => {
      const segmentId = segment.id || "unknown";
      const segmentLength = segment.properties?.panjang || 0;
      console.log(
        `  ${idx + 1}. ID ${segmentId}: ${Math.round(segmentLength)}m`
      );
    });

    return bestPath;
  }

  console.error(
    `❌ [ROUTING] Tidak ada path yang valid ditemukan dari ${startRoutes.length} jalur awal`
  );
  return null;
}

// Fungsi untuk mencari path dari jalur tertentu ke tujuan
export function findPathToDestination(
  currentRoute: any,
  destination: [number, number],
  allRoutes: any[],
  maxSteps: number,
  visitedRoutes: Set<string> = new Set(),
  currentPath: any[] = []
): {
  coordinates: [number, number][];
  distance: number;
  routeIds: string[];
  geojsonSegments: any[];
} | null {
  const depth = currentPath.length;

  // Cek apakah sudah mencapai maksimal langkah
  if (maxSteps <= 0) {
    if (depth === 0)
      console.warn(`⚠️ [ROUTING] Maksimal step tercapai (${maxSteps})`);
    return null;
  }

  // Cek apakah jalur ini sudah dikunjungi
  if (visitedRoutes.has(currentRoute.id)) {
    if (depth === 0)
      console.warn(`⚠️ [ROUTING] Jalur ${currentRoute.id} sudah dikunjungi`);
    return null;
  }

  // Tambahkan jalur ini ke path
  const newPath = [...currentPath, currentRoute];
  const newVisited = new Set(visitedRoutes);
  newVisited.add(currentRoute.id);

  // Cek apakah jalur ini terhubung dengan tujuan
  const routeCoords = getRouteCoordinates(currentRoute);
  if (routeCoords.length === 0) {
    if (depth === 0)
      console.warn(
        `⚠️ [ROUTING] Jalur ${currentRoute.id} tidak memiliki koordinat`
      );
    return null;
  }

  const routeEnd = routeCoords[routeCoords.length - 1];
  const distanceToDestination = calculateDistance(routeEnd, destination);

  // PERBAIKAN: Cek apakah sudah sampai tujuan (jarak < 15m untuk toleransi lebih besar)
  if (distanceToDestination < 15) {
    console.log(
      `✅ [ROUTING] Sampai tujuan! Jalur ${
        currentRoute.id
      } berakhir ${Math.round(distanceToDestination)}m dari tujuan`
    );
    const allCoordinates = buildCompleteCoordinates(newPath, destination);
    const totalDistance = calculatePathDistance(allCoordinates);
    const routeIds = newPath.map((route) => route.id);

    return {
      coordinates: allCoordinates,
      distance: totalDistance,
      routeIds: routeIds,
      geojsonSegments: newPath,
    };
  }

  // Cari jalur yang terhubung dengan jalur ini
  const connectedRoutes = findConnectedRouteToRoute(currentRoute, allRoutes);
  const unvisitedConnectedRoutes = connectedRoutes.filter(
    (route) => !newVisited.has(route.id)
  );

  if (unvisitedConnectedRoutes.length === 0) {
    if (depth === 0)
      console.warn(
        `⚠️ [ROUTING] Tidak ada jalur terhubung yang belum dikunjungi dari ${currentRoute.id}`
      );
    return null;
  }

  // PERBAIKAN: Prioritaskan jalur yang lebih logis, bukan hanya yang terdekat
  const prioritizedRoutes = unvisitedConnectedRoutes
    .map((route) => {
      const routeCoords = getRouteCoordinates(route);
      if (routeCoords.length === 0)
        return { route, distanceToDestination: Infinity, routeLength: 0 };

      const routeStart = routeCoords[0];
      const routeEnd = routeCoords[routeCoords.length - 1];
      const distanceStartToTarget = calculateDistance(routeStart, destination);
      const distanceEndToTarget = calculateDistance(routeEnd, destination);

      const distanceToTarget = Math.min(
        distanceStartToTarget,
        distanceEndToTarget
      );

      // Hitung panjang jalur dari properties atau koordinat
      let routeLength = 0;
      if (route.properties && route.properties.panjang) {
        routeLength = Number(route.properties.panjang);
      } else {
        // Hitung dari koordinat
        for (let i = 1; i < routeCoords.length; i++) {
          routeLength += calculateDistance(routeCoords[i - 1], routeCoords[i]);
        }
      }

      // PERBAIKAN: Tambahkan penalti untuk jalur yang terlalu pendek (kemungkinan jalur sambungan)
      let adjustedDistance = distanceToTarget;
      if (routeLength < 20) {
        // Jalur pendek (< 20m) kemungkinan adalah jalur sambungan, berikan penalti
        adjustedDistance += 30;
      }

      return { route, distanceToDestination: adjustedDistance, routeLength };
    })
    .sort((a, b) => {
      // PERBAIKAN: Prioritaskan jalur yang lebih panjang jika jarak ke tujuan sama
      // Ini mencegah melewati jalur utama yang seharusnya dilalui
      if (Math.abs(a.distanceToDestination - b.distanceToDestination) < 50) {
        // Jika jarak ke tujuan hampir sama, pilih jalur yang lebih panjang
        // Jalur panjang kemungkinan adalah jalur utama, bukan jalur sambungan
        return b.routeLength - a.routeLength;
      }
      // Jika jarak ke tujuan berbeda signifikan, pilih yang terdekat
      return a.distanceToDestination - b.distanceToDestination;
    })
    .map((item) => item.route);

  // PERBAIKAN: Coba jalur yang terhubung dengan debug info
  console.log(
    `🔍 [ROUTING] Mencoba ${prioritizedRoutes.length} jalur terhubung dari ${currentRoute.id}:`
  );

  for (let i = 0; i < Math.min(3, prioritizedRoutes.length); i++) {
    const connectedRoute = prioritizedRoutes[i];
    const routeCoords = getRouteCoordinates(connectedRoute);
    const routeLength = connectedRoute.properties?.panjang || 0;

    console.log(
      `  ${i + 1}. Jalur ${connectedRoute.id}: ${Math.round(routeLength)}m`
    );

    const result = findPathToDestination(
      connectedRoute,
      destination,
      allRoutes,
      maxSteps - 1,
      newVisited,
      newPath
    );

    if (result) {
      console.log(
        `✅ [ROUTING] Path ditemukan melalui jalur ${connectedRoute.id}`
      );
      return result;
    }
  }

  return null;
}

// Fungsi untuk membangun koordinat lengkap dari path
export function buildCompleteCoordinates(
  path: any[],
  destination: [number, number]
): [number, number][] {
  if (path.length === 0) return [];

  let allCoordinates: [number, number][] = [];

  for (let i = 0; i < path.length; i++) {
    const route = path[i];
    const routeCoords = getRouteCoordinates(route);

    if (routeCoords.length === 0) continue;

    // Jika ini jalur pertama, gunakan semua koordinat
    if (i === 0) {
      allCoordinates = [...routeCoords];
    } else {
      // Untuk jalur berikutnya, skip koordinat pertama jika sama dengan akhir jalur sebelumnya
      const prevRoute = path[i - 1];
      const prevRouteCoords = getRouteCoordinates(prevRoute);
      const prevEnd = prevRouteCoords[prevRouteCoords.length - 1];
      const currentStart = routeCoords[0];

      // Jika koordinat sama atau sangat dekat, skip koordinat pertama
      if (calculateDistance(prevEnd, currentStart) < 10) {
        allCoordinates.push(...routeCoords.slice(1));
      } else {
        allCoordinates.push(...routeCoords);
      }
    }
  }

  // Tambahkan koordinat tujuan jika jarak wajar (< 30m)
  const pathEnd = allCoordinates[allCoordinates.length - 1];
  const distanceToDestination = calculateDistance(pathEnd, destination);

  if (distanceToDestination > 5 && distanceToDestination < 30) {
    allCoordinates.push(destination);
  }

  return allCoordinates;
}

// Fungsi untuk menghitung total jarak path
export function calculatePathDistance(coordinates: [number, number][]): number {
  let totalDistance = 0;

  for (let i = 1; i < coordinates.length; i++) {
    totalDistance += calculateDistance(coordinates[i - 1], coordinates[i]);
  }

  return totalDistance;
}

// Fungsi untuk mencari rute terpendek menggunakan jalur yang tersedia
export function findShortestRoute(
  startCoord: [number, number],
  endCoord: [number, number],
  routes: any[]
): {
  coordinates: [number, number][];
  distance: number;
  routeIds: string[];
  geojsonSegments: any[];
} | null {
  console.log(`🔄 [FALLBACK] Mencoba algoritma fallback...`);

  // Coba cari rute lengkap menggunakan multiple jalur
  const completeRoute = findCompleteRoute(startCoord, endCoord, routes);

  if (completeRoute) {
    console.log(
      `✅ [FALLBACK] Complete route ditemukan! ${
        completeRoute.geojsonSegments.length
      } segmen, ${Math.round(completeRoute.distance)}m`
    );
    return completeRoute;
  }

  console.log(
    `⚠️ [FALLBACK] Complete route tidak ditemukan, mencari jalur terdekat...`
  );

  // Jika tidak ada rute lengkap, cari jalur terdekat
  let bestRoute: any = null;
  let minDistance = Infinity;

  for (const route of routes) {
    const routeCoords = getRouteCoordinates(route);
    if (routeCoords.length === 0) continue;

    const startPoint = routeCoords[0];
    const endPoint = routeCoords[routeCoords.length - 1];

    // Hitung jarak dari start ke jalur dan dari jalur ke end
    const startToRoute = calculateDistance(startCoord, startPoint);
    const routeToEnd = calculateDistance(endPoint, endCoord);
    const routeLength = route.properties?.panjang || 0;

    const totalDistance = startToRoute + routeLength + routeToEnd;

    if (totalDistance < minDistance) {
      minDistance = totalDistance;
      bestRoute = route;
    }
  }

  if (bestRoute) {
    const routeCoords = getRouteCoordinates(bestRoute);
    console.log(
      `✅ [FALLBACK] Jalur terdekat ditemukan: ${bestRoute.id} (${Math.round(
        minDistance
      )}m)`
    );
    return {
      coordinates: routeCoords,
      distance: minDistance,
      routeIds: [bestRoute.id],
      geojsonSegments: [bestRoute],
    };
  }

  console.warn(`⚠️ [FALLBACK] Tidak ada jalur yang ditemukan`);
  return null;
}

// Fungsi utilitas: hitung jarak euclidean antar dua koordinat
function euclideanDistance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

// Fungsi: cari node terdekat di graph dari koordinat
function findNearestNode(coord: [number, number], nodes: [number, number][]) {
  let minDist = Infinity;
  let nearest: [number, number] | null = null;
  for (const n of nodes) {
    const d = euclideanDistance(coord, n);
    if (d < minDist) {
      minDist = d;
      nearest = n;
    }
  }

  // Log jika tidak ada node yang ditemukan
  if (!nearest) {
    console.warn(
      `⚠️ [NODE] Tidak ada node terdekat dari [${
        coord[0]?.toFixed(6) || "unknown"
      }, ${coord[1]?.toFixed(6) || "unknown"}]`
    );
  }

  return nearest;
}

// Fungsi utama Dijkstra untuk rute geojson
export function findShortestRouteDijkstra(
  startCoord: [number, number],
  endCoord: [number, number],
  routes: any[]
): {
  coordinates: [number, number][];
  distance: number;
  routeIds: string[];
  geojsonSegments: any[];
} | null {
  console.log(`🔄 [DIJKSTRA] Memulai algoritma Dijkstra...`);

  // 1. Bangun graph: node = endpoint LineString, edge = LineString
  const nodes: [number, number][] = [];
  const edges: Array<{
    from: [number, number];
    to: [number, number];
    route: any;
    length: number;
  }> = [];

  for (const route of routes) {
    const coords = route.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const start: [number, number] = [coords[0][1], coords[0][0]];
    const end: [number, number] = [
      coords[coords.length - 1][1],
      coords[coords.length - 1][0],
    ];
    nodes.push(start, end);

    // Gunakan data panjang dari GeoJSON jika tersedia, fallback ke euclidean distance
    const routeLength =
      route.properties?.panjang || euclideanDistance(start, end) * 111000; // Convert to meters if no panjang

    edges.push({
      from: start,
      to: end,
      route,
      length: routeLength, // Gunakan panjang dari GeoJSON
    });
    // Bidirectional
    edges.push({
      from: end,
      to: start,
      route,
      length: routeLength, // Gunakan panjang dari GeoJSON
    });
  }

  // Dedup node
  const uniqueNodes = Array.from(new Set(nodes.map((n) => n.join(",")))).map(
    (s) => s.split(",").map(Number) as [number, number]
  );

  console.log(
    `📊 [DIJKSTRA] Graph built: ${uniqueNodes.length} nodes, ${edges.length} edges`
  );

  // 2. Temukan node terdekat dari start & end
  const startNode = findNearestNode(startCoord, uniqueNodes);
  const endNode = findNearestNode(endCoord, uniqueNodes);

  if (!startNode || !endNode) {
    console.warn(
      `⚠️ [DIJKSTRA] Tidak dapat menemukan node terdekat: startNode=${!!startNode}, endNode=${!!endNode}`
    );
    return null;
  }

  console.log(
    `📍 [DIJKSTRA] Start node: [${(startNode as [number, number])[0].toFixed(
      6
    )}, ${(startNode as [number, number])[1].toFixed(6)}]`
  );
  console.log(
    `🎯 [DIJKSTRA] End node: [${(endNode as [number, number])[0].toFixed(
      6
    )}, ${(endNode as [number, number])[1].toFixed(6)}]`
  );

  // 3. Dijkstra
  const dist = new Map<string, number>();
  const prev = new Map<string, { node: [number, number]; edge: any }>();
  const queue: Array<{ node: [number, number]; cost: number }> = [
    { node: startNode, cost: 0 },
  ];
  dist.set((startNode as [number, number]).join(","), 0);

  let iterations = 0;
  const maxIterations = 1000; // Prevent infinite loop

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    queue.sort((a, b) => a.cost - b.cost);
    const { node, cost } = queue.shift()!;

    if (node.join(",") === (endNode as [number, number]).join(",")) {
      console.log(`✅ [DIJKSTRA] Path ditemukan dalam ${iterations} iterasi`);
      break;
    }

    for (const edge of edges.filter(
      (e) => e.from[0] === node[0] && e.from[1] === node[1]
    )) {
      const next = edge.to;
      const nextKey = next.join(",");
      const newCost = cost + edge.length;
      if (!dist.has(nextKey) || newCost < dist.get(nextKey)!) {
        dist.set(nextKey, newCost);
        prev.set(nextKey, { node, edge });
        queue.push({ node: next, cost: newCost });
      }
    }
  }

  if (iterations >= maxIterations) {
    console.warn(
      `⚠️ [DIJKSTRA] Maksimal iterasi tercapai (${maxIterations}), kemungkinan ada infinite loop`
    );
  }

  // 4. Rekonstruksi path
  const pathEdges: any[] = [];
  let currKey = (endNode as [number, number]).join(",");
  while (prev.has(currKey)) {
    const { node, edge } = prev.get(currKey)!;
    pathEdges.unshift(edge.route);
    currKey = node.join(",");
  }

  if (pathEdges.length === 0) {
    console.warn(`⚠️ [DIJKSTRA] Tidak ada path yang ditemukan`);
    return null;
  }

  console.log(`📏 [DIJKSTRA] Path terdiri dari ${pathEdges.length} segmen`);

  // Gabungkan koordinat
  let allCoords: [number, number][] = [];
  for (let i = 0; i < pathEdges.length; i++) {
    const coords = pathEdges[i].geometry.coordinates.map((c: number[]) => [
      c[1],
      c[0],
    ]);
    if (i === 0) allCoords = [...coords];
    else {
      // Hindari duplikat node
      if (
        allCoords[allCoords.length - 1][0] === coords[0][0] &&
        allCoords[allCoords.length - 1][1] === coords[0][1]
      )
        allCoords.push(...coords.slice(1));
      else allCoords.push(...coords);
    }
  }

  // Tambahkan titik tujuan jika belum sama
  if (euclideanDistance(allCoords[allCoords.length - 1], endCoord) > 0.00001) {
    allCoords.push(endCoord);
  }

  // Hitung total jarak menggunakan data panjang dari GeoJSON
  let totalDist = 0;
  for (const edge of pathEdges) {
    // Gunakan panjang dari GeoJSON jika tersedia
    const segmentLength = edge.properties?.panjang || 0;
    totalDist += segmentLength;
  }

  // Jika tidak ada panjang dari GeoJSON, fallback ke Haversine
  if (totalDist === 0) {
    for (let i = 1; i < allCoords.length; i++) {
      totalDist += calculateDistance(allCoords[i - 1], allCoords[i]);
    }
  }

  console.log(
    `✅ [DIJKSTRA] Selesai! Total jarak: ${Math.round(totalDist)}m, ${
      allCoords.length
    } koordinat`
  );

  return {
    coordinates: allCoords,
    distance: totalDist,
    routeIds: pathEdges.map((e) => e.id),
    geojsonSegments: pathEdges,
  };
}

// Fungsi untuk mencari jalur berdasarkan nama atau ID
export function findRouteByName(name: string, routes: any[]): any | null {
  const lowerName = name.toLowerCase();

  for (const route of routes) {
    if (
      route.properties?.Nama &&
      route.properties.Nama.toLowerCase().includes(lowerName)
    ) {
      return route;
    }
    if (route.id && route.id.toString().toLowerCase().includes(lowerName)) {
      return route;
    }
  }

  return null;
}

// Fungsi untuk mendapatkan semua jalur yang tersedia
export function getAllRoutes(
  routes: any[]
): Array<{ id: string; name: string; coordinates: [number, number][] }> {
  return routes.map((route) => ({
    id: route.id || route.properties?.OBJECTID || "",
    name:
      route.properties?.Nama ||
      `Jalur ${route.id || route.properties?.OBJECTID || ""}`,
    coordinates: getRouteCoordinates(route),
  }));
}

// Fungsi utama untuk mencari rute
export function findRoute(
  startCoordinates: [number, number],
  endCoordinates: [number, number],
  points: Point[],
  routes: any[]
): {
  coordinates: [number, number][];
  distance: number;
  routeIds: string[];
  geojsonSegments: any[];
} | null {
  console.log(
    `🔍 [ROUTING] Mencari rute dari [${startCoordinates[0].toFixed(
      6
    )}, ${startCoordinates[1].toFixed(6)}] ke [${endCoordinates[0].toFixed(
      6
    )}, ${endCoordinates[1].toFixed(6)}]`
  );
  console.log(
    `📊 [ROUTING] Data tersedia: ${points.length} titik, ${routes.length} jalur`
  );

  // Cari titik terdekat untuk start dan end
  const startPoint = findNearestPoint(startCoordinates, points);
  const endPoint = findNearestPoint(endCoordinates, points);

  let actualStart = startCoordinates;
  let actualEnd = endCoordinates;

  if (startPoint) {
    actualStart = startPoint.coordinates;
    console.log(
      `📍 [ROUTING] Titik start terdekat: ${startPoint.name} (${Math.round(
        calculateDistance(startCoordinates, actualStart)
      )}m)`
    );
  } else {
    console.warn(`⚠️ [ROUTING] Tidak ada titik terdekat untuk start point`);
  }

  if (endPoint) {
    actualEnd = endPoint.coordinates;
    console.log(
      `🎯 [ROUTING] Titik end terdekat: ${endPoint.name} (${Math.round(
        calculateDistance(endCoordinates, actualEnd)
      )}m)`
    );
  } else {
    console.warn(`⚠️ [ROUTING] Tidak ada titik terdekat untuk end point`);
  }

  // Coba Dijkstra dulu
  console.log(`🔄 [ROUTING] Mencoba algoritma Dijkstra...`);
  const dijkstraResult = findShortestRouteDijkstra(
    actualStart,
    actualEnd,
    routes
  );
  if (dijkstraResult && dijkstraResult.geojsonSegments.length > 0) {
    console.log(
      `✅ [ROUTING] Dijkstra berhasil! ${
        dijkstraResult.geojsonSegments.length
      } segmen, ${Math.round(dijkstraResult.distance)}m`
    );
    return dijkstraResult;
  }

  // Fallback: findShortestRoute lama
  console.log(`🔄 [ROUTING] Dijkstra gagal, mencoba algoritma fallback...`);
  const routeResult = findShortestRoute(actualStart, actualEnd, routes);
  if (routeResult && routeResult.geojsonSegments.length > 0) {
    console.log(
      `✅ [ROUTING] Fallback berhasil! ${
        routeResult.geojsonSegments.length
      } segmen, ${Math.round(routeResult.distance)}m`
    );
    return routeResult;
  }

  // Jika tidak ada rute yang valid, kembalikan fallback route (garis lurus)
  console.warn(
    "⚠️ [ROUTING] Tidak ditemukan rute yang valid, menggunakan fallback garis lurus"
  );

  const fallbackDistance = calculateDistance(actualStart, actualEnd);
  const fallbackCoordinates = [actualStart, actualEnd];

  return {
    coordinates: fallbackCoordinates,
    distance: fallbackDistance,
    routeIds: ["fallback"],
    geojsonSegments: [
      {
        type: "Feature",
        id: "fallback",
        geometry: {
          type: "LineString",
          coordinates: [
            [actualEnd[1], actualEnd[0]], // GeoJSON format: [lng, lat]
            [actualStart[1], actualStart[0]],
          ],
        },
        properties: {
          nama: "Rute Langsung",
          jenis: "fallback",
        },
      },
    ],
  };
}
