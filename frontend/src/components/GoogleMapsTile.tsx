"use client";

import React, { useState } from "react";

interface GoogleMapsProps {
  className?: string;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({
  className = "",
  initialLat = -0.0,
  initialLng = 109.3333,
  initialZoom = 15,
}) => {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const getMapUrl = () => {
    const baseUrl = "https://www.google.com/maps/embed/v1/view";
    const params = new URLSearchParams({
      key: "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8", // Free API key for testing
      center: `${initialLat},${initialLng}`,
      zoom: initialZoom.toString(),
      maptype: mapType,
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const toggleMapType = () => {
    setMapType((prev) => (prev === "roadmap" ? "satellite" : "roadmap"));
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div className="w-full h-full relative">
        <iframe
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps - Polnep"
        />
      </div>

      {/* Map Type Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={toggleMapType}
          className="bg-white/90 px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-white transition-colors"
        >
          {mapType === "roadmap" ? "🌍 Street View" : "🛰️ Satellite View"}
        </button>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-2 rounded-lg text-sm shadow-lg z-10">
        <div className="text-xs text-gray-600">
          <div>Polnep Location</div>
          <div>Lat: {initialLat.toFixed(4)}</div>
          <div>Lng: {initialLng.toFixed(4)}</div>
          <div>Zoom: {initialZoom}</div>
          <div>Type: {mapType}</div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMaps;
