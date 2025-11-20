/**
 * Preset Normalization Layer
 * 
 * Normalizes preset values to valid ranges and formats.
 * Clamps out-of-range values and reports changes.
 */

import type { PresetFile } from './schema';
import { VALUE_RANGES, VALID_ENUMS } from './constants';

/**
 * Represents a single normalization change.
 */
export interface NormalizationChange {
  /** Field path (e.g., 'background.settings.scale') */
  field: string;
  /** Original value before normalization */
  oldValue: unknown;
  /** New value after normalization */
  newValue: unknown;
}

/**
 * Normalization result structure.
 */
export interface NormalizationResult {
  /** Normalized preset file */
  normalized: PresetFile;
  /** List of changes made during normalization */
  changes: NormalizationChange[];
}

/**
 * Normalizes a preset file.
 * 
 * This function:
 * - Clamps numeric values to valid ranges
 * - Fixes invalid enum values
 * - Ensures required fields have default values
 * - Reports all changes made
 * 
 * @param file - Preset file to normalize
 * @returns Normalized preset and list of changes
 */
export function normalizePresetFile(file: PresetFile): NormalizationResult {
  const changes: NormalizationChange[] = [];
  const normalized = { ...file };

  // Normalize background settings
  if (normalized.background?.settings) {
    normalizeBackgroundSettings(normalized.background.settings, changes);
  }

  // Normalize overlay
  if (normalized.overlay) {
    normalizeOverlay(normalized.overlay, changes);
  }

  return {
    normalized,
    changes,
  };
}

/**
 * Normalizes background settings.
 */
function normalizeBackgroundSettings(
  settings: PresetFile['background']['settings'],
  changes: NormalizationChange[]
): void {
  // Normalize scale
  if (typeof settings.scale === 'number') {
    const oldScale = settings.scale;
    const newScale = clamp(settings.scale, VALUE_RANGES.scale.min, VALUE_RANGES.scale.max);
    if (oldScale !== newScale) {
      settings.scale = newScale;
      changes.push({
        field: 'background.settings.scale',
        oldValue: oldScale,
        newValue: newScale,
      });
    }
  }

  // Normalize x offset
  if (typeof settings.x === 'number') {
    const oldX = settings.x;
    const newX = clamp(settings.x, VALUE_RANGES.x.min, VALUE_RANGES.x.max);
    if (oldX !== newX) {
      settings.x = newX;
      changes.push({
        field: 'background.settings.x',
        oldValue: oldX,
        newValue: newX,
      });
    }
  }

  // Normalize y offset
  if (typeof settings.y === 'number') {
    const oldY = settings.y;
    const newY = clamp(settings.y, VALUE_RANGES.y.min, VALUE_RANGES.y.max);
    if (oldY !== newY) {
      settings.y = newY;
      changes.push({
        field: 'background.settings.y',
        oldValue: oldY,
        newValue: newY,
      });
    }
  }

  // Normalize fit enum
  if (typeof settings.fit === 'string' && !VALID_ENUMS.fit.includes(settings.fit as any)) {
    const oldFit = settings.fit;
    const newFit = 'cover'; // Default fallback
    settings.fit = newFit;
    changes.push({
      field: 'background.settings.fit',
      oldValue: oldFit,
      newValue: newFit,
    });
  }

  // Normalize align enum
  if (typeof settings.align === 'string' && !VALID_ENUMS.align.includes(settings.align as any)) {
    const oldAlign = settings.align;
    const newAlign = 'center'; // Default fallback
    settings.align = newAlign;
    changes.push({
      field: 'background.settings.align',
      oldValue: oldAlign,
      newValue: newAlign,
    });
  }

  // Normalize boolean fields (ensure they are boolean)
  if (settings.loop !== undefined && typeof settings.loop !== 'boolean') {
    const oldLoop = settings.loop;
    const newLoop = Boolean(settings.loop);
    settings.loop = newLoop;
    changes.push({
      field: 'background.settings.loop',
      oldValue: oldLoop,
      newValue: newLoop,
    });
  }

  if (settings.autoplay !== undefined && typeof settings.autoplay !== 'boolean') {
    const oldAutoplay = settings.autoplay;
    const newAutoplay = Boolean(settings.autoplay);
    settings.autoplay = newAutoplay;
    changes.push({
      field: 'background.settings.autoplay',
      oldValue: oldAutoplay,
      newValue: newAutoplay,
    });
  }

  if (settings.mute !== undefined && typeof settings.mute !== 'boolean') {
    const oldMute = settings.mute;
    const newMute = Boolean(settings.mute);
    settings.mute = newMute;
    changes.push({
      field: 'background.settings.mute',
      oldValue: oldMute,
      newValue: newMute,
    });
  }
}

/**
 * Normalizes overlay configuration.
 */
function normalizeOverlay(
  overlay: PresetFile['overlay'],
  changes: NormalizationChange[]
): void {
  // Normalize overlay mode
  if (typeof overlay.mode === 'string' && !['none', 'custom'].includes(overlay.mode)) {
    const oldMode = overlay.mode;
    const newMode = 'none'; // Default fallback
    overlay.mode = newMode;
    changes.push({
      field: 'overlay.mode',
      oldValue: oldMode,
      newValue: newMode,
    });
  }

  // Ensure elements is an array
  if (!Array.isArray(overlay.elements)) {
    const oldElements = overlay.elements;
    const newElements: typeof overlay.elements = [];
    overlay.elements = newElements;
    changes.push({
      field: 'overlay.elements',
      oldValue: oldElements,
      newValue: newElements,
    });
  }
}

/**
 * Clamps a number to a range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

