/**
 * Preset Import Pipeline
 * 
 * End-to-end import pipeline that handles:
 * 1. File reading
 * 2. JSON parsing
 * 3. Version detection
 * 4. Sequential migration
 * 5. Validation
 * 6. Normalization
 * 7. Result generation
 */

import type { PresetFile } from './schema';
import type { AppSettings } from '../constants/defaults';
import type { Lang } from '../i18n';
import { migratePreset, getSchemaVersion } from './migration';
import { validatePresetFile, type ValidationResult } from './validation';
import { normalizePresetFile, type NormalizationResult } from './normalization';
import { 
  PresetError, 
  ERROR_CODES, 
  getUserFriendlyErrorMessage,
  createPresetError 
} from './errors';
import { ensureOverlayFormat } from '../utils/overlayMigration';

/**
 * Complete import result structure.
 */
export interface ImportResult {
  /** Whether import was successful */
  success: boolean;
  /** Migrated and validated preset file (if successful) */
  preset?: PresetFile;
  /** Settings extracted from preset (ready to apply) */
  settings?: Partial<AppSettings>;
  /** Media URL from preset */
  mediaUrl?: string;
  /** Validation result */
  validation?: ValidationResult;
  /** Normalization result */
  normalization?: NormalizationResult;
  /** List of errors (if any) */
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
    userMessage?: string;
  }>;
  /** List of warnings (if any) */
  warnings?: Array<{
    field: string;
    message: string;
  }>;
  /** List of normalization changes (if any) */
  normalizationChanges?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

/**
 * Imports a preset file through the complete pipeline.
 * 
 * Pipeline steps:
 * 1. Validate file type
 * 2. Read and parse JSON
 * 3. Detect version
 * 4. Migrate to current version (sequential)
 * 5. Validate structure and values
 * 6. Normalize values (clamp, fix enums, etc.)
 * 7. Convert to app settings
 * 8. Return structured result
 * 
 * @param file - File object from file input
 * @param lang - Language for user-friendly messages
 * @returns Import result with all details
 */
export async function importPresetPipeline(
  file: File,
  lang: Lang = 'en'
): Promise<ImportResult> {
  try {
    // Step 1: Validate file type
    if (!file.name.endsWith('.nzxt-esc-preset')) {
      throw new PresetError(
        'Invalid file type',
        ERROR_CODES.INVALID_FILE_TYPE
      );
    }

    // Reject overlay-preset format files (they should use overlay preset import)
    if (file.name.endsWith('.nzxt-esc-overlay-preset')) {
      throw new PresetError(
        'This is an overlay preset file. Please use overlay import instead.',
        ERROR_CODES.INVALID_FILE_TYPE
      );
    }

    // Step 2: Read and parse JSON
    let parsed: unknown;
    try {
      const text = await file.text();
      parsed = JSON.parse(text);
    } catch (error) {
      throw new PresetError(
        'Failed to parse JSON',
        ERROR_CODES.PARSE_ERROR,
        error
      );
    }

    // Step 3: Detect version and migrate
    let migrated: PresetFile;
    try {
      const sourceVersion = getSchemaVersion(parsed);
      
      if (sourceVersion < 0) {
        throw new PresetError(
          `Unsupported preset version: ${sourceVersion}`,
          ERROR_CODES.UNSUPPORTED_VERSION
        );
      }

      migrated = migratePreset(parsed);
    } catch (error) {
      if (error instanceof PresetError) {
        throw error;
      }
      throw new PresetError(
        'Migration failed',
        ERROR_CODES.MIGRATION_FAILED,
        error
      );
    }

    // Step 4: Validate
    const validation = validatePresetFile(migrated);

    // If validation has errors, return early with errors
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors.map(err => ({
          code: ERROR_CODES.VALIDATION_FAILED,
          message: err.message,
          field: err.field,
          userMessage: getUserFriendlyErrorMessage(
            new PresetError(err.message, ERROR_CODES.VALIDATION_FAILED),
            lang
          ),
        })),
        warnings: validation.warnings.map(warn => ({
          field: warn.field,
          message: warn.message,
        })),
        validation,
      };
    }

    // Step 5: Normalize
    const normalization = normalizePresetFile(migrated);
    const normalized = normalization.normalized;

    // Step 6: Convert to app settings
    const overlay = ensureOverlayFormat(normalized.overlay);
    
    const settings: Partial<AppSettings> = {
      scale: normalized.background.settings.scale,
      x: normalized.background.settings.x,
      y: normalized.background.settings.y,
      fit: normalized.background.settings.fit,
      align: normalized.background.settings.align,
      loop: normalized.background.settings.loop,
      autoplay: normalized.background.settings.autoplay,
      mute: normalized.background.settings.mute,
      resolution: normalized.background.settings.resolution,
      backgroundColor: normalized.background.settings.backgroundColor,
      overlay,
      showGuide: normalized.misc?.showGuide,
    };

    // Step 7: Build result
    const result: ImportResult = {
      success: true,
      preset: normalized,
      settings,
      mediaUrl: normalized.background.url,
      validation,
      normalization,
    };

    // Add warnings if any
    if (validation.warnings.length > 0) {
      result.warnings = validation.warnings.map(warn => ({
        field: warn.field,
        message: warn.message,
      }));
    }

    // Add normalization changes if any
    if (normalization.changes.length > 0) {
      result.normalizationChanges = normalization.changes;
    }

    return result;

  } catch (error) {
    const presetError = createPresetError(error);
    
    return {
      success: false,
      errors: [{
        code: presetError.code,
        message: presetError.message,
        userMessage: getUserFriendlyErrorMessage(presetError, lang),
      }],
    };
  }
}

