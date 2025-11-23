/**
 * Overlay Preset Export/Import System
 * 
 * Handles exporting overlay elements to .nzxt-esc-overlay-preset files
 * and importing overlay preset files to restore elements.
 * 
 * This is a separate system from the main preset system to avoid conflicts.
 */

import type { OverlayElement } from '../types/overlay';
import type { OverlayPresetFile, OverlayPresetValidationResult } from './schema';
import { 
  OVERLAY_PRESET_SCHEMA_VERSION,
  isOverlayPresetFile,
  validateOverlayPresetFile 
} from './schema';

/**
 * Import result structure.
 */
export interface OverlayPresetImportResult {
  /** Whether import was successful */
  success: boolean;
  /** Imported elements (if successful) */
  elements?: OverlayElement[];
  /** Validation result */
  validation?: OverlayPresetValidationResult;
  /** Error message (if failed) */
  error?: string;
}

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
 * Exports overlay elements to .nzxt-esc-overlay-preset file.
 * 
 * @param elements - Array of overlay elements to export
 * @param presetName - Name for the preset
 * @param filename - Optional filename (without extension, defaults to presetName)
 * @returns Promise that resolves when export is complete
 */
export async function exportOverlayPreset(
  elements: OverlayElement[],
  presetName: string,
  filename?: string
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const appVersion = getAppVersion();
    
    // Create overlay preset file structure
    const presetFile: OverlayPresetFile = {
      schemaVersion: OVERLAY_PRESET_SCHEMA_VERSION,
      format: 'overlay-preset',
      appVersion,
      elements: [...elements], // Copy array to avoid mutations
      meta: {
        name: presetName,
        createdAt: now,
      },
    };
    
    // Convert to JSON
    const json = JSON.stringify(presetFile, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download filename (sanitize presetName for filename)
    const sanitizedName = presetName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const finalFilename = filename || sanitizedName || `overlay-preset-${Date.now()}`;
    
    // Create temporary anchor and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${finalFilename}.nzxt-esc-overlay-preset`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[OverlayPreset] Export error:', error);
    throw new Error('Failed to export overlay preset file');
  }
}

/**
 * Imports an overlay preset file.
 * 
 * Pipeline:
 * 1. Validate file type (must be .nzxt-esc-overlay-preset)
 * 2. Read and parse JSON
 * 3. Type guard check (isOverlayPresetFile)
 * 4. Validate structure and elements
 * 5. Return elements or errors
 * 
 * @param file - File object from file input
 * @returns Promise that resolves with import result
 */
export async function importOverlayPreset(
  file: File
): Promise<OverlayPresetImportResult> {
  try {
    // Step 1: Validate file type
    if (!file.name.endsWith('.nzxt-esc-overlay-preset')) {
      return {
        success: false,
        error: 'Invalid file type. Expected .nzxt-esc-overlay-preset file.',
      };
    }
    
    // Step 2: Read and parse JSON
    let parsed: unknown;
    try {
      const text = await file.text();
      parsed = JSON.parse(text);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse JSON file. Please check the file format.',
      };
    }
    
    // Step 3: Type guard check
    if (!isOverlayPresetFile(parsed)) {
      return {
        success: false,
        error: 'Invalid overlay preset file structure. Missing required fields or incorrect format.',
      };
    }
    
    // Step 4: Validate structure and elements
    const validation = validateOverlayPresetFile(parsed);
    
    if (!validation.valid) {
      const errorMessages = validation.errors.map(err => `${err.field}: ${err.message}`).join('; ');
      return {
        success: false,
        validation,
        error: `Validation failed: ${errorMessages}`,
      };
    }
    
    // Step 5: Return elements
    return {
      success: true,
      elements: [...parsed.elements], // Copy array to avoid mutations
      validation,
    };
    
  } catch (error) {
    console.error('[OverlayPreset] Import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during import',
    };
  }
}

