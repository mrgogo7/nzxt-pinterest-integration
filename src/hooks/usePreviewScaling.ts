import { useMemo } from 'react';
import { calculateOffsetScale } from '../utils/positioning';
import { NZXT_DEFAULTS } from '../constants/nzxt';

/**
 * Hook for calculating preview scaling factors.
 * 
 * CRITICAL: offsetScale formula must be preserved (previewSize / lcdResolution)
 * 
 * @param previewSize - Preview circle size (default: 200px)
 * @returns Object with offsetScale and overlayPreviewScale
 */
export function usePreviewScaling(previewSize: number = 200) {
  const lcdResolution = typeof window !== 'undefined' && window.nzxt?.v1?.width 
    ? window.nzxt.v1.width 
    : NZXT_DEFAULTS.LCD_WIDTH;

  const offsetScale = useMemo(
    () => calculateOffsetScale(previewSize, lcdResolution),
    [previewSize, lcdResolution]
  );

  // Scale factor for overlay preview (200px preview / 640px LCD)
  const overlayPreviewScale = useMemo(
    () => previewSize / lcdResolution,
    [previewSize, lcdResolution]
  );

  return {
    offsetScale,
    overlayPreviewScale,
    lcdResolution,
  };
}

