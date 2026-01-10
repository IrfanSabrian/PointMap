/**
 * @file useMapState.ts
 * @description Custom hook untuk mengelola semua state di LeafletMap component
 * @phase Phase 1.1 - Extract Map State
 * @created 2025-12-04
 */

import { useState, useRef, Dispatch, SetStateAction } from "react";
import type L from "leaflet";
import type { FeatureType } from "@/types/map";

/**
 * Interface untuk Map Configuration States
 */
export interface MapConfigState {
  basemap: string;
  setBasemap: Dispatch<SetStateAction<string>>;

  layerVisible: boolean;
  setLayerVisible: Dispatch<SetStateAction<boolean>>;

  isSatellite: boolean;
  setIsSatellite: Dispatch<SetStateAction<boolean>>;
}

/**
 * Interface untuk Loading & Process States
 */
export interface LoadingState {
  isLoadingData: boolean;
  setIsLoadingData: Dispatch<SetStateAction<boolean>>;

  isSaving: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
}

/**
 * Interface untuk UI & Visibility States
 */
export interface UIState {
  cardVisible: boolean;
  setCardVisible: Dispatch<SetStateAction<boolean>>;

  showBuildingDetailCanvas: boolean;
  setShowBuildingDetailCanvas: Dispatch<SetStateAction<boolean>>;

  showShapeSwitchModal: boolean;
  setShowShapeSwitchModal: Dispatch<SetStateAction<boolean>>;
}

/**
 * Interface untuk Animation States
 */
export interface AnimationState {
  isContainerShaking: boolean;
  setIsContainerShaking: Dispatch<SetStateAction<boolean>>;

  isBuildingDetailFadingOut: boolean;
  setIsBuildingDetailFadingOut: Dispatch<SetStateAction<boolean>>;

  isBuildingDetailFadingIn: boolean;
  setIsBuildingDetailFadingIn: Dispatch<SetStateAction<boolean>>;

  cardAnimation: boolean;
  setCardAnimation: Dispatch<SetStateAction<boolean>>;
}

/**
 * Interface untuk Feature & Data States
 */
export interface FeatureState {
  selectedFeature: FeatureType | null;
  setSelectedFeature: Dispatch<SetStateAction<FeatureType | null>>;

  bangunanFeatures: FeatureType[];
  setBangunanFeatures: Dispatch<SetStateAction<FeatureType[]>>;

  ruanganFeatures: FeatureType[];
  setRuanganFeatures: Dispatch<SetStateAction<FeatureType[]>>;

  nonBangunanFeatures: FeatureType[];
  setNonBangunanFeatures: Dispatch<SetStateAction<FeatureType[]>>;
}

/**
 * Interface untuk Drawing & Editing States
 */
export interface DrawingState {
  drawingMode: string | null;
  setDrawingMode: Dispatch<SetStateAction<string | null>>;

  isDrawingEnabled: boolean;
  setIsDrawingEnabled: Dispatch<SetStateAction<boolean>>;

  isEditingShape: boolean;
  setIsEditingShape: Dispatch<SetStateAction<boolean>>;

  editingShape: any;
  setEditingShape: Dispatch<SetStateAction<any>>;

  originalShapeData: any;
  setOriginalShapeData: Dispatch<SetStateAction<any>>;

  draggedShape: any;
  setDraggedShape: Dispatch<SetStateAction<any>>;

  originalShapePosition: any;
  setOriginalShapePosition: Dispatch<SetStateAction<any>>;

  showDragConfirmation: boolean;
  setShowDragConfirmation: Dispatch<SetStateAction<boolean>>;

  pendingDragShape: any;
  setPendingDragShape: Dispatch<SetStateAction<any>>;

  activeShape: any;
  setActiveShape: Dispatch<SetStateAction<any>>;

  pendingNewShape: any;
  setPendingNewShape: Dispatch<SetStateAction<any>>;
}

/**
 * Interface untuk Edit States (Building/Room)
 */
export interface EditState {
  isEditingName: boolean;
  setIsEditingName: Dispatch<SetStateAction<boolean>>;

  isEditingThumbnail: boolean;
  setIsEditingThumbnail: Dispatch<SetStateAction<boolean>>;

  isEditingLantai: boolean;
  setIsEditingLantai: Dispatch<SetStateAction<boolean>>;

  isEditingInteraksi: boolean;
  setIsEditingInteraksi: Dispatch<SetStateAction<boolean>>;

  editName: string;
  setEditName: Dispatch<SetStateAction<string>>;

  editThumbnail: string;
  setEditThumbnail: Dispatch<SetStateAction<string>>;

  editInteraksi: string;
  setEditInteraksi: Dispatch<SetStateAction<string>>;

  selectedFile: File | null;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;

  filePreviewUrl: string | null;
  setFilePreviewUrl: Dispatch<SetStateAction<string | null>>;
}

/**
 * Interface untuk Lantai (Floor) States
 */
export interface LantaiState {
  lantaiFiles: { [key: number]: File | null };
  setLantaiFiles: Dispatch<SetStateAction<{ [key: number]: File | null }>>;

  lantaiPreviewUrls: { [key: number]: string | null };
  setLantaiPreviewUrls: Dispatch<
    SetStateAction<{ [key: number]: string | null }>
  >;

  lantaiGambarData: any[];
  setLantaiGambarData: Dispatch<SetStateAction<any[]>>;

  selectedLantaiFilter: number;
  setSelectedLantaiFilter: Dispatch<SetStateAction<number>>;

  savedLantaiFiles: { [key: number]: boolean };
  setSavedLantaiFiles: Dispatch<SetStateAction<{ [key: number]: boolean }>>;

  tambahLantaiFile: File | null;
  setTambahLantaiFile: Dispatch<SetStateAction<File | null>>;

  tambahLantaiPreviewUrl: string | null;
  setTambahLantaiPreviewUrl: Dispatch<SetStateAction<string | null>>;

  selectedLantaiForRuangan: number | null;
  setSelectedLantaiForRuangan: Dispatch<SetStateAction<number | null>>;

  selectedLantaiForEdit: number | null;
  setSelectedLantaiForEdit: Dispatch<SetStateAction<number | null>>;
}

/**
 * Interface untuk Ruangan (Room) States
 */
export interface RuanganState {
  selectedRuanganForEdit: any;
  setSelectedRuanganForEdit: Dispatch<SetStateAction<any>>;

  ruanganList: any[];
  setRuanganList: Dispatch<SetStateAction<any[]>>;

  ruanganForm: {
    nama_ruangan: string;
    nomor_lantai: number;
    nama_jurusan: string;
    nama_prodi: string;
    pin_style: string;
    posisi_x: number | null;
    posisi_y: number | null;
  };
  setRuanganForm: Dispatch<
    SetStateAction<{
      nama_ruangan: string;
      nomor_lantai: number;
      nama_jurusan: string;
      nama_prodi: string;
      pin_style: string;
      posisi_x: number | null;
      posisi_y: number | null;
    }>
  >;
}

/**
 * Interface untuk Layer Visibility States
 */
export interface LayerVisibilityState {
  bangunanLayerVisible: boolean;
  setBangunanLayerVisible: Dispatch<SetStateAction<boolean>>;
}

/**
 * Interface untuk Highlight & Search States
 */
export interface HighlightState {
  isHighlightActive: boolean;
  setIsHighlightActive: Dispatch<SetStateAction<boolean>>;

  searchHighlightedId: number | null;
  setSearchHighlightedId: Dispatch<SetStateAction<number | null>>;
}

/**
 * Interface gabungan untuk semua states
 */
export interface MapState {
  config: MapConfigState;
  loading: LoadingState;
  ui: UIState;
  animation: AnimationState;
  features: FeatureState;
  drawing: DrawingState;
  edit: EditState;
  lantai: LantaiState;
  ruangan: RuanganState;
  layerVisibility: LayerVisibilityState;
  highlight: HighlightState;
}

/**
 * Custom hook untuk mengelola Map State
 * @param isDark - Dark mode flag
 * @returns MapState object dengan semua states yang terorganisir
 */
export function useMapState(isDark: boolean = false): MapState {
  // ==================== MAP CONFIGURATION ====================
  const [basemap, setBasemap] = useState<string>(
    isDark ? "alidade_smooth_dark" : "esri_topo"
  );
  const [layerVisible, setLayerVisible] = useState(true);
  const [isSatellite, setIsSatellite] = useState(basemap === "esri_satellite");

  // ==================== LOADING STATES ====================
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ==================== UI VISIBILITY STATES ====================
  const [cardVisible, setCardVisible] = useState(false);
  const [showBuildingDetailCanvas, setShowBuildingDetailCanvas] =
    useState(false);
  const [showShapeSwitchModal, setShowShapeSwitchModal] = useState(false);

  // ==================== ANIMATION STATES ====================
  const [isContainerShaking, setIsContainerShaking] = useState(false);
  const [isBuildingDetailFadingOut, setIsBuildingDetailFadingOut] =
    useState(false);
  const [isBuildingDetailFadingIn, setIsBuildingDetailFadingIn] =
    useState(false);
  const [cardAnimation, setCardAnimation] = useState(false);

  // ==================== FEATURE & DATA STATES ====================
  const [selectedFeature, setSelectedFeature] = useState<FeatureType | null>(
    null
  );
  const [bangunanFeatures, setBangunanFeatures] = useState<FeatureType[]>([]);
  const [ruanganFeatures, setRuanganFeatures] = useState<FeatureType[]>([]);
  const [nonBangunanFeatures, setNonBangunanFeatures] = useState<FeatureType[]>(
    []
  );

  // ==================== DRAWING & EDITING STATES ====================
  const [drawingMode, setDrawingMode] = useState<string | null>(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [isEditingShape, setIsEditingShape] = useState(false);
  const [editingShape, setEditingShape] = useState<any>(null);
  const [originalShapeData, setOriginalShapeData] = useState<any>(null);
  const [draggedShape, setDraggedShape] = useState<any>(null);
  const [originalShapePosition, setOriginalShapePosition] = useState<any>(null);
  const [showDragConfirmation, setShowDragConfirmation] = useState(false);
  const [pendingDragShape, setPendingDragShape] = useState<any>(null);
  const [activeShape, setActiveShape] = useState<any>(null);
  const [pendingNewShape, setPendingNewShape] = useState<any>(null);

  // ==================== EDIT STATES ====================
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingThumbnail, setIsEditingThumbnail] = useState(false);
  const [isEditingLantai, setIsEditingLantai] = useState(false);
  const [isEditingInteraksi, setIsEditingInteraksi] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editInteraksi, setEditInteraksi] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // ==================== LANTAI STATES ====================
  const [lantaiFiles, setLantaiFiles] = useState<{
    [key: number]: File | null;
  }>({});
  const [lantaiPreviewUrls, setLantaiPreviewUrls] = useState<{
    [key: number]: string | null;
  }>({});
  const [lantaiGambarData, setLantaiGambarData] = useState<any[]>([]);
  const [selectedLantaiFilter, setSelectedLantaiFilter] = useState(1);
  const [savedLantaiFiles, setSavedLantaiFiles] = useState<{
    [key: number]: boolean;
  }>({});
  const [tambahLantaiFile, setTambahLantaiFile] = useState<File | null>(null);
  const [tambahLantaiPreviewUrl, setTambahLantaiPreviewUrl] = useState<
    string | null
  >(null);
  const [selectedLantaiForRuangan, setSelectedLantaiForRuangan] = useState<
    number | null
  >(null);
  const [selectedLantaiForEdit, setSelectedLantaiForEdit] = useState<
    number | null
  >(null);

  // ==================== RUANGAN STATES ====================
  const [selectedRuanganForEdit, setSelectedRuanganForEdit] =
    useState<any>(null);
  const [ruanganList, setRuanganList] = useState<any[]>([]);
  const [ruanganForm, setRuanganForm] = useState({
    nama_ruangan: "",
    nomor_lantai: 1,
    nama_jurusan: "",
    nama_prodi: "",
    pin_style: "default",
    posisi_x: null as number | null,
    posisi_y: null as number | null,
  });

  // ==================== LAYER VISIBILITY STATES ====================
  // ==================== LAYER VISIBILITY STATES ====================

  const [bangunanLayerVisible, setBangunanLayerVisible] = useState(true);

  // ==================== HIGHLIGHT & SEARCH STATES ====================
  const [isHighlightActive, setIsHighlightActive] = useState(false);
  const [searchHighlightedId, setSearchHighlightedId] = useState<number | null>(
    null
  );

  // ==================== RETURN ORGANIZED STATE ====================
  return {
    config: {
      basemap,
      setBasemap,
      layerVisible,
      setLayerVisible,
      isSatellite,
      setIsSatellite,
    },
    loading: {
      isLoadingData,
      setIsLoadingData,
      isSaving,
      setIsSaving,
    },
    ui: {
      cardVisible,
      setCardVisible,
      showBuildingDetailCanvas,
      setShowBuildingDetailCanvas,
      showShapeSwitchModal,
      setShowShapeSwitchModal,
    },
    animation: {
      isContainerShaking,
      setIsContainerShaking,
      isBuildingDetailFadingOut,
      setIsBuildingDetailFadingOut,
      isBuildingDetailFadingIn,
      setIsBuildingDetailFadingIn,
      cardAnimation,
      setCardAnimation,
    },
    features: {
      selectedFeature,
      setSelectedFeature,
      bangunanFeatures,
      setBangunanFeatures,
      ruanganFeatures,
      setRuanganFeatures,
      nonBangunanFeatures,
      setNonBangunanFeatures,
    },
    drawing: {
      drawingMode,
      setDrawingMode,
      isDrawingEnabled,
      setIsDrawingEnabled,
      isEditingShape,
      setIsEditingShape,
      editingShape,
      setEditingShape,
      originalShapeData,
      setOriginalShapeData,
      draggedShape,
      setDraggedShape,
      originalShapePosition,
      setOriginalShapePosition,
      showDragConfirmation,
      setShowDragConfirmation,
      pendingDragShape,
      setPendingDragShape,
      activeShape,
      setActiveShape,
      pendingNewShape,
      setPendingNewShape,
    },
    edit: {
      isEditingName,
      setIsEditingName,
      isEditingThumbnail,
      setIsEditingThumbnail,
      isEditingLantai,
      setIsEditingLantai,
      isEditingInteraksi,
      setIsEditingInteraksi,
      editName,
      setEditName,
      editThumbnail,
      setEditThumbnail,
      editInteraksi,
      setEditInteraksi,
      selectedFile,
      setSelectedFile,
      filePreviewUrl,
      setFilePreviewUrl,
    },
    lantai: {
      lantaiFiles,
      setLantaiFiles,
      lantaiPreviewUrls,
      setLantaiPreviewUrls,
      lantaiGambarData,
      setLantaiGambarData,
      selectedLantaiFilter,
      setSelectedLantaiFilter,
      savedLantaiFiles,
      setSavedLantaiFiles,
      tambahLantaiFile,
      setTambahLantaiFile,
      tambahLantaiPreviewUrl,
      setTambahLantaiPreviewUrl,
      selectedLantaiForRuangan,
      setSelectedLantaiForRuangan,
      selectedLantaiForEdit,
      setSelectedLantaiForEdit,
    },
    ruangan: {
      selectedRuanganForEdit,
      setSelectedRuanganForEdit,
      ruanganList,
      setRuanganList,
      ruanganForm,
      setRuanganForm,
    },
    layerVisibility: {
      bangunanLayerVisible,
      setBangunanLayerVisible,
    },
    highlight: {
      isHighlightActive,
      setIsHighlightActive,
      searchHighlightedId,
      setSearchHighlightedId,
    },
  };
}
