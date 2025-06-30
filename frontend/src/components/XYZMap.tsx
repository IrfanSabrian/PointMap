"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface Tile {
  x: number;
  y: number;
  z: number;
  url: string;
  image?: HTMLImageElement;
  loaded: boolean;
}

interface XYZMapProps {
  width?: number;
  height?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  tileSize?: number;
  className?: string;
}

const XYZMap: React.FC<XYZMapProps> = ({
  width,
  height,
  initialZoom = 10,
  minZoom = 1,
  maxZoom = 18,
  tileSize = 256,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Update canvas size berdasarkan container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // OpenStreetMap XYZ tile URL
  const getTileUrl = (x: number, y: number, z: number) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  // Hitung tile coordinates berdasarkan zoom dan position
  const getTileCoordinates = useCallback(() => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    // Konversi pixel ke tile coordinates
    const tileX = Math.floor((centerX - position.x) / tileSize);
    const tileY = Math.floor((centerY - position.y) / tileSize);

    // Hitung jumlah tile yang dibutuhkan
    const tilesX = Math.ceil(canvasSize.width / tileSize) + 2;
    const tilesY = Math.ceil(canvasSize.height / tileSize) + 2;

    const tileCoords: Tile[] = [];

    for (
      let x = tileX - Math.floor(tilesX / 2);
      x <= tileX + Math.floor(tilesX / 2);
      x++
    ) {
      for (
        let y = tileY - Math.floor(tilesY / 2);
        y <= tileY + Math.floor(tilesY / 2);
        y++
      ) {
        // Validasi tile coordinates
        if (
          x >= 0 &&
          y >= 0 &&
          x < Math.pow(2, zoom) &&
          y < Math.pow(2, zoom)
        ) {
          tileCoords.push({
            x,
            y,
            z: zoom,
            url: getTileUrl(x, y, zoom),
            loaded: false,
          });
        }
      }
    }

    return tileCoords;
  }, [canvasSize.width, canvasSize.height, position, zoom, tileSize]);

  // Load tile image
  const loadTile = useCallback((tile: Tile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        tile.image = img;
        tile.loaded = true;
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load tile: ${tile.url}`));
      };

      img.src = tile.url;
    });
  }, []);

  // Load semua tile yang dibutuhkan
  const loadTiles = useCallback(async () => {
    const newTiles = getTileCoordinates();
    setTiles(newTiles);
    setIsLoading(true);

    try {
      await Promise.all(newTiles.map(loadTile));
    } catch (error) {
      console.error("Error loading tiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getTileCoordinates, loadTile]);

  // Render tiles ke canvas
  const renderTiles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    tiles.forEach((tile) => {
      if (tile.loaded && tile.image) {
        const tileX = centerX + tile.x * tileSize - position.x;
        const tileY = centerY + tile.y * tileSize - position.y;

        ctx.drawImage(tile.image, tileX, tileY, tileSize, tileSize);
      }
    });
  }, [tiles, canvasSize.width, canvasSize.height, position, tileSize]);

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
    const newZoom = Math.min(Math.max(minZoom, zoom + delta), maxZoom);

    if (newZoom !== zoom) {
      setZoom(newZoom);
    }
  };

  // Effects
  useEffect(() => {
    loadTiles();
  }, [loadTiles]);

  useEffect(() => {
    renderTiles();
  }, [renderTiles]);

  // Reset zoom dan position
  const resetView = () => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-lg text-sm">
          Loading tiles...
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(prev + 1, maxZoom))}
          className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(prev - 1, minZoom))}
          className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50"
          title="Reset View"
        >
          ⌂
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 bg-white/80 px-3 py-1 rounded-lg text-sm">
        Zoom: {zoom}
      </div>
    </div>
  );
};

export default XYZMap;
