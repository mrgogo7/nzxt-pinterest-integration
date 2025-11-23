import type { AppSettings } from '../constants/defaults';
import type { Overlay, OverlayElement, MetricElementData, TextElementData, DividerElementData } from '../types/overlay';
import {
  bringToFront,
  sendToBack,
  distributeHorizontally,
  distributeVertically,
  alignLeft,
  alignRight,
  alignTop,
  alignBottom,
  alignCenterX,
  alignCenterY,
} from './alignment';

// ============================================================================
// LEGACY HELPERS (Deprecated - kept for backward compatibility)
// ============================================================================

/**
 * @deprecated Use new element-based helpers instead. Kept for backward compatibility.
 * Updates a single overlay field in settings.
 */
export function updateOverlayField(
  settings: AppSettings,
  overlayConfig: Overlay,
  field: string,
  value: any
): AppSettings {
  return {
    ...settings,
    overlay: {
      ...overlayConfig as any,
      [field]: value,
    },
  };
}

/**
 * @deprecated Use new element-based helpers instead. Kept for backward compatibility.
 * Resets a single overlay field to its default value.
 */
export function resetOverlayFieldValue(
  settings: AppSettings,
  overlayConfig: Overlay,
  field: string,
  defaultValue: any
): AppSettings {
  return updateOverlayField(settings, overlayConfig, field, defaultValue);
}

/**
 * @deprecated Use new element-based helpers instead. Kept for backward compatibility.
 * Updates multiple overlay fields at once.
 */
export function updateOverlayFields(
  settings: AppSettings,
  overlayConfig: Overlay,
  updates: Partial<Overlay>
): AppSettings {
  return {
    ...settings,
    overlay: {
      ...overlayConfig as any,
      ...updates,
    },
  };
}

/**
 * @deprecated Use updateOverlayElement instead. Kept for backward compatibility.
 * Updates a custom reading in the overlay settings.
 */
export function updateCustomReading(
  settings: AppSettings,
  overlayConfig: Overlay,
  readingId: string,
  updates: Partial<{ metric: any; numberColor: string; numberSize: number; x: number; y: number }>
): AppSettings {
  // Use updateOverlayElement for element-based format
  return updateOverlayElement(settings, overlayConfig, readingId, updates);
}

/**
 * @deprecated Use updateOverlayElement instead. Kept for backward compatibility.
 * Updates a custom text in the overlay settings.
 */
export function updateCustomText(
  settings: AppSettings,
  overlayConfig: Overlay,
  textId: string,
  updates: Partial<{ text: string; textColor: string; textSize: number; x: number; y: number }>
): AppSettings {
  // Use updateOverlayElement for element-based format
  return updateOverlayElement(settings, overlayConfig, textId, updates);
}

// ============================================================================
// NEW ELEMENT-BASED HELPERS
// ============================================================================

/**
 * Updates a single overlay element in the overlay.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration (must be Overlay type)
 * @param elementId - ID of the element to update
 * @param updates - Partial element object with fields to update
 * @returns Updated app settings
 */
export function updateOverlayElement(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  updates: Partial<OverlayElement>
): AppSettings {
  const elementIndex = overlay.elements.findIndex(el => el.id === elementId);
  
  if (elementIndex === -1) {
    return settings; // Element not found
  }
  
  const updatedElements = [...overlay.elements];
  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    ...updates,
  };
  
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Updates the data of a metric element.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param elementId - ID of the metric element to update
 * @param dataUpdates - Partial MetricElementData object
 * @returns Updated app settings
 */
export function updateMetricElementData(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  dataUpdates: Partial<MetricElementData>
): AppSettings {
  const elementIndex = overlay.elements.findIndex(el => el.id === elementId);
  
  if (elementIndex === -1 || overlay.elements[elementIndex].type !== 'metric') {
    return settings; // Element not found or not a metric element
  }
  
  // Normalize numeric values to integers (except for fields that should remain float)
  const normalizedUpdates: Partial<MetricElementData> = { ...dataUpdates };
  if ('numberSize' in normalizedUpdates && typeof normalizedUpdates.numberSize === 'number') {
    normalizedUpdates.numberSize = Math.round(normalizedUpdates.numberSize);
  }
  if ('textSize' in normalizedUpdates && typeof normalizedUpdates.textSize === 'number') {
    normalizedUpdates.textSize = Math.round(normalizedUpdates.textSize);
  }
  
  const updatedElements = [...overlay.elements];
  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    data: {
      ...(updatedElements[elementIndex].data as MetricElementData),
      ...normalizedUpdates,
    },
  };
  
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Updates the data of a text element.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param elementId - ID of the text element to update
 * @param dataUpdates - Partial TextElementData object
 * @returns Updated app settings
 */
export function updateTextElementData(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  dataUpdates: Partial<TextElementData>
): AppSettings {
  const elementIndex = overlay.elements.findIndex(el => el.id === elementId);
  
  if (elementIndex === -1 || overlay.elements[elementIndex].type !== 'text') {
    return settings; // Element not found or not a text element
  }
  
  // Normalize numeric values to integers
  const normalizedUpdates: Partial<TextElementData> = { ...dataUpdates };
  if ('textSize' in normalizedUpdates && typeof normalizedUpdates.textSize === 'number') {
    normalizedUpdates.textSize = Math.round(normalizedUpdates.textSize);
  }
  
  const updatedElements = [...overlay.elements];
  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    data: {
      ...(updatedElements[elementIndex].data as TextElementData),
      ...normalizedUpdates,
    },
  };
  
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Updates the data of a divider element.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param elementId - ID of the divider element to update
 * @param dataUpdates - Partial DividerElementData object
 * @returns Updated app settings
 */
export function updateDividerElementData(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  dataUpdates: Partial<DividerElementData>
): AppSettings {
  const elementIndex = overlay.elements.findIndex(el => el.id === elementId);
  
  if (elementIndex === -1 || overlay.elements[elementIndex].type !== 'divider') {
    return settings; // Element not found or not a divider element
  }
  
  // Normalize numeric values to integers
  const normalizedUpdates: Partial<DividerElementData> = { ...dataUpdates };
  if ('width' in normalizedUpdates && typeof normalizedUpdates.width === 'number') {
    normalizedUpdates.width = Math.round(normalizedUpdates.width);
  }
  if ('height' in normalizedUpdates && typeof normalizedUpdates.height === 'number') {
    normalizedUpdates.height = Math.round(normalizedUpdates.height);
  }
  
  const updatedElements = [...overlay.elements];
  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    data: {
      ...(updatedElements[elementIndex].data as DividerElementData),
      ...normalizedUpdates,
    },
  };
  
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Adds a new overlay element to the overlay.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param element - New element to add
 * @returns Updated app settings
 */
export function addOverlayElement(
  settings: AppSettings,
  overlay: Overlay,
  element: OverlayElement
): AppSettings {
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: [...overlay.elements, element],
    },
  };
}

/**
 * Removes an overlay element from the overlay.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param elementId - ID of the element to remove
 * @returns Updated app settings
 */
export function removeOverlayElement(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string
): AppSettings {
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: overlay.elements.filter(el => el.id !== elementId),
    },
  };
}

/**
 * Reorders overlay elements by moving an element to a new index.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param elementId - ID of the element to move
 * @param newIndex - New index for the element
 * @returns Updated app settings
 */
export function reorderOverlayElements(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  newIndex: number
): AppSettings {
  const elementIndex = overlay.elements.findIndex(el => el.id === elementId);
  
  if (elementIndex === -1) {
    return settings; // Element not found
  }
  
  const updatedElements = [...overlay.elements];
  const [movedElement] = updatedElements.splice(elementIndex, 1);
  updatedElements.splice(newIndex, 0, movedElement);
  
  // Update zIndex based on new position
  const elementsWithZIndex = updatedElements.map((el, index) => ({
    ...el,
    zIndex: el.zIndex !== undefined ? index : index,
  }));
  
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: elementsWithZIndex,
    },
  };
}

/**
 * Updates the position of an overlay element.
 * 
 * @param settings - Current app settings
 * @param overlay - Current overlay configuration
 * @param elementId - ID of the element to update
 * @param x - New X position
 * @param y - New Y position
 * @returns Updated app settings
 */
export function updateOverlayElementPosition(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  x: number,
  y: number
): AppSettings {
  // Ensure integer values for position
  return updateOverlayElement(settings, overlay, elementId, { 
    x: Math.round(x), 
    y: Math.round(y) 
  });
}

/**
 * Updates an overlay element's rotation angle.
 */
export function updateOverlayElementAngle(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string,
  angle: number
): AppSettings {
  // Normalize angle to 0-360 range and round to integer
  let normalizedAngle = angle % 360;
  if (normalizedAngle < 0) {
    normalizedAngle += 360;
  }
  const roundedAngle = Math.round(normalizedAngle);
  // Omit angle if 0 for cleaner data
  return updateOverlayElement(settings, overlay, elementId, { 
    angle: roundedAngle === 0 ? undefined : roundedAngle 
  });
}

/**
 * Alignment helper functions.
 */

/**
 * Brings an element to the front (highest z-index).
 */
export function bringElementToFront(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string
): AppSettings {
  const updatedElements = bringToFront(overlay.elements, elementId);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Sends an element to the back (lowest z-index).
 */
export function sendElementToBack(
  settings: AppSettings,
  overlay: Overlay,
  elementId: string
): AppSettings {
  const updatedElements = sendToBack(overlay.elements, elementId);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Distributes selected elements horizontally with equal spacing.
 */
export function distributeElementsHorizontally(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = distributeHorizontally(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Distributes selected elements vertically with equal spacing.
 */
export function distributeElementsVertically(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = distributeVertically(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Aligns selected elements to the left.
 */
export function alignElementsLeft(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = alignLeft(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Aligns selected elements to the right.
 */
export function alignElementsRight(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = alignRight(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Aligns selected elements to the top.
 */
export function alignElementsTop(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = alignTop(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Aligns selected elements to the bottom.
 */
export function alignElementsBottom(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = alignBottom(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Centers selected elements horizontally (x = 0).
 */
export function alignElementsCenterX(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = alignCenterX(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Centers selected elements vertically (y = 0).
 */
export function alignElementsCenterY(
  settings: AppSettings,
  overlay: Overlay,
  elementIds: string[]
): AppSettings {
  const updatedElements = alignCenterY(overlay.elements, elementIds);
  return {
    ...settings,
    overlay: {
      ...overlay,
      elements: updatedElements,
    },
  };
}

/**
 * Maximum number of overlay elements allowed.
 */
export const MAX_OVERLAY_ELEMENTS = 20;

/**
 * Checks if adding new elements would exceed the maximum limit.
 * 
 * @param currentElementCount - Current number of elements in overlay
 * @param newElementCount - Number of elements to add
 * @returns true if adding would exceed limit, false otherwise
 */
export function wouldExceedElementLimit(
  currentElementCount: number,
  newElementCount: number
): boolean {
  return (currentElementCount + newElementCount) > MAX_OVERLAY_ELEMENTS;
}