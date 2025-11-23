/**
 * Overlay Preset Utilities
 * 
 * Utility functions for overlay preset operations.
 */

import type { OverlayElement } from '../types/overlay';

/**
 * Generate unique element ID.
 * Uses timestamp + random string for uniqueness.
 */
export function generateElementId(): string {
  return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Assign IDs to template elements.
 * Preserves all other properties (zIndex, angle, data, etc.)
 * 
 * @param elements - Array of elements without IDs
 * @returns Array of OverlayElement with assigned IDs
 */
export function assignIdsToElements(
  elements: Omit<OverlayElement, 'id'>[]
): OverlayElement[] {
  return elements.map(element => ({
    ...element,
    id: generateElementId(),
  }));
}

/**
 * Normalize zIndex values for template elements when appending.
 * Finds the highest zIndex in existing elements and offsets template elements accordingly.
 * 
 * @param existingElements - Current overlay elements
 * @param newElements - Template elements to be appended
 * @returns New elements with normalized zIndex values
 */
export function normalizeZIndexForAppend(
  existingElements: OverlayElement[],
  newElements: OverlayElement[]
): OverlayElement[] {
  if (existingElements.length === 0) {
    return newElements; // No normalization needed if no existing elements
  }
  
  // Find highest zIndex in existing elements
  const maxZIndex = Math.max(...existingElements.map(el => el.zIndex ?? 0));
  
  // Normalize new elements: offset by maxZIndex + 1 to ensure they appear above
  return newElements.map(element => ({
    ...element,
    zIndex: (element.zIndex ?? 0) + maxZIndex + 1,
  }));
}

