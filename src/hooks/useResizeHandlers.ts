/**
 * Hook for managing element resize handlers.
 * 
 * Handles resize for metric and text elements with min/max constraints.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { canResizeElement } from '../utils/resize';
import { resizeElement, type ResizeOperationConfig } from '../transform/operations/ResizeOperation';
import type { ResizeHandle } from '../transform/engine/HandlePositioning';
import type { Overlay } from '../types/overlay';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for managing element resize.
 * 
 * Supports undo/redo via onResizeComplete callback.
 */
export function useResizeHandlers(
  offsetScale: number,
  settingsRef: React.MutableRefObject<AppSettings>,
  setSettings: (settings: AppSettings) => void,
  onResizeComplete?: (elementId: string, oldSize: number, newSize: number) => void
) {
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const resizeStart = useRef<{ 
    startX: number; 
    startY: number; 
    elementId: string;
    handle: ResizeHandle;
    initialSize: number;
  } | null>(null);

  const handleResizeMouseDown = useCallback((
    elementId: string,
    handle: ResizeHandle,
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
    
    if (!element || !canResizeElement(element)) return;
    
    // Get initial size
    let initialSize = 0;
    if (element.type === 'metric') {
      initialSize = (element.data as any).numberSize || 180;
    } else if (element.type === 'text') {
      initialSize = (element.data as any).textSize || 45;
    }
    
    setResizingElementId(elementId);
    resizeStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      elementId,
      handle,
      initialSize,
    };
  }, [settingsRef]);

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeStart.current) return;

    // Get preview container for ResizeOperation
    const previewContainer = document.querySelector('.overlay-preview');
    if (!previewContainer) return;
    const previewRect = previewContainer.getBoundingClientRect();

    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay;
    
    if (!currentOverlay || typeof currentOverlay !== 'object' || !('elements' in currentOverlay)) {
      return;
    }
    
    const overlay = currentOverlay as Overlay;
    const elementIndex = overlay.elements.findIndex(el => el.id === resizeStart.current!.elementId);
    
    if (elementIndex !== -1) {
      const element = overlay.elements[elementIndex];
      
      // Use new ResizeOperation (Bug #2 fix)
      const resizeConfig: ResizeOperationConfig = {
        offsetScale,
        previewRect,
        startMousePos: {
          x: resizeStart.current.startX,
          y: resizeStart.current.startY,
        },
        initialSize: resizeStart.current.initialSize,
      };
      
      const result = resizeElement(
        element,
        resizeStart.current.handle,
        { x: e.clientX, y: e.clientY },
        resizeConfig
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
  }, [offsetScale, setSettings, settingsRef]);

  const handleResizeMouseUp = useCallback(() => {
    // Record resize action for undo/redo
    if (resizeStart.current && onResizeComplete) {
      const currentSettings = settingsRef.current;
      const currentOverlay = currentSettings.overlay;
      if (currentOverlay && typeof currentOverlay === 'object' && 'elements' in currentOverlay) {
        const overlay = currentOverlay as Overlay;
        const element = overlay.elements.find(el => el.id === resizeStart.current!.elementId);
        if (element) {
          let currentSize = 0;
          if (element.type === 'metric') {
            currentSize = (element.data as any).numberSize || 180;
          } else if (element.type === 'text') {
            currentSize = (element.data as any).textSize || 45;
          }
          
          // Only record if size actually changed
          if (currentSize !== resizeStart.current.initialSize) {
            onResizeComplete(
              resizeStart.current.elementId,
              resizeStart.current.initialSize,
              currentSize
            );
          }
        }
      }
    }
    
    setResizingElementId(null);
    resizeStart.current = null;
  }, [onResizeComplete, settingsRef]);

  // Event listeners for resize
  useEffect(() => {
    if (resizingElementId) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [resizingElementId, handleResizeMouseMove, handleResizeMouseUp]);

  return {
    resizingElementId,
    handleResizeMouseDown,
  };
}

