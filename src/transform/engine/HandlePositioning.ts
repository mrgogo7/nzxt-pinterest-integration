/**
 * HandlePositioning.ts
 * 
 * Handle positioning utilities for TransformEngine v1.
 * 
 * This module calculates the positions of resize and rotation handles
 * based on element's bounding box and rotation.
 * 
 * Design Decision: 8 resize handles (4 corners + 4 edges) + 1 rotation handle.
 * Rotation handle is positioned at top-middle, slightly outside the bounding box.
 * 
 * All handle positions are calculated in global (LCD) coordinates.
 */

import type { OverlayElement } from '../../types/overlay';
import { 
  calculateAABB, 
  calculateRotatedBoundingBoxAtPosition,
  type BoundingBox,
} from './BoundingBox';

/**
 * Resize handle positions.
 * Figma-style: 4 corners + 4 edges = 8 handles total.
 */
export type ResizeHandle = 
  | 'nw' | 'n' | 'ne'  // North handles
  | 'w' | 'e'          // East/West handles
  | 'sw' | 's' | 'se'; // South handles

/**
 * Handle position in global (LCD) coordinates.
 */
export interface HandlePosition {
  x: number;
  y: number;
  angle: number; // Rotation angle for handle (to keep it upright)
}

/**
 * All handle positions for an element.
 */
export interface ElementHandlePositions {
  resizeHandles: Map<ResizeHandle, HandlePosition>;
  rotationHandle: HandlePosition;
}

/**
 * Configuration for handle positioning.
 */
export interface HandlePositioningConfig {
  /** Handle size in pixels (for visual rendering) */
  handleSize: number;
  /** Offset from bounding box edge (in pixels) */
  handleOffset: number;
  /** Rotation handle offset from top edge (in pixels) */
  rotationHandleOffset: number;
}

/**
 * Default handle positioning configuration.
 */
const DEFAULT_CONFIG: HandlePositioningConfig = {
  handleSize: 8,
  handleOffset: 4, // Half of handleSize, to center handle on edge
  rotationHandleOffset: 10, // 10px outside bounding box
};

/**
 * Calculates all handle positions for an element.
 * 
 * @param element - Overlay element
 * @param config - Handle positioning configuration
 * @returns All handle positions
 */
export function calculateHandlePositions(
  element: OverlayElement,
  config: HandlePositioningConfig = DEFAULT_CONFIG
): ElementHandlePositions {
  const aabb = calculateAABB(element);
  const angle = element.angle ?? 0;
  
  // Calculate resize handle positions
  const resizeHandles = calculateResizeHandlePositions(element, aabb, angle, config);
  
  // Calculate rotation handle position
  const rotationHandle = calculateRotationHandlePosition(element, aabb, angle, config);
  
  return {
    resizeHandles,
    rotationHandle,
  };
}

/**
 * Calculates resize handle positions.
 * 
 * Handles are positioned at AABB corners and edges.
 * For rotated elements, handles are positioned at the rotated corners/edges.
 * 
 * @param element - Overlay element
 * @param aabb - Axis-aligned bounding box (relative to element center)
 * @param angle - Element rotation angle
 * @param config - Handle positioning configuration
 * @returns Map of handle positions
 */
function calculateResizeHandlePositions(
  element: OverlayElement,
  _aabb: BoundingBox,
  angle: number,
  config: HandlePositioningConfig
): Map<ResizeHandle, HandlePosition> {
  const handles = new Map<ResizeHandle, HandlePosition>();
  
  // Get rotated bounding box corners (in global coordinates)
  const rBox = calculateRotatedBoundingBoxAtPosition(element);
  
  // Corner handles
  handles.set('nw', calculateCornerHandlePosition(rBox.topLeft, angle, config));
  handles.set('ne', calculateCornerHandlePosition(rBox.topRight, angle, config));
  handles.set('sw', calculateCornerHandlePosition(rBox.bottomLeft, angle, config));
  handles.set('se', calculateCornerHandlePosition(rBox.bottomRight, angle, config));
  
  // Edge handles (midpoints of rotated edges)
  const topMid = {
    x: (rBox.topLeft.x + rBox.topRight.x) / 2,
    y: (rBox.topLeft.y + rBox.topRight.y) / 2,
  };
  const rightMid = {
    x: (rBox.topRight.x + rBox.bottomRight.x) / 2,
    y: (rBox.topRight.y + rBox.bottomRight.y) / 2,
  };
  const bottomMid = {
    x: (rBox.bottomLeft.x + rBox.bottomRight.x) / 2,
    y: (rBox.bottomLeft.y + rBox.bottomRight.y) / 2,
  };
  const leftMid = {
    x: (rBox.topLeft.x + rBox.bottomLeft.x) / 2,
    y: (rBox.topLeft.y + rBox.bottomLeft.y) / 2,
  };
  
  handles.set('n', calculateEdgeHandlePosition(topMid, rBox.topLeft, rBox.topRight, angle, config));
  handles.set('e', calculateEdgeHandlePosition(rightMid, rBox.topRight, rBox.bottomRight, angle, config));
  handles.set('s', calculateEdgeHandlePosition(bottomMid, rBox.bottomLeft, rBox.bottomRight, angle, config));
  handles.set('w', calculateEdgeHandlePosition(leftMid, rBox.topLeft, rBox.bottomLeft, angle, config));
  
  return handles;
}

/**
 * Calculates corner handle position.
 * 
 * Handle is positioned at the corner, offset outward along the diagonal.
 * 
 * @param corner - Corner position in global coordinates
 * @param angle - Element rotation angle
 * @param config - Handle positioning configuration
 * @returns Handle position
 */
function calculateCornerHandlePosition(
  corner: { x: number; y: number },
  angle: number,
  config: HandlePositioningConfig
): HandlePosition {
  // Calculate offset direction for corner handle
  // WHY: Corner handles need to be offset outward along the diagonal.
  // We calculate the direction from element center to corner, then offset
  // in that direction. This ensures handles are always outside the bounding box.
  const offset = config.handleOffset;
  
  // Simple offset calculation: offset in the direction away from center
  // WHY: For corner handles, we offset diagonally outward. The sign of the
  // offset is determined by the corner's position relative to element center.
  // This is a simplified approach that works well for our use case.
  const offsetX = offset * (corner.x > 0 ? 1 : -1);
  const offsetY = offset * (corner.y > 0 ? 1 : -1);
  
  return {
    x: corner.x + offsetX,
    y: corner.y + offsetY,
    angle: angle, // Handle rotates with element
  };
}

/**
 * Calculates edge handle position.
 * 
 * Handle is positioned at the edge midpoint, offset outward perpendicular to the edge.
 * 
 * @param midpoint - Edge midpoint in global coordinates
 * @param edgeStart - Edge start point
 * @param edgeEnd - Edge end point
 * @param angle - Element rotation angle
 * @param config - Handle positioning configuration
 * @returns Handle position
 */
function calculateEdgeHandlePosition(
  midpoint: { x: number; y: number },
  edgeStart: { x: number; y: number },
  edgeEnd: { x: number; y: number },
  angle: number,
  config: HandlePositioningConfig
): HandlePosition {
  // Calculate edge direction vector
  const edgeDx = edgeEnd.x - edgeStart.x;
  const edgeDy = edgeEnd.y - edgeStart.y;
  const edgeLength = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
  
  if (edgeLength < 1e-6) {
    // Degenerate edge, return midpoint
    return {
      x: midpoint.x,
      y: midpoint.y,
      angle: angle,
    };
  }
  
  // Normalize edge direction
  const edgeNormX = edgeDx / edgeLength;
  const edgeNormY = edgeDy / edgeLength;
  
  // Calculate perpendicular direction (outward from element)
  // WHY: Edge handles need to be offset perpendicular to the edge, not along it.
  // We rotate the edge direction by 90° counterclockwise to get the perpendicular.
  // Formula: perp = (-edgeNormY, edgeNormX) for 90° CCW rotation
  const perpX = -edgeNormY;
  const perpY = edgeNormX;
  
  // Offset outward along perpendicular
  const offset = config.handleOffset;
  const offsetX = perpX * offset;
  const offsetY = perpY * offset;
  
  return {
    x: midpoint.x + offsetX,
    y: midpoint.y + offsetY,
    angle: angle, // Handle rotates with element
  };
}

/**
 * Calculates rotation handle position.
 * 
 * Rotation handle is positioned at top-middle of bounding box,
 * offset outward to avoid overlap with resize handles.
 * 
 * @param element - Overlay element
 * @param aabb - Axis-aligned bounding box
 * @param angle - Element rotation angle
 * @param config - Handle positioning configuration
 * @returns Rotation handle position
 */
function calculateRotationHandlePosition(
  element: OverlayElement,
  aabb: BoundingBox,
  angle: number,
  config: HandlePositioningConfig
): HandlePosition {
  // Get rotated bounding box
  const rBox = calculateRotatedBoundingBoxAtPosition(element);
  
  // Top edge midpoint
  const topMid = {
    x: (rBox.topLeft.x + rBox.topRight.x) / 2,
    y: (rBox.topLeft.y + rBox.topRight.y) / 2,
  };
  
  // Calculate direction from element center to top midpoint
  const dx = topMid.x - element.x;
  const dy = topMid.y - element.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 1e-6) {
    // Degenerate case, use default offset
    return {
      x: element.x,
      y: element.y - aabb.height / 2 - config.rotationHandleOffset,
      angle: angle,
    };
  }
  
  // Normalize direction
  const normX = dx / distance;
  const normY = dy / distance;
  
  // Offset outward along this direction
  const offset = config.rotationHandleOffset;
  const offsetX = normX * offset;
  const offsetY = normY * offset;
  
  return {
    x: topMid.x + offsetX,
    y: topMid.y + offsetY,
    angle: angle, // Handle rotates with element
  };
}

/**
 * Gets handle position for a specific handle.
 * 
 * @param element - Overlay element
 * @param handle - Handle identifier
 * @param config - Handle positioning configuration
 * @returns Handle position, or null if handle doesn't exist
 */
export function getHandlePosition(
  element: OverlayElement,
  handle: ResizeHandle | 'rotation',
  config: HandlePositioningConfig = DEFAULT_CONFIG
): HandlePosition | null {
  const positions = calculateHandlePositions(element, config);
  
  if (handle === 'rotation') {
    return positions.rotationHandle;
  }
  
  return positions.resizeHandles.get(handle) || null;
}

/**
 * Gets all resize handle positions as an array.
 * 
 * @param element - Overlay element
 * @param config - Handle positioning configuration
 * @returns Array of [handle, position] pairs
 */
export function getAllResizeHandlePositions(
  element: OverlayElement,
  config: HandlePositioningConfig = DEFAULT_CONFIG
): Array<[ResizeHandle, HandlePosition]> {
  const positions = calculateHandlePositions(element, config);
  return Array.from(positions.resizeHandles.entries());
}

