/**
 * UnifiedOverlayRenderer
 * 
 * Renders overlay elements from an element array.
 * 
 * This component is responsible for rendering all overlay elements in the correct
 * z-index order with proper transform application.
 * 
 * Transform Order (Bug #3 Fix):
 * - CSS transforms are applied right-to-left
 * - Correct order: translate first, then rotate
 * - This ensures element is positioned correctly before rotation
 * 
 * Performance optimization with memoization.
 */

import { memo } from 'react';
import type { Overlay, OverlayMetrics } from '../../types/overlay';
import OverlayElementRenderer from './OverlayElementRenderer';

interface UnifiedOverlayRendererProps {
  overlay: Overlay;
  metrics: OverlayMetrics;
  scale?: number;
}

/**
 * UnifiedOverlayRenderer
 * Renders all overlay elements in the correct z-index order.
 */
function UnifiedOverlayRenderer({
  overlay,
  metrics,
  scale = 1,
}: UnifiedOverlayRendererProps) {
  if (overlay.mode === 'none' || !overlay.elements || overlay.elements.length === 0) {
    return null;
  }

  // Sort elements by zIndex (default to array index if not set)
  const sortedElements = [...overlay.elements].sort((a, b) => {
    const aZ = a.zIndex !== undefined ? a.zIndex : overlay.elements.indexOf(a);
    const bZ = b.zIndex !== undefined ? b.zIndex : overlay.elements.indexOf(b);
    return aZ - bZ;
  });

  return (
    <>
      {sortedElements.map((element) => {
        const angle = element.angle ?? 0;
        
        // Transform order: translate → rotate (applied right-to-left in CSS)
        // WHY: We position the element first, then rotate it around its center.
        // This ensures rotated elements appear at the correct position.
        const transform = angle !== 0
          ? `translate(calc(-50% + ${element.x * scale}px), calc(-50% + ${element.y * scale}px)) rotate(${angle}deg)`
          : `translate(calc(-50% + ${element.x * scale}px), calc(-50% + ${element.y * scale}px))`;
        
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: '50%',  // Center of preview circle
              top: '50%',   // Center of preview circle
              transform,    // Position and rotate element
              transformOrigin: 'center center', // Rotate around center
              pointerEvents: 'none', // Elements don't capture mouse events (handled by OverlayPreview)
              zIndex: element.zIndex !== undefined ? element.zIndex : 0,
            }}
          >
            <OverlayElementRenderer
              element={element}
              metrics={metrics}
              scale={scale}
            />
          </div>
        );
      })}
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(UnifiedOverlayRenderer);

