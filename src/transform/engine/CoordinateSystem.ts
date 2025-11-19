/**
 * CoordinateSystem.ts
 * 
 * Coordinate system utilities for TransformEngine v1.
 * 
 * This module provides the single source of truth for coordinate transformations
 * between different coordinate spaces:
 * 
 * 1. **LCD Coordinate Space (Canonical)**
 *    - Real LCD resolution (e.g., 640x640)
 *    - Center at (0, 0)
 *    - This is where all state is stored
 * 
 * 2. **Preview Coordinate Space**
 *    - Scaled preview representation (e.g., 200x200)
 *    - Center at (0, 0)
 *    - Used for visual feedback in ConfigPreview
 * 
 * 3. **Screen Coordinate Space**
 *    - Browser viewport coordinates
 *    - Used for mouse event handling
 * 
 * 4. **Local Coordinate Space (Element)**
 *    - Element's own coordinate system
 *    - Center at (0, 0) relative to element
 *    - Rotated by element's angle
 * 
 * All transformations are pure functions and maintain consistency
 * between LCD and Preview spaces.
 */

import { NZXT_DEFAULTS } from '../../constants/nzxt';
import type { TransformMatrix } from './TransformMatrix';
import { applyMatrixToPoint, applyInverseMatrixToPoint } from './TransformMatrix';

/**
 * Coordinate system configuration.
 */
export interface CoordinateSystemConfig {
  /** Preview circle size in pixels (default: 200px) */
  previewSize: number;
  /** LCD resolution in pixels (default: 640px) */
  lcdResolution: number;
}

/**
 * Default coordinate system configuration.
 */
const DEFAULT_CONFIG: CoordinateSystemConfig = {
  previewSize: 200,
  lcdResolution: NZXT_DEFAULTS.LCD_WIDTH,
};

/**
 * Calculates the offset scale factor between preview and LCD.
 * 
 * CRITICAL FORMULA: offsetScale = previewSize / lcdResolution
 * 
 * This formula converts coordinates between the preview circle and the LCD.
 * Example: 200 / 640 = 0.3125 means 1 LCD pixel = 0.3125 preview pixels.
 * 
 * WHY THIS FORMULA IS CRITICAL:
 * - This formula solved persistent drag positioning issues in the past
 * - Any change to this formula will break drag positioning accuracy
 * - Both ConfigPreview and KrakenOverlay depend on this exact calculation
 * 
 * @param config - Coordinate system configuration
 * @returns Offset scale factor
 */
export function calculateOffsetScale(
  config: CoordinateSystemConfig = DEFAULT_CONFIG
): number {
  return config.previewSize / config.lcdResolution;
}

/**
 * Converts a value from LCD coordinate space to preview coordinate space.
 * 
 * @param lcdValue - Value in LCD pixels
 * @param offsetScale - Offset scale factor (from calculateOffsetScale)
 * @returns Value in preview pixels
 */
export function lcdToPreview(
  lcdValue: number,
  offsetScale: number
): number {
  return lcdValue * offsetScale;
}

/**
 * Converts a value from preview coordinate space to LCD coordinate space.
 * 
 * @param previewValue - Value in preview pixels
 * @param offsetScale - Offset scale factor (from calculateOffsetScale)
 * @returns Value in LCD pixels (rounded)
 */
export function previewToLcd(
  previewValue: number,
  offsetScale: number
): number {
  return Math.round(previewValue / offsetScale);
}

/**
 * Converts a point from LCD coordinate space to preview coordinate space.
 * 
 * @param point - Point in LCD coordinates
 * @param offsetScale - Offset scale factor
 * @returns Point in preview coordinates
 */
export function lcdPointToPreview(
  point: { x: number; y: number },
  offsetScale: number
): { x: number; y: number } {
  return {
    x: lcdToPreview(point.x, offsetScale),
    y: lcdToPreview(point.y, offsetScale),
  };
}

/**
 * Converts a point from preview coordinate space to LCD coordinate space.
 * 
 * @param point - Point in preview coordinates
 * @param offsetScale - Offset scale factor
 * @returns Point in LCD coordinates (rounded)
 */
export function previewPointToLcd(
  point: { x: number; y: number },
  offsetScale: number
): { x: number; y: number } {
  return {
    x: previewToLcd(point.x, offsetScale),
    y: previewToLcd(point.y, offsetScale),
  };
}

/**
 * Converts mouse screen coordinates to preview coordinates.
 * 
 * This is used for mouse event handling in the preview canvas.
 * 
 * @param mouseX - Mouse X in screen coordinates
 * @param mouseY - Mouse Y in screen coordinates
 * @param previewRect - Preview container's bounding rect
 * @returns Point in preview coordinates (center-relative)
 */
export function screenToPreview(
  mouseX: number,
  mouseY: number,
  previewRect: DOMRect
): { x: number; y: number } {
  // Preview center in screen coordinates
  const previewCenterX = previewRect.left + previewRect.width / 2;
  const previewCenterY = previewRect.top + previewRect.height / 2;
  
  // Convert to preview coordinates (center-relative)
  return {
    x: mouseX - previewCenterX,
    y: mouseY - previewCenterY,
  };
}

/**
 * Converts mouse screen coordinates to LCD coordinates.
 * 
 * This combines screen → preview → LCD conversion.
 * 
 * @param mouseX - Mouse X in screen coordinates
 * @param mouseY - Mouse Y in screen coordinates
 * @param previewRect - Preview container's bounding rect
 * @param offsetScale - Offset scale factor
 * @returns Point in LCD coordinates (center-relative)
 */
export function screenToLcd(
  mouseX: number,
  mouseY: number,
  previewRect: DOMRect,
  offsetScale: number
): { x: number; y: number } {
  const previewPoint = screenToPreview(mouseX, mouseY, previewRect);
  return previewPointToLcd(previewPoint, offsetScale);
}

/**
 * Transforms a point from local (element) coordinate space to global (LCD) coordinate space.
 * 
 * This applies the element's transform (rotation, scale, translation).
 * 
 * @param localPoint - Point in local coordinates
 * @param elementTransform - Element's transform matrix (from TransformMatrix)
 * @returns Point in global (LCD) coordinates
 */
export function localToGlobal(
  localPoint: { x: number; y: number },
  elementTransform: TransformMatrix
): { x: number; y: number } {
  return applyMatrixToPoint(elementTransform, localPoint.x, localPoint.y);
}

/**
 * Transforms a point from global (LCD) coordinate space to local (element) coordinate space.
 * 
 * This is the inverse of localToGlobal.
 * 
 * @param globalPoint - Point in global (LCD) coordinates
 * @param elementTransform - Element's transform matrix
 * @returns Point in local coordinates
 */
export function globalToLocal(
  globalPoint: { x: number; y: number },
  elementTransform: TransformMatrix
): { x: number; y: number } {
  return applyInverseMatrixToPoint(elementTransform, globalPoint.x, globalPoint.y);
}

/**
 * Transforms a mouse delta from screen coordinates to element's local coordinate space.
 * 
 * This is critical for correct move/resize behavior with rotated elements.
 * 
 * Steps:
 * 1. Convert screen delta to LCD delta
 * 2. Transform LCD delta to element's local coordinate space
 * 
 * @param screenDelta - Mouse movement in screen coordinates
 * @param previewRect - Preview container's bounding rect
 * @param offsetScale - Offset scale factor
 * @param elementTransform - Element's transform matrix
 * @returns Delta in element's local coordinate space
 */
export function screenDeltaToLocal(
  screenDelta: { x: number; y: number },
  _previewRect: DOMRect,
  offsetScale: number,
  elementTransform: TransformMatrix
): { x: number; y: number } {
  // Convert screen delta to LCD delta
  const lcdDelta = previewPointToLcd(screenDelta, offsetScale);
  
  // Transform LCD delta to local coordinates
  // We need to transform the delta vector, not a point
  // For a delta, we transform it as if it's a point at origin
  const localDelta = applyInverseMatrixToPoint(
    elementTransform,
    lcdDelta.x,
    lcdDelta.y
  );
  
  return localDelta;
}

/**
 * Gets the default coordinate system configuration.
 * 
 * @returns Default configuration
 */
export function getDefaultConfig(): CoordinateSystemConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Creates a coordinate system configuration with custom values.
 * 
 * @param previewSize - Preview circle size
 * @param lcdResolution - LCD resolution
 * @returns Configuration object
 */
export function createConfig(
  previewSize: number,
  lcdResolution: number = NZXT_DEFAULTS.LCD_WIDTH
): CoordinateSystemConfig {
  return {
    previewSize,
    lcdResolution,
  };
}

