"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

interface DashboardMapProps {
  isDark?: boolean;
  className?: string;
}

export default function DashboardMap({
  isDark = false,
  className = "",
}: DashboardMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [-0.0545, 109.3465], // Default center
      zoom: 18,
      zoomControl: true,
    });

    // Add basemap
    const basemapUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

    L.tileLayer(basemapUrl, {
      attribution: isDark
        ? '&copy; <a href="https://carto.com/">CartoDB</a>'
        : '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 20,
    }).addTo(map);

    // Fetch and display bangunan (buildings)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/geojson`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          L.geoJSON(data.features, {
            style: {
              color: "#3b82f6",
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.4,
              fillColor: "#3b82f6",
            },
            onEachFeature: (feature, layer) => {
              if (feature.properties && feature.properties.nama) {
                layer.bindTooltip(feature.properties.nama, {
                  permanent: false,
                  direction: "top",
                });
              }
            },
          }).addTo(map);
        }
      })
      .catch((error) => {
        console.error("Error loading buildings:", error);
      });

    // Fetch and display ruangan (rooms)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          data.forEach((room) => {
            if (room.posisi_x && room.posisi_y) {
              const marker = L.circleMarker([room.posisi_y, room.posisi_x], {
                radius: 6,
                fillColor: "#ef4444",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
              });

              if (room.nama_ruangan) {
                marker.bindTooltip(room.nama_ruangan, {
                  permanent: false,
                  direction: "top",
                });
              }

              marker.addTo(map);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error loading rooms:", error);
      });

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isDark]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
