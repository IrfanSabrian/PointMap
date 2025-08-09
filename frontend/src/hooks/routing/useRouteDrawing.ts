import { useCallback } from "react";
import L, { LatLngExpression, PolylineOptions } from "leaflet";

/**
 * useRouteDrawing
 *
 * Abstraksi sederhana untuk menggambar/menghapus polyline rute pada peta Leaflet.
 */

export function useRouteDrawing(mapRef: React.MutableRefObject<L.Map | null>) {
  const addRouteLine = useCallback(
    (
      points: LatLngExpression[],
      options?: PolylineOptions
    ): L.Polyline | null => {
      const map = mapRef.current;
      if (!map || !points || points.length === 0) return null;
      const line = L.polyline(points, options).addTo(map);
      return line;
    },
    [mapRef]
  );

  const removeRouteLine = useCallback(
    (line: L.Polyline | null, afterRemove?: () => void) => {
      const map = mapRef.current;
      if (!map || !line) return;
      map.removeLayer(line);
      afterRemove?.();
    },
    [mapRef]
  );

  return { addRouteLine, removeRouteLine };
}

export type UseRouteDrawingReturn = ReturnType<typeof useRouteDrawing>;
