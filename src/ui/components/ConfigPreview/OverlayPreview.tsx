import UnifiedOverlayRenderer from '../UnifiedOverlayRenderer';
import type { Overlay, OverlayMetrics } from '../../../types/overlay';
import type { Lang, t as tFunction } from '../../../i18n';
import { lcdToPreview } from '../../../utils/positioning';
import type { AlignmentGuide } from '../../../utils/snapping';
import { canResizeElement } from '../../../utils/resize';
import { RotateCw } from 'lucide-react';
import { 
  calculateAABB,
} from '../../../transform/engine/BoundingBox';
import { 
  calculateHandlePositions,
  getAllResizeHandlePositions,
  type ResizeHandle,
} from '../../../transform/engine/HandlePositioning';
import '../../styles/TransformHandles.css';
import '../../styles/BoundingBox.css';

interface OverlayPreviewProps {
  overlayConfig: Overlay;
  metrics: OverlayMetrics;
  overlayPreviewScale: number;
  offsetScale: number;
  overlayAdjX: number;
  overlayAdjY: number;
  draggingElementId: string | null;
  selectedElementId: string | null;
  onElementMouseDown: (elementId: string, e: React.MouseEvent) => void;
  activeGuides: AlignmentGuide[];
  resizingElementId: string | null;
  onResizeMouseDown: (elementId: string, handle: ResizeHandle, e: React.MouseEvent) => void;
  rotatingElementId: string | null;
  onRotationMouseDown: (elementId: string, centerX: number, centerY: number, e: React.MouseEvent) => void;
  isRealDataReceived: boolean;
  lang: Lang;
  t: typeof tFunction;
}

/**
 * Overlay preview component.
 * Displays overlay preview with element-based rendering and drag support.
 * 
 * Fully migrated to element-based system:
 * - Uses UnifiedOverlayRenderer for all element types
 * - Unified element drag handlers for all element types
 * - Element-based hit area calculation
 */
export default function OverlayPreview({
  overlayConfig,
  metrics,
  overlayPreviewScale,
  offsetScale,
  overlayAdjX,
  overlayAdjY,
  draggingElementId,
  selectedElementId,
  onElementMouseDown,
  activeGuides,
  resizingElementId,
  onResizeMouseDown,
  rotatingElementId,
  onRotationMouseDown,
  isRealDataReceived,
  lang,
  t,
}: OverlayPreviewProps) {
  return (
    <div className="preview-column">
      {overlayConfig.mode !== 'none' ? (
        <>
          <div className="preview-title">{t('overlayPreviewTitle', lang)}</div>
          <div
            className={`preview-circle overlay-preview ${draggingElementId ? 'dragging' : ''}`}
            style={{ position: 'relative', width: '200px', height: '200px' }}
          >
            {/* Alignment guides */}
            {activeGuides.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              >
                {activeGuides.map((guide, index) => {
                  if (guide.type === 'center-x' || guide.type === 'edge-left' || guide.type === 'edge-right') {
                    const x = lcdToPreview(guide.x, offsetScale);
                    return (
                      <div
                        key={`guide-x-${index}`}
                        style={{
                          position: 'absolute',
                          left: `calc(50% + ${x}px)`,
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          background: 'rgba(0, 200, 255, 0.8)',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    );
                  } else if (guide.type === 'center-y' || guide.type === 'edge-top' || guide.type === 'edge-bottom') {
                    const y = lcdToPreview(guide.y, offsetScale);
                    return (
                      <div
                        key={`guide-y-${index}`}
                        style={{
                          position: 'absolute',
                          top: `calc(50% + ${y}px)`,
                          left: 0,
                          right: 0,
                          height: '1px',
                          background: 'rgba(0, 200, 255, 0.8)',
                          transform: 'translateY(-50%)',
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Unified overlay renderer for all elements */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translate(${overlayAdjX}px, ${overlayAdjY}px)`,
                pointerEvents: 'none',
              }}
            >
              <UnifiedOverlayRenderer
                overlay={overlayConfig}
                metrics={metrics}
                scale={overlayPreviewScale}
              />
            </div>
            
            {/* Unified element drag handlers for all element types */}
            {overlayConfig.mode === 'custom' && overlayConfig.elements && overlayConfig.elements.length > 0 && (
              <>
                {overlayConfig.elements.map((element) => {
                  const elementX = lcdToPreview(element.x, offsetScale);
                  const elementY = lcdToPreview(element.y, offsetScale);
                  const isDraggingThis = draggingElementId === element.id;
                  const isSelected = selectedElementId === element.id;
                  const isResizingThis = resizingElementId === element.id;
                  const isRotatingThis = rotatingElementId === element.id;
                  const canResize = canResizeElement(element);
                  
                  // Calculate AABB (Axis-Aligned Bounding Box) for element
                  // WHY: AABB is used for visual bounding box (Figma-style).
                  // Even when elements are rotated, the bounding box remains axis-aligned.
                  const aabb = calculateAABB(element);
                  
                  // Convert AABB to preview coordinates for rendering
                  const aabbAtPosition = {
                    left: elementX + lcdToPreview(aabb.left, offsetScale),
                    right: elementX + lcdToPreview(aabb.right, offsetScale),
                    top: elementY + lcdToPreview(aabb.top, offsetScale),
                    bottom: elementY + lcdToPreview(aabb.bottom, offsetScale),
                    width: lcdToPreview(aabb.width, offsetScale),
                    height: lcdToPreview(aabb.height, offsetScale),
                  };
                  
                  // Get handle positions from HandlePositioning system (only when selected)
                  // WHY: Handle positions are expensive to calculate, so we only do it for selected elements.
                  const handlePositions = isSelected ? calculateHandlePositions(element) : null;
                  
                  // Calculate hit area based on AABB (for selection)
                  // WHY: AABB is used for hit detection (Figma-style). This ensures consistent
                  // selection behavior regardless of element rotation.
                  const hitAreaWidth = aabbAtPosition.width;
                  const hitAreaHeight = aabbAtPosition.height;
                  
                  // Get element label (same as OverlaySettings)
                  const getElementLabel = (): string => {
                    if (element.type === 'metric') {
                      const metricElements = overlayConfig.elements.filter(el => el.type === 'metric');
                      const metricIndex = metricElements.findIndex(el => el.id === element.id);
                      const readingLabels = [
                        t('firstReading', lang),
                        t('secondReading', lang),
                        t('thirdReading', lang),
                        t('fourthReading', lang),
                        t('fifthReading', lang),
                        t('sixthReading', lang),
                        t('seventhReading', lang),
                        t('eighthReading', lang),
                      ];
                      return readingLabels[metricIndex] || `${metricIndex + 1}${metricIndex === 0 ? 'st' : metricIndex === 1 ? 'nd' : metricIndex === 2 ? 'rd' : 'th'} ${t('reading', lang)}`;
                    } else if (element.type === 'text') {
                      const textElements = overlayConfig.elements.filter(el => el.type === 'text');
                      const textIndex = textElements.findIndex(el => el.id === element.id);
                      const textLabels = [
                        t('firstText', lang),
                        t('secondText', lang),
                        t('thirdText', lang),
                        t('fourthText', lang),
                      ];
                      return textLabels[textIndex] || `${textIndex + 1}${textIndex === 0 ? 'st' : textIndex === 1 ? 'nd' : textIndex === 2 ? 'rd' : 'th'} ${t('text', lang)}`;
                    } else if (element.type === 'divider') {
                      return t('divider', lang) || 'Divider';
                    }
                    return element.type;
                  };

                  return (
                    <div key={element.id}>
                      {/* Element hit area - using AABB (Figma-style) */}
                      <div
                        data-element-id={element.id}
                        onMouseDown={(e) => {
                          onElementMouseDown(element.id, e);
                        }}
                        style={{
                          position: 'absolute',
                          // Use AABB for hit area (axis-aligned, not rotated)
                          left: `calc(50% + ${aabbAtPosition.left}px)`,
                          top: `calc(50% + ${aabbAtPosition.top}px)`,
                          width: `${hitAreaWidth}px`,
                          height: `${hitAreaHeight}px`,
                          cursor: isDraggingThis ? 'grabbing' : (isSelected ? 'move' : 'grab'),
                          pointerEvents: 'auto',
                          zIndex: element.zIndex !== undefined ? element.zIndex + 100 : 100,
                          // Bounding box outline is shown separately (see below)
                        }}
                      />
                      
                      {/* AABB Bounding Box (Modern Framer-style) - shown when selected */}
                      {/* Resizing state for opacity feedback */}
                      {isSelected && (
                        <div
                          className={`bounding-box ${isDraggingThis ? 'dragging' : ''} ${isResizingThis ? 'resizing' : ''}`}
                          style={{
                            left: `calc(50% + ${aabbAtPosition.left}px)`,
                            top: `calc(50% + ${aabbAtPosition.top}px)`,
                            width: `${aabbAtPosition.width}px`,
                            height: `${aabbAtPosition.height}px`,
                            zIndex: (element.zIndex !== undefined ? element.zIndex : 0) + 150,
                          }}
                        />
                      )}
                      
                      {/* Element label - shown when selected */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            // Label positioned at AABB top-left corner
                            left: `calc(50% + ${aabbAtPosition.left}px)`,
                            top: `calc(50% + ${aabbAtPosition.top}px)`,
                            pointerEvents: 'none',
                            zIndex: (element.zIndex !== undefined ? element.zIndex : 0) + 300,
                            transform: 'translate(-7px, calc(-100% - 5px))',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '10px',
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              userSelect: 'none',
                            }}
                          >
                            {getElementLabel()}
                          </div>
                        </div>
                      )}
                      
                      {/* Rotation handle - positioned at top-right (Figma-style) */}
                      {/* Rotation handle pushed outside bounding box at top-right */}
                      {isSelected && handlePositions && (() => {
                        // Check if this handle is currently being rotated
                        const isActive = rotatingElementId === element.id;
                        
                        // Position rotation handle at top-right corner of bounding box
                        // Calculate top-right corner position in preview coordinates
                        const topRightX = aabbAtPosition.right;
                        const topRightY = aabbAtPosition.top;
                        
                        // Calculate direction from element center to top-right corner
                        const dx = topRightX - elementX;
                        const dy = topRightY - elementY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Normalize direction vector
                        const normX = distance > 0 ? dx / distance : 1;
                        const normY = distance > 0 ? dy / distance : -1;
                        
                        // Add offset to push handle outside bounding box
                        // Rotation handle size is 24px (12px radius), we need at least 12px + spacing
                        const additionalOffset = 14; // Preview pixels - pushes handle outside bounding box
                        const offsetX = normX * additionalOffset;
                        const offsetY = normY * additionalOffset;
                        
                        // Final position: top-right corner + offset
                        const finalX = topRightX + offsetX;
                        const finalY = topRightY + offsetY;
                        
                        // Calculate rotation angle for handle (perpendicular to direction from center to top-right)
                        // For top-right, angle should be approximately 45 degrees (adjusted for element rotation)
                        const handleAngle = handlePositions.rotationHandle.angle;
                        
                        return (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              // Element center in LCD coordinates
                              onRotationMouseDown(element.id, element.x, element.y, e);
                            }}
                            className="rotation-handle-wrapper"
                            style={{
                              position: 'absolute',
                              // Position at top-right corner with offset
                              left: `calc(50% + ${finalX}px)`,
                              top: `calc(50% + ${finalY}px)`,
                              transform: `translate(-50%, -50%) rotate(${handleAngle}deg)`,
                              cursor: rotatingElementId === element.id ? 'grabbing' : 'grab',
                              pointerEvents: 'auto',
                              zIndex: (element.zIndex !== undefined ? element.zIndex : 0) + 250,
                            }}
                          >
                            {/* Figma-style rotation handle with CSS classes */}
                            {/* Rotating state for enhanced visibility */}
                            <div className={`rotation-handle ${isActive ? 'active' : ''} ${isRotatingThis ? 'rotating' : ''}`}>
                              {/* Icon wrapper with counter-rotation to keep icon upright */}
                              <div
                                className="rotation-handle__icon"
                                style={{
                                  transform: `rotate(${-handleAngle}deg)`,
                                }}
                              >
                                <RotateCw size={14} strokeWidth={2} color="rgba(0, 200, 255, 1)" />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Resize handles - all 8 handles (Figma-style) */}
                      {isSelected && canResize && handlePositions && (
                        <>
                          {/* All 8 resize handles: 4 corners + 4 edges */}
                          {getAllResizeHandlePositions(element).map(([handle, handlePos]) => {
                            // Convert LCD coordinates to preview coordinates
                            const handleX = lcdToPreview(handlePos.x, offsetScale);
                            const handleY = lcdToPreview(handlePos.y, offsetScale);
                            
                            // Check if this handle is currently being resized
                            const isActive = resizingElementId === element.id;
                            
                            return (
                              <div
                                key={handle}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  onResizeMouseDown(element.id, handle, e);
                                }}
                                className="resize-handle-wrapper"
                                style={{
                                  position: 'absolute',
                                  left: `calc(50% + ${handleX}px)`,
                                  top: `calc(50% + ${handleY}px)`,
                                  transform: `translate(-50%, -50%) rotate(${handlePos.angle}deg)`,
                                  pointerEvents: 'auto',
                                  zIndex: (element.zIndex !== undefined ? element.zIndex : 0) + 200,
                                  cursor: `${handle}-resize`,
                                }}
                              >
                                {/* Figma-style handle with CSS classes */}
                                {/* Resizing state for opacity feedback */}
                                <div
                                  className={`resize-handle resize-handle--${handle} ${isActive ? 'active' : ''} ${isResizingThis ? 'resizing' : ''}`}
                                />
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {/* Mock data warning */}
          {!isRealDataReceived && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(255, 193, 7, 0.15)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '8px',
                color: '#ffc107',
                fontSize: '11px',
                lineHeight: '1.4',
                textAlign: 'center',
                maxWidth: '200px',
              }}
            >
              {t('mockDataWarning', lang)}
            </div>
          )}
        </>
      ) : (
        <div className="preview-title" style={{ opacity: 0.5 }}>
          {t('overlayPreviewTitle', lang)} - {t('overlayMode', lang)}: None
        </div>
      )}
    </div>
  );
}

