"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Campus, DEFAULT_CAMPUS, getCampusByName } from "@/config/campusConfig";

const STORAGE_KEY = "pointmap_selected_campus";

interface CampusContextType {
  selectedCampus: Campus;
  setSelectedCampus: (campus: Campus) => void;
  isLoading: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [selectedCampus, setSelectedCampus] = useState<Campus>(DEFAULT_CAMPUS);
  const [isLoading, setIsLoading] = useState(true);

  // Load campus from localStorage on mount
  useEffect(() => {
    try {
      const storedCampusName = localStorage.getItem(STORAGE_KEY);
      if (storedCampusName) {
        const campus = getCampusByName(storedCampusName);
        if (campus) {
          setSelectedCampus(campus);
        }
      }
    } catch (error) {
      console.error("Failed to load campus from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage when campus changes
  const handleSetCampus = (campus: Campus) => {
    console.log("🔄 CampusContext: Setting campus to", campus.name);

    // Clone object to force re-render
    setSelectedCampus({ ...campus });

    try {
      localStorage.setItem(STORAGE_KEY, campus.name);
    } catch (error) {
      console.error("Failed to save campus to localStorage:", error);
    }
  };

  return (
    <CampusContext.Provider
      value={{
        selectedCampus,
        setSelectedCampus: handleSetCampus,
        isLoading,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampusContext() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error("useCampusContext must be used within a CampusProvider");
  }
  return context;
}
