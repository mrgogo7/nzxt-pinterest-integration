/**
 * Overlay Preset Schema
 * 
 * Defines the structure for overlay preset files (.nzxt-esc-overlay-preset).
 * This is a separate format from the main preset system to avoid conflicts.
 */

import type { OverlayElement } from '../types/overlay';

/**
 * Current schema version for overlay presets.
 * Increment when making breaking changes to the format.
 */
export const OVERLAY_PRESET_SCHEMA_VERSION = 1;

/**
 * Overlay preset file structure.
 * Contains only overlay elements, not full app settings.
 */
export interface OverlayPresetFile {
  /** Schema version (for future migration support) */
  schemaVersion: number;
  /** Format discriminator - must be "overlay-preset" */
  format: 'overlay-preset';
  /** Application version (from package.json) */
  appVersion: string;
  /** Array of overlay elements */
  elements: OverlayElement[];
  /** Metadata */
  meta: {
    /** Preset name (user-friendly identifier) */
    name: string;
    /** ISO timestamp when preset was created/exported */
    createdAt: string;
  };
}

/**
 * Type guard to check if an object is a valid OverlayPresetFile.
 * Performs basic structure validation.
 */
export function isOverlayPresetFile(obj: unknown): obj is OverlayPresetFile {
  if (!obj || typeof obj !== 'object') return false;
  
  const file = obj as Record<string, unknown>;
  
  // Required top-level fields
  if (typeof file.schemaVersion !== 'number') return false;
  if (file.format !== 'overlay-preset') return false;
  if (typeof file.appVersion !== 'string') return false;
  if (!Array.isArray(file.elements)) return false;
  if (!file.meta || typeof file.meta !== 'object') return false;
  
  // Meta structure
  const meta = file.meta as Record<string, unknown>;
  if (typeof meta.name !== 'string') return false;
  if (typeof meta.createdAt !== 'string') return false;
  
  // Elements array validation (basic check - detailed validation in import)
  if (file.elements.length === 0) return true; // Empty array is valid
  
  // Check first element structure (detailed validation happens in import)
  const firstElement = file.elements[0] as unknown;
  if (!firstElement || typeof firstElement !== 'object') return false;
  const element = firstElement as Record<string, unknown>;
  if (typeof element.id !== 'string') return false;
  if (typeof element.type !== 'string') return false;
  if (typeof element.x !== 'number') return false;
  if (typeof element.y !== 'number') return false;
  if (!element.data || typeof element.data !== 'object') return false;
  
  return true;
}

/**
 * Validation result for overlay preset files.
 */
export interface OverlayPresetValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Validates an overlay preset file structure and elements.
 * 
 * @param file - Overlay preset file to validate
 * @returns Validation result with errors if any
 */
export function validateOverlayPresetFile(
  file: OverlayPresetFile
): OverlayPresetValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  
  // Schema version check
  if (file.schemaVersion !== OVERLAY_PRESET_SCHEMA_VERSION) {
    errors.push({
      field: 'schemaVersion',
      message: `Unsupported schema version: ${file.schemaVersion}. Expected: ${OVERLAY_PRESET_SCHEMA_VERSION}`,
    });
  }
  
  // Format check
  if (file.format !== 'overlay-preset') {
    errors.push({
      field: 'format',
      message: `Invalid format: ${file.format}. Expected: overlay-preset`,
    });
  }
  
  // App version check (should be non-empty)
  if (!file.appVersion || file.appVersion.trim() === '') {
    errors.push({
      field: 'appVersion',
      message: 'App version is required',
    });
  }
  
  // Meta validation
  if (!file.meta.name || file.meta.name.trim() === '') {
    errors.push({
      field: 'meta.name',
      message: 'Preset name is required',
    });
  }
  
  if (!file.meta.createdAt) {
    errors.push({
      field: 'meta.createdAt',
      message: 'Created timestamp is required',
    });
  }
  
  // Elements validation
  if (!Array.isArray(file.elements)) {
    errors.push({
      field: 'elements',
      message: 'Elements must be an array',
    });
    return { valid: false, errors };
  }
  
  // Validate each element
  file.elements.forEach((element, index) => {
    const prefix = `elements[${index}]`;
    
    // Required fields
    if (!element.id || typeof element.id !== 'string') {
      errors.push({
        field: `${prefix}.id`,
        message: 'Element ID is required and must be a string',
      });
    }
    
    if (!element.type || !['metric', 'text', 'divider'].includes(element.type)) {
      errors.push({
        field: `${prefix}.type`,
        message: 'Element type must be one of: metric, text, divider',
      });
    }
    
    if (typeof element.x !== 'number' || isNaN(element.x)) {
      errors.push({
        field: `${prefix}.x`,
        message: 'Element X position must be a number',
      });
    }
    
    if (typeof element.y !== 'number' || isNaN(element.y)) {
      errors.push({
        field: `${prefix}.y`,
        message: 'Element Y position must be a number',
      });
    }
    
    // Angle validation (optional, but if present must be valid)
    if (element.angle !== undefined) {
      if (typeof element.angle !== 'number' || isNaN(element.angle)) {
        errors.push({
          field: `${prefix}.angle`,
          message: 'Element angle must be a number',
        });
      } else if (element.angle < 0 || element.angle > 360) {
        errors.push({
          field: `${prefix}.angle`,
          message: 'Element angle must be between 0 and 360',
        });
      }
    }
    
    // Data validation based on type
    if (!element.data || typeof element.data !== 'object') {
      errors.push({
        field: `${prefix}.data`,
        message: 'Element data is required',
      });
      return;
    }
    
    const data = element.data as unknown as Record<string, unknown>;
    
    if (element.type === 'metric') {
      // Metric element validation
      if (typeof data.metric !== 'string' || 
          !['cpuTemp', 'cpuLoad', 'cpuClock', 'liquidTemp', 'gpuTemp', 'gpuLoad', 'gpuClock'].includes(data.metric)) {
        errors.push({
          field: `${prefix}.data.metric`,
          message: 'Metric type must be a valid metric key',
        });
      }
      if (typeof data.numberColor !== 'string') {
        errors.push({
          field: `${prefix}.data.numberColor`,
          message: 'Number color must be a string',
        });
      }
      if (typeof data.numberSize !== 'number' || data.numberSize < 0) {
        errors.push({
          field: `${prefix}.data.numberSize`,
          message: 'Number size must be a positive number',
        });
      }
      if (typeof data.textColor !== 'string') {
        errors.push({
          field: `${prefix}.data.textColor`,
          message: 'Text color must be a string',
        });
      }
      if (typeof data.textSize !== 'number' || data.textSize < 0) {
        errors.push({
          field: `${prefix}.data.textSize`,
          message: 'Text size must be a positive number',
        });
      }
    } else if (element.type === 'text') {
      // Text element validation
      if (typeof data.text !== 'string') {
        errors.push({
          field: `${prefix}.data.text`,
          message: 'Text content must be a string',
        });
      } else if (data.text.length > 120) {
        errors.push({
          field: `${prefix}.data.text`,
          message: 'Text content must not exceed 120 characters',
        });
      }
      if (typeof data.textColor !== 'string') {
        errors.push({
          field: `${prefix}.data.textColor`,
          message: 'Text color must be a string',
        });
      }
      if (typeof data.textSize !== 'number' || data.textSize < 6) {
        errors.push({
          field: `${prefix}.data.textSize`,
          message: 'Text size must be at least 6',
        });
      }
    } else if (element.type === 'divider') {
      // Divider element validation
      if (typeof data.width !== 'number' || data.width < 1 || data.width > 400) {
        errors.push({
          field: `${prefix}.data.width`,
          message: 'Divider width must be between 1 and 400',
        });
      }
      if (typeof data.height !== 'number' || data.height < 10 || data.height > 640) {
        errors.push({
          field: `${prefix}.data.height`,
          message: 'Divider height must be between 10 and 640',
        });
      }
      if (typeof data.color !== 'string') {
        errors.push({
          field: `${prefix}.data.color`,
          message: 'Divider color must be a string',
        });
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

