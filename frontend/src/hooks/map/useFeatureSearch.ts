import { useEffect, useMemo, useState } from "react";
import type { FeatureType } from "@/types/map";

/**
 * useFeatureSearch
 *
 * Hook untuk pencarian sederhana nama bangunan/ruangan pada daftar fitur.
 * Mengembalikan state teks pencarian, kontrol visibilitas hasil, dan hasilnya.
 */

type UseFeatureSearchArgs = {
  bangunanFeatures: FeatureType[];
  ruanganFeatures: FeatureType[];
};

export function useFeatureSearch({
  bangunanFeatures,
  ruanganFeatures,
}: UseFeatureSearchArgs) {
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<FeatureType[]>([]);

  // Compute results when dependencies change
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const results: FeatureType[] = [];

    // Bangunan
    bangunanFeatures.forEach((bangunan) => {
      const nama = bangunan.properties?.nama || "";
      if (nama.toLowerCase().includes(searchLower)) {
        results.push({
          ...bangunan,
          properties: {
            ...bangunan.properties,
            displayType: "bangunan",
            displayInfo: `${bangunan.properties?.lantai || 0} Lantai`,
          },
        });
      }
    });

    // Ruangan
    ruanganFeatures.forEach((ruangan) => {
      const nama = ruangan.properties?.nama || "";
      if (nama.toLowerCase().includes(searchLower)) {
        results.push({
          ...ruangan,
          properties: {
            ...ruangan.properties,
            displayType: "ruangan",
            isRuangan: true,
          },
        });
      }
    });

    setSearchResults(results);
  }, [searchText, bangunanFeatures, ruanganFeatures]);

  return useMemo(
    () => ({
      searchText,
      setSearchText,
      showSearchResults,
      setShowSearchResults,
      searchResults,
    }),
    [searchText, showSearchResults, searchResults]
  );
}
