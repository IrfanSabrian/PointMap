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

  // Jika sudah dekat dengan tujuan, return path ini
  if (distanceToDestination < 50) {
    const allCoordinates = buildCompleteCoordinates(newPath, destination);
    const totalDistance = calculatePathDistance(allCoordinates);
    const routeIds = newPath.map((route) => route.id);

    return {
      coordinates: allCoordinates,
      distance: totalDistance,
      routeIds: routeIds,
    };
  }

  // Cari jalur yang terhubung dengan jalur ini
  const connectedRoutes = findConnectedRouteToRoute(currentRoute, allRoutes);

  // Coba setiap jalur yang terhubung
  for (const connectedRoute of connectedRoutes.slice(0, 3)) {
    // Coba 3 jalur terdekat
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

  // Tambahkan koordinat tujuan jika tidak sama dengan akhir path
  const pathEnd = allCoordinates[allCoordinates.length - 1];
  if (calculateDistance(pathEnd, destination) > 10) {
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
    };
  }

  return null;
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
} | null {
  // Cari titik terdekat untuk start dan end
  const startPoint = findNearestPoint(startCoordinates, points);
  const endPoint = findNearestPoint(endCoordinates, points);

  let actualStart = startCoordinates;
  let actualEnd = endCoordinates;

  // Jika ada titik terdekat, gunakan koordinat titik tersebut
  if (startPoint) {
    actualStart = startPoint.coordinates;
  }
  if (endPoint) {
    actualEnd = endPoint.coordinates;
  }

  // Cari rute menggunakan jalur yang tersedia
  const routeResult = findShortestRoute(actualStart, actualEnd, routes);

  if (routeResult) {
    return routeResult;
  }

  // Fallback: jika tidak ada jalur yang cocok, gunakan garis lurus
  const fallbackDistance = calculateDistance(actualStart, actualEnd);
  return {
    coordinates: [actualStart, actualEnd],
    distance: fallbackDistance,
    routeIds: [],
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
