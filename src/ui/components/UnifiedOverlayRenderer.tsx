/**
 * UnifiedOverlayRenderer
 * Renders overlay elements from an element array.
 * 
 * FAZ1: Simple rendering pipeline - visual accuracy is NOT critical.
 * The goal is to display elements on screen with z-index ordering.
 */

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
export default function UnifiedOverlayRenderer({
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
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${element.x * scale}px), calc(-50% + ${element.y * scale}px))`,
              pointerEvents: 'none',
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

