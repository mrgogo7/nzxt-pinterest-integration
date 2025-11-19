/**
 * BoundingBox.ts
 * 
 * Bounding box calculation utilities for TransformEngine v1.
 * 
 * This module provides functions to calculate:
 * 1. Element's actual render dimensions (based on element type and data)
 * 2. Rotated bounding box (RBox) - the actual rotated shape
 * 3. Axis-aligned bounding box (AABB) - the axis-aligned rectangle that contains the rotated shape
 * 
 * Design Decision: AABB is used for visual bounding box (Figma-style).
 * Even when elements are rotated, the bounding box remains axis-aligned.
 */

import type { OverlayElement, MetricElementData, TextElementData, DividerElementData } from '../../types/overlay';
import { NZXT_DEFAULTS } from '../../constants/nzxt';

/**
 * Element dimensions in LCD coordinates.
 */
export interface ElementDimensions {
  width: number;
  height: number;
}

/**
 * Bounding box in LCD coordinates.
 * All coordinates are relative to element center (0, 0).
 */
export interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Rotated bounding box corners.
 * These are the actual corners of the rotated element.
 */
export interface RotatedBoundingBox {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

/**
 * Calculates element dimensions based on element type and data.
 * 
 * This uses the same logic as the renderer to ensure accuracy.
 * 
 * @param element - Overlay element
 * @returns Element dimensions in LCD coordinates
 */
export function calculateElementDimensions(element: OverlayElement): ElementDimensions {
  if (element.type === 'metric') {
    const data = element.data as MetricElementData;
    const numberSize = data.numberSize || 180;
    // Same calculation as boundaries.ts and OverlayPreview.tsx
    return {
      width: numberSize * 1.5,
      height: numberSize * 0.85,
    };
  } else if (element.type === 'text') {
    const data = element.data as TextElementData;
    const textSize = data.textSize || 45;
    const textLength = (data.text || '').length || 1;
    // Same calculation as boundaries.ts and OverlayPreview.tsx
    return {
      width: Math.max(textSize * textLength * 0.6, textSize * 2),
      height: textSize * 1.2,
    };
  } else if (element.type === 'divider') {
    const data = element.data as DividerElementData;
    // Divider is vertical by default
    return {
      width: data.thickness || 2,
      height: NZXT_DEFAULTS.LCD_HEIGHT, // Full height for vertical divider
    };
  }
  
  // Fallback for unknown types
  return { width: 100, height: 100 };
}

/**
 * Calculates the axis-aligned bounding box (AABB) for an element.
 * 
 * This is the bounding box used for visual feedback (Figma-style).
 * It's always axis-aligned, even when the element is rotated.
 * 
 * @param element - Overlay element
 * @returns AABB in LCD coordinates (relative to element center)
 */
export function calculateAABB(element: OverlayElement): BoundingBox {
  const dimensions = calculateElementDimensions(element);
  const angle = element.angle ?? 0;
  
  // If not rotated, AABB is just the element dimensions
  if (angle === 0) {
    const halfWidth = dimensions.width / 2;
    const halfHeight = dimensions.height / 2;
    return {
      left: -halfWidth,
      right: halfWidth,
      top: -halfHeight,
      bottom: halfHeight,
      width: dimensions.width,
      height: dimensions.height,
    };
  }
  
  // For rotated elements, calculate AABB from rotated corners
  // WHY: When an element is rotated, its bounding box becomes larger.
  // We need to find the smallest axis-aligned rectangle that contains
  // the rotated shape. This is done by rotating all corners and finding
  // the min/max X and Y values.
  const rotatedBox = calculateRotatedBoundingBox(dimensions, angle);
  
  // Find min/max X and Y from rotated corners
  // WHY: The AABB is the axis-aligned rectangle that bounds all rotated corners.
  // This gives us the visual bounding box (Figma-style) that users see.
  const corners = [
    rotatedBox.topLeft,
    rotatedBox.topRight,
    rotatedBox.bottomRight,
    rotatedBox.bottomLeft,
  ];
  
  const xs = corners.map(c => c.x);
  const ys = corners.map(c => c.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates the rotated bounding box (RBox) corners for an element.
 * 
 * This returns the actual corners of the rotated element shape.
 * 
 * @param dimensions - Element dimensions
 * @param angle - Rotation angle in degrees
 * @returns Rotated bounding box corners (relative to element center)
 */
export function calculateRotatedBoundingBox(
  dimensions: ElementDimensions,
  angle: number
): RotatedBoundingBox {
  const halfWidth = dimensions.width / 2;
  const halfHeight = dimensions.height / 2;
  
  // Convert angle to radians
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  
  // Corner points in local (unrotated) coordinates
  const corners = [
    { x: -halfWidth, y: -halfHeight }, // top-left
    { x: halfWidth, y: -halfHeight },   // top-right
    { x: halfWidth, y: halfHeight },     // bottom-right
    { x: -halfWidth, y: halfHeight },   // bottom-left
  ];
  
  // Rotate each corner around origin (0, 0)
  // WHY: We rotate around origin (element center) using standard 2D rotation:
  // x' = x*cos(θ) - y*sin(θ)
  // y' = x*sin(θ) + y*cos(θ)
  // This gives us the actual corners of the rotated element shape.
  const rotatePoint = (x: number, y: number) => ({
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  });
  
  const rotatedCorners = corners.map(c => rotatePoint(c.x, c.y));
  
  return {
    topLeft: rotatedCorners[0],
    topRight: rotatedCorners[1],
    bottomRight: rotatedCorners[2],
    bottomLeft: rotatedCorners[3],
  };
}

/**
 * Calculates the AABB for an element at a specific position.
 * 
 * This is useful for checking if an element intersects with boundaries
 * or other elements.
 * 
 * @param element - Overlay element
 * @returns AABB in global (LCD) coordinates
 */
export function calculateAABBAtPosition(element: OverlayElement): BoundingBox {
  const aabb = calculateAABB(element);
  
  // Translate AABB to element's position
  return {
    left: element.x + aabb.left,
    right: element.x + aabb.right,
    top: element.y + aabb.top,
    bottom: element.y + aabb.bottom,
    width: aabb.width,
    height: aabb.height,
  };
}

/**
 * Calculates the rotated bounding box corners at a specific position.
 * 
 * @param element - Overlay element
 * @returns Rotated bounding box corners in global (LCD) coordinates
 */
export function calculateRotatedBoundingBoxAtPosition(
  element: OverlayElement
): RotatedBoundingBox {
  const dimensions = calculateElementDimensions(element);
  const angle = element.angle ?? 0;
  const rotatedBox = calculateRotatedBoundingBox(dimensions, angle);
  
  // Translate corners to element's position
  return {
    topLeft: {
      x: element.x + rotatedBox.topLeft.x,
      y: element.y + rotatedBox.topLeft.y,
    },
    topRight: {
      x: element.x + rotatedBox.topRight.x,
      y: element.y + rotatedBox.topRight.y,
    },
    bottomRight: {
      x: element.x + rotatedBox.bottomRight.x,
      y: element.y + rotatedBox.bottomRight.y,
    },
    bottomLeft: {
      x: element.x + rotatedBox.bottomLeft.x,
      y: element.y + rotatedBox.bottomLeft.y,
    },
  };
}

/**
 * Calculates the combined AABB for multiple elements.
 * 
 * This is useful for multi-select operations.
 * 
 * @param elements - Array of overlay elements
 * @returns Combined AABB in global (LCD) coordinates
 */
export function calculateCombinedAABB(elements: OverlayElement[]): BoundingBox | null {
  if (elements.length === 0) {
    return null;
  }
  
  const aabbs = elements.map(el => calculateAABBAtPosition(el));
  
  const minLeft = Math.min(...aabbs.map(a => a.left));
  const maxRight = Math.max(...aabbs.map(a => a.right));
  const minTop = Math.min(...aabbs.map(a => a.top));
  const maxBottom = Math.max(...aabbs.map(a => a.bottom));
  
  return {
    left: minLeft,
    right: maxRight,
    top: minTop,
    bottom: maxBottom,
    width: maxRight - minLeft,
    height: maxBottom - minTop,
  };
}

/**
 * Checks if a point is inside an element's AABB.
 * 
 * @param point - Point in global (LCD) coordinates
 * @param element - Overlay element
 * @returns True if point is inside AABB
 */
export function isPointInAABB(
  point: { x: number; y: number },
  element: OverlayElement
): boolean {
  const aabb = calculateAABBAtPosition(element);
  return (
    point.x >= aabb.left &&
    point.x <= aabb.right &&
    point.y >= aabb.top &&
    point.y <= aabb.bottom
  );
}

/**
 * Checks if a point is inside an element's rotated bounding box.
 * 
 * This uses point-in-polygon test for the rotated rectangle.
 * 
 * @param point - Point in global (LCD) coordinates
 * @param element - Overlay element
 * @returns True if point is inside rotated bounding box
 */
export function isPointInRotatedBoundingBox(
  point: { x: number; y: number },
  element: OverlayElement
): boolean {
  const rBox = calculateRotatedBoundingBoxAtPosition(element);
  
  // Point-in-polygon test using cross product
  // Check if point is on the same side of all edges
  const corners = [
    rBox.topLeft,
    rBox.topRight,
    rBox.bottomRight,
    rBox.bottomLeft,
  ];
  
  // For each edge, check if point is on the correct side
  for (let i = 0; i < 4; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % 4];
    
    // Vector from p1 to p2
    const edgeX = p2.x - p1.x;
    const edgeY = p2.y - p1.y;
    
    // Vector from p1 to point
    const pointX = point.x - p1.x;
    const pointY = point.y - p1.y;
    
    // Cross product: positive means point is on left side of edge
    // For a convex polygon, all cross products should have the same sign
    const cross = edgeX * pointY - edgeY * pointX;
    
    // First edge determines the sign
    if (i === 0) {
      const expectedSign = cross >= 0 ? 1 : -1;
      // Check remaining edges
      for (let j = 1; j < 4; j++) {
        const p1j = corners[j];
        const p2j = corners[(j + 1) % 4];
        const edgeXj = p2j.x - p1j.x;
        const edgeYj = p2j.y - p1j.y;
        const pointXj = point.x - p1j.x;
        const pointYj = point.y - p1j.y;
        const crossj = edgeXj * pointYj - edgeYj * pointXj;
        if ((crossj >= 0 ? 1 : -1) !== expectedSign) {
          return false;
        }
      }
      return true;
    }
  }
  
  return false;
}

