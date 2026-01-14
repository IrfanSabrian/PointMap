/**
 * Campus Configuration
 * Defines all Polnep campuses with their locations and metadata
 *
 * IMPORTANT: maxZoom values are set based on satellite imagery availability:
 * - Larger cities (Pontianak) have detailed satellite imagery up to zoom 20-21
 * - Smaller cities (Sanggau, Kapuas Hulu, Sukamara) typically only have imagery up to zoom 18-19
 * - Setting maxZoom too high will result in "grey tiles" / "data not available" errors
 */

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  zoom: number;
  maxZoom: number; // Max allow zoom level for User Interface (Digital Zoom)
  maxNativeZoom: number; // Max available Satellite Tile level (Data Source)
}

export const CAMPUSES: Campus[] = [
  {
    id: "polnep-pontianak",
    name: "Politeknik Negeri Pontianak",
    shortName: "Polnep Pontianak",
    latitude: -0.05469884018504279,
    longitude: 109.3463450740866,
    zoom: 18,
    maxZoom: 21, // Allow heavy zoom for editing precision
    maxNativeZoom: 19, // Safest satellite tile level for Pontianak
  },
  {
    id: "psdku-sanggau",
    name: "PSDKU Polnep Sanggau",
    shortName: "PSDKU Sanggau",
    latitude: 0.1426413682998116,
    longitude: 110.55261974598871,
    zoom: 18,
    maxZoom: 21,
    maxNativeZoom: 18, // Remote area safe limit
  },
  {
    id: "pdd-kapuas-hulu",
    name: "PDD Polnep Kapuas Hulu",
    shortName: "PDD Kapuas Hulu",
    latitude: 0.8802689185357316,
    longitude: 112.92781814288477,
    zoom: 18,
    maxZoom: 21,
    maxNativeZoom: 18,
  },
  {
    id: "psdku-sukamara",
    name: "PSDKU Polnep Sukamara",
    shortName: "PSDKU Sukamara",
    latitude: -2.75768723939167,
    longitude: 111.19258469572107,
    zoom: 18,
    maxZoom: 21,
    maxNativeZoom: 18,
  },
];

// Default campus
export const DEFAULT_CAMPUS = CAMPUSES[0];

// Helper function to get campus by name
export function getCampusByName(name: string): Campus | undefined {
  return CAMPUSES.find((c) => c.name === name);
}

// Helper function to get campus by ID
export function getCampusById(id: string): Campus | undefined {
  return CAMPUSES.find((c) => c.id === id);
}
