import { useState, useRef } from "react";
import L from "leaflet";
import { parseRouteSteps, getStepInstruction } from "@/lib/routeSteps";

export type TransportMode = "jalan_kaki" | "kendaraan";

/**
 * useRouting
 *
 * Hook state manajemen navigasi rute:
 * - routeSteps, activeStepIndex, jarak total, estimasi waktu
 * - layer garis rute & alternatif
 * - marker tujuan, status sampai tujuan, moda transport
 * Juga mengekspos helper `parseRouteSteps` dan `getStepInstruction`.
 */
export function useRouting() {
  const [routeSteps, setRouteSteps] = useState<Record<string, any>[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [totalWalkingTime, setTotalWalkingTime] = useState<number | null>(null);
  const [totalVehicleTime, setTotalVehicleTime] = useState<number | null>(null);
  const [routeLine, setRouteLine] = useState<L.Layer | null>(null);
  const [alternativeRouteLines, setAlternativeRouteLines] = useState<L.Layer[]>(
    []
  );
  const [destinationMarker, setDestinationMarker] = useState<L.Marker | null>(
    null
  );
  const [hasReachedDestination, setHasReachedDestination] =
    useState<boolean>(false);
  const [transportMode, setTransportMode] =
    useState<TransportMode>("jalan_kaki");
  const activeStepLineRef = useRef<L.Polyline | null>(null);

  return {
    routeSteps,
    setRouteSteps,
    activeStepIndex,
    setActiveStepIndex,
    routeDistance,
    setRouteDistance,
    totalWalkingTime,
    setTotalWalkingTime,
    totalVehicleTime,
    setTotalVehicleTime,
    routeLine,
    setRouteLine,
    alternativeRouteLines,
    setAlternativeRouteLines,
    destinationMarker,
    setDestinationMarker,
    hasReachedDestination,
    setHasReachedDestination,
    transportMode,
    setTransportMode,
    activeStepLineRef,
    parseRouteSteps,
    getStepInstruction,
  };
}
