/**
 * Preset System Constants
 * 
 * Centralized constants for preset system versioning and configuration.
 */

/**
 * Current schema version.
 * This is the version that all exported presets will use.
 * Increment this when making breaking changes to the preset format.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Minimum supported schema version.
 * Presets with versions below this will be rejected.
 */
export const MIN_SUPPORTED_VERSION = 0;

/**
 * Schema version history.
 * Documents what changed in each version.
 */
export const SCHEMA_VERSION_HISTORY: Record<number, string> = {
  0: 'Initial version (no schemaVersion field) - Legacy format',
  1: 'Added presetName field, standardized structure',
  // Future versions will be added here as they're introduced
};

/**
 * Value ranges for normalization and validation.
 */
export const VALUE_RANGES = {
  scale: { min: 0.1, max: 5.0 },
  x: { min: -1000, max: 1000 },
  y: { min: -1000, max: 1000 },
} as const;

/**
 * Valid enum values for validation.
 */
export const VALID_ENUMS = {
  fit: ['cover', 'contain', 'fill'] as const,
  align: ['center', 'top', 'bottom', 'left', 'right'] as const,
} as const;

