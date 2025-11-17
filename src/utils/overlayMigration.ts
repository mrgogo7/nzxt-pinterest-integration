/**
 * Overlay migration utilities.
 * 
 * FAZ1: Simple migration from legacy OverlaySettings to new Overlay model.
 * Migration is minimal - visual accuracy, position accuracy, and color accuracy are NOT important.
 * The goal is only to make the new element-based overlay structure work.
 */

import type { OverlaySettings, Overlay, OverlayElement, MetricElementData, TextElementData, OverlayMetricKey } from '../types/overlay';
import { DEFAULT_OVERLAY } from '../types/overlay';

/**
 * Generate a unique ID for an overlay element.
 */
function generateElementId(): string {
  return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a simple metric element with default values.
 */
function createSimpleMetricElement(metric: OverlayMetricKey, x: number = 0, y: number = 0, zIndex: number = 0): OverlayElement {
  return {
    id: generateElementId(),
    type: 'metric',
    x,
    y,
    zIndex,
    data: {
      metric,
      numberColor: 'rgba(255, 255, 255, 1)',
      numberSize: 180,
      textColor: 'rgba(255, 255, 255, 1)',
      textSize: 45,
      showLabel: true,
    } as MetricElementData,
  };
}

/**
 * Migrate legacy OverlaySettings to new Overlay model.
 * 
 * FAZ1: Minimal migration - visual accuracy is NOT important.
 * - Single/Dual/Triple: Simple metric elements with basic positions
 * - Custom: Convert readings/texts to elements (order/labelIndex may be lost)
 * - Invalid data: Return DEFAULT_OVERLAY
 * - Divider elements are NOT created (FAZ1)
 */
export function migrateOverlaySettingsToOverlay(oldSettings: OverlaySettings | null | undefined): Overlay {
  // Handle null/undefined
  if (!oldSettings || typeof oldSettings !== 'object') {
    return DEFAULT_OVERLAY;
  }

  // Handle invalid mode
  if (!oldSettings.mode || typeof oldSettings.mode !== 'string') {
    return DEFAULT_OVERLAY;
  }

  const elements: OverlayElement[] = [];

  try {
    switch (oldSettings.mode) {
      case 'none':
        return DEFAULT_OVERLAY;

      case 'single':
        // Single mode: 1 metric element (simple)
        const singleMetric = oldSettings.primaryMetric || 'cpuTemp';
        elements.push(createSimpleMetricElement(singleMetric, 0, 0, 0));
        return {
          mode: 'custom',
          elements,
        };

      case 'dual':
        // Dual mode: 2 metric elements (simple positions)
        const dualPrimary = oldSettings.primaryMetric || 'cpuTemp';
        const dualSecondary = oldSettings.secondaryMetric || oldSettings.primaryMetric || 'gpuTemp';
        elements.push(createSimpleMetricElement(dualPrimary, -50, 0, 0));
        elements.push(createSimpleMetricElement(dualSecondary, 50, 0, 1));
        return {
          mode: 'custom',
          elements,
        };

      case 'triple':
        // Triple mode: 3 metric elements (simple positions)
        const triplePrimary = oldSettings.primaryMetric || 'cpuTemp';
        const tripleSecondary = oldSettings.secondaryMetric || oldSettings.primaryMetric || 'gpuTemp';
        const tripleTertiary = oldSettings.tertiaryMetric || oldSettings.primaryMetric || 'liquidTemp';
        elements.push(createSimpleMetricElement(triplePrimary, -50, 0, 0));
        elements.push(createSimpleMetricElement(tripleSecondary, 50, -30, 1));
        elements.push(createSimpleMetricElement(tripleTertiary, 50, 30, 2));
        return {
          mode: 'custom',
          elements,
        };

      case 'custom':
        // Custom mode: Convert readings and texts to elements
        // Order and labelIndex may be lost - that's acceptable for FAZ1
        
        // Convert custom readings to metric elements
        if (Array.isArray(oldSettings.customReadings)) {
          oldSettings.customReadings.forEach((reading, index) => {
            if (reading && typeof reading === 'object' && reading.metric) {
              try {
                elements.push({
                  id: reading.id || generateElementId(),
                  type: 'metric',
                  x: typeof reading.x === 'number' ? reading.x : 0,
                  y: typeof reading.y === 'number' ? reading.y : 0,
                  zIndex: typeof reading.order === 'number' ? reading.order : index,
                  data: {
                    metric: reading.metric,
                    numberColor: typeof reading.numberColor === 'string' ? reading.numberColor : 'rgba(255, 255, 255, 1)',
                    numberSize: typeof reading.numberSize === 'number' ? reading.numberSize : 180,
                    textColor: 'transparent', // Custom readings don't show labels
                    textSize: 0,
                    showLabel: false,
                  } as MetricElementData,
                });
              } catch (e) {
                // Skip invalid reading
              }
            }
          });
        }

        // Convert custom texts to text elements
        if (Array.isArray(oldSettings.customTexts)) {
          oldSettings.customTexts.forEach((text, index) => {
            if (text && typeof text === 'object' && typeof text.text === 'string') {
              try {
                elements.push({
                  id: text.id || generateElementId(),
                  type: 'text',
                  x: typeof text.x === 'number' ? text.x : 0,
                  y: typeof text.y === 'number' ? text.y : 0,
                  zIndex: typeof text.order === 'number' ? text.order : elements.length + index,
                  data: {
                    text: text.text.substring(0, 120), // Max 120 chars
                    textColor: typeof text.textColor === 'string' ? text.textColor : 'rgba(255, 255, 255, 1)',
                    textSize: typeof text.textSize === 'number' && text.textSize >= 6 ? text.textSize : 45,
                  } as TextElementData,
                });
              } catch (e) {
                // Skip invalid text
              }
            }
          });
        }

        return {
          mode: 'custom',
          elements,
        };

      default:
        // Unknown mode - return default
        return DEFAULT_OVERLAY;
    }
  } catch (error) {
    // Any error during migration - return default
    console.warn('[overlayMigration] Migration error, using default overlay:', error);
    return DEFAULT_OVERLAY;
  }
}

/**
 * Check if an object is legacy OverlaySettings format.
 */
export function isLegacyOverlaySettings(obj: any): obj is OverlaySettings {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  // Check for legacy mode
  if ('mode' in obj && typeof obj.mode === 'string') {
    const mode = obj.mode;
    if (mode === 'single' || mode === 'dual' || mode === 'triple') {
      return true;
    }
    if (mode === 'custom' && ('customReadings' in obj || 'customTexts' in obj)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Ensure overlay is in the new format.
 * If it's legacy format, migrate it. Otherwise return as-is.
 */
export function ensureOverlayFormat(overlay: OverlaySettings | Overlay | null | undefined): Overlay {
  if (!overlay) {
    return DEFAULT_OVERLAY;
  }

  // Check if it's already the new format
  if ('elements' in overlay && Array.isArray(overlay.elements)) {
    return overlay as Overlay;
  }

  // It's legacy format - migrate it
  return migrateOverlaySettingsToOverlay(overlay as OverlaySettings);
}

/**
 * Reset to default overlay.
 * Used when overlay data is invalid or corrupted.
 */
export function resetToDefaultOverlay(): Overlay {
  return DEFAULT_OVERLAY;
}

