import { useState } from "react";
import L from "leaflet";

export function useGps() {
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGpsRequesting, setIsGpsRequesting] = useState(false);
  const [showGPSTroubleshoot, setShowGPSTroubleshoot] = useState(false);

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

  // Ambil lokasi GPS
  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung"));
        return;
      }
      if (isGpsRequesting) {
        reject(new Error("GPS request sedang berlangsung"));
        return;
      }
      setIsGpsRequesting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsGpsRequesting(false);
          const { latitude, longitude } = position.coords;
          setUserLocation(L.latLng(latitude, longitude));
          resolve([latitude, longitude]);
        },
        (error) => {
          setIsGpsRequesting(false);
          setShowGPSTroubleshoot(true);
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
  };
}
