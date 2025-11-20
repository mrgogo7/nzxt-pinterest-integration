/**
 * Preset Profile Schema
 * 
 * Defines the structure for export/import preset files (.nzxt-esc-preset).
 * Uses versioned schema for migration support.
 */

import type { AppSettings } from '../constants/defaults';
import type { Overlay } from '../types/overlay';

/**
 * Current schema version.
 * Increment this when making breaking changes to the preset format.
 * 
 * @deprecated Use CURRENT_SCHEMA_VERSION from './constants' instead.
 * This is kept for backward compatibility.
 */
export const PRESET_SCHEMA_VERSION = 1;

/**
 * Preset file structure.
 * All export/import operations use this schema.
 */
export interface PresetFile {
  /** Schema version (for migration support) */
  schemaVersion: number;
  /** ISO timestamp when preset was exported */
  exportedAt: string;
  /** Application version (from package.json) */
  appVersion: string;
  /** Preset name (user-friendly identifier) */
  presetName: string;
  /** Background configuration */
  background: {
    /** Media URL (image/video) */
    url: string;
    /** Background settings (scale, position, fit, align, etc.) */
    settings: Pick<AppSettings, 'scale' | 'x' | 'y' | 'fit' | 'align' | 'loop' | 'autoplay' | 'mute' | 'resolution' | 'backgroundColor'>;
  };
  /** Overlay configuration */
  overlay: Overlay;
  /** UI/Misc settings */
  misc?: {
    /** Show guide lines toggle */
    showGuide?: boolean;
    /** Future: language preference */
    language?: string;
    /** Future: any other UI settings */
    [key: string]: unknown;
  };
}

/**
 * Type guard to check if an object is a valid PresetFile.
 */
export function isPresetFile(obj: unknown): obj is PresetFile {
  if (!obj || typeof obj !== 'object') return false;
  
  const file = obj as Record<string, unknown>;
  
  // Required fields
  if (typeof file.schemaVersion !== 'number') return false;
  if (typeof file.exportedAt !== 'string') return false;
  if (typeof file.appVersion !== 'string') return false;
  if (!file.background || typeof file.background !== 'object') return false;
  if (!file.overlay || typeof file.overlay !== 'object') return false;
  
  // Preset name (optional for backward compatibility)
  if (file.presetName !== undefined && typeof file.presetName !== 'string') return false;
  
  // Background structure
  const bg = file.background as Record<string, unknown>;
  if (typeof bg.url !== 'string') return false;
  if (!bg.settings || typeof bg.settings !== 'object') return false;
  
  // Overlay structure (basic check - full validation in migration)
  const ov = file.overlay as Record<string, unknown>;
  if (typeof ov.mode !== 'string') return false;
  if (!Array.isArray(ov.elements)) return false;
  
  return true;
}

