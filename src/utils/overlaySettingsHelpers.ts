import type { AppSettings } from '../constants/defaults';
import type { Overlay, OverlayElement, OverlaySettings, MetricElementData, TextElementData } from '../types/overlay';

// ============================================================================
// LEGACY HELPERS (Deprecated - kept for backward compatibility)
// ============================================================================

/**
 * @deprecated Use new element-based helpers instead. Kept for backward compatibility.
 * Updates a single overlay field in settings.
 */
export function updateOverlayField(
  settings: AppSettings,
  overlayConfig: OverlaySettings | Overlay,
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
  overlayConfig: OverlaySettings | Overlay,
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
  overlayConfig: OverlaySettings | Overlay,
  updates: Partial<OverlaySettings | Overlay>
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
  overlayConfig: OverlaySettings | Overlay,
  readingId: string,
  updates: Partial<{ metric: any; numberColor: string; numberSize: number; x: number; y: number }>
): AppSettings {
  // If it's new format, use updateOverlayElement
  if ('elements' in overlayConfig) {
    return updateOverlayElement(settings, overlayConfig, readingId, updates);
  }
  
  // Legacy format
  const currentReadings = [...((overlayConfig as OverlaySettings).customReadings || [])];
  const readingIndex = currentReadings.findIndex(r => r.id === readingId);
  
  if (readingIndex !== -1) {
    currentReadings[readingIndex] = {
      ...currentReadings[readingIndex],
      ...updates,
    };
  }
  
  return updateOverlayField(settings, overlayConfig, 'customReadings', currentReadings);
}

/**
 * @deprecated Use updateOverlayElement instead. Kept for backward compatibility.
 * Updates a custom text in the overlay settings.
 */
export function updateCustomText(
  settings: AppSettings,
  overlayConfig: OverlaySettings | Overlay,
  textId: string,
  updates: Partial<{ text: string; textColor: string; textSize: number; x: number; y: number }>
): AppSettings {
  // If it's new format, use updateOverlayElement
  if ('elements' in overlayConfig) {
    return updateOverlayElement(settings, overlayConfig, textId, updates);
  }
  
  // Legacy format
  const currentTexts = [...((overlayConfig as OverlaySettings).customTexts || [])];
  const textIndex = currentTexts.findIndex(t => t.id === textId);
  
  if (textIndex !== -1) {
    currentTexts[textIndex] = {
      ...currentTexts[textIndex],
      ...updates,
    };
  }
  
  return updateOverlayField(settings, overlayConfig, 'customTexts', currentTexts);
}

// ============================================================================
// NEW ELEMENT-BASED HELPERS (FAZ1)
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
  
  const updatedElements = [...overlay.elements];
  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    data: {
      ...(updatedElements[elementIndex].data as MetricElementData),
      ...dataUpdates,
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
  
  const updatedElements = [...overlay.elements];
  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    data: {
      ...(updatedElements[elementIndex].data as TextElementData),
      ...dataUpdates,
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
  return updateOverlayElement(settings, overlay, elementId, { x, y });
}
