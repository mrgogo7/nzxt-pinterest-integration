/**
 * Overlay Preset Templates
 * 
 * Predefined overlay templates for quick setup.
 * Templates contain elements without IDs - IDs are assigned at runtime.
 */

import type { OverlayElement } from '../types/overlay';
import { assignIdsToElements } from './utils';

/**
 * Template element type (OverlayElement without ID).
 */
type TemplateElement = Omit<OverlayElement, 'id'>;

/**
 * Overlay template definitions.
 * Each template contains an array of elements without IDs.
 * Templates are parsed from exported .nzxt-esc-overlay-preset files.
 */
export const OVERLAY_TEMPLATES: Record<string, TemplateElement[]> = {
  'single-infographic': [
    {
      type: 'metric',
      x: 0,
      y: 0,
      zIndex: 0,
      data: {
        metric: 'cpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 180,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: 0,
      y: 86,
      zIndex: 1,
      data: {
        text: 'CPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 45,
      },
    },
  ],

  'dual-infographic': [
    {
      type: 'metric',
      x: -152,
      y: 0,
      zIndex: 0,
      data: {
        metric: 'cpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 127,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: -152,
      y: 75,
      zIndex: 1,
      data: {
        text: 'CPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 45,
      },
    },
    {
      type: 'metric',
      x: 153,
      y: 0,
      zIndex: 2,
      data: {
        metric: 'gpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 127,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: 152,
      y: 75,
      zIndex: 3,
      data: {
        text: 'GPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 45,
      },
    },
    {
      type: 'divider',
      x: 0,
      y: 0,
      zIndex: 4,
      data: {
        width: 2,
        height: 384,
        color: 'rgba(255, 255, 255, 0.3)',
      },
    },
  ],

  'triple-infographic': [
    {
      type: 'metric',
      x: -125,
      y: -10,
      zIndex: 0,
      data: {
        metric: 'cpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 193,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: -132,
      y: 78,
      zIndex: 1,
      data: {
        text: 'CPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 46,
      },
    },
    {
      type: 'metric',
      x: 152,
      y: -80,
      zIndex: 2,
      data: {
        metric: 'gpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 100,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: 152,
      y: -27,
      zIndex: 3,
      data: {
        text: 'GPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 25,
      },
    },
    {
      type: 'divider',
      x: 36,
      y: 0,
      zIndex: 4,
      data: {
        width: 2,
        height: 384,
        color: 'rgba(255, 255, 255, 0.3)',
      },
    },
    {
      type: 'metric',
      x: 150,
      y: 81,
      zIndex: 5,
      data: {
        metric: 'liquidTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 100,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: 149,
      y: 137,
      zIndex: 6,
      data: {
        text: 'Liquid',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 25,
      },
    },
  ],

  'quadruple-infographic': [
    {
      type: 'metric',
      x: -152,
      y: -106,
      zIndex: 0,
      data: {
        metric: 'cpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 120,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: -155,
      y: -47,
      zIndex: 1,
      data: {
        text: 'CPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 35,
      },
    },
    {
      type: 'metric',
      x: 152,
      y: -106,
      zIndex: 2,
      data: {
        metric: 'gpuTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 120,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: 152,
      y: -47,
      zIndex: 3,
      data: {
        text: 'GPU',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 35,
      },
    },
    {
      type: 'divider',
      x: 0,
      y: 0,
      zIndex: 4,
      data: {
        width: 2,
        height: 384,
        color: 'rgba(255, 255, 255, 0.3)',
      },
    },
    {
      type: 'metric',
      x: -150,
      y: 99,
      zIndex: 5,
      data: {
        metric: 'liquidTemp',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 120,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
    {
      type: 'text',
      x: -157,
      y: 162,
      zIndex: 6,
      data: {
        text: 'Liquid',
        textColor: 'rgba(255, 255, 255, 1)',
        textSize: 35,
      },
    },
    {
      type: 'metric',
      x: 150,
      y: 111,
      zIndex: 7,
      data: {
        metric: 'gpuLoad',
        numberColor: 'rgba(255, 255, 255, 1)',
        numberSize: 120,
        textColor: 'transparent',
        textSize: 0,
        showLabel: false,
      },
    },
  ],
} as const;

/**
 * Get template elements with assigned IDs.
 * 
 * @param templateId - Template ID (e.g., 'single-infographic')
 * @returns Array of OverlayElement with IDs, or empty array if template not found
 */
export function getTemplateElements(templateId: string): OverlayElement[] {
  const template = OVERLAY_TEMPLATES[templateId];
  
  if (!template) {
    console.warn(`[OverlayPreset] Template not found: ${templateId}`);
    return [];
  }
  
  return assignIdsToElements(template);
}

