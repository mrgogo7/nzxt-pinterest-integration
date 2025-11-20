/**
 * Preset Validation Layer
 * 
 * Validates preset files for correctness, completeness, and value ranges.
 * Provides structured validation results with errors and warnings.
 */

import type { PresetFile } from './schema';
import { VALUE_RANGES, VALID_ENUMS } from './constants';

/**
 * Validation error/warning severity levels.
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Individual validation issue.
 */
export interface ValidationIssue {
  /** Field path (e.g., 'background.settings.scale') */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Severity level */
  severity: ValidationSeverity;
}

/**
 * Validation result structure.
 */
export interface ValidationResult {
  /** Whether the preset is valid (no errors) */
  valid: boolean;
  /** List of validation errors (blocking) */
  errors: ValidationIssue[];
  /** List of validation warnings (non-blocking) */
  warnings: ValidationIssue[];
}

/**
 * Field validator function type.
 */
type FieldValidator<T = unknown> = (value: T, field: string) => ValidationIssue | null;

/**
 * Validates a preset file.
 * 
 * @param file - Preset file to validate
 * @returns Validation result with errors and warnings
 */
export function validatePresetFile(file: PresetFile): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Required fields validation
  validateRequiredFields(file, errors);

  // Background settings validation
  validateBackgroundSettings(file, errors, warnings);

  // Overlay validation
  validateOverlay(file, errors, warnings);

  // Misc settings validation
  validateMiscSettings(file, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates required top-level fields.
 */
function validateRequiredFields(file: PresetFile, errors: ValidationIssue[]): void {
  if (!file.presetName || typeof file.presetName !== 'string' || file.presetName.trim().length === 0) {
    errors.push({
      field: 'presetName',
      message: 'Preset name is required and cannot be empty',
      severity: 'error',
    });
  }

  if (!file.background || typeof file.background !== 'object') {
    errors.push({
      field: 'background',
      message: 'Background configuration is required',
      severity: 'error',
    });
    return; // Can't validate further if background is missing
  }

  if (typeof file.background.url !== 'string') {
    errors.push({
      field: 'background.url',
      message: 'Background URL must be a string',
      severity: 'error',
    });
  }

  if (!file.overlay || typeof file.overlay !== 'object') {
    errors.push({
      field: 'overlay',
      message: 'Overlay configuration is required',
      severity: 'error',
    });
  }
}

/**
 * Validates background settings.
 */
function validateBackgroundSettings(
  file: PresetFile,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  if (!file.background?.settings) {
    errors.push({
      field: 'background.settings',
      message: 'Background settings are required',
      severity: 'error',
    });
    return;
  }

  const settings = file.background.settings;

  // Scale validation
  if (typeof settings.scale !== 'number') {
    errors.push({
      field: 'background.settings.scale',
      message: 'Scale must be a number',
      severity: 'error',
    });
  } else {
    const scaleIssue = validateNumericRange(
      settings.scale,
      VALUE_RANGES.scale.min,
      VALUE_RANGES.scale.max,
      'background.settings.scale',
      'Scale'
    );
    if (scaleIssue) {
      warnings.push(scaleIssue);
    }
  }

  // X offset validation
  if (typeof settings.x !== 'number') {
    errors.push({
      field: 'background.settings.x',
      message: 'X offset must be a number',
      severity: 'error',
    });
  } else {
    const xIssue = validateNumericRange(
      settings.x,
      VALUE_RANGES.x.min,
      VALUE_RANGES.x.max,
      'background.settings.x',
      'X offset'
    );
    if (xIssue) {
      warnings.push(xIssue);
    }
  }

  // Y offset validation
  if (typeof settings.y !== 'number') {
    errors.push({
      field: 'background.settings.y',
      message: 'Y offset must be a number',
      severity: 'error',
    });
  } else {
    const yIssue = validateNumericRange(
      settings.y,
      VALUE_RANGES.y.min,
      VALUE_RANGES.y.max,
      'background.settings.y',
      'Y offset'
    );
    if (yIssue) {
      warnings.push(yIssue);
    }
  }

  // Fit validation
  if (typeof settings.fit !== 'string') {
    errors.push({
      field: 'background.settings.fit',
      message: 'Fit must be a string',
      severity: 'error',
    });
  } else if (!VALID_ENUMS.fit.includes(settings.fit as any)) {
    errors.push({
      field: 'background.settings.fit',
      message: `Invalid fit value: "${settings.fit}". Must be one of: ${VALID_ENUMS.fit.join(', ')}`,
      severity: 'error',
    });
  }

  // Align validation
  if (typeof settings.align !== 'string') {
    errors.push({
      field: 'background.settings.align',
      message: 'Align must be a string',
      severity: 'error',
    });
  } else if (!VALID_ENUMS.align.includes(settings.align as any)) {
    errors.push({
      field: 'background.settings.align',
      message: `Invalid align value: "${settings.align}". Must be one of: ${VALID_ENUMS.align.join(', ')}`,
      severity: 'error',
    });
  }

  // Boolean fields validation
  if (typeof settings.loop !== 'boolean') {
    errors.push({
      field: 'background.settings.loop',
      message: 'Loop must be a boolean',
      severity: 'error',
    });
  }

  if (typeof settings.autoplay !== 'boolean') {
    errors.push({
      field: 'background.settings.autoplay',
      message: 'Autoplay must be a boolean',
      severity: 'error',
    });
  }

  if (typeof settings.mute !== 'boolean') {
    errors.push({
      field: 'background.settings.mute',
      message: 'Mute must be a boolean',
      severity: 'error',
    });
  }

  // Resolution validation
  if (typeof settings.resolution !== 'string') {
    errors.push({
      field: 'background.settings.resolution',
      message: 'Resolution must be a string',
      severity: 'error',
    });
  } else if (!/^\d+x\d+$/.test(settings.resolution)) {
    warnings.push({
      field: 'background.settings.resolution',
      message: `Resolution format "${settings.resolution}" may be invalid. Expected format: "WIDTHxHEIGHT" (e.g., "640x640")`,
      severity: 'warning',
    });
  }

  // Background color validation
  if (settings.backgroundColor !== undefined) {
    if (typeof settings.backgroundColor !== 'string') {
      errors.push({
        field: 'background.settings.backgroundColor',
        message: 'Background color must be a string',
        severity: 'error',
      });
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(settings.backgroundColor)) {
      warnings.push({
        field: 'background.settings.backgroundColor',
        message: `Background color "${settings.backgroundColor}" may be invalid. Expected hex format: "#RRGGBB"`,
        severity: 'warning',
      });
    }
  }
}

/**
 * Validates overlay configuration.
 */
function validateOverlay(
  file: PresetFile,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  if (!file.overlay) {
    return; // Already validated as required
  }

  if (typeof file.overlay.mode !== 'string') {
    errors.push({
      field: 'overlay.mode',
      message: 'Overlay mode must be a string',
      severity: 'error',
    });
  } else if (!['none', 'custom'].includes(file.overlay.mode)) {
    errors.push({
      field: 'overlay.mode',
      message: `Invalid overlay mode: "${file.overlay.mode}". Must be "none" or "custom"`,
      severity: 'error',
    });
  }

  if (!Array.isArray(file.overlay.elements)) {
    errors.push({
      field: 'overlay.elements',
      message: 'Overlay elements must be an array',
      severity: 'error',
    });
  }
}

/**
 * Validates misc settings.
 */
function validateMiscSettings(file: PresetFile, warnings: ValidationIssue[]): void {
  if (file.misc) {
    if (file.misc.showGuide !== undefined && typeof file.misc.showGuide !== 'boolean') {
      warnings.push({
        field: 'misc.showGuide',
        message: 'Show guide should be a boolean',
        severity: 'warning',
      });
    }
  }
}

/**
 * Validates a numeric value against a range.
 * Returns a warning if out of range, null if valid.
 */
function validateNumericRange(
  value: number,
  min: number,
  max: number,
  field: string,
  fieldName: string
): ValidationIssue | null {
  if (value < min || value > max) {
    return {
      field,
      message: `${fieldName} value ${value} is outside recommended range [${min}, ${max}]. It will be clamped during normalization.`,
      severity: 'warning',
    };
  }
  return null;
}

