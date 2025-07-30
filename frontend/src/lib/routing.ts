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

  return nearestPoint;
}

// Fungsi untuk mendapatkan koordinat jalur dalam format [lat, lng]
export function getRouteCoordinates(route: any): [number, number][] {
  if (route.geometry?.type === "LineString" && route.geometry?.coordinates) {
    return route.geometry.coordinates.map(
      (coord: number[]) => [coord[1], coord[0]] // Convert [lng, lat] to [lat, lng]
    );
  }
  return [];
}

// Fungsi untuk mencari jalur yang terhubung dengan titik
export function findConnectedRoutes(
  point: [number, number],
  routes: any[],
  maxDistance: number = 50 // meter
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

  return connectedRoutes.sort((a, b) => a.distanceToPoint - b.distanceToPoint);
}

// Fungsi untuk mencari jalur yang terhubung dengan jalur lain
export function findConnectedRouteToRoute(
  route: any,
  routes: any[],
  maxDistance: number = 30 // meter
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

  return connectedRoutes.sort((a, b) => a.distanceToRoute - b.distanceToRoute);
}

// Fungsi untuk mencari rute lengkap menggunakan multiple jalur
export function findCompleteRoute(
  startCoord: [number, number],
  endCoord: [number, number],
  routes: any[],
  maxSteps: number = 10 // Maksimal 10 langkah untuk menghindari infinite loop
): {
  coordinates: [number, number][];
  distance: number;
  routeIds: string[];
  geojsonSegments: any[];
} | null {
  // Cari jalur yang terhubung dengan titik awal
  const startRoutes = findConnectedRoutes(startCoord, routes);
  const endRoutes = findConnectedRoutes(endCoord, routes);

  if (startRoutes.length === 0 || endRoutes.length === 0) {
    return null;
  }

  // Coba setiap jalur awal
  for (const startRoute of startRoutes.slice(0, 3)) {
    // Coba 3 jalur terdekat
    const path = findPathToDestination(startRoute, endCoord, routes, maxSteps);
    if (path) {
      return path;
    }
  }

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
  // Cek apakah sudah mencapai maksimal langkah
  if (maxSteps <= 0) return null;

  // Cek apakah jalur ini sudah dikunjungi
  if (visitedRoutes.has(currentRoute.id)) return null;

  // Tambahkan jalur ini ke path
  const newPath = [...currentPath, currentRoute];
  const newVisited = new Set(visitedRoutes);
  newVisited.add(currentRoute.id);

  // Cek apakah jalur ini terhubung dengan tujuan
  const routeCoords = getRouteCoordinates(currentRoute);
  if (routeCoords.length === 0) return null;

  const routeEnd = routeCoords[routeCoords.length - 1];
  const distanceToDestination = calculateDistance(routeEnd, destination);

  // PATCH: Hanya return path jika routeEnd benar-benar sangat dekat dengan tujuan (misal < 10m)
  if (distanceToDestination < 10) {
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
  // Jika hanya "cukup dekat" tapi tidak benar-benar sampai, lanjutkan pencarian jalur

  // Cari jalur yang terhubung dengan jalur ini
  const connectedRoutes = findConnectedRouteToRoute(currentRoute, allRoutes);

  // PERBAIKAN: Filter jalur yang sudah dikunjungi untuk mencegah loop
  const unvisitedConnectedRoutes = connectedRoutes.filter(
    (route) => !newVisited.has(route.id)
  );

  // PERBAIKAN: Prioritaskan jalur yang mendekat ke tujuan
  const prioritizedRoutes = unvisitedConnectedRoutes
    .map((route) => {
      const routeCoords = getRouteCoordinates(route);
      if (routeCoords.length === 0)
        return { route, distanceToDestination: Infinity };

      const routeEnd = routeCoords[routeCoords.length - 1];
      const distanceToTarget = calculateDistance(routeEnd, destination);

      return { route, distanceToDestination: distanceToTarget };
    })
    .sort((a, b) => a.distanceToDestination - b.distanceToDestination)
    .map((item) => item.route);

  // Coba setiap jalur yang terhubung (maksimal 3 terdekat)
  for (const connectedRoute of prioritizedRoutes.slice(0, 3)) {
    const result = findPathToDestination(
      connectedRoute,
      destination,
      allRoutes,
      maxSteps - 1,
      newVisited,
      newPath
    );

    if (result) {
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

  // PERBAIKAN: Jangan tambahkan garis otomatis ke tujuan
  // Hanya tampilkan jalur yang benar-benar ada di GeoJSON
  // const pathEnd = allCoordinates[allCoordinates.length - 1];
  // if (calculateDistance(pathEnd, destination) > 10) {
  //   allCoordinates.push(destination);
  // }

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
  // Coba cari rute lengkap menggunakan multiple jalur
  const completeRoute = findCompleteRoute(startCoord, endCoord, routes);

  if (completeRoute) {
    return completeRoute;
  }

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
    return {
      coordinates: routeCoords,
      distance: minDistance,
      routeIds: [bestRoute.id],
      geojsonSegments: [bestRoute],
    };
  }

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
  // 2. Temukan node terdekat dari start & end
  const startNode = findNearestNode(startCoord, uniqueNodes);
  const endNode = findNearestNode(endCoord, uniqueNodes);
  if (!startNode || !endNode) return null;
  // 3. Dijkstra
  const dist = new Map<string, number>();
  const prev = new Map<string, { node: [number, number]; edge: any }>();
  const queue: Array<{ node: [number, number]; cost: number }> = [
    { node: startNode, cost: 0 },
  ];
  dist.set(startNode.join(","), 0);
  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { node, cost } = queue.shift()!;
    if (node.join(",") === endNode.join(",")) break;
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
  // 4. Rekonstruksi path
  const pathEdges: any[] = [];
  let currKey = endNode.join(",");
  while (prev.has(currKey)) {
    const { node, edge } = prev.get(currKey)!;
    pathEdges.unshift(edge.route);
    currKey = node.join(",");
  }
  if (pathEdges.length === 0) return null;
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
  // Cari titik terdekat untuk start dan end
  const startPoint = findNearestPoint(startCoordinates, points);
  const endPoint = findNearestPoint(endCoordinates, points);

  let actualStart = startCoordinates;
  let actualEnd = endCoordinates;

  if (startPoint) actualStart = startPoint.coordinates;
  if (endPoint) actualEnd = endPoint.coordinates;

  // Coba Dijkstra dulu
  const dijkstraResult = findShortestRouteDijkstra(
    actualStart,
    actualEnd,
    routes
  );
  if (dijkstraResult) return dijkstraResult;

  // Fallback: findShortestRoute lama
  const routeResult = findShortestRoute(actualStart, actualEnd, routes);
  if (routeResult) return routeResult;

  // Fallback: garis lurus
  const fallbackDistance = calculateDistance(actualStart, actualEnd);
  return {
    coordinates: [actualStart, actualEnd],
    distance: fallbackDistance,
    routeIds: [],
    geojsonSegments: [],
  };
}
