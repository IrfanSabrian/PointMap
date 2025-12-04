#!/usr/bin/env node
/**
 * Migration script untuk update semua state/ref references di LeafletMap.tsx
 * 
 * Pattern Replacing:
 * - oldState -> mapState.category.oldState  
 * - setOldState -> mapState.category.setOldState
 * - oldRef -> mapRefs.oldRef
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LeafletMap.tsx');

// State mappings (old name -> { category, newName })
const stateMappings = {
  // Config
  'basemap': { category: 'config', setter: 'setBasemap' },
  'layerVisible': { category: 'config', setter: 'setLayerVisible' },
  'isSatellite': { category: 'config', setter: 'setIsSatellite' },
  
  // Loading
  'isLoadingData': { category: 'loading', setter: 'setIsLoadingData' },
  'isCalculatingRoute': { category: 'loading', setter: 'setIsCalculatingRoute' },
  'isSaving': { category: 'loading', setter: 'setIsSaving' },
  
  // UI
  'cardVisible': { category: 'ui', setter: 'setCardVisible' },
  'showBuildingDetailCanvas': { category: 'ui', setter: 'setShowBuildingDetailCanvas' },
  'showRouteModal': { category: 'ui', setter: 'setShowRouteModal' },
  'showRuanganModal': { category: 'ui', setter: 'setShowRuanganModal' },
  'showPinPositionModal': { category: 'ui', setter: 'setShowPinPositionModal' },
  'showTambahLantaiModal': { category: 'ui', setter: 'setShowTambahLantaiModal' },
  'showEditLantaiModal': { category: 'ui', setter: 'setShowEditLantaiModal' },
  'showShapeSwitchModal': { category: 'ui', setter: 'setShowShapeSwitchModal' },
  
  // Animation
  'isContainerShaking': { category: 'animation', setter: 'setIsContainerShaking' },
  'isBuildingDetailFadingOut': { category: 'animation', setter: 'setIsBuildingDetailFadingOut' },
  'isBuildingDetailFadingIn': { category: 'animation', setter: 'setIsBuildingDetailFadingIn' },
  'cardAnimation': { category: 'animation', setter: 'setCardAnimation' },
  
  // Features
  'selectedFeature': { category: 'features', setter: 'setSelectedFeature' },
  'bangunanFeatures': { category: 'features', setter: 'setBangunanFeatures' },
  'ruanganFeatures': { category: 'features', setter: 'setRuanganFeatures' },
  'nonBangunanFeatures': { category: 'features', setter: 'setNonBangunanFeatures' },
  'titikFeatures': { category: 'features', setter: 'setTitikFeatures' },
  'jalurFeatures': { category: 'features', setter: 'setJalurFeatures' },
  
  // Routing
  'routeEndType': { category: 'routing', setter: 'setRouteEndType' },
  'routeEndId': { category: 'routing', setter: 'setRouteEndId' },
  'routeStartType': { category: 'routing', setter: 'setRouteStartType' },
  'routeStartId': { category: 'routing', setter: 'setRouteStartId' },
  'routeEndSearchText': { category: 'routing', setter: 'setRouteEndSearchText' },
  'routeEndSearchResults': { category: 'routing', setter: 'setRouteEndSearchResults' },
  'isNavigationActive': { category: 'routing', setter: 'setIsNavigationActive' },
  'isStartDropdownOpen': { category: 'routing', setter: 'setIsStartDropdownOpen' },
  
  // Drawing
  'drawingMode': { category: 'drawing', setter: 'setDrawingMode' },
  'isDrawingEnabled': { category: 'drawing', setter: 'setIsDrawingEnabled' },
  'isEditingShape': { category: 'drawing', setter: 'setIsEditingShape' },
  'editingShape': { category: 'drawing', setter: 'setEditingShape' },
  'originalShapeData': { category: 'drawing', setter: 'setOriginalShapeData' },
  'draggedShape': { category: 'drawing', setter: 'setDraggedShape' },
  'originalShapePosition': { category: 'drawing', setter: 'setOriginalShapePosition' },
  'showDragConfirmation': { category: 'drawing', setter: 'setShowDragConfirmation' },
  'pendingDragShape': { category: 'drawing', setter: 'setPendingDragShape' },
  'activeShape': { category: 'drawing', setter: 'setActiveShape' },
  'pendingNewShape': { category: 'drawing', setter: 'setPendingNewShape' },
  
  // Edit
  'isEditingName': { category: 'edit', setter: 'setIsEditingName' },
  'isEditingThumbnail': { category: 'edit', setter: 'setIsEditingThumbnail' },
  'isEditingLantai': { category: 'edit', setter: 'setIsEditingLantai' },
  'isEditingInteraksi': { category: 'edit', setter: 'setIsEditingInteraksi' },
  'editName': { category: 'edit', setter: 'setEditName' },
  'editThumbnail': { category: 'edit', setter: 'setEditThumbnail' },
  'editInteraksi': { category: 'edit', setter: 'setEditInteraksi' },
  'selectedFile': { category: 'edit', setter: 'setSelectedFile' },
  'filePreviewUrl': { category: 'edit', setter: 'setFilePreviewUrl' },
  
  // Lantai
  'lantaiFiles': { category: 'lantai', setter: 'setLantaiFiles' },
  'lantaiPreviewUrls': { category: 'lantai', setter: 'setLantaiPreviewUrls' },
  'lantaiGambarData': { category: 'lantai', setter: 'setLantaiGambarData' },
  'selectedLantaiFilter': { category: 'lantai', setter: 'setSelectedLantaiFilter' },
  'savedLantaiFiles': { category: 'lantai', setter: 'setSavedLantaiFiles' },
  'tambahLantaiFile': { category: 'lantai', setter: 'setTambahLantaiFile' },
  'tambahLantaiPreviewUrl': { category: 'lantai', setter: 'setTambahLantaiPreviewUrl' },
  'selectedLantaiForRuangan': { category: 'lantai', setter: 'setSelectedLantaiForRuangan' },
  'selectedLantaiForEdit': { category: 'lantai', setter: 'setSelectedLantaiForEdit' },
  
  // Ruangan
  'selectedRuanganForEdit': { category: 'ruangan', setter: 'setSelectedRuanganForEdit' },
  'ruanganList': { category: 'ruangan', setter: 'setRuanganList' },
  'ruanganForm': { category: 'ruangan', setter: 'setRuanganForm' },
  
  // Layer Visibility
  'jalurLayerVisible': { category: 'layerVisibility', setter: 'setJalurLayerVisible' },
  'titikLayerVisible': { category: 'layerVisibility', setter: 'setTitikLayerVisible' },
  'bangunanLayerVisible': { category: 'layerVisibility', setter: 'setBangunanLayerVisible' },
  
  // Highlight
  'isHighlightActive': { category: 'highlight', setter: 'setIsHighlightActive' },
  'searchHighlightedId': { category: 'highlight', setter: 'setSearchHighlightedId' },
};

// Ref mappings (old name -> new name, all under mapRefs)
const refMappings = {
  'mapRef': 'mapRefs.mapRef',
  'leafletMapRef': 'mapRefs.leafletMapRef',
  'basemapLayerRef': 'mapRefs.basemapLayerRef',
  'nonBangunanLayerRef': 'mapRefs.nonBangunanLayerRef',
  'bangunanLayerRef': 'mapRefs.bangunanLayerRef',
  'jalurLayerRef': 'mapRefs.jalurLayerRef',
  'titikLayerRef': 'mapRefs.titikLayerRef',
  'userMarkerRef': 'mapRefs.userMarkerRef',
  'routeLineRef': 'mapRefs.routeLineRef',
  'navigationMarkerRef': 'mapRefs.navigationMarkerRef',
  'isHighlightActiveRef': 'mapRefs.isHighlightActiveRef',
  'isNavigationActiveRef': 'mapRefs.isNavigationActiveRef',
  'isGpsRecalcRef': 'mapRefs.isGpsRecalcRef',
  'isZoomingRef': 'mapRefs.isZoomingRef',
  'isBuildingClickedRef': 'mapRefs.isBuildingClickedRef',
  'isDrawingEnabledRef': 'mapRefs.isDrawingEnabledRef',
  'drawingModeRef': 'mapRefs.drawingModeRef',
};

function migrateFile() {
  console.log('🚀 Starting migration...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  let replacements = 0;
  
  // Replace setters first (to avoid conflicts)
  Object.entries(stateMappings).forEach(([stateName, info]) => {
    const setterRegex = new RegExp(`\\b${info.setter}\\b`, 'g');
    const before = content.length;
    content = content.replace(setterRegex, `${info.category}.${info.setter}`);
    const after = content.length;
    if (before !== after) {
      const count = (content.match(new RegExp(`${info.category}\\.${info.setter}`, 'g')) || []).length;
      console.log(`  ✓ Replaced ${info.setter} → ${info.category}.${info.setter} (${count} occurrences)`);
      replacements += count;
    }
  });
  
  // Replace state getters
  Object.entries(stateMappings).forEach(([stateName, info]) => {
    const stateRegex = new RegExp(`\\b${stateName}\\b`, 'g');
    const before = content.length;
    content = content.replace(stateRegex, `${info.category}.${stateName}`);
    const after = content.length;
    if (before !== after) {
      const count = (content.match(new RegExp(`${info.category}\\.${stateName}`, 'g')) || []).length;
      console.log(`  ✓ Replaced ${stateName} → ${info.category}.${stateName} (${count} occurrences)`);
      replacements += count;
    }
  });
  
  // Replace refs
  Object.entries(refMappings).forEach(([oldRef, newRef]) => {
    const refRegex = new RegExp(`\\b${oldRef}\\b`, 'g');
    const before = content.length;
    content = content.replace(refRegex, newRef);
    const after = content.length;
    if (before !== after) {
      const count = (content.match(new RegExp(newRef.replace(/\./g, '\\.'), 'g')) || []).length;
      console.log(`  ✓ Replaced ${oldRef} → ${newRef} (${count} occurrences)`);
      replacements += count;
    }
  });
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`\n✅ Migration complete! ${replacements} total replacements made.`);
  console.log(`📝 File updated: ${filePath}`);
}

migrateFile();
