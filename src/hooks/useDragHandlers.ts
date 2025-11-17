import { useState, useRef, useCallback, useEffect } from 'react';
import { previewToLcd } from '../utils/positioning';
import { DEFAULT_OVERLAY } from '../types/overlay';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for managing all drag handlers in ConfigPreview.
 * 
 * Handles:
 * - Background drag
 * - Overlay drag (single/dual/triple modes)
 * - Custom reading drag
 * - Custom text drag
 * 
 * @param offsetScale - Scale factor for converting preview to LCD pixels
 * @param settingsRef - Ref to current settings (to avoid stale closures)
 * @param setSettings - Settings setter function
 * @param overlayConfig - Current overlay configuration
 */
export function useDragHandlers(
  offsetScale: number,
  settingsRef: React.MutableRefObject<AppSettings>,
  setSettings: (settings: AppSettings) => void,
  overlayConfig: typeof DEFAULT_OVERLAY
) {
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [isDraggingSecondaryTertiary, setIsDraggingSecondaryTertiary] = useState(false);
  const [draggingReadingId, setDraggingReadingId] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Drag refs
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const overlayDragStart = useRef<{ x: number; y: number } | null>(null);
  const secondaryTertiaryDragStart = useRef<{ x: number; y: number } | null>(null);
  const customReadingDragStart = useRef<{ x: number; y: number; readingId: string } | null>(null);
  const customTextDragStart = useRef<{ x: number; y: number; textId: string } | null>(null);
  const selectedItemMousePos = useRef<{ x: number; y: number } | null>(null);

  // Background drag handlers
  const handleBackgroundMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  }, []);

  const handleBackgroundMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    setSettings({
      ...currentSettings,
      x: currentSettings.x + lcdDx,
      y: currentSettings.y + lcdDy,
    });
  }, [offsetScale, setSettings, settingsRef]);

  const handleBackgroundMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Overlay drag handlers
  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't handle drag for custom mode - each reading has its own drag handler
    if (overlayConfig.mode === 'custom') {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // For triple and dual modes, determine which section to drag based on click position
    if (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const centerX = rect.width / 2;
      
      // If clicked on right half, drag secondary (dual) or secondary/tertiary (triple)
      if (clickX > centerX) {
        secondaryTertiaryDragStart.current = { x: e.clientX, y: e.clientY };
        setIsDraggingSecondaryTertiary(true);
      } else {
        // Left half or center: drag primary/divider
        overlayDragStart.current = { x: e.clientX, y: e.clientY };
        setIsDraggingOverlay(true);
      }
    } else {
      // For single mode, drag entire overlay
      overlayDragStart.current = { x: e.clientX, y: e.clientY };
      setIsDraggingOverlay(true);
    }
  }, [overlayConfig.mode]);

  const handleOverlayMouseMove = useCallback((e: MouseEvent) => {
    if (!overlayDragStart.current) return;

    const dx = e.clientX - overlayDragStart.current.x;
    const dy = e.clientY - overlayDragStart.current.y;
    overlayDragStart.current = { x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels for overlay (same as background)
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay || DEFAULT_OVERLAY;
    setSettings({
      ...currentSettings,
      overlay: {
        ...currentOverlay,
        x: (currentOverlay.x || 0) + lcdDx,
        y: (currentOverlay.y || 0) + lcdDy,
      },
    });
  }, [offsetScale, setSettings, settingsRef]);

  const handleSecondaryTertiaryMouseMove = useCallback((e: MouseEvent) => {
    if (!secondaryTertiaryDragStart.current) return;

    const dx = e.clientX - secondaryTertiaryDragStart.current.x;
    const dy = e.clientY - secondaryTertiaryDragStart.current.y;
    secondaryTertiaryDragStart.current = { x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay || DEFAULT_OVERLAY;
    
    // For dual mode, update secondaryOffsetX/Y; for triple mode, update dualReadersOffsetX/Y
    if (currentOverlay.mode === 'dual') {
      setSettings({
        ...currentSettings,
        overlay: {
          ...currentOverlay,
          secondaryOffsetX: (currentOverlay.secondaryOffsetX || 0) + lcdDx,
          secondaryOffsetY: (currentOverlay.secondaryOffsetY || 0) + lcdDy,
        },
      });
    } else if (currentOverlay.mode === 'triple') {
      setSettings({
        ...currentSettings,
        overlay: {
          ...currentOverlay,
          dualReadersOffsetX: (currentOverlay.dualReadersOffsetX || 0) + lcdDx,
          dualReadersOffsetY: (currentOverlay.dualReadersOffsetY || 0) + lcdDy,
        },
      });
    }
  }, [offsetScale, setSettings, settingsRef]);

  const handleOverlayMouseUp = useCallback(() => {
    setIsDraggingOverlay(false);
    overlayDragStart.current = null;
  }, []);

  const handleSecondaryTertiaryMouseUp = useCallback(() => {
    setIsDraggingSecondaryTertiary(false);
    secondaryTertiaryDragStart.current = null;
  }, []);

  // Custom reading drag handlers
  const handleCustomReadingMouseDown = useCallback((e: React.MouseEvent, readingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If already selected, start dragging immediately
    if (selectedReadingId === readingId) {
      setDraggingReadingId(readingId);
      customReadingDragStart.current = { x: e.clientX, y: e.clientY, readingId };
    } else {
      // First click: just select, don't start dragging
      setSelectedReadingId(readingId);
      setSelectedTextId(null); // Deselect text if reading is selected
      selectedItemMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [selectedReadingId]);

  const handleCustomReadingMouseMove = useCallback((e: MouseEvent) => {
    if (!customReadingDragStart.current) return;

    const dx = e.clientX - customReadingDragStart.current.x;
    const dy = e.clientY - customReadingDragStart.current.y;
    customReadingDragStart.current = { ...customReadingDragStart.current, x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay || DEFAULT_OVERLAY;
    const currentReadings = currentOverlay.customReadings || [];
    const readingIndex = currentReadings.findIndex(r => r.id === customReadingDragStart.current!.readingId);
    
    if (readingIndex !== -1) {
      const updatedReadings = [...currentReadings];
      updatedReadings[readingIndex] = {
        ...updatedReadings[readingIndex],
        x: updatedReadings[readingIndex].x + lcdDx,
        y: updatedReadings[readingIndex].y + lcdDy,
      };
      setSettings({
        ...currentSettings,
        overlay: {
          ...currentOverlay,
          customReadings: updatedReadings,
        },
      });
    }
  }, [offsetScale, setSettings, settingsRef]);

  const handleCustomReadingMouseUp = useCallback(() => {
    setDraggingReadingId(null);
    customReadingDragStart.current = null;
    // Keep selected after drag ends - user can click again to drag
  }, []);

  // Custom Text drag handlers
  const handleCustomTextMouseDown = useCallback((e: React.MouseEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If already selected, start dragging immediately
    if (selectedTextId === textId) {
      setDraggingTextId(textId);
      customTextDragStart.current = { x: e.clientX, y: e.clientY, textId };
    } else {
      // First click: just select, don't start dragging
      setSelectedTextId(textId);
      setSelectedReadingId(null); // Deselect reading if text is selected
      selectedItemMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [selectedTextId]);

  const handleCustomTextMouseMove = useCallback((e: MouseEvent) => {
    if (!customTextDragStart.current) return;

    const dx = e.clientX - customTextDragStart.current.x;
    const dy = e.clientY - customTextDragStart.current.y;
    customTextDragStart.current = { ...customTextDragStart.current, x: e.clientX, y: e.clientY };

    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay || DEFAULT_OVERLAY;
    const currentTexts = currentOverlay.customTexts || [];
    const textIndex = currentTexts.findIndex(t => t.id === customTextDragStart.current!.textId);
    
    if (textIndex !== -1) {
      const updatedTexts = [...currentTexts];
      updatedTexts[textIndex] = {
        ...updatedTexts[textIndex],
        x: updatedTexts[textIndex].x + lcdDx,
        y: updatedTexts[textIndex].y + lcdDy,
      };
      setSettings({
        ...currentSettings,
        overlay: {
          ...currentOverlay,
          customTexts: updatedTexts,
        },
      });
    }
  }, [offsetScale, setSettings, settingsRef]);

  const handleCustomTextMouseUp = useCallback(() => {
    setDraggingTextId(null);
    customTextDragStart.current = null;
    // Keep selected after drag ends - user can click again to drag
  }, []);

  // Event listeners for drag handlers
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleBackgroundMouseMove);
      window.addEventListener('mouseup', handleBackgroundMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleBackgroundMouseMove);
        window.removeEventListener('mouseup', handleBackgroundMouseUp);
      };
    }
  }, [isDragging, handleBackgroundMouseMove, handleBackgroundMouseUp]);

  useEffect(() => {
    if (isDraggingOverlay) {
      window.addEventListener('mousemove', handleOverlayMouseMove);
      window.addEventListener('mouseup', handleOverlayMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleOverlayMouseMove);
        window.removeEventListener('mouseup', handleOverlayMouseUp);
      };
    }
  }, [isDraggingOverlay, handleOverlayMouseMove, handleOverlayMouseUp]);

  useEffect(() => {
    if (isDraggingSecondaryTertiary) {
      window.addEventListener('mousemove', handleSecondaryTertiaryMouseMove);
      window.addEventListener('mouseup', handleSecondaryTertiaryMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSecondaryTertiaryMouseMove);
        window.removeEventListener('mouseup', handleSecondaryTertiaryMouseUp);
      };
    }
  }, [isDraggingSecondaryTertiary, handleSecondaryTertiaryMouseMove, handleSecondaryTertiaryMouseUp]);

  useEffect(() => {
    if (draggingReadingId) {
      window.addEventListener('mousemove', handleCustomReadingMouseMove);
      window.addEventListener('mouseup', handleCustomReadingMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCustomReadingMouseMove);
        window.removeEventListener('mouseup', handleCustomReadingMouseUp);
      };
    }
  }, [draggingReadingId, handleCustomReadingMouseMove, handleCustomReadingMouseUp]);

  useEffect(() => {
    if (draggingTextId) {
      window.addEventListener('mousemove', handleCustomTextMouseMove);
      window.addEventListener('mouseup', handleCustomTextMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCustomTextMouseMove);
        window.removeEventListener('mouseup', handleCustomTextMouseUp);
      };
    }
  }, [draggingTextId, handleCustomTextMouseMove, handleCustomTextMouseUp]);

  // Handle click outside to deselect and stop drag
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is inside Overlay Options area
      const overlayOptionsArea = target.closest('.overlay-options-area');
      const isReading = target.closest('[data-reading-id]');
      const isText = target.closest('[data-text-id]');
      
      // If clicking outside Overlay Options area (and not on a reading/text), deselect and stop drag
      if (!overlayOptionsArea && !isReading && !isText) {
        // Stop any active drag
        if (draggingReadingId) {
          setDraggingReadingId(null);
          customReadingDragStart.current = null;
        }
        if (draggingTextId) {
          setDraggingTextId(null);
          customTextDragStart.current = null;
        }
        
        // Deselect
        setSelectedReadingId(null);
        setSelectedTextId(null);
        selectedItemMousePos.current = null;
      }
    };

    if (selectedReadingId || selectedTextId || draggingReadingId || draggingTextId) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedReadingId, selectedTextId, draggingReadingId, draggingTextId]);

  return {
    // Background drag
    isDragging,
    handleBackgroundMouseDown,
    
    // Overlay drag
    isDraggingOverlay,
    isDraggingSecondaryTertiary,
    handleOverlayMouseDown,
    
    // Custom reading drag
    draggingReadingId,
    selectedReadingId,
    handleCustomReadingMouseDown,
    
    // Custom text drag
    draggingTextId,
    selectedTextId,
    handleCustomTextMouseDown,
  };
}

