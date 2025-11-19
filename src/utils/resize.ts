/**
 * Resize utilities for overlay elements.
 * Handles resize constraints and size calculations.
 * 
 * Refined resize UX - stable, predictable, smooth.
 */

import type { OverlayElement, MetricElementData, TextElementData } from '../types/overlay';

/**
 * Resize constants for smooth, controlled resizing.
 * Adjusted for natural, responsive resize feel.
 */
export const RESIZE_SPEED_FACTOR = 0.6; // Normalizes mouse movement to size delta (increased for responsiveness)
export const RESIZE_SMOOTHING_FACTOR = 0.15; // Interpolation factor for smooth resize (reduced for more direct control)
export const RESIZE_MAX_STEP = 30; // Maximum size change per frame (increased to allow larger movements)
export const RESIZE_MIN_STEP = 1; // Minimum size change per frame (ensures responsiveness)

/**
 * Minimum and maximum size constraints for element types.
 */
export const SIZE_CONSTRAINTS = {
  metric: {
    numberSize: { min: 20, max: 500 },
  },
  text: {
    textSize: { min: 6, max: 200 },
  },
  divider: {
    thickness: { min: 1, max: 20 },
    width: { min: 10, max: 100 },
  },
} as const;

/**
 * Resize handle positions.
 */
export type ResizeHandle = 
  | 'nw' | 'n' | 'ne'
  | 'w' | 'e'
  | 'sw' | 's' | 'se';

/**
 * Resize direction based on handle.
 */
export interface ResizeDirection {
  horizontal: 'left' | 'right' | 'none';
  vertical: 'top' | 'bottom' | 'none';
}

/**
 * Gets resize direction from handle position.
 */
export function getResizeDirection(handle: ResizeHandle): ResizeDirection {
  return {
    horizontal: handle.includes('w') ? 'left' : handle.includes('e') ? 'right' : 'none',
    vertical: handle.includes('n') ? 'top' : handle.includes('s') ? 'bottom' : 'none',
  };
}

/**
 * Constrains a size value within min/max bounds.
 */
export function constrainSize(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates resize delta based on handle position and mouse movement.
 * Proper direction detection and normalized delta.
 * 
 * @param handle - Resize handle position
 * @param dx - Mouse movement in X direction (preview pixels)
 * @param dy - Mouse movement in Y direction (preview pixels)
 * @param offsetScale - Scale factor for converting preview to LCD pixels
 * @param clampDelta - Whether to clamp delta to RESIZE_MAX_STEP (default: false for total movement)
 */
export function calculateResizeDelta(
  handle: ResizeHandle,
  dx: number,
  dy: number,
  offsetScale: number,
  clampDelta: boolean = false
): number {
  const direction = getResizeDirection(handle);
  
  // Convert preview pixels to LCD pixels
  const lcdDx = dx / offsetScale;
  const lcdDy = dy / offsetScale;
  
  let delta = 0;
  
  if (direction.horizontal !== 'none' && direction.vertical !== 'none') {
    // Corner handle: Figma/Canva standard behavior
    // Use diagonal distance and determine sign based on handle position
    const diagonalDistance = Math.sqrt(lcdDx * lcdDx + lcdDy * lcdDy);
    
    // Determine if we're increasing or decreasing based on handle and movement direction
    // Standard behavior: moving away from center = increase
    let isIncreasing = false;
    
    if (handle === 'nw') {
      // NW: LEFT (dx < 0) or UP (dy < 0) → increase
      isIncreasing = lcdDx < 0 || lcdDy < 0;
    } else if (handle === 'ne') {
      // NE: RIGHT (dx > 0) or UP (dy < 0) → increase
      isIncreasing = lcdDx > 0 || lcdDy < 0;
    } else if (handle === 'sw') {
      // SW: LEFT (dx < 0) or DOWN (dy > 0) → increase
      isIncreasing = lcdDx < 0 || lcdDy > 0;
    } else if (handle === 'se') {
      // SE: RIGHT (dx > 0) or DOWN (dy > 0) → increase
      isIncreasing = lcdDx > 0 || lcdDy > 0;
    }
    
    // Apply speed factor and set sign
    delta = diagonalDistance * RESIZE_SPEED_FACTOR;
    delta = isIncreasing ? delta : -delta;
    
  } else if (direction.horizontal !== 'none') {
    // Horizontal handle (E/W) - Figma/Canva standard
    if (direction.horizontal === 'left') {
      // Left handle (W): moving LEFT (dx < 0) → increase, moving RIGHT (dx > 0) → decrease
      delta = -lcdDx * RESIZE_SPEED_FACTOR; // Invert: left movement = positive delta
    } else {
      // Right handle (E): moving RIGHT (dx > 0) → increase, moving LEFT (dx < 0) → decrease
      delta = lcdDx * RESIZE_SPEED_FACTOR; // Direct: right movement = positive delta
    }
  } else if (direction.vertical !== 'none') {
    // Vertical handle (N/S) - Figma/Canva standard
    if (direction.vertical === 'top') {
      // Top handle (N): moving UP (dy < 0) → increase, moving DOWN (dy > 0) → decrease
      delta = -lcdDy * RESIZE_SPEED_FACTOR; // Invert: up movement = positive delta
    } else {
      // Bottom handle (S): moving DOWN (dy > 0) → increase, moving UP (dy < 0) → decrease
      delta = lcdDy * RESIZE_SPEED_FACTOR; // Direct: down movement = positive delta
    }
  }
  
  // Clamp delta only if requested (for frame-based incremental deltas)
  // Total movement should not be clamped to allow proportional resize
  if (clampDelta) {
    delta = Math.max(-RESIZE_MAX_STEP, Math.min(RESIZE_MAX_STEP, delta));
  }
  
  // Ensure minimum step for responsiveness (only for very small movements)
  if (Math.abs(delta) > 0 && Math.abs(delta) < RESIZE_MIN_STEP) {
    delta = delta > 0 ? RESIZE_MIN_STEP : -RESIZE_MIN_STEP;
  }
  
  return delta;
}

/**
 * Applies smoothing interpolation to resize delta.
 */
export function applyResizeSmoothing(
  currentSize: number,
  targetSize: number
): number {
  const delta = targetSize - currentSize;
  const smoothedDelta = delta * RESIZE_SMOOTHING_FACTOR;
  return currentSize + smoothedDelta;
}

/**
 * Resizes a metric element's numberSize with smoothing.
 */
export function resizeMetricElement(
  element: OverlayElement,
  delta: number,
  useSmoothing: boolean = false
): OverlayElement {
  if (element.type !== 'metric') return element;
  
  const data = element.data as MetricElementData;
  const currentSize = data.numberSize;
  const targetSize = currentSize + delta;
  
  // Apply smoothing if requested
  const newSize = useSmoothing
    ? applyResizeSmoothing(currentSize, targetSize)
    : targetSize;
  
  const constrainedSize = constrainSize(
    newSize,
    SIZE_CONSTRAINTS.metric.numberSize.min,
    SIZE_CONSTRAINTS.metric.numberSize.max
  );
  
  return {
    ...element,
    data: {
      ...data,
      numberSize: constrainedSize,
    },
  };
}

/**
 * Resizes a text element's textSize with smoothing.
 */
export function resizeTextElement(
  element: OverlayElement,
  delta: number,
  useSmoothing: boolean = false
): OverlayElement {
  if (element.type !== 'text') return element;
  
  const data = element.data as TextElementData;
  const currentSize = data.textSize;
  const targetSize = currentSize + delta;
  
  // Apply smoothing if requested
  const newSize = useSmoothing
    ? applyResizeSmoothing(currentSize, targetSize)
    : targetSize;
  
  const constrainedSize = constrainSize(
    newSize,
    SIZE_CONSTRAINTS.text.textSize.min,
    SIZE_CONSTRAINTS.text.textSize.max
  );
  
  return {
    ...element,
    data: {
      ...data,
      textSize: constrainedSize,
    },
  };
}

/**
 * Checks if an element can be resized.
 */
export function canResizeElement(element: OverlayElement): boolean {
  return element.type === 'metric' || element.type === 'text';
}

