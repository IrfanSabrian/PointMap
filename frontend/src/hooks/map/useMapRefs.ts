/**
 * @file useMapRefs.ts  
 * @description Custom hook untuk mengelola semua refs di LeafletMap component
 * @phase Phase 1.2 - Extract Refs
 * @created 2025-12-04
 */

import { useRef, MutableRefObject } from "react";
import type L from "leaflet";
import type { FeatureType } from "@/types/map";

/**
 * Interface untuk Map Refs
 */
export interface MapRefs {
  // Core Map Refs
  mapRef: MutableRefObject<HTMLDivElement | null>;
  leafletMapRef: MutableRefObject<L.Map | null>;
  basemapLayerRef: MutableRefObject<L.TileLayer | null>;
  
  // Layer Refs
  nonBangunanLayerRef: MutableRefObject<L.GeoJSON<FeatureType> | null>;
  bangunanLayerRef: MutableRefObject<L.GeoJSON<FeatureType> | null>;
  jalurLayerRef: MutableRefObject<L.Layer | null>;
  titikLayerRef: MutableRefObject<L.Layer | null>;
  
  // Route/Navigation Refs
  userMarkerRef: MutableRefObject<L.Marker | null>;
  routeLineRef: MutableRefObject<L.Polyline | null>;
  navigationMarkerRef: MutableRefObject<L.Marker | null>;
  
  // State Tracking Refs (for performance)
  isHighlightActiveRef: MutableRefObject<boolean>;
  isNavigationActiveRef: MutableRefObject<boolean>;
  isGpsRecalcRef: MutableRefObject<boolean>;
  isZoomingRef: MutableRefObject<boolean>;
  isBuildingClickedRef: MutableRefObject<boolean>;
  isDrawingEnabledRef: MutableRefObject<boolean>;
  drawingModeRef: MutableRefObject<string | null>;
}

/**
 * Custom hook untuk mengelola Map Refs
 * @returns MapRefs object dengan semua refs yang terorganisir
 */
export function useMapRefs(): MapRefs {
  // ==================== CORE MAP REFS ====================
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);

  // ==================== LAYER REFS ====================
  const nonBangunanLayerRef = useRef<L.GeoJSON<FeatureType> | null>(null);
  const bangunanLayerRef = useRef<L.GeoJSON<FeatureType> | null>(null);
  const jalurLayerRef = useRef<L.Layer | null>(null);
  const titikLayerRef = useRef<L.Layer | null>(null);

  // ==================== ROUTE/NAVIGATION REFS ====================
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const navigationMarkerRef = useRef<L.Marker | null>(null);

  // ==================== STATE TRACKING REFS ====================
  // These refs are used for performance optimization to avoid re-renders
  const isHighlightActiveRef = useRef(false);
  const isNavigationActiveRef = useRef(false);
  const isGpsRecalcRef = useRef(false);
  const isZoomingRef = useRef(false);
  const isBuildingClickedRef = useRef(false);
  const isDrawingEnabledRef = useRef(false);
  const drawingModeRef = useRef<string | null>(null);

  // ==================== RETURN ORGANIZED REFS ====================
  return {
    // Core
    mapRef,
    leafletMapRef,
    basemapLayerRef,
    
    // Layers
    nonBangunanLayerRef,
    bangunanLayerRef,
    jalurLayerRef,
    titikLayerRef,
    
    // Route/Navigation
    userMarkerRef,
    routeLineRef,
    navigationMarkerRef,
    
    // State Tracking
    isHighlightActiveRef,
    isNavigationActiveRef,
    isGpsRecalcRef,
    isZoomingRef,
    isBuildingClickedRef,
    isDrawingEnabledRef,
    drawingModeRef,
  };
}
