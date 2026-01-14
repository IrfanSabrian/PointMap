/**
 * Custom hook for managing campus selection
 * Provides campus state with localStorage persistence
 *
 * REFACTORED: Now uses CampusContext for global state
 */

import { useCampusContext } from "@/context/CampusContext";

export function useCampus() {
  const { selectedCampus, setSelectedCampus, isLoading } = useCampusContext();

  return {
    selectedCampus,
    setSelectedCampus,
    isLoading,
  };
}
