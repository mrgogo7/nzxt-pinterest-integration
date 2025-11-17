import { useMemo } from 'react';
import { DEFAULT_OVERLAY } from '../types/overlay';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for computing overlay configuration from settings.
 * 
 * Merges DEFAULT_OVERLAY with settings.overlay to create the final overlay config.
 * 
 * @param settings - Current app settings
 * @returns Computed overlay configuration
 */
export function useOverlayConfig(settings: AppSettings) {
  const overlayConfig = useMemo(
    () => ({
      ...DEFAULT_OVERLAY,
      ...(settings.overlay || {}),
    }),
    [settings.overlay]
  );

  return overlayConfig;
}

