"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

interface Tile {
  x: number;
  y: number;
  z: number;
  url: string;
  image?: HTMLImageElement;
  loaded: boolean;
  error: boolean;
}

interface TileProvider {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
}

interface AdvancedXYZMapProps {
  width?: number;
  height?: number;
  initialZoom?: number;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

const AdvancedXYZMap: React.FC<AdvancedXYZMapProps> = ({
  width,
  height,
  initialZoom = 10,
  initialLat = -0.0, // Pontianak coordinates
  initialLng = 109.3333,
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
  const [currentProvider, setCurrentProvider] = useState<string>("osm");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
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

  // Tile providers
  const tileProviders: TileProvider[] = useMemo(
    () => [
      {
        id: "osm",
        name: "OpenStreetMap",
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: 1,
      },
      {
        id: "satellite",
        name: "Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "© Esri",
        maxZoom: 19,
        minZoom: 1,
      },
      {
        id: "terrain",
        name: "Terrain",
        url: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
        attribution: "© Stamen Design",
        maxZoom: 18,
        minZoom: 1,
      },
      {
        id: "cartodb",
        name: "CartoDB",
        url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        attribution: "© CartoDB",
        maxZoom: 19,
        minZoom: 1,
      },
    ],
    []
  );

  const currentProviderConfig = useMemo(
    () =>
      tileProviders.find((p) => p.id === currentProvider) || tileProviders[0],
    [tileProviders, currentProvider]
  );

  // Konversi lat/lng ke pixel coordinates
  const latLngToPixel = useCallback(
    (lat: number, lng: number, zoom: number) => {
      const n = Math.pow(2, zoom);
      const xtile = Math.floor((lng + 180) / 360) * n;
      const ytile = Math.floor(
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) +
              1 / Math.cos((lat * Math.PI) / 180)
          ) /
            Math.PI) /
          2) *
          n
      );
      return { x: xtile, y: ytile };
    },
    []
  );

  // Konversi pixel ke lat/lng
  const pixelToLatLng = useCallback((x: number, y: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const lng = (x / n) * 360 - 180;
    const lat =
      (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    return { lat, lng };
  }, []);

  // Get tile URL dengan template replacement
  const getTileUrl = useCallback(
    (x: number, y: number, z: number) => {
      return currentProviderConfig.url
        .replace("{x}", x.toString())
        .replace("{y}", y.toString())
        .replace("{z}", z.toString());
    },
    [currentProviderConfig]
  );

  // Hitung tile coordinates yang dibutuhkan
  const getTileCoordinates = useCallback(() => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    // Konversi pixel ke tile coordinates
    const tileX = Math.floor((centerX - position.x) / 256);
    const tileY = Math.floor((centerY - position.y) / 256);

    // Hitung jumlah tile yang dibutuhkan
    const tilesX = Math.ceil(canvasSize.width / 256) + 2;
    const tilesY = Math.ceil(canvasSize.height / 256) + 2;

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
            error: false,
          });
        }
      }
    }

    return tileCoords;
  }, [canvasSize.width, canvasSize.height, position, zoom, getTileUrl]);

  // Load tile image dengan retry mechanism
  const loadTile = useCallback((tile: Tile, retryCount = 0): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        tile.image = img;
        tile.loaded = true;
        tile.error = false;
        resolve();
      };

      img.onerror = () => {
        tile.error = true;
        if (retryCount < 3) {
          // Retry loading tile
          setTimeout(() => {
            loadTile(tile, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, 1000 * (retryCount + 1));
        } else {
          reject(
            new Error(
              `Failed to load tile after ${retryCount + 1} retries: ${tile.url}`
            )
          );
        }
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
      await Promise.allSettled(newTiles.map(loadTile));
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
        const tileX = centerX + tile.x * 256 - position.x;
        const tileY = centerY + tile.y * 256 - position.y;

        ctx.drawImage(tile.image, tileX, tileY, 256, 256);
      } else if (tile.error) {
        // Render error tile
        const tileX = centerX + tile.x * 256 - position.x;
        const tileY = centerY + tile.y * 256 - position.y;

        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(tileX, tileY, 256, 256);
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(tileX, tileY, 256, 256);

        ctx.fillStyle = "#999";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Error", tileX + 128, tileY + 128);
      }
    });
  }, [tiles, canvasSize.width, canvasSize.height, position]);

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
    const newZoom = Math.min(
      Math.max(currentProviderConfig.minZoom, zoom + delta),
      currentProviderConfig.maxZoom
    );

    if (newZoom !== zoom) {
      setZoom(newZoom);
    }
  };

  // Effects
  useEffect(() => {
    loadTiles();
  }, [loadTiles, currentProvider]);

  useEffect(() => {
    renderTiles();
  }, [renderTiles]);

  // Reset view ke Pontianak
  const resetView = () => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  };

  // Get current coordinates
  const getCurrentCoordinates = () => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const tileX = Math.floor((centerX - position.x) / 256);
    const tileY = Math.floor((centerY - position.y) / 256);
    return pixelToLatLng(tileX, tileY, zoom);
  };

  const currentCoords = getCurrentCoordinates();

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
        <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-sm shadow-lg">
          Loading tiles...
        </div>
      )}

      {/* Layer panel */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 mb-2"
          title="Layer Options"
        >
          ⚙️
        </button>

        {showLayerPanel && (
          <div className="bg-white rounded shadow-lg p-3 mb-2 min-w-48">
            <h3 className="text-sm font-bold mb-2">Pilih Layer</h3>
            {tileProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setCurrentProvider(provider.id);
                  setShowLayerPanel(false);
                }}
                className={`w-full text-left px-2 py-1 rounded text-sm mb-1 ${
                  currentProvider === provider.id
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100"
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              setZoom((prev) =>
                Math.min(prev + 1, currentProviderConfig.maxZoom)
              )
            }
            className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() =>
              setZoom((prev) =>
                Math.max(prev - 1, currentProviderConfig.minZoom)
              )
            }
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
      </div>

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-sm shadow-lg">
        <div>Zoom: {zoom}</div>
        <div>Lat: {currentCoords.lat.toFixed(4)}</div>
        <div>Lng: {currentCoords.lng.toFixed(4)}</div>
        <div className="text-xs text-gray-600 mt-1">
          {currentProviderConfig.attribution}
        </div>
      </div>
    </div>
  );
};

export default AdvancedXYZMap;
