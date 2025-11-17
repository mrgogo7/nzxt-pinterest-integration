# Comprehensive Refactoring Analysis & Plan

**Project:** NZXT Elite Screen Customizer (NZXT-ESC)  
**Goal:** Transform into a fully AI-friendly, future-proof, cleanly architected codebase  
**Date:** 2025-01-27  
**Status:** In Progress

---

## Executive Summary

This document provides a comprehensive analysis of the NZXT-ESC codebase and outlines a strategic refactoring plan designed specifically for **AI-driven development**. The goal is to create an architecture that is:

1. **Easy for AI models to understand** - Clear structure, explicit patterns, comprehensive documentation
2. **Resistant to AI mistakes** - Strong typing, discriminated unions, single source of truth
3. **Extensible** - Clear extension points, documented patterns, minimal duplication
4. **Maintainable** - Modular architecture, clear boundaries, consistent patterns

---

## Current Architecture Analysis

### 1. Project Structure

```
src/
├── constants/          # Default values and constants
│   ├── defaults.ts     # AppSettings defaults, overlay defaults
│   ├── nzxt.ts         # NZXT API constants
│   └── storage.ts      # Storage keys
├── hooks/              # React custom hooks
│   ├── useConfig.ts    # Configuration management
│   ├── useMediaUrl.ts  # Media URL management
│   ├── useMonitoring.ts # Real/mock monitoring data
│   ├── useStorageSync.ts # Cross-process sync
│   ├── useOverlayConfig.ts # Overlay config computation
│   ├── useSettingsSync.ts # Throttled settings sync
│   ├── useDragHandlers.ts # Drag interaction logic
│   ├── usePreviewScaling.ts # Preview/LCD scaling
│   └── useMediaUrl.ts  # Media URL state
├── types/              # TypeScript type definitions
│   ├── overlay.ts      # Overlay domain types
│   ├── nzxt.d.ts       # NZXT API types
│   └── css-modules.d.ts # CSS modules types
├── utils/              # Utility functions
│   ├── storage.ts      # localStorage + cookie fallback
│   ├── monitoring.ts   # Data mapping utilities
│   ├── positioning.ts  # Position calculations
│   ├── settings.ts     # Settings merge/validation
│   ├── media.ts        # Media type detection
│   ├── overlaySettingsHelpers.ts # Overlay update helpers
│   └── pinterest.ts    # Pinterest URL resolution
├── ui/                 # UI components
│   ├── components/     # Reusable components
│   │   ├── ConfigPreview/ # ConfigPreview subcomponents
│   │   ├── SingleInfographic.tsx
│   │   ├── DualInfographic.tsx
│   │   ├── TripleInfographic.tsx
│   │   ├── KrakenOverlay.tsx
│   │   ├── MediaRenderer.tsx
│   │   └── AnimateNumber.tsx
│   ├── Config.tsx      # Main config page component
│   └── styles/         # CSS modules and styles
└── main.tsx / config.tsx # Entry points
```

### 2. Current Domain Model

#### Overlay Modes
- **Type:** `"none" | "single" | "dual" | "triple" | "custom"`
- **Issue:** No discriminated union, mode-specific fields are optional
- **Problem:** Easy to make mistakes when accessing mode-specific properties

#### Overlay Settings
- **Location:** `src/types/overlay.ts` - `OverlaySettings` interface
- **Issues:**
  - Flat structure with many optional fields
  - Mode-specific fields mixed together (e.g., `secondaryOffsetX` exists for dual/triple)
  - Defaults scattered across codebase (mode switching logic in OverlaySettings.tsx)
  - No clear separation between mode-agnostic and mode-specific settings

#### Metrics
- **Type:** `OverlayMetricKey = "cpuTemp" | "cpuLoad" | ...`
- **Issues:**
  - Label/unit logic in `getOverlayLabelAndValue()` function
  - No centralized metric metadata (labels, units, formatting)
  - Type-safe but not easily extensible

### 3. Storage Architecture

#### Current Storage Keys
- `media_url` - Media URL (via `storage.ts` with cookie fallback)
- `nzxtPinterestConfig` - App settings (primary)
- `nzxtMediaConfig` - App settings (compat)
- `nzxtLang` - Language preference

#### Issues:
1. **Multiple storage mechanisms:**
   - `storage.ts` - Media URL with cookie fallback + polling
   - `useConfig.ts` - Settings via localStorage with storage events
   - No unified storage abstraction
   - Cookie fallback only for media URL, not settings

2. **No schema versioning:**
   - Breaking changes would lose user data (acceptable per requirements)
   - But no clear migration path if needed in future

3. **Storage sync complexity:**
   - Multiple sync mechanisms (storage events, polling)
   - Throttled saves (100ms) for settings but not media URL
   - Different patterns for different storage keys

### 4. Environment Detection

#### Current Implementation:
- **Location:** `src/main.tsx` - URL parameter check `?kraken=1`
- **NZXT API:** `window.nzxt?.v1?.onMonitoringDataUpdate`
- **Issues:**
  - Environment detection duplicated across components
  - Mock vs real data logic scattered
  - No centralized environment abstraction

### 5. UI Architecture

#### Config Page (`Config.tsx`)
- **Purpose:** User configuration and preview
- **Issues:**
  - Mixed concerns (URL input, color picker, preview, settings)
  - Large component tree with prop drilling
  - Settings sync logic intertwined with UI

#### Display Page (`KrakenOverlay.tsx`)
- **Purpose:** LCD rendering in NZXT CAM
- **Issues:**
  - Reads from same storage as Config (good)
  - But uses different hooks/components (acceptable)
  - Custom mode rendering logic duplicated

### 6. Code Smells & AI-Unfriendly Patterns

#### 1. **Scattered Defaults**
- **Location 1:** `src/types/overlay.ts` - `DEFAULT_OVERLAY`
- **Location 2:** `src/ui/components/ConfigPreview/OverlaySettings.tsx` - Mode switching defaults
- **Location 3:** `src/constants/defaults.ts` - `DEFAULT_SETTINGS`
- **Problem:** AI models must search multiple files to find defaults

#### 2. **Mode Switching Logic in UI**
- **Location:** `OverlaySettings.tsx` lines 45-82
- **Problem:** Business logic mixed with presentation
- **Impact:** Hard for AI to understand mode transitions

#### 3. **Duplicated Position Logic**
- **Location 1:** `ConfigPreview.tsx` - Preview offset calculations
- **Location 2:** `KrakenOverlay.tsx` - LCD offset calculations
- **Problem:** Similar logic in two places, easy to diverge

#### 4. **Weak Type Safety for Mode-Specific Fields**
- **Example:** `overlay.secondaryOffsetX` exists but is only valid for dual mode
- **Problem:** No compile-time guarantee that field is used correctly
- **Solution:** Discriminated unions

#### 5. **Inconsistent Storage Patterns**
- **Example:** Media URL uses polling + cookie, settings use storage events
- **Problem:** Different patterns confuse AI models

#### 6. **Missing Architectural Documentation**
- **Problem:** No clear explanation of:
  - Why storage.ts uses polling (NZXT CAM cross-process issues)
  - Why offsetScale formula is critical (200/640 = 0.3125)
  - How mode switching works
  - Where to add new metrics/overlay modes

---

## Refactoring Goals

### 1. Clear Domain Model
- ✅ Discriminated unions for overlay modes
- ✅ Single source of truth for defaults
- ✅ Centralized metric definitions
- ✅ Explicit mode transition rules

### 2. Unified Storage Layer
- ✅ Single storage module
- ✅ Consistent API for all storage operations
- ✅ Schema versioning (for future-proofing)
- ✅ Clear documentation of storage strategy

### 3. Centralized Environment Abstraction
- ✅ Single function to detect NZXT CAM
- ✅ Single function to create metrics provider
- ✅ No duplicated environment checks

### 4. Clean UI Architecture
- ✅ Config page: Pure user input + preview
- ✅ Display page: Pure LCD rendering
- ✅ Both depend on shared domain + storage modules
- ✅ Clear separation of concerns

### 5. AI-Friendly Structure
- ✅ Clear file organization
- ✅ Comprehensive English comments
- ✅ Extension points documented
- ✅ Consistent patterns throughout

---

## Proposed Architecture

### Phase 1: Domain Model Refactoring

#### 1.1 Discriminated Union for Overlay Modes

```typescript
// types/overlay.ts

export type OverlayMode = "none" | "single" | "dual" | "triple" | "custom";

// Base overlay settings (mode-agnostic)
interface BaseOverlaySettings {
  mode: OverlayMode;
  primaryMetric: OverlayMetricKey;
}

// Mode-specific settings using discriminated unions
export type OverlaySettings =
  | (BaseOverlaySettings & { mode: "none" })
  | (BaseOverlaySettings & SingleModeOverlay)
  | (BaseOverlaySettings & DualModeOverlay)
  | (BaseOverlaySettings & TripleModeOverlay)
  | (BaseOverlaySettings & CustomModeOverlay);

// Each mode has its own interface
interface SingleModeOverlay {
  mode: "single";
  numberColor: string;
  textColor: string;
  numberSize: number;
  textSize: number;
  x: number;
  y: number;
}

interface DualModeOverlay {
  mode: "dual";
  primaryMetric: OverlayMetricKey;
  secondaryMetric: OverlayMetricKey;
  primaryNumberColor: string;
  primaryTextColor: string;
  secondaryNumberColor: string;
  secondaryTextColor: string;
  primaryNumberSize: number;
  primaryTextSize: number;
  secondaryNumberSize: number;
  secondaryTextSize: number;
  showDivider: boolean;
  dividerWidth: number;
  dividerThickness: number;
  dividerColor: string;
  dividerGap: number;
  x: number;
  y: number;
  secondaryOffsetX: number;
  secondaryOffsetY: number;
}

// Similar for TripleModeOverlay and CustomModeOverlay...
```

**Benefits:**
- Compile-time type safety for mode-specific fields
- Clear documentation of what fields are valid for each mode
- AI models can understand mode structure from types alone

#### 1.2 Centralized Metric Definitions

```typescript
// domain/metrics.ts

export const METRIC_DEFINITIONS = {
  cpuTemp: {
    label: "CPU",
    unit: "°",
    unitType: "temp" as const,
    format: (value: number) => Math.round(value).toString(),
  },
  cpuLoad: {
    label: "CPU",
    unit: "%",
    unitType: "percent" as const,
    format: (value: number) => Math.round(value).toString(),
  },
  // ... all metrics
} as const;

// Type-safe metric key
export type MetricKey = keyof typeof METRIC_DEFINITIONS;

// Helper function
export function getMetricInfo(key: MetricKey, value: number) {
  const def = METRIC_DEFINITIONS[key];
  return {
    label: def.label,
    valueNumber: def.format(value),
    valueUnit: def.unit,
    valueUnitType: def.unitType,
  };
}
```

**Benefits:**
- Single source of truth for metric metadata
- Easy to add new metrics (just add to METRIC_DEFINITIONS)
- Type-safe and extensible

#### 1.3 Mode Transition Defaults

```typescript
// domain/overlayModes.ts

export const MODE_TRANSITIONS = {
  none: () => ({}),
  single: (current: Partial<OverlaySettings>) => ({
    numberColor: current.numberColor || DEFAULT_OVERLAY.numberColor,
    textColor: current.textColor || DEFAULT_OVERLAY.textColor,
    numberSize: 180,
    textSize: 45,
    x: 0,
    y: 0,
  }),
  dual: (current: Partial<OverlaySettings>) => ({
    // ... dual mode defaults
  }),
  triple: (current: Partial<OverlaySettings>) => ({
    // ... triple mode defaults
  }),
  custom: (current: Partial<OverlaySettings>) => ({
    customReadings: [],
    customTexts: [],
  }),
} as const;

// Helper function
export function getModeTransitionDefaults(
  fromMode: OverlayMode,
  toMode: OverlayMode,
  current: Partial<OverlaySettings>
): Partial<OverlaySettings> {
  return MODE_TRANSITIONS[toMode](current);
}
```

**Benefits:**
- All mode transition logic in one place
- Clear documentation of defaults for each mode
- Easy to modify mode switching behavior

### Phase 2: Storage Layer Unification

#### 2.1 Unified Storage Module

```typescript
// storage/index.ts

export interface StorageSchema {
  version: number;
  mediaUrl: string;
  settings: AppSettings;
  language: Lang;
}

// Single storage API
export const storage = {
  get: (): StorageSchema => { /* ... */ },
  set: (schema: Partial<StorageSchema>): void => { /* ... */ },
  subscribe: (callback: (schema: StorageSchema) => void): Unsubscribe => { /* ... */ },
  // Migration support (for future)
  migrate: (fromVersion: number, toVersion: number): void => { /* ... */ },
};
```

**Benefits:**
- Single API for all storage operations
- Consistent behavior across all storage keys
- Easy to add schema versioning in future
- Clear documentation of storage strategy

### Phase 3: Environment Abstraction

#### 3.1 Environment Detection

```typescript
// environment/index.ts

export interface Environment {
  type: "nzxt-cam" | "browser";
  hasMonitoring: boolean;
  lcdWidth: number;
  lcdHeight: number;
}

export function detectEnvironment(): Environment {
  const searchParams = new URLSearchParams(window.location.search);
  const isNZXT = searchParams.get("kraken") === "1";
  const hasAPI = !!window.nzxt?.v1?.onMonitoringDataUpdate;
  
  return {
    type: isNZXT ? "nzxt-cam" : "browser",
    hasMonitoring: hasAPI,
    lcdWidth: window.nzxt?.v1?.width || NZXT_DEFAULTS.LCD_WIDTH,
    lcdHeight: window.nzxt?.v1?.height || NZXT_DEFAULTS.LCD_HEIGHT,
  };
}

export function createMetricsProvider(env: Environment): MetricsProvider {
  if (env.hasMonitoring) {
    return new RealMetricsProvider();
  } else {
    return new MockMetricsProvider();
  }
}
```

**Benefits:**
- Single function to detect environment
- No duplicated environment checks
- Easy to test different environments
- Clear abstraction for monitoring

### Phase 4: File Structure Reorganization

```
src/
├── domain/              # Domain logic (pure TypeScript)
│   ├── overlay.ts       # Overlay domain types and logic
│   ├── metrics.ts       # Metric definitions and helpers
│   ├── media.ts         # Media domain types
│   └── modes.ts         # Mode transition logic
├── storage/             # Storage layer
│   ├── index.ts         # Unified storage API
│   ├── schema.ts        # Storage schema definition
│   ├── localStorage.ts  # localStorage implementation
│   ├── cookie.ts        # Cookie fallback
│   └── sync.ts          # Cross-process sync
├── environment/         # Environment detection
│   ├── index.ts         # Environment detection
│   ├── nzxt.ts          # NZXT CAM integration
│   └── monitoring.ts    # Metrics provider factory
├── hooks/               # React hooks (UI layer)
│   ├── useConfig.ts
│   ├── useMediaUrl.ts
│   └── ...
├── ui/                  # UI components
│   ├── Config.tsx       # Config page
│   ├── Display.tsx      # Display page (KrakenOverlay)
│   └── components/      # Reusable components
└── utils/               # Pure utility functions
    ├── positioning.ts
    └── ...
```

**Benefits:**
- Clear domain boundaries
- Easy to understand project structure
- Natural extension points
- AI models can navigate by domain

---

## Refactoring Phases

### Phase 1: Domain Model (High Priority)
1. Create discriminated unions for overlay modes
2. Centralize metric definitions
3. Extract mode transition defaults
4. Update type definitions

**Estimated Impact:** High - Improves type safety and AI understanding

### Phase 2: Storage Unification (High Priority)
1. Create unified storage module
2. Migrate all storage operations to new API
3. Update hooks to use new storage
4. Document storage strategy

**Estimated Impact:** High - Simplifies storage logic, reduces duplication

### Phase 3: Environment Abstraction (Medium Priority)
1. Create environment detection module
2. Create metrics provider factory
3. Update components to use new abstraction
4. Remove duplicated environment checks

**Estimated Impact:** Medium - Reduces duplication, improves testability

### Phase 4: File Reorganization (Medium Priority)
1. Create domain/ directory
2. Move domain logic from utils/ to domain/
3. Create storage/ directory
4. Create environment/ directory
5. Update imports

**Estimated Impact:** Medium - Improves organization, AI navigation

### Phase 5: Documentation (Low Priority)
1. Add comprehensive English comments
2. Document extension points
3. Create architecture decision records
4. Update README with new structure

**Estimated Impact:** Low - Improves AI understanding, maintainability

---

## Success Criteria

1. ✅ **Type Safety:** Discriminated unions for overlay modes
2. ✅ **Single Source of Truth:** All defaults in one place
3. ✅ **Unified Storage:** Single storage API for all operations
4. ✅ **Clear Boundaries:** Domain/storage/environment/UI layers separated
5. ✅ **AI-Friendly:** Clear structure, comprehensive comments, documented patterns
6. ✅ **Backward Compatible:** Existing functionality preserved
7. ✅ **Extensible:** Easy to add new metrics, modes, storage keys

---

## Risk Assessment

### High Risk
- **Storage migration:** Breaking changes could lose user data (acceptable per requirements)
- **Type changes:** Discriminated unions may require significant refactoring

### Medium Risk
- **File reorganization:** Many import updates required
- **Mode transition logic:** Complex business logic, must preserve behavior

### Low Risk
- **Environment abstraction:** Mostly moving code, low risk
- **Documentation:** Pure addition, no code changes

---

## Next Steps

1. ✅ Create this analysis document
2. ⏭️ Begin Phase 1: Domain Model Refactoring
3. ⏭️ Commit after each major change
4. ⏭️ Test after each phase
5. ⏭️ Document architectural decisions

---

## Notes for AI Contributors

### Extension Points

1. **Adding a new metric:**
   - Add to `domain/metrics.ts` - `METRIC_DEFINITIONS`
   - Add to `types/overlay.ts` - `OverlayMetricKey` union
   - TypeScript will ensure type safety throughout

2. **Adding a new overlay mode:**
   - Add to `domain/overlayModes.ts` - `MODE_TRANSITIONS`
   - Create new discriminated union variant in `types/overlay.ts`
   - Add rendering component in `ui/components/`
   - Update mode switching UI in `ui/Config.tsx`

3. **Adding a new storage key:**
   - Add to `storage/schema.ts` - `StorageSchema` interface
   - Storage module handles sync automatically

4. **Environment-specific behavior:**
   - Check `environment/index.ts` - `detectEnvironment()`
   - Use environment type to conditionally render/behave

### Critical Formulas

1. **Offset Scale:** `previewSize / lcdResolution` (e.g., 200 / 640 = 0.3125)
   - **Why:** Converts between preview and LCD pixel coordinates
   - **Location:** `utils/positioning.ts` - `calculateOffsetScale()`
   - **Must preserve:** Any change breaks drag positioning

2. **Throttled Save:** 100ms interval
   - **Why:** Real-time sync without performance issues
   - **Location:** `hooks/useSettingsSync.ts`
   - **Must preserve:** Slower = laggy UI, faster = performance issues

3. **Storage Polling:** 500ms interval (for media URL)
   - **Why:** NZXT CAM doesn't always fire storage events
   - **Location:** `storage/index.ts` - polling fallback
   - **Must preserve:** Without polling, cross-process sync fails

---

**End of Analysis Document**

