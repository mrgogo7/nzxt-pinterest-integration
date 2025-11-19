/**
 * Hook for managing element rotation handlers.
 * 
 * Supports smooth rotation and snapping.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { rotateElement, type RotateOperationConfig } from '../transform/operations/RotateOperation';
import type { Overlay } from '../types/overlay';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for managing element rotation.
 * 
 * Supports undo/redo via onRotateComplete callback.
 */
export function useRotationHandlers(
  _offsetScale: number,
  settingsRef: React.MutableRefObject<AppSettings>,
  setSettings: (settings: AppSettings) => void,
  onRotateComplete?: (elementId: string, oldAngle: number | undefined, newAngle: number | undefined) => void
) {
  const [rotatingElementId, setRotatingElementId] = useState<string | null>(null);
  const rotationStart = useRef<{
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
    elementId: string;
    initialAngle: number;
  } | null>(null);

  const handleRotationMouseDown = useCallback((
    elementId: string,
    _centerX: number,
    _centerY: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay;
    
    if (!currentOverlay || typeof currentOverlay !== 'object' || !('elements' in currentOverlay)) {
      return;
    }
    
    const overlay = currentOverlay as Overlay;
    const element = overlay.elements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // Get current element angle
    const currentElementAngle = element.angle ?? 0;
    
    // centerX and centerY are in preview coordinates
    // We need to convert them to LCD coordinates for RotateOperation
    // But actually, RotateOperation expects element center in LCD coordinates
    // So we need to convert preview center to LCD center
    const previewContainer = document.querySelector('.overlay-preview');
    if (!previewContainer) return;
    
    // Element center in LCD coordinates is element.x, element.y
    // But centerX, centerY passed here are in preview coordinates
    // We need to convert preview coordinates to LCD coordinates
    // Actually, let's use element.x, element.y directly as element center
    const elementCenter = { x: element.x, y: element.y };
    
    setRotatingElementId(elementId);
    rotationStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      centerX: elementCenter.x,
      centerY: elementCenter.y,
      elementId,
      initialAngle: currentElementAngle,
    };
  }, [settingsRef]);

  const handleRotationMouseMove = useCallback((e: MouseEvent) => {
    if (!rotationStart.current) return;

    // Get preview container for RotateOperation
    const previewContainer = document.querySelector('.overlay-preview');
    if (!previewContainer) return;
    const previewRect = previewContainer.getBoundingClientRect();

    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay;
    
    if (!currentOverlay || typeof currentOverlay !== 'object' || !('elements' in currentOverlay)) {
      return;
    }
    
    const overlay = currentOverlay as Overlay;
    const elementIndex = overlay.elements.findIndex(el => el.id === rotationStart.current!.elementId);
    
    if (elementIndex !== -1) {
      const element = overlay.elements[elementIndex];
      
      // Use new RotateOperation (Bug #7 fix)
      const rotateConfig: RotateOperationConfig = {
        offsetScale: _offsetScale,
        previewRect,
        startMousePos: {
          x: rotationStart.current.startX,
          y: rotationStart.current.startY,
        },
        initialAngle: rotationStart.current.initialAngle,
        elementCenter: {
          x: rotationStart.current.centerX,
          y: rotationStart.current.centerY,
        },
      };
      
      const result = rotateElement(
        element,
        { x: e.clientX, y: e.clientY },
        rotateConfig
      );
      
      const updatedElements = [...overlay.elements];
      updatedElements[elementIndex] = result.element;
      
      setSettings({
        ...currentSettings,
        overlay: {
          ...overlay,
          elements: updatedElements,
        },
      });
    }
  }, [_offsetScale, setSettings, settingsRef]);

  const handleRotationMouseUp = useCallback(() => {
    // Record rotate action for undo/redo
    if (rotationStart.current && onRotateComplete) {
      const currentSettings = settingsRef.current;
      const currentOverlay = currentSettings.overlay;
      if (currentOverlay && typeof currentOverlay === 'object' && 'elements' in currentOverlay) {
        const overlay = currentOverlay as Overlay;
        const element = overlay.elements.find(el => el.id === rotationStart.current!.elementId);
        if (element) {
          const currentAngle = element.angle ?? 0;
          const initialAngle = rotationStart.current.initialAngle;
          
          // Only record if angle actually changed
          if (currentAngle !== initialAngle) {
            onRotateComplete(
              rotationStart.current.elementId,
              initialAngle === 0 ? undefined : initialAngle,
              currentAngle === 0 ? undefined : currentAngle
            );
          }
        }
      }
    }
    
    setRotatingElementId(null);
    rotationStart.current = null;
  }, [onRotateComplete, settingsRef]);

  // Event listeners for rotation
  useEffect(() => {
    if (rotatingElementId) {
      window.addEventListener('mousemove', handleRotationMouseMove);
      window.addEventListener('mouseup', handleRotationMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleRotationMouseMove);
        window.removeEventListener('mouseup', handleRotationMouseUp);
      };
    }
  }, [rotatingElementId, handleRotationMouseMove, handleRotationMouseUp]);

  return {
    rotatingElementId,
    handleRotationMouseDown,
  };
}

