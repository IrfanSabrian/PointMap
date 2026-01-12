"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

interface MapEditorProps {
  isDark?: boolean;
  initialGeometry?: any; // GeoJSON feature
  onGeometryChange?: (geometry: any) => void;
  mode?: "polygon" | "marker"; // polygon for buildings, marker for rooms
  className?: string;
  isEdit?: boolean;
}

export default function MapEditor({
  isDark = false,
  initialGeometry = null,
  onGeometryChange,
  mode = "polygon",
  className = "",
  isEdit = false,
}: MapEditorProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnLayerRef = useRef<L.Layer | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [-0.0545, 109.3465],
      zoom: 18,
      zoomControl: true,
    });

    // Add basemap (Always Satellite)
    const basemapUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const basemapLayer = L.tileLayer(basemapUrl, {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 19,
    }).addTo(map);

    basemapLayerRef.current = basemapLayer;

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
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: !isEdit,
    });

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
            (layer as any).pm.enable({
              allowEditing: true,
              allowRemoval: false, // We don't want to remove the initial layer in edit mode usually, or maybe we do?
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
      if (drawnLayerRef.current) {
        map.removeLayer(drawnLayerRef.current);
      }

      drawnLayerRef.current = layer;

      // Convert to GeoJSON and notify parent
      const geoJson = layer.toGeoJSON();
      if (onGeometryChange) {
        onGeometryChange(geoJson);
      }

      // Enable editing for this layer
      if (layer.pm) {
        layer.pm.enable({
          allowEditing: true,
          allowRemoval: true,
        });
      }
    });

    // Handle editing
    map.on("pm:edit", (e: any) => {
      if (drawnLayerRef.current) {
        const geoJson = (drawnLayerRef.current as any).toGeoJSON();
        if (onGeometryChange) {
          onGeometryChange(geoJson);
        }
      }
    });

    // Handle removal
    map.on("pm:remove", (e: any) => {
      drawnLayerRef.current = null;
      if (onGeometryChange) {
        onGeometryChange(null);
      }
    });

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isDark, mode]);

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
