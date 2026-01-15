"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type { Campus } from "@/config/campusConfig";
import { DEFAULT_CAMPUS } from "@/config/campusConfig";

interface MapEditorProps {
  isDark?: boolean;
  initialGeometry?: any; // GeoJSON feature
  onGeometryChange?: (geometry: any) => void;
  mode?: "polygon" | "marker"; // polygon for buildings, marker for rooms
  className?: string;
  isEdit?: boolean;
  campus?: Campus;
}

export default function MapEditor({
  isDark = false,
  initialGeometry = null,
  onGeometryChange,
  mode = "polygon",
  className = "",
  isEdit = false,
  campus = DEFAULT_CAMPUS,
}: MapEditorProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnLayerRef = useRef<L.Layer | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);

  // Sync callback ref
  const onGeometryChangeRef = useRef(onGeometryChange);
  useEffect(() => {
    onGeometryChangeRef.current = onGeometryChange;
  }, [onGeometryChange]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [campus.latitude, campus.longitude],
      zoom: campus.zoom,
      zoomControl: true,
      maxZoom: campus.maxZoom, // Set max zoom limit on map instance
      minZoom: 2,
    });

    // Add basemap (Always Satellite)
    const basemapUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const basemapLayer = L.tileLayer(basemapUrl, {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: campus.maxZoom, // User can zoom up to this level
      maxNativeZoom: campus.maxNativeZoom, // Tiles are only available up to this level (prevents grey tiles)
    }).addTo(map);

    basemapLayerRef.current = basemapLayer;

    // Add zoom event listener for debugging
    map.on("zoomend", () => {
      const currentZoom = map.getZoom();
      console.log(
        `📍 Current zoom: ${currentZoom} / Max: ${campus.maxZoom} / Native: ${campus.maxNativeZoom}`
      );
    });

    // Add Geoman controls
    map.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawCircleMarker: mode === "marker" && !isEdit,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: mode === "polygon" && !isEdit,
      drawMarker: mode === "marker" && !isEdit,
      drawText: false,
      editMode: false,
      rotateMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: !isEdit,
    });

    // Helper to handle geometry updates
    const handleLayerUpdate = (layer: any) => {
      if (!layer || !layer.toGeoJSON) return;

      // Update ref to current layer
      drawnLayerRef.current = layer;

      const geoJson = layer.toGeoJSON();
      // console.log("🔄 Layer updated:", geoJson.geometry.type);

      if (onGeometryChangeRef.current) {
        onGeometryChangeRef.current(geoJson);
      }
    };

    // Load initial geometry if provided
    if (initialGeometry) {
      try {
        let geometryToLoad = initialGeometry;

        // Parse if string
        if (typeof initialGeometry === "string") {
          // If empty string or just whitespace, skip
          if (!initialGeometry.trim()) return;
          try {
            geometryToLoad = JSON.parse(initialGeometry);
          } catch (e) {
            console.error("Failed to parse initial geometry JSON:", e);
            return;
          }
        }

        // Validate that we have a valid object to pass to L.geoJSON
        if (
          !geometryToLoad ||
          typeof geometryToLoad !== "object" ||
          Object.keys(geometryToLoad).length === 0
        ) {
          console.warn("Invalid geometry object:", geometryToLoad);
          return;
        }

        const geoJsonLayer = L.geoJSON(geometryToLoad, {
          style: {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.4,
            fillColor: "#3b82f6",
          },
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#ef4444",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
        });

        // Add to map
        geoJsonLayer.addTo(map);

        // Store reference to the layer and enable editing
        geoJsonLayer.eachLayer((layer) => {
          drawnLayerRef.current = layer;

          // Enable PM for editing if supported on this layer
          if (isEdit && (layer as any).pm) {
            const pmLayer = layer as any;
            pmLayer.pm.enable({
              allowEditing: true,
              allowRemoval: false, // Prevent removal of initial layer unless needed
            });

            // Listen to changes on the layer directly for reliability
            const updateEvents = [
              "pm:edit",
              "pm:markerdragend",
              "pm:dragend",
              "pm:vertexadded",
              "pm:vertexremoved",
              "pm:cut",
              "pm:rotateend",
            ];

            updateEvents.forEach((event) => {
              layer.on(event, () => handleLayerUpdate(layer));
            });
          }
        });

        // Fit bounds to the geometry
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Error loading initial geometry:", error);
      }
    }

    // Handle drawing creation
    map.on("pm:create", (e: any) => {
      const layer = e.layer;

      // Remove previous drawn layer
      if (drawnLayerRef.current && drawnLayerRef.current !== layer) {
        map.removeLayer(drawnLayerRef.current);
      }

      // Handle the new layer
      handleLayerUpdate(layer);

      // Enable editing for this layer
      if (layer.pm) {
        layer.pm.enable({
          allowEditing: true,
          allowRemoval: true,
        });

        // Attach listeners to new layer too
        const updateEvents = [
          "pm:edit",
          "pm:markerdragend",
          "pm:dragend",
          "pm:vertexadded",
          "pm:vertexremoved",
          "pm:cut",
          "pm:rotateend",
        ];

        updateEvents.forEach((event) => {
          layer.on(event, () => handleLayerUpdate(layer));
        });
      }
    });

    // Global edit handler as fallback (using e.layer)
    map.on("pm:edit", (e: any) => {
      if (e.layer) {
        handleLayerUpdate(e.layer);
      }
    });

    // Handle removal
    map.on("pm:remove", (e: any) => {
      // Only nullify if the removed layer is the current one
      if (e.layer === drawnLayerRef.current) {
        drawnLayerRef.current = null;
        if (onGeometryChangeRef.current) {
          onGeometryChangeRef.current(null);
        }
      }
    });

    mapRef.current = map;

    // Explicitly set max zoom (redundant but ensures it's applied)
    map.setMaxZoom(campus.maxZoom);

    console.log("🗺️ MapEditor using stable initialization");

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, mode, campus, isEdit]); // Removed onGeometryChange and initialGeometry from dependencies

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${className}`}
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
