/**
 * useTransformEngine.ts
 * 
 * React hook wrapper for TransformEngine v1 operations.
 * 
 * This hook provides a unified interface for all transform operations
 * (move, resize, rotate) and manages the state for transform interactions.
 * 
 * NOTE: This hook is currently optional. The existing hooks (useDragHandlers,
 * useResizeHandlers, useRotationHandlers) are still used and have been updated
 * to use the new operations. This hook can be used in the future for a more
 * unified transform interface.
 * 
 * It integrates with the new TransformEngine operations while maintaining
 * compatibility with existing UI components.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { OverlayElement } from '../../types/overlay';
import type { AppSettings } from '../../constants/defaults';
import { moveElement, type MoveOperationConfig } from '../operations/MoveOperation';
import { resizeElement, type ResizeOperationConfig } from '../operations/ResizeOperation';
import { rotateElement, type RotateOperationConfig } from '../operations/RotateOperation';
import { isMetricElementData, isTextElementData } from '../../types/overlay';

/**
 * Transform engine hook configuration.
 */
export interface TransformEngineConfig {
  /** Offset scale factor (preview to LCD) */
  offsetScale: number;
  /** Preview container element (for getting bounding rect) */
  previewContainer?: HTMLElement | null;
}

/**
 * Transform operation state.
 */
export interface TransformState {
  /** Currently dragging element ID */
  draggingElementId: string | null;
  /** Currently resizing element ID */
  resizingElementId: string | null;
  /** Currently rotating element ID */
  rotatingElementId: string | null;
  /** Selected element ID */
  selectedElementId: string | null;
}

/**
 * Hook return value.
 */
export interface UseTransformEngineReturn {
  // State
  state: TransformState;
  
  // Move handlers
  handleElementMouseDown: (elementId: string, e: React.MouseEvent) => void;
  
  // Resize handlers
  handleResizeMouseDown: (elementId: string, handle: import('../engine/HandlePositioning').ResizeHandle, e: React.MouseEvent) => void;
  
  // Rotate handlers
  handleRotationMouseDown: (elementId: string, centerX: number, centerY: number, e: React.MouseEvent) => void;
  
  // Selection
  setSelectedElementId: (id: string | null) => void;
}

/**
 * Hook for managing transform operations.
 * 
 * This hook provides a unified interface for move, resize, and rotate operations
 * using the new TransformEngine operations.
 * 
 * @param config - Transform engine configuration
 * @param settingsRef - Ref to current settings (to avoid stale closures)
 * @param setSettings - Settings setter function
 * @returns Transform engine hook interface
 */
export function useTransformEngine(
  config: TransformEngineConfig,
  settingsRef: React.MutableRefObject<AppSettings>,
  setSettings: (settings: AppSettings) => void
): UseTransformEngineReturn {
  // Transform state
  const [state, setState] = useState<TransformState>({
    draggingElementId: null,
    resizingElementId: null,
    rotatingElementId: null,
    selectedElementId: null,
  });
  
  // Operation start refs
  const moveStart = useRef<{
    elementId: string;
    startMousePos: { x: number; y: number };
  } | null>(null);
  
  const resizeStart = useRef<{
    elementId: string;
    handle: import('../engine/HandlePositioning').ResizeHandle;
    startMousePos: { x: number; y: number };
    initialSize: number;
  } | null>(null);
  
  const rotateStart = useRef<{
    elementId: string;
    elementCenter: { x: number; y: number };
    startMousePos: { x: number; y: number };
    initialAngle: number;
  } | null>(null);
  
  /**
   * Gets preview container bounding rect.
   */
  const getPreviewRect = useCallback((): DOMRect => {
    if (config.previewContainer) {
      return config.previewContainer.getBoundingClientRect();
    }
    
    // Fallback: query selector
    const container = document.querySelector('.overlay-preview');
    if (container) {
      return container.getBoundingClientRect();
    }
    
    // Fallback: return empty rect
    return new DOMRect(0, 0, 200, 200);
  }, [config.previewContainer]);
  
  /**
   * Gets element from settings.
   */
  const getElement = useCallback((elementId: string): OverlayElement | null => {
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay;
    
    if (!currentOverlay || typeof currentOverlay !== 'object' || !('elements' in currentOverlay)) {
      return null;
    }
    
    const overlay = currentOverlay as import('../../types/overlay').Overlay;
    return overlay.elements.find(el => el.id === elementId) || null;
  }, [settingsRef]);
  
  /**
   * Updates element in settings.
   */
  const updateElement = useCallback((element: OverlayElement) => {
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay;
    
    if (!currentOverlay || typeof currentOverlay !== 'object' || !('elements' in currentOverlay)) {
      return;
    }
    
    const overlay = currentOverlay as import('../../types/overlay').Overlay;
    const elementIndex = overlay.elements.findIndex(el => el.id === element.id);
    
    if (elementIndex === -1) {
      return;
    }
    
    const updatedElements = [...overlay.elements];
    updatedElements[elementIndex] = element;
    
    setSettings({
      ...currentSettings,
      overlay: {
        ...overlay,
        elements: updatedElements,
      },
    });
  }, [setSettings, settingsRef]);
  
  // Move handlers
  const handleElementMouseDown = useCallback((elementId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If already selected, start dragging immediately
    if (state.selectedElementId === elementId) {
      setState(prev => ({ ...prev, draggingElementId: elementId }));
      moveStart.current = {
        elementId,
        startMousePos: { x: e.clientX, y: e.clientY },
      };
    } else {
      // First click: just select, don't start dragging
      setState(prev => ({ ...prev, selectedElementId: elementId }));
    }
  }, [state.selectedElementId]);
  
  const handleElementMouseMove = useCallback((e: MouseEvent) => {
    if (!moveStart.current) return;
    
    const element = getElement(moveStart.current.elementId);
    if (!element) return;
    
    const previewRect = getPreviewRect();
    const screenDelta = {
      x: e.clientX - moveStart.current.startMousePos.x,
      y: e.clientY - moveStart.current.startMousePos.y,
    };
    
    const moveConfig: MoveOperationConfig = {
      offsetScale: config.offsetScale,
      previewRect,
    };
    
    const result = moveElement(element, screenDelta, moveConfig);
    updateElement(result.element);
    
    // Update start position for next frame
    moveStart.current.startMousePos = { x: e.clientX, y: e.clientY };
  }, [getElement, getPreviewRect, config.offsetScale, updateElement]);
  
  const handleElementMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, draggingElementId: null }));
    moveStart.current = null;
  }, []);
  
  // Resize handlers
  const handleResizeMouseDown = useCallback((
    elementId: string,
    handle: import('../engine/HandlePositioning').ResizeHandle,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = getElement(elementId);
    if (!element) return;
    
    // Get initial size
    let initialSize = 0;
    if (element.type === 'metric' && isMetricElementData(element.data)) {
      initialSize = element.data.numberSize || 180;
    } else if (element.type === 'text' && isTextElementData(element.data)) {
      initialSize = element.data.textSize || 45;
    } else {
      return; // Only metric and text can be resized
    }
    
    setState(prev => ({ ...prev, resizingElementId: elementId }));
    resizeStart.current = {
      elementId,
      handle,
      startMousePos: { x: e.clientX, y: e.clientY },
      initialSize,
    };
  }, [getElement]);
  
  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeStart.current) return;
    
    const element = getElement(resizeStart.current.elementId);
    if (!element) return;
    
    const previewRect = getPreviewRect();
    const resizeConfig: ResizeOperationConfig = {
      offsetScale: config.offsetScale,
      previewRect,
      startMousePos: resizeStart.current.startMousePos,
      initialSize: resizeStart.current.initialSize,
    };
    
    const result = resizeElement(
      element,
      resizeStart.current.handle,
      { x: e.clientX, y: e.clientY },
      resizeConfig
    );
    
    updateElement(result.element);
  }, [getElement, getPreviewRect, config.offsetScale, updateElement]);
  
  const handleResizeMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, resizingElementId: null }));
    resizeStart.current = null;
  }, []);
  
  // Rotate handlers
  const handleRotationMouseDown = useCallback((
    elementId: string,
    centerX: number,
    centerY: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = getElement(elementId);
    if (!element) return;
    
    const initialAngle = element.angle ?? 0;
    
    setState(prev => ({ ...prev, rotatingElementId: elementId }));
    rotateStart.current = {
      elementId,
      elementCenter: { x: centerX, y: centerY },
      startMousePos: { x: e.clientX, y: e.clientY },
      initialAngle,
    };
  }, [getElement]);
  
  const handleRotationMouseMove = useCallback((e: MouseEvent) => {
    if (!rotateStart.current) return;
    
    const element = getElement(rotateStart.current.elementId);
    if (!element) return;
    
    const previewRect = getPreviewRect();
    const rotateConfig: RotateOperationConfig = {
      offsetScale: config.offsetScale,
      previewRect,
      startMousePos: rotateStart.current.startMousePos,
      initialAngle: rotateStart.current.initialAngle,
      elementCenter: rotateStart.current.elementCenter,
    };
    
    const result = rotateElement(
      element,
      { x: e.clientX, y: e.clientY },
      rotateConfig
    );
    
    updateElement(result.element);
  }, [getElement, getPreviewRect, config.offsetScale, updateElement]);
  
  const handleRotationMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, rotatingElementId: null }));
    rotateStart.current = null;
  }, []);
  
  // Event listeners
  useEffect(() => {
    if (state.draggingElementId) {
      window.addEventListener('mousemove', handleElementMouseMove);
      window.addEventListener('mouseup', handleElementMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleElementMouseMove);
        window.removeEventListener('mouseup', handleElementMouseUp);
      };
    }
  }, [state.draggingElementId, handleElementMouseMove, handleElementMouseUp]);
  
  useEffect(() => {
    if (state.resizingElementId) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [state.resizingElementId, handleResizeMouseMove, handleResizeMouseUp]);
  
  useEffect(() => {
    if (state.rotatingElementId) {
      window.addEventListener('mousemove', handleRotationMouseMove);
      window.addEventListener('mouseup', handleRotationMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleRotationMouseMove);
        window.removeEventListener('mouseup', handleRotationMouseUp);
      };
    }
  }, [state.rotatingElementId, handleRotationMouseMove, handleRotationMouseUp]);
  
  return {
    state,
    handleElementMouseDown,
    handleResizeMouseDown,
    handleRotationMouseDown,
    setSelectedElementId: (id: string | null) => {
      setState(prev => ({ ...prev, selectedElementId: id }));
    },
  };
}

