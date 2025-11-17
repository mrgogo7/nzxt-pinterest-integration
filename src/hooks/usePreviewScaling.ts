import { useMemo } from 'react';
import { calculateOffsetScale } from '../utils/positioning';
import { NZXT_DEFAULTS } from '../constants/nzxt';

/**
 * Hook for calculating preview scaling factors.
 * 
 * CRITICAL: offsetScale formula must be preserved (previewSize / lcdResolution)
 * 
 * This hook calculates scaling factors needed to convert between preview coordinates
 * (200px circle in ConfigPreview) and LCD coordinates (640px circle in KrakenOverlay).
 * 
 * ARCHITECTURAL DECISION:
 * - Preview size is hardcoded to 200px (ConfigPreview preview circle)
 * - LCD resolution is 640px (NZXT Kraken Elite default, or from NZXT API)
 * - Scale factor is used for all drag positioning calculations
 * - Both offsetScale and overlayPreviewScale use the same formula
 * 
 * AI CONTRIBUTORS:
 * - DO NOT change the default previewSize without updating ConfigPreview CSS
 * - DO NOT modify the offsetScale formula (see positioning.ts for details)
 * - If LCD resolution changes, ensure NZXT API provides correct value
 * 
 * @param previewSize - Preview circle size (default: 200px, MUST match ConfigPreview)
 * @returns Object with offsetScale, overlayPreviewScale, and lcdResolution
 */
export function usePreviewScaling(previewSize: number = 200) {
  // Get LCD resolution from NZXT API or use default
  // In NZXT CAM, window.nzxt.v1.width provides actual LCD width
  // In browser, use default 640px (NZXT Kraken Elite standard)
  const lcdResolution = typeof window !== 'undefined' && window.nzxt?.v1?.width 
    ? window.nzxt.v1.width 
    : NZXT_DEFAULTS.LCD_WIDTH;

  // CRITICAL: This formula converts preview pixels to LCD pixels
  // Used for drag positioning in ConfigPreview
  const offsetScale = useMemo(
    () => calculateOffsetScale(previewSize, lcdResolution),
    [previewSize, lcdResolution]
  );

  // Scale factor for overlay preview rendering
  // Same formula as offsetScale, used for scaling overlay components
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

