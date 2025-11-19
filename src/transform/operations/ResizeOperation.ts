/**
 * ResizeOperation.ts
 * 
 * Resize operation for TransformEngine v1.
 * 
 * This module handles element resizing with proper support for rotated elements.
 * It fixes Bug #2: rotated elements resizing incorrectly.
 * 
 * Key Fix: Resize delta is calculated in element's local coordinate space,
 * accounting for rotation. This ensures rotated elements resize correctly
 * regardless of their rotation angle.
 * 
 * Design Decisions:
 * - Aspect ratio lock is always ON (default behavior)
 * - Center-origin transforms (element center stays fixed during resize)
 * - All 8 handles supported (4 corners + 4 edges, including NE)
 */

import type { OverlayElement, MetricElementData, TextElementData, DividerElementData } from '../../types/overlay';
import type { ResizeHandle } from '../engine/HandlePositioning';
import { 
  createRotationMatrix,
  applyMatrixToPoint,
} from '../engine/TransformMatrix';

/**
 * Resize operation result.
 */
export interface ResizeResult {
  /** Updated element with new size */
  element: OverlayElement;
  /** New size value (numberSize for metric, textSize for text) */
  newSize: number;
}

/**
 * Resize operation configuration.
 */
export interface ResizeOperationConfig {
  /** Offset scale factor (preview to LCD) */
  offsetScale: number;
  /** Preview container bounding rect */
  previewRect: DOMRect;
  /** Initial mouse position when resize started (in screen coordinates) */
  startMousePos: { x: number; y: number };
  /** Initial element size when resize started */
  initialSize: number;
}

/**
 * Size constraints for element types.
 */
const SIZE_CONSTRAINTS = {
  metric: { min: 20, max: 500 },
  text: { min: 6, max: 200 },
  divider: {
    width: { min: 1, max: 400 }, // Thickness constraints (width) - allows strong vertical bars
    height: { min: 10, max: 640 }, // Length constraints (height) - covers full LCD height
  },
} as const;

/**
 * Resize speed factor (normalizes mouse movement to size delta).
 */
const RESIZE_SPEED_FACTOR = 0.6;

/**
 * Resize speed factor for divider elements (slower for fine control).
 */
const DIVIDER_RESIZE_SPEED_FACTOR = 0.1;

/**
 * Resizes an element based on handle position and mouse movement.
 * 
 * This function properly handles rotated elements by:
 * 1. Converting mouse movement to element's local coordinate space
 * 2. Calculating resize delta based on handle direction in local space
 * 3. Applying aspect ratio lock (always ON)
 * 4. Applying size constraints
 * 
 * Bug #2 Fix: Resize delta is now calculated in local coordinates,
 * accounting for element rotation. This ensures correct resize behavior
 * for rotated elements.
 * 
 * @param element - Element to resize
 * @param handle - Resize handle being dragged
 * @param currentMousePos - Current mouse position in screen coordinates
 * @param config - Resize operation configuration
 * @returns Updated element with new size
 */
export function resizeElement(
  element: OverlayElement,
  handle: ResizeHandle,
  currentMousePos: { x: number; y: number },
  config: ResizeOperationConfig
): ResizeResult {
  // Only metric, text, and divider elements can be resized
  if (element.type !== 'metric' && element.type !== 'text' && element.type !== 'divider') {
    return {
      element,
      newSize: getElementSize(element),
    };
  }
  
  // Calculate mouse movement in screen coordinates
  const screenDelta = {
    x: currentMousePos.x - config.startMousePos.x,
    y: currentMousePos.y - config.startMousePos.y,
  };
  
  // Convert screen delta to LCD delta
  const lcdDelta = {
    x: screenDelta.x / config.offsetScale,
    y: screenDelta.y / config.offsetScale,
  };
  
  // Get element's rotation angle
  const angle = element.angle ?? 0;
  
  // Divider is a rectangle element - use generic rectangle resize (no aspect ratio lock)
  // Width and height are independent dimensions
  if (element.type === 'divider') {
    return resizeDividerRectangle(
      element,
      handle,
      lcdDelta,
      angle,
      config
    );
  }
  
  // For metric and text elements, use aspect ratio lock (always ON)
  // Calculate resize delta in element's local coordinate space
  // WHY: This is the critical fix for Bug #2. When an element is rotated,
  // the mouse movement is in global (screen) coordinates, but resize should
  // happen in the element's local coordinate space. We transform the delta
  // by rotating it by -angle to get it in local space, then calculate resize
  // direction based on handle position in local space.
  const localDelta = calculateResizeDeltaInLocalSpace(
    handle,
    lcdDelta,
    angle
  );
  
  // Calculate new size
  // For aspect ratio lock (always ON), we use the larger delta
  const sizeDelta = Math.abs(localDelta.x) > Math.abs(localDelta.y)
    ? localDelta.x
    : localDelta.y;
  
  const targetSize = config.initialSize + sizeDelta * RESIZE_SPEED_FACTOR;
  
  // Apply size constraints
  const constraints = element.type === 'metric' 
    ? SIZE_CONSTRAINTS.metric 
    : SIZE_CONSTRAINTS.text;
  const constrainedSize = Math.max(
    constraints.min,
    Math.min(constraints.max, targetSize)
  );
  
  // Update element
  const updatedElement = updateElementSize(element, constrainedSize);
  
  return {
    element: updatedElement,
    newSize: constrainedSize,
  };
}

/**
 * Calculates resize delta in element's local coordinate space.
 * 
 * This transforms the mouse movement delta from global (LCD) coordinates
 * to the element's local coordinate space, accounting for rotation.
 * 
 * @param handle - Resize handle being dragged
 * @param lcdDelta - Mouse movement in LCD coordinates
 * @param angle - Element rotation angle in degrees
 * @returns Resize delta in local coordinates
 */
function calculateResizeDeltaInLocalSpace(
  handle: ResizeHandle,
  lcdDelta: { x: number; y: number },
  angle: number
): { x: number; y: number } {
  // If element is not rotated, use delta directly
  if (angle === 0) {
    return calculateResizeDeltaForHandle(handle, lcdDelta);
  }
  
  // Transform delta to local coordinate space
  // WHY: Mouse movement is in global coordinates, but resize should happen
  // in element's local space. We rotate the delta by -angle to "undo" the
  // element's rotation, bringing the delta into local coordinate space.
  // Example: If element is rotated 45°, we rotate delta by -45° to get
  // the movement direction relative to the element's orientation.
  const rotationMatrix = createRotationMatrix(-angle);
  const localDelta = applyMatrixToPoint(rotationMatrix, lcdDelta.x, lcdDelta.y);
  
  // Calculate resize direction in local space
  return calculateResizeDeltaForHandle(handle, localDelta);
}

/**
 * Calculates resize delta based on handle direction.
 * 
 * This determines how the mouse movement should affect the element size
 * based on which handle is being dragged.
 * 
 * @param handle - Resize handle
 * @param delta - Movement delta (in local or global coordinates)
 * @returns Resize delta with direction
 */
function calculateResizeDeltaForHandle(
  handle: ResizeHandle,
  delta: { x: number; y: number }
): { x: number; y: number } {
  // Determine resize direction based on handle
  const direction = getResizeDirection(handle);
  
  let deltaX = 0;
  let deltaY = 0;
  
  if (direction.horizontal !== 'none' && direction.vertical !== 'none') {
    // Corner handle: use diagonal distance
    const diagonalDistance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    const sign = getCornerHandleSign(handle, delta);
    const diagonalDelta = diagonalDistance * sign;
    
    // For aspect ratio lock, apply to both axes equally
    deltaX = diagonalDelta;
    deltaY = diagonalDelta;
  } else if (direction.horizontal !== 'none') {
    // Horizontal handle (E/W)
    if (direction.horizontal === 'left') {
      // Left handle: moving left increases size
      deltaX = -delta.x;
    } else {
      // Right handle: moving right increases size
      deltaX = delta.x;
    }
    // For aspect ratio lock, apply to Y as well
    deltaY = deltaX;
  } else if (direction.vertical !== 'none') {
    // Vertical handle (N/S)
    if (direction.vertical === 'top') {
      // Top handle: moving up increases size
      deltaY = -delta.y;
    } else {
      // Bottom handle: moving down increases size
      deltaY = delta.y;
    }
    // For aspect ratio lock, apply to X as well
    deltaX = deltaY;
  }
  
  return { x: deltaX, y: deltaY };
}

/**
 * Gets resize direction from handle position.
 */
function getResizeDirection(handle: ResizeHandle): {
  horizontal: 'left' | 'right' | 'none';
  vertical: 'top' | 'bottom' | 'none';
} {
  return {
    horizontal: handle.includes('w') ? 'left' : handle.includes('e') ? 'right' : 'none',
    vertical: handle.includes('n') ? 'top' : handle.includes('s') ? 'bottom' : 'none',
  };
}

/**
 * Gets sign for corner handle resize direction.
 * 
 * Determines whether the corner handle movement increases or decreases size.
 */
function getCornerHandleSign(
  handle: ResizeHandle,
  delta: { x: number; y: number }
): number {
  // Moving away from center increases size
  // This is determined by the handle position and movement direction
  if (handle === 'nw') {
    // NW: moving left or up increases
    return (delta.x < 0 || delta.y < 0) ? 1 : -1;
  } else if (handle === 'ne') {
    // NE: moving right or up increases
    return (delta.x > 0 || delta.y < 0) ? 1 : -1;
  } else if (handle === 'sw') {
    // SW: moving left or down increases
    return (delta.x < 0 || delta.y > 0) ? 1 : -1;
  } else if (handle === 'se') {
    // SE: moving right or down increases
    return (delta.x > 0 || delta.y > 0) ? 1 : -1;
  }
  return 1;
}

/**
 * Gets current element size.
 * For metric/text: returns numberSize/textSize.
 * For divider: returns width (for undo/redo consistency).
 */
function getElementSize(element: OverlayElement): number {
  if (element.type === 'metric') {
    const data = element.data as MetricElementData;
    return data.numberSize || 180;
  } else if (element.type === 'text') {
    const data = element.data as TextElementData;
    return data.textSize || 45;
  } else if (element.type === 'divider') {
    const data = element.data as DividerElementData;
    return data.width || 2;
  }
  return 0;
}

/**
 * Resizes a divider element as a rectangle.
 * 
 * Divider is a rectangle element - width and height are independent.
 * Resize rules (same as any rectangle):
 * - Left/Right handles: resize width (thickness)
 * - Top/Bottom handles: resize height (length)
 * - Corner handles: resize both independently (no aspect ratio lock)
 * 
 * @param element - Divider element to resize
 * @param handle - Resize handle being dragged
 * @param lcdDelta - Mouse movement in LCD coordinates
 * @param angle - Element rotation angle in degrees
 * @param config - Resize operation configuration (initialSize not used for divider)
 * @returns Updated divider element
 */
function resizeDividerRectangle(
  element: OverlayElement,
  handle: ResizeHandle,
  lcdDelta: { x: number; y: number },
  angle: number,
  _config: ResizeOperationConfig
): ResizeResult {
  const data = element.data as DividerElementData;
  
  // CRITICAL FIX: Use the EXACT same delta calculation as metric/text elements
  // This ensures divider resize speed matches metric/text exactly.
  // The calculateResizeDeltaInLocalSpace function handles rotation and handle direction correctly.
  const localDelta = calculateResizeDeltaInLocalSpace(
    handle,
    lcdDelta,
    angle
  );
  
  // Get current values (already in LCD pixels)
  let currentWidth = data.width || 2;
  let currentHeight = data.height || 384; // Default 60% of 640px LCD
  
  // CRITICAL: For divider, width and height are independent (no aspect ratio lock)
  // But we use the same delta calculation as metric/text for consistency.
  // 
  // For edge handles: calculateResizeDeltaForHandle applies the same delta to both axes
  // (for aspect ratio lock), but for divider we only use the relevant axis.
  // For corner handles: both axes get the diagonal delta (same as metric/text).
  const direction = getResizeDirection(handle);
  
  if (direction.horizontal !== 'none' && direction.vertical !== 'none') {
    // Corner handle: resize both width and height independently
    // localDelta.x and localDelta.y are both the diagonal delta (from calculateResizeDeltaForHandle)
    // Use either one (they're the same for corner handles)
    const delta = localDelta.x; // or localDelta.y, they're equal for corner handles
    currentWidth = currentWidth + delta * DIVIDER_RESIZE_SPEED_FACTOR;
    currentHeight = currentHeight + delta * DIVIDER_RESIZE_SPEED_FACTOR;
    
  } else if (direction.horizontal !== 'none') {
    // Horizontal handle (Left/Right): resize width only
    // localDelta.x has the correct sign and value (from calculateResizeDeltaForHandle)
    // localDelta.y is the same as localDelta.x (aspect ratio lock), but we ignore it for divider
    currentWidth = currentWidth + localDelta.x * DIVIDER_RESIZE_SPEED_FACTOR;
    
  } else if (direction.vertical !== 'none') {
    // Vertical handle (Top/Bottom): resize height only
    // localDelta.y has the correct sign and value (from calculateResizeDeltaForHandle)
    // localDelta.x is the same as localDelta.y (aspect ratio lock), but we ignore it for divider
    currentHeight = currentHeight + localDelta.y * DIVIDER_RESIZE_SPEED_FACTOR;
  }
  
  // Apply constraints
  const widthConstraints = SIZE_CONSTRAINTS.divider.width;
  const constrainedWidth = Math.max(
    widthConstraints.min,
    Math.min(widthConstraints.max, currentWidth)
  );
  
  const heightConstraints = SIZE_CONSTRAINTS.divider.height;
  const constrainedHeight = Math.max(
    heightConstraints.min,
    Math.min(heightConstraints.max, currentHeight)
  );
  
  // Update element
  const updatedElement: OverlayElement = {
    ...element,
    data: {
      ...data,
      width: constrainedWidth,
      height: constrainedHeight,
    },
  };
  
  // Return width as newSize for consistency (undo/redo uses it)
  return {
    element: updatedElement,
    newSize: constrainedWidth,
  };
}

/**
 * Updates element size.
 */
function updateElementSize(
  element: OverlayElement,
  newSize: number
): OverlayElement {
  if (element.type === 'metric') {
    return {
      ...element,
      data: {
        ...(element.data as MetricElementData),
        numberSize: newSize,
      },
    };
  } else if (element.type === 'text') {
    return {
      ...element,
      data: {
        ...(element.data as TextElementData),
        textSize: newSize,
      },
    };
  } else if (element.type === 'divider') {
    // This function is only used for metric/text, divider uses resizeDividerRectangle
    return element;
  }
  return element;
}

