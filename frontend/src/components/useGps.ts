import { useState, useEffect, useRef } from "react";
import L from "leaflet";

export function useGps() {
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGpsRequesting, setIsGpsRequesting] = useState(false);
  const [showGPSTroubleshoot, setShowGPSTroubleshoot] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

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

  // Mulai live GPS tracking
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

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLng = L.latLng(latitude, longitude);
        (latLng as any).timestamp = Date.now();
        setUserLocation(latLng);
        console.log("📍 Live GPS update:", [latitude, longitude]);

        // Trigger route update jika ada rute aktif
        // Kirim event untuk update route
        window.postMessage(
          {
            type: "gps-updated",
            coordinates: [latitude, longitude],
            timestamp: Date.now(),
          },
          "*"
        );
      },
      (error) => {
        console.error("📍 Live GPS error:", error);
        setIsLiveTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000, // Update setiap 3 detik untuk responsivitas lebih baik
      }
    );
  };

  // Stop live GPS tracking
  const stopLiveTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
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
          setUserLocation(latLng);
          console.log("📍 GPS berhasil diambil:", [latitude, longitude]);
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
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    userLocation,
    setUserLocation,
    isGettingLocation,
    setIsGettingLocation,
    isGpsRequesting,
    showGPSTroubleshoot,
    setShowGPSTroubleshoot,
    isUserInsideCampus,
    getCurrentLocation,
    isLiveTracking,
    startLiveTracking,
    stopLiveTracking,
  };
}
