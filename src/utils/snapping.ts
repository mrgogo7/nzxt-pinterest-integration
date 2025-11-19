/**
 * Snapping and alignment utilities for overlay elements.
 * Provides smart guides and alignment detection.
 */

import type { OverlayElement } from '../types/overlay';
import { getElementBounds } from './boundaries';

/**
 * Snapping thresholds in LCD pixels.
 * Soft, magnetic, escapable snapping behavior.
 */
const SNAP_THRESHOLD = 5; // Distance at which snapping becomes active (reduced for natural feel)
const SNAP_ESCAPE_TOLERANCE = 15; // Distance needed to escape snapping once engaged (larger for easy escape)
const SNAP_SMOOTHING_FACTOR = 0.3; // Interpolation factor for smooth magnetic pull (0-1, lower = smoother)

/**
 * Alignment guide types.
 */
export type AlignmentGuide = 
  | { type: 'center-x'; x: number }
  | { type: 'center-y'; y: number }
  | { type: 'edge-left'; x: number }
  | { type: 'edge-right'; x: number }
  | { type: 'edge-top'; y: number }
  | { type: 'edge-bottom'; y: number };

/**
 * Snapping result containing the snapped position and active guides.
 */
export interface SnappingResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
  isSnapped: boolean;
}

/**
 * Snapping state to track escape behavior.
 */
interface SnappingState {
  lastSnappedX: number | null;
  lastSnappedY: number | null;
  escapeVelocityX: number;
  escapeVelocityY: number;
}

/**
 * Detects alignment between elements and returns snapping guides.
 * Only shows guides when within threshold for better UX.
 */
export function detectAlignment(
  draggedElement: OverlayElement,
  otherElements: OverlayElement[],
  offsetScale: number
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const draggedBounds = getElementBounds(draggedElement, offsetScale);

  // Center alignment (0, 0) - only show if within threshold
  const centerDistanceX = Math.abs(draggedElement.x);
  const centerDistanceY = Math.abs(draggedElement.y);
  
  // Show center guides if within threshold (escape is handled in applySnapping)
  if (centerDistanceX < SNAP_THRESHOLD) {
    guides.push({ type: 'center-x', x: 0 });
  }
  if (centerDistanceY < SNAP_THRESHOLD) {
    guides.push({ type: 'center-y', y: 0 });
  }

  // Check alignment with other elements
  for (const otherElement of otherElements) {
    if (otherElement.id === draggedElement.id) continue;
    
    const otherBounds = getElementBounds(otherElement, offsetScale);
    
    // Center X alignment - show if within threshold (escape handled in applySnapping)
    const centerXDiff = Math.abs(draggedElement.x - otherElement.x);
    if (centerXDiff < SNAP_THRESHOLD) {
      guides.push({ type: 'center-x', x: otherElement.x });
    }
    
    // Center Y alignment - show if within threshold (escape handled in applySnapping)
    const centerYDiff = Math.abs(draggedElement.y - otherElement.y);
    if (centerYDiff < SNAP_THRESHOLD) {
      guides.push({ type: 'center-y', y: otherElement.y });
    }
    
    // Left edge alignment
    const leftDiff = Math.abs(draggedBounds.left - otherBounds.left);
    if (leftDiff < SNAP_THRESHOLD) {
      guides.push({ type: 'edge-left', x: otherBounds.left });
    }
    
    // Right edge alignment
    const rightDiff = Math.abs(draggedBounds.right - otherBounds.right);
    if (rightDiff < SNAP_THRESHOLD) {
      guides.push({ type: 'edge-right', x: otherBounds.right });
    }
    
    // Top edge alignment
    const topDiff = Math.abs(draggedBounds.top - otherBounds.top);
    if (topDiff < SNAP_THRESHOLD) {
      guides.push({ type: 'edge-top', y: otherBounds.top });
    }
    
    // Bottom edge alignment
    const bottomDiff = Math.abs(draggedBounds.bottom - otherBounds.bottom);
    if (bottomDiff < SNAP_THRESHOLD) {
      guides.push({ type: 'edge-bottom', y: otherBounds.bottom });
    }
  }

  return guides;
}

/**
 * Applies soft, magnetic snapping to a position based on detected guides.
 * Uses smooth interpolation for natural feel, not hard snapping.
 */
export function applySnapping(
  x: number,
  y: number,
  guides: AlignmentGuide[],
  snappingState?: SnappingState
): SnappingResult {
  let snappedX = x;
  let snappedY = y;
  let isSnapped = false;

  // Find the closest snap points
  let closestX: { value: number; distance: number } | null = null;
  let closestY: { value: number; distance: number } | null = null;

  for (const guide of guides) {
    switch (guide.type) {
      case 'center-x': {
        const distance = Math.abs(x - guide.x);
        if (!closestX || distance < closestX.distance) {
          closestX = { value: guide.x, distance };
        }
        break;
      }
      case 'center-y': {
        const distance = Math.abs(y - guide.y);
        if (!closestY || distance < closestY.distance) {
          closestY = { value: guide.y, distance };
        }
        break;
      }
      case 'edge-left':
      case 'edge-right':
        // For edge alignment, we need to adjust based on element bounds
        // This is handled in the drag handler with element bounds
        break;
      case 'edge-top':
      case 'edge-bottom':
        // For edge alignment, we need to adjust based on element bounds
        // This is handled in the drag handler with element bounds
        break;
    }
  }

  // Apply soft magnetic snapping with smooth interpolation
  if (closestX && closestX.distance < SNAP_THRESHOLD) {
    // Check escape tolerance - if we were previously snapped to this point, check distance from it
    const wasSnappedToThis = snappingState?.lastSnappedX === closestX.value;
    const distanceFromLastSnap = wasSnappedToThis ? Math.abs(x - closestX.value) : 0;
    const isEscaping = wasSnappedToThis && distanceFromLastSnap > SNAP_ESCAPE_TOLERANCE;
    
    if (!isEscaping) {
      // Smooth interpolation: closer = stronger pull
      const pullStrength = 1 - (closestX.distance / SNAP_THRESHOLD);
      const interpolatedPull = pullStrength * SNAP_SMOOTHING_FACTOR;
      snappedX = x + (closestX.value - x) * interpolatedPull;
      isSnapped = true;
    }
  }

  if (closestY && closestY.distance < SNAP_THRESHOLD) {
    // Check escape tolerance - if we were previously snapped to this point, check distance from it
    const wasSnappedToThis = snappingState?.lastSnappedY === closestY.value;
    const distanceFromLastSnap = wasSnappedToThis ? Math.abs(y - closestY.value) : 0;
    const isEscaping = wasSnappedToThis && distanceFromLastSnap > SNAP_ESCAPE_TOLERANCE;
    
    if (!isEscaping) {
      // Smooth interpolation: closer = stronger pull
      const pullStrength = 1 - (closestY.distance / SNAP_THRESHOLD);
      const interpolatedPull = pullStrength * SNAP_SMOOTHING_FACTOR;
      snappedY = y + (closestY.value - y) * interpolatedPull;
      isSnapped = true;
    }
  }

  return { 
    x: snappedX, 
    y: snappedY, 
    guides,
    isSnapped 
  };
}

/**
 * Exports for use in drag handlers.
 */
export { SNAP_THRESHOLD, SNAP_ESCAPE_TOLERANCE, type SnappingState };

