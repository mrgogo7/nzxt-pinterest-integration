/**
 * Preset Export/Import System
 * 
 * Handles exporting current configuration to .nzxt-esc-preset files
 * and importing preset files to restore configuration.
 * 
 * Uses the new import pipeline for robust import handling with
 * migration, validation, and normalization.
 */

import type { PresetFile } from './schema';
import type { Lang } from '../i18n';
import { CURRENT_SCHEMA_VERSION } from './constants';
import { importPresetPipeline, type ImportResult } from './importPipeline';
import type { AppSettings } from '../constants/defaults';

// Re-export types and functions for convenience
export type { ImportResult } from './importPipeline';
export type { ValidationResult, ValidationIssue } from './validation';
export type { NormalizationResult, NormalizationChange } from './normalization';
export { ERROR_CODES, PresetError, getUserFriendlyErrorMessage } from './errors';

/**
 * Gets current app version from package.json.
 * Falls back to '0.0.1' if not available.
 */
function getAppVersion(): string {
  // In production build, version might be injected via Vite
  // For now, we'll use a constant or try to read from package.json
  // Since we're in browser context, we'll use a simple fallback
  return '0.0.1'; // TODO: Could be injected at build time
}

/**
 * Creates a preset file from current application state.
 * 
 * @param settings - Current app settings
 * @param mediaUrl - Current media URL
 * @param presetName - Preset name
 * @returns Preset file object ready for export
 */
export function createPresetFromState(
  settings: AppSettings,
  mediaUrl: string,
  presetName: string
): PresetFile {
  const now = new Date().toISOString();
  const appVersion = getAppVersion();

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: now,
    appVersion,
    presetName,
    background: {
      url: mediaUrl,
      settings: {
        scale: settings.scale,
        x: settings.x,
        y: settings.y,
        fit: settings.fit,
        align: settings.align,
        loop: settings.loop,
        autoplay: settings.autoplay,
        mute: settings.mute,
        resolution: settings.resolution,
        backgroundColor: settings.backgroundColor || '#000000',
      },
    },
    overlay: settings.overlay || { mode: 'none', elements: [] },
    misc: settings.showGuide !== undefined ? { showGuide: settings.showGuide } : undefined,
  };
}

/**
 * Exports current configuration to .nzxt-esc-preset file.
 * 
 * @param settings - Current app settings
 * @param mediaUrl - Current media URL
 * @param presetName - Preset name
 * @param filename - Optional filename (without extension, defaults to presetName)
 * @returns Promise that resolves when export is complete
 */
export async function exportPreset(
  settings: AppSettings,
  mediaUrl: string,
  presetName: string,
  filename?: string
): Promise<void> {
  try {
    const preset = createPresetFromState(settings, mediaUrl, presetName);
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download filename (sanitize presetName for filename)
    const sanitizedName = presetName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const finalFilename = filename || sanitizedName || `nzxt-esc-preset-${Date.now()}`;

    // Create temporary anchor and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${finalFilename}.nzxt-esc-preset`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[Preset] Export error:', error);
    throw new Error('Failed to export preset file');
  }
}

/**
 * Imports a preset file using the new pipeline.
 * 
 * This is the main import function that uses the complete pipeline:
 * - File validation
 * - JSON parsing
 * - Migration
 * - Validation
 * - Normalization
 * 
 * @param file - File object from file input
 * @param lang - Language for user-friendly error messages (default: 'en')
 * @returns Promise that resolves with import result
 */
export async function importPreset(
  file: File,
  lang: Lang = 'en'
): Promise<ImportResult> {
  return importPresetPipeline(file, lang);
}

/**
 * Legacy import function for backward compatibility.
 * 
 * @deprecated Use importPreset() which returns ImportResult.
 * This function is kept for backward compatibility but will be removed in future versions.
 */
export async function importPresetLegacy(
  file: File
): Promise<{ preset: PresetFile; settings: Partial<AppSettings>; mediaUrl: string }> {
  const result = await importPresetPipeline(file, 'en');
  
  if (!result.success || !result.preset || !result.settings || !result.mediaUrl) {
    const errorMessage = result.errors?.[0]?.userMessage || result.errors?.[0]?.message || 'Import failed';
    throw new Error(errorMessage);
  }

  return {
    preset: result.preset,
    settings: result.settings,
    mediaUrl: result.mediaUrl,
  };
}

