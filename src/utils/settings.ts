import { DEFAULT_SETTINGS, type AppSettings } from '../constants/defaults';
import { DEFAULT_OVERLAY } from '../types/overlay';

/**
 * Merges saved settings with defaults, ensuring all fields are present.
 * 
 * @param saved - Saved settings object (may be partial)
 * @returns Complete settings object with defaults applied
 */
export function mergeSettings(saved: any): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    overlay: {
      ...DEFAULT_OVERLAY,
      ...(saved?.overlay || {}),
    },
  };
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

