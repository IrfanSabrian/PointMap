import { useState, useRef } from "react";
import L from "leaflet";
import { parseRouteSteps, getStepInstruction } from "../lib/routeSteps";

export function useRouting() {
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeLine, setRouteLine] = useState<L.Layer | null>(null);
  const activeStepLineRef = useRef<L.Polyline | null>(null);

  return {
    routeSteps,
    setRouteSteps,
    activeStepIndex,
    setActiveStepIndex,
    routeDistance,
    setRouteDistance,
    routeLine,
    setRouteLine,
    activeStepLineRef,
    parseRouteSteps,
    getStepInstruction,
  };
}
