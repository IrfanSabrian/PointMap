import type * as GeoJSON from "geojson";

/** Properti umum untuk fitur peta (bangunan/ruangan/dll). */

export interface FeatureProperties {
  id?: number | string;
  nama?: string;
  interaksi?: string;
  lantai?: number;
  kategori?: string;
  subtipe?: string;
  displayType?: string;
  displayInfo?: string;
  jurusan?: string;
  prodi?: string;
  isRuangan?: boolean;
  bangunan_id?: number | string;
  nomor_lantai?: number;
  thumbnail?: string;
  [key: string]: any;
}

/** Fitur GeoJSON dengan properti terstruktur. */
export interface FeatureFixed extends GeoJSON.Feature {
  properties: FeatureProperties;
  geometry: GeoJSON.Geometry;
}

/** Alias umum yang dipakai di komponen. */
export type FeatureType = FeatureFixed;
