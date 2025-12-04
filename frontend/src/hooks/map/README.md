# Map Hooks

Custom React hooks untuk mengelola LeafletMap component.

## 📁 Structure

```
hooks/map/
├── README.md              # This file
├── useMapState.ts         # Map state management (UI, data, features)
├── useMapInitialization.ts # Map initialization logic (coming soon)
├── useMapDrawing.ts       # Drawing & shape editing (coming soon)
├── useMapRouting.ts       # Routing & navigation (coming soon)
└── useMapLayers.ts        # GeoJSON layers management (coming soon)
```

## 🎯 Purpose

Memecah LeafletMap.tsx (10,532 lines) menjadi modular hooks yang:
- ✅ Mudah di-maintain
- ✅ Mudah di-test
- ✅ Reusable
- ✅ Clear separation of concerns

## 📝 Hooks Overview

### useMapState
**Status**: ✅ Active
**Purpose**: Centralized state management for map component
**Exports**:
- Map configuration states (basemap, layers, visibility)
- UI states (modals, animations, loading)
- Data states (features, buildings, rooms)
- Drawing/editing states
- Route/navigation states

### useMapInitialization
**Status**: 🚧 Coming Soon
**Purpose**: Handle map creation and initialization

### useMapDrawing
**Status**: 🚧 Coming Soon
**Purpose**: Geoman.js integration and shape management

### useMapRouting
**Status**: 🚧 Coming Soon
**Purpose**: Route calculation and navigation

### useMapLayers
**Status**: 🚧 Coming Soon
**Purpose**: GeoJSON layers management

---

**Last Updated**: 2025-12-04
**Phase**: 1.1 - Extract Map State
