import type { AppSettings } from '../constants/defaults';
import { NZXT_DEFAULTS } from '../constants/nzxt';

/**
 * Base position coordinates for alignment.
 */
export interface BasePosition {
  x: number;
  y: number;
}

/**
 * Gets base position percentages based on alignment setting.
 * 
 * @param align - Alignment setting
 * @returns Base position with x and y percentages
 */
export function getBaseAlign(
  align: AppSettings['align']
): BasePosition {
  switch (align) {
    case 'top':
      return { x: 50, y: 0 };
    case 'bottom':
      return { x: 50, y: 100 };
    case 'left':
      return { x: 0, y: 50 };
    case 'right':
      return { x: 100, y: 50 };
    default:
      return { x: 50, y: 50 }; // center
  }
}

/**
 * Generates CSS object-position string from alignment and offsets.
 * 
 * @param align - Alignment setting
 * @param x - X offset in pixels
 * @param y - Y offset in pixels
 * @returns CSS object-position string
 */
export function getObjectPosition(
  align: AppSettings['align'],
  x: number,
  y: number
): string {
  const base = getBaseAlign(align);
  return `calc(${base.x}% + ${x}px) calc(${base.y}% + ${y}px)`;
}

/**
 * Calculates offset scale between preview and LCD resolution.
 * 
 * CRITICAL FORMULA: offsetScale = previewSize / lcdResolution
 * 
 * This formula converts coordinates between the 200px preview circle and the 640px LCD.
 * Example: 200 / 640 = 0.3125 means 1 LCD pixel = 0.3125 preview pixels.
 * 
 * WHY THIS FORMULA IS CRITICAL:
 * - This formula solved persistent drag positioning issues in the past
 * - Any change to this formula will break drag positioning accuracy
 * - Both ConfigPreview and KrakenOverlay depend on this exact calculation
 * - The preview uses 200px circle, LCD uses 640px circle, scale MUST match
 * 
 * AI CONTRIBUTORS: DO NOT modify this formula without extensive testing.
 * Test drag positioning in both preview and actual LCD display.
 * 
 * @param previewSize - Preview circle size (default: 200px, MUST match ConfigPreview preview size)
 * @param lcdResolution - LCD resolution (default: 640px, MUST match NZXT Kraken Elite LCD)
 * @returns Offset scale factor (typically 0.3125 for 200/640)
 */
export function calculateOffsetScale(
  previewSize: number = 200,
  lcdResolution: number = NZXT_DEFAULTS.LCD_WIDTH
): number {
  return previewSize / lcdResolution;
}

/**
 * Converts preview pixel to LCD pixel.
 * 
 * @param previewPixel - Pixel value in preview coordinates
 * @param offsetScale - Offset scale factor
 * @returns LCD pixel value (rounded)
 */
export function previewToLcd(
  previewPixel: number,
  offsetScale: number
): number {
  return Math.round(previewPixel / offsetScale);
}

/**
 * Converts LCD pixel to preview pixel.
 * 
 * @param lcdPixel - Pixel value in LCD coordinates
 * @param offsetScale - Offset scale factor
 * @returns Preview pixel value
 */
export function lcdToPreview(
  lcdPixel: number,
  offsetScale: number
): number {
  return lcdPixel * offsetScale;
}

