# Storage Layer Documentation

## Overview

The storage layer provides a unified API for persisting application data across different execution contexts (browser, NZXT CAM).

## Storage Mechanisms

### 1. Media URL Storage (`storage.ts`)

**Location:** `src/utils/storage.ts`

**Purpose:** Store media URL with cross-process compatibility for NZXT CAM.

**Mechanism:**
- **Primary:** localStorage (`media_url`)
- **Fallback:** Cookie (`media_url` with `SameSite=None; Secure`)
- **Sync:** Polling (500ms) + Storage Events

**Why Polling?**
NZXT CAM doesn't always fire storage events for cross-process changes. Polling ensures Config and Display pages stay in sync.

**Why Cookie Fallback?**
NZXT CAM sometimes isolates localStorage between processes. Cookies with `SameSite=None; Secure` work across processes.

### 2. Settings Storage (`useConfig.ts`)

**Location:** `src/hooks/useConfig.ts`

**Purpose:** Store application settings (overlay, background, etc.).

**Mechanism:**
- **Storage:** localStorage (`nzxtPinterestConfig`, `nzxtMediaConfig` for compatibility)
- **Sync:** Storage Events (cross-tab/process)

**Why Two Keys?**
- `nzxtPinterestConfig`: Current primary key
- `nzxtMediaConfig`: Legacy compatibility key (read/written together)

### 3. Language Storage

**Location:** `src/i18n.ts`

**Purpose:** Store user language preference.

**Mechanism:**
- **Storage:** localStorage (`nzxtLang`)
- **Sync:** Storage Events

## Storage Strategy

### Priority Order

1. **localStorage (Primary):** Fast, synchronous, standard Web API
2. **Cookie (Fallback):** Only for media URL (NZXT CAM compatibility)
3. **Default Values:** When storage is empty or inaccessible

### Cross-Process Sync

**Media URL:**
- Polling: 500ms interval (NZXT CAM fallback)
- Storage Events: Instant (browser standard)
- Cookie: Cross-process fallback

**Settings:**
- Storage Events: Standard browser event
- No polling needed (settings don't need cookie fallback)

### Critical Design Decisions

1. **Polling for Media URL:**
   - **Why:** NZXT CAM doesn't reliably fire storage events
   - **Interval:** 500ms (balance between responsiveness and performance)
   - **Trade-off:** Small performance cost for reliable sync

2. **Cookie Fallback:**
   - **Why:** NZXT CAM isolates localStorage between processes
   - **Attributes:** `SameSite=None; Secure` (required for cross-process)
   - **Trade-off:** Larger storage size, but necessary for compatibility

3. **Throttled Settings Save:**
   - **Why:** Real-time sync without performance issues
   - **Interval:** 100ms (in `useSettingsSync.ts`)
   - **Trade-off:** Small delay for better performance

## Extension Points

### Adding a New Storage Key

1. Add key to `storage/schema.ts` - `STORAGE_KEYS`
2. Add property to `StorageSchema` interface
3. Update storage getter/setter in `storage/index.ts` (future unified API)

### Migrating Storage Schema

1. Increment `STORAGE_SCHEMA_VERSION` in `schema.ts`
2. Add migration logic in `storage/index.ts`
3. Update `StorageSchema` interface if breaking changes

## AI Contributors Notes

### When to Use Each Storage Mechanism

- **Media URL:** Use `storage.ts` functions (`getMediaUrl`, `setMediaUrl`, `subscribe`)
- **Settings:** Use `useConfig` hook (handles localStorage + sync automatically)
- **Language:** Use `i18n.ts` functions (`getLang`, `setLang`)

### Critical Formulas

- **Polling Interval (Media URL):** 500ms - DO NOT CHANGE without testing NZXT CAM sync
- **Throttled Save (Settings):** 100ms - DO NOT CHANGE without performance testing
- **Cookie Attributes:** `SameSite=None; Secure` - REQUIRED for NZXT CAM cross-process

### Testing Storage

1. **Browser:** Test with multiple tabs (storage events should sync)
2. **NZXT CAM:** Test Config → Display sync (polling should work)
3. **Cookie Fallback:** Clear localStorage, verify cookie is used

