import { useMemo } from 'react';
import { DEFAULT_OVERLAY, type Overlay, type OverlaySettings, isOverlay, isLegacyOverlaySettings } from '../types/overlay';
import { ensureOverlayFormat } from '../utils/overlayMigration';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for computing overlay configuration from settings.
 * 
 * Fully migrated to element-based system.
 * - Returns new Overlay model (mode: "none" | "custom", elements[])
 * - Automatically migrates legacy OverlaySettings if detected
 * - Migration is done in useMemo for performance
 * 
 * @param settings - Current app settings
 * @returns Computed overlay configuration (always Overlay type)
 */
export function useOverlayConfig(settings: AppSettings): Overlay {
  const overlayConfig = useMemo(() => {
    // No overlay in settings
    if (!settings.overlay) {
      return DEFAULT_OVERLAY;
    }

    // Check if it's already the new format
    if (isOverlay(settings.overlay)) {
      return settings.overlay;
    }

    // Check if it's legacy format
    if (isLegacyOverlaySettings(settings.overlay)) {
      try {
        // Migrate legacy format to new format
        return ensureOverlayFormat(settings.overlay as OverlaySettings);
      } catch (error) {
        // Migration failed - return default
        console.warn('[useOverlayConfig] Migration failed, using default overlay:', error);
        return DEFAULT_OVERLAY;
      }
    }

    // Invalid/corrupted data - return default
    console.warn('[useOverlayConfig] Invalid overlay data, using default overlay');
    return DEFAULT_OVERLAY;
  }, [settings.overlay]);

  return overlayConfig;
}

