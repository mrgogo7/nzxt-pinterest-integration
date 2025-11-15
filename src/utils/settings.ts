import { DEFAULT_SETTINGS, type AppSettings } from '../constants/defaults';
import { DEFAULT_OVERLAY } from '../types/overlay';
import { normalizeToRgba } from './color';

/**
 * Normalize color values in overlay settings to RGBA format.
 * Handles backward compatibility with old HEX format colors.
 */
function normalizeOverlayColors(overlay: any): any {
  if (!overlay || typeof overlay !== 'object') return overlay;

  const normalized = { ...overlay };

  // List of color fields in overlay settings
  const colorFields = [
    'numberColor',
    'textColor',
    'primaryNumberColor',
    'primaryTextColor',
    'secondaryNumberColor',
    'secondaryTextColor',
    'tertiaryNumberColor',
    'tertiaryTextColor',
    'dividerColor',
  ];

  // Normalize each color field
  colorFields.forEach(field => {
    if (normalized[field] && typeof normalized[field] === 'string') {
      normalized[field] = normalizeToRgba(normalized[field]);
    }
  });

  return normalized;
}

/**
 * Merges saved settings with defaults, ensuring all fields are present.
 * Also normalizes color values for backward compatibility.
 * 
 * @param saved - Saved settings object (may be partial)
 * @returns Complete settings object with defaults applied
 */
export function mergeSettings(saved: any): AppSettings {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...saved,
    overlay: {
      ...DEFAULT_OVERLAY,
      ...(saved?.overlay ? normalizeOverlayColors(saved.overlay) : {}),
    },
  };

  // Normalize backgroundColor if present
  if (merged.backgroundColor && typeof merged.backgroundColor === 'string') {
    merged.backgroundColor = normalizeToRgba(merged.backgroundColor);
  }

  return merged;
}

/**
 * Validates settings object structure.
 * 
 * @param settings - Settings object to validate
 * @returns True if settings are valid
 */
export function validateSettings(settings: any): settings is AppSettings {
  if (!settings || typeof settings !== 'object') return false;
  
  // Basic type checks
  if (typeof settings.scale !== 'number') return false;
  if (typeof settings.x !== 'number') return false;
  if (typeof settings.y !== 'number') return false;
  
  return true;
}

