import { useState, useEffect, useRef } from "react";
import L from "leaflet";

export function useGps() {
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGpsRequesting, setIsGpsRequesting] = useState(false);
  const [showGPSTroubleshoot, setShowGPSTroubleshoot] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const headingRef = useRef<number | null>(null);

  // Cek apakah user berada di dalam kampus
  const isUserInsideCampus = (userLat: number, userLng: number): boolean => {
    const campusBounds = {
      north: -0.045,
      south: -0.055,
      east: 111.345,
      west: 111.335,
    };
    return (
      userLat >= campusBounds.south &&
      userLat <= campusBounds.north &&
      userLng >= campusBounds.west &&
      userLng <= campusBounds.east
    );
  };

  // Fungsi untuk mendapatkan heading dari device orientation
  const getDeviceHeading = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!window.DeviceOrientationEvent) {
        reject(new Error("Device orientation tidak didukung"));
        return;
      }

      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          // alpha adalah rotasi pada sumbu Z (heading)
          const heading = event.alpha;
          setUserHeading(heading);
          headingRef.current = heading;
          window.removeEventListener("deviceorientation", handleOrientation);
          resolve(heading);
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);

      // Timeout setelah 5 detik
      setTimeout(() => {
        window.removeEventListener("deviceorientation", handleOrientation);
        reject(new Error("Timeout mendapatkan heading"));
      }, 5000);
    });
  };

  // Mulai live GPS tracking dengan heading
  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation tidak didukung");
      return;
    }

    if (watchIdRef.current) {
      // Stop tracking yang sedang berjalan
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLiveTracking(true);
    console.log("📍 Memulai live GPS tracking...");

    // Request permission untuk device orientation (untuk iOS)
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((permission: string) => {
          if (permission === "granted") {
            console.log("📍 Device orientation permission granted");
            // Mulai listening untuk device orientation setelah permission granted
            startDeviceOrientationListening();
          } else {
            console.log("📍 Device orientation permission denied");
          }
        })
        .catch((error: any) => {
          console.log("📍 Device orientation permission error:", error);
        });
    } else {
      // Untuk browser yang tidak memerlukan permission, langsung mulai listening
      startDeviceOrientationListening();
    }

    // Fungsi untuk update GPS secara manual setiap 3 detik
    const updateGPS = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLng = L.latLng(latitude, longitude);
          (latLng as any).timestamp = Date.now();
          (latLng as any).heading = headingRef.current;
          setUserLocation(latLng);
          console.log(
            "📍 Manual GPS update (3s interval):",
            [latitude, longitude],
            "heading:",
            headingRef.current
          );

          // Trigger route update jika ada rute aktif
          window.postMessage(
            {
              type: "gps-updated",
              coordinates: [latitude, longitude],
              heading: headingRef.current,
              timestamp: Date.now(),
            },
            "*"
          );
        },
        (error) => {
          console.error("📍 Manual GPS error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0, // Selalu ambil posisi terbaru
        }
      );
    };

    // Jalankan update GPS pertama kali
    updateGPS();

    // Set interval untuk update GPS setiap 3 detik
    const gpsInterval = setInterval(updateGPS, 3000);

    // Simpan interval ID untuk cleanup
    watchIdRef.current = gpsInterval as any;

    // Juga gunakan watchPosition sebagai backup
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLng = L.latLng(latitude, longitude);
        (latLng as any).timestamp = Date.now();
        (latLng as any).heading = headingRef.current;
        setUserLocation(latLng);
        console.log(
          "📍 Watch GPS update:",
          [latitude, longitude],
          "heading:",
          headingRef.current
        );

        // Trigger route update jika ada rute aktif
        window.postMessage(
          {
            type: "gps-updated",
            coordinates: [latitude, longitude],
            heading: headingRef.current,
            timestamp: Date.now(),
          },
          "*"
        );
      },
      (error) => {
        console.error("📍 Watch GPS error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );

    // Simpan watch ID untuk cleanup
    const originalWatchId = watchId;
    return () => {
      clearInterval(gpsInterval);
      navigator.geolocation.clearWatch(originalWatchId);
    };
  };

  // Fungsi untuk mulai listening device orientation
  const startDeviceOrientationListening = () => {
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          const heading = event.alpha;
          setUserHeading(heading);
          headingRef.current = heading;
          console.log("📍 Device orientation heading:", heading);
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);

      // Simpan reference untuk cleanup
      const orientationHandler = handleOrientation;

      // Cleanup function
      return () => {
        window.removeEventListener("deviceorientation", orientationHandler);
      };
    }
  };

  // Stop live GPS tracking
  const stopLiveTracking = () => {
    if (watchIdRef.current) {
      // Clear interval timer
      clearInterval(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
    console.log("📍 Live GPS tracking dihentikan");
  };

  // Ambil lokasi GPS
  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung"));
        return;
      }

      // Jika sudah ada lokasi GPS yang valid dan belum terlalu lama, gunakan cache
      if (userLocation && isGpsRequesting === false) {
        const now = Date.now();
        const lastUpdate = (userLocation as any).timestamp || 0;
        if (now - lastUpdate < 30000) {
          // 30 detik cache
          console.log("📍 Menggunakan GPS cache:", [
            userLocation.lat,
            userLocation.lng,
          ]);
          resolve([userLocation.lat, userLocation.lng]);
          return;
        }
      }

      if (isGpsRequesting) {
        console.log("📍 GPS request sedang berlangsung, menunggu...");
        // Tunggu sebentar dan coba lagi
        setTimeout(() => {
          if (userLocation) {
            resolve([userLocation.lat, userLocation.lng]);
          } else {
            reject(new Error("GPS request timeout"));
          }
        }, 2000);
        return;
      }

      setIsGpsRequesting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsGpsRequesting(false);
          const { latitude, longitude } = position.coords;
          const latLng = L.latLng(latitude, longitude);
          (latLng as any).timestamp = Date.now();
          (latLng as any).heading = headingRef.current;
          setUserLocation(latLng);
          console.log(
            "📍 GPS berhasil diambil:",
            [latitude, longitude],
            "heading:",
            headingRef.current
          );
          resolve([latitude, longitude]);
        },
        (error) => {
          setIsGpsRequesting(false);
          setShowGPSTroubleshoot(true);
          console.error("📍 GPS error:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  };

  // Cleanup saat component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        clearInterval(watchIdRef.current);
      }
    };
  }, []);

  return {
    userLocation,
    userHeading,
    setUserLocation,
    setUserHeading,
    isGettingLocation,
    setIsGettingLocation,
    isGpsRequesting,
    showGPSTroubleshoot,
    setShowGPSTroubleshoot,
    isUserInsideCampus,
    getCurrentLocation,
    getDeviceHeading,
    isLiveTracking,
    startLiveTracking,
    stopLiveTracking,
  };
}
