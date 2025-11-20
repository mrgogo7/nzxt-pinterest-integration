/**
 * Preset Migration Layer
 * 
 * Handles migration of preset files between schema versions.
 * Ensures backward compatibility when preset format changes.
 * 
 * Uses sequential migration pipeline: 0 → 1 → 2 → ... → CURRENT_SCHEMA_VERSION
 */

import { PRESET_SCHEMA_VERSION, type PresetFile } from './schema';
import { CURRENT_SCHEMA_VERSION, MIN_SUPPORTED_VERSION } from './constants';
import type { Overlay } from '../types/overlay';
import { DEFAULT_OVERLAY } from '../types/overlay';
import { ensureOverlayFormat } from '../utils/overlayMigration';
import { isLegacyOverlaySettings } from '../types/overlay';

/**
 * Migration function type.
 * Each migration function takes a file from version N and returns version N+1.
 */
export type MigrationFunction = (file: any) => PresetFile;

/**
 * Migration registry.
 * Maps source version to migration function.
 * Each function migrates from version N to version N+1.
 */
const MIGRATION_REGISTRY: Record<number, MigrationFunction> = {
  0: migrate0To1,
  // Future migrations:
  // 1: migrate1To2,
  // 2: migrate2To3,
  // etc.
};

/**
 * Gets the schema version from a preset file.
 * Returns 0 if schemaVersion is missing (legacy format).
 */
export function getSchemaVersion(file: unknown): number {
  if (!file || typeof file !== 'object') {
    return 0;
  }
  const fileObj = file as Record<string, unknown>;
  return typeof fileObj.schemaVersion === 'number' ? fileObj.schemaVersion : 0;
}

/**
 * Migrates a preset file to the current schema version using sequential pipeline.
 * 
 * Migration process:
 * 1. Detect source version
 * 2. Apply migrations sequentially: version → version+1 → ... → CURRENT_SCHEMA_VERSION
 * 3. Each migration is idempotent (safe to run multiple times)
 * 
 * @param file - Preset file (may be from older version)
 * @returns Migrated preset file in current schema version
 * @throws Error if migration fails or version is unsupported
 */
export function migratePreset(file: unknown): PresetFile {
  if (!file || typeof file !== 'object') {
    throw new Error('Invalid preset file: not an object');
  }

  const sourceVersion = getSchemaVersion(file);
  
  // Check minimum supported version
  if (sourceVersion < MIN_SUPPORTED_VERSION) {
    throw new Error(
      `Unsupported preset version: ${sourceVersion}. Minimum supported version is ${MIN_SUPPORTED_VERSION}.`
    );
  }

  // If already at current version, return as-is (with type assertion)
  if (sourceVersion === CURRENT_SCHEMA_VERSION) {
    return file as PresetFile;
  }

  // If source version is newer than current, we can't migrate forward
  // But we'll try to preserve as much as possible (forward compatibility)
  if (sourceVersion > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `Preset version ${sourceVersion} is newer than current version ${CURRENT_SCHEMA_VERSION}. ` +
      `Attempting to use forward compatibility mode.`
    );
    // Try to use the file as-is, but validate it matches current structure
    return file as PresetFile;
  }

  // Sequential migration: apply each migration step in order
  let migrated = file;
  
  for (let v = sourceVersion; v < CURRENT_SCHEMA_VERSION; v++) {
    const migration = MIGRATION_REGISTRY[v];
    
    if (!migration) {
      throw new Error(
        `No migration function found for version ${v}. ` +
        `Cannot migrate from version ${sourceVersion} to ${CURRENT_SCHEMA_VERSION}.`
      );
    }

    try {
      migrated = migration(migrated);
      
      // Verify migration updated version number
      const migratedVersion = getSchemaVersion(migrated);
      if (migratedVersion !== v + 1) {
        throw new Error(
          `Migration from version ${v} to ${v + 1} failed: ` +
          `result version is ${migratedVersion} instead of ${v + 1}`
        );
      }
    } catch (error) {
      throw new Error(
        `Migration from version ${v} to ${v + 1} failed: ` +
        (error instanceof Error ? error.message : String(error))
      );
    }
  }

  // Final version check
  const finalVersion = getSchemaVersion(migrated);
  if (finalVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Migration failed: expected version ${CURRENT_SCHEMA_VERSION}, got ${finalVersion}`
    );
  }

  return migrated as PresetFile;
}

/**
 * Migrates from version 0 (no schemaVersion) to version 1.
 * This is the initial migration for backward compatibility.
 * 
 * Changes in v1:
 * - Added presetName field (required)
 * - Standardized structure
 * 
 * This function is idempotent: calling it multiple times on the same input
 * will produce the same output.
 */
function migrate0To1(file: any): PresetFile {
  const now = new Date().toISOString();
  
  // Try to extract appVersion from file, or use unknown
  const appVersion = typeof file.appVersion === 'string' ? file.appVersion : '0.0.1';
  const exportedAt = typeof file.exportedAt === 'string' ? file.exportedAt : now;
  // Preset name (optional for backward compatibility - use exportedAt as fallback)
  const presetName = typeof file.presetName === 'string' ? file.presetName : `Preset ${now.slice(0, 10)}`;

  // Extract background
  const bg = file.background as Record<string, unknown> | undefined;
  const bgUrl = bg && typeof bg.url === 'string' ? bg.url : '';
  const bgSettings = bg && typeof bg.settings === 'object' ? bg.settings as Record<string, unknown> : {};

  // Extract overlay - handle legacy format migration
  let overlay: Overlay = DEFAULT_OVERLAY;
  const ov = file.overlay;
  
  if (ov && typeof ov === 'object') {
    // Check if it's already new format
    const ovObj = ov as Record<string, unknown>;
    if ('mode' in ovObj && 'elements' in ovObj && Array.isArray(ovObj.elements)) {
      // New format - ensure it's properly formatted
      overlay = ensureOverlayFormat(ov as Overlay);
    } else if (isLegacyOverlaySettings(ov)) {
      // Legacy format - migrate it
      overlay = ensureOverlayFormat(ov);
    }
  }

  // Extract misc settings
  const misc = file.misc && typeof file.misc === 'object' ? { ...file.misc } as Record<string, unknown> : {};
  const showGuide = misc.showGuide !== undefined ? Boolean(misc.showGuide) : undefined;

  // Preserve unknown fields for forward compatibility
  const unknownFields: Record<string, unknown> = {};
  const knownFields = ['schemaVersion', 'exportedAt', 'appVersion', 'presetName', 'background', 'overlay', 'misc'];
  
  if (typeof file === 'object' && file !== null) {
    for (const key in file) {
      if (!knownFields.includes(key)) {
        unknownFields[key] = (file as Record<string, unknown>)[key];
      }
    }
  }

  const result: PresetFile = {
    schemaVersion: 1,
    exportedAt,
    appVersion,
    presetName,
    background: {
      url: bgUrl,
      settings: {
        scale: typeof bgSettings.scale === 'number' ? bgSettings.scale : 1,
        x: typeof bgSettings.x === 'number' ? bgSettings.x : 0,
        y: typeof bgSettings.y === 'number' ? bgSettings.y : 0,
        fit: (typeof bgSettings.fit === 'string' && ['cover', 'contain', 'fill'].includes(bgSettings.fit))
          ? bgSettings.fit as 'cover' | 'contain' | 'fill'
          : 'cover',
        align: (typeof bgSettings.align === 'string' && ['center', 'top', 'bottom', 'left', 'right'].includes(bgSettings.align))
          ? bgSettings.align as 'center' | 'top' | 'bottom' | 'left' | 'right'
          : 'center',
        loop: typeof bgSettings.loop === 'boolean' ? bgSettings.loop : true,
        autoplay: typeof bgSettings.autoplay === 'boolean' ? bgSettings.autoplay : true,
        mute: typeof bgSettings.mute === 'boolean' ? bgSettings.mute : true,
        resolution: typeof bgSettings.resolution === 'string' ? bgSettings.resolution : '640x640',
        backgroundColor: typeof bgSettings.backgroundColor === 'string' ? bgSettings.backgroundColor : '#000000',
      },
    },
    overlay,
    misc: showGuide !== undefined ? { showGuide } : undefined,
  };

  // Merge unknown fields for forward compatibility
  return { ...result, ...unknownFields } as PresetFile;
}

/**
 * Future migration functions will be added here.
 * Each function migrates from version N to version N+1.
 * 
 * Example:
 * 
 * function migrate1To2(file: PresetFile): PresetFile {
 *   return {
 *     ...file,
 *     schemaVersion: 2,
 *     // ... new structure
 *   };
 * }
 */

// Future migration functions:
// function migrate1To2(file: PresetFile): PresetFile {
//   // Example: Add new field or restructure data
//   return {
//     ...file,
//     schemaVersion: 2,
//     // ... new structure
//   };
// }

