/**
 * Environment detection and abstraction.
 * 
 * This module provides a single source of truth for environment detection,
 * including NZXT CAM detection, monitoring API availability, and LCD dimensions.
 * 
 * AI contributors: All environment-specific behavior should use this module
 * instead of duplicating environment checks throughout the codebase.
 */

import { NZXT_DEFAULTS } from '../constants/nzxt';

/**
 * Environment type.
 * 
 * - "nzxt-cam": Running inside NZXT CAM application (LCD display context)
 * - "browser": Running in standard web browser (config page context)
 */
export type EnvironmentType = "nzxt-cam" | "browser";

/**
 * Environment information.
 * 
 * This object contains all information about the current execution environment,
 * including the type, monitoring availability, and LCD dimensions.
 */
export interface Environment {
  /** Environment type (NZXT CAM or browser) */
  type: EnvironmentType;
  /** Whether real monitoring data is available */
  hasMonitoring: boolean;
  /** LCD width in pixels (default: 640) */
  lcdWidth: number;
  /** LCD height in pixels (default: 640) */
  lcdHeight: number;
  /** LCD shape (always 'circle' for Kraken Elite) */
  lcdShape: 'circle' | 'rectangle';
}

/**
 * Detect the current execution environment.
 * 
 * This function checks:
 * 1. URL parameters (?kraken=1 indicates NZXT CAM)
 * 2. NZXT API availability (window.nzxt.v1)
 * 3. Monitoring data callback availability
 * 4. LCD dimensions from NZXT API or defaults
 * 
 * @returns Environment information object
 */
export function detectEnvironment(): Environment {
  // Check URL parameter (NZXT CAM appends ?kraken=1)
  const searchParams = new URLSearchParams(window.location.search);
  const isNZXT = searchParams.get("kraken") === "1";
  
  // Check NZXT API availability
  const hasNzxtAPI = typeof window !== 'undefined' && !!window.nzxt?.v1;
  const hasMonitoringCallback = hasNzxtAPI && 
    typeof window.nzxt?.v1?.onMonitoringDataUpdate === 'function';
  
  // Get LCD dimensions from NZXT API or use defaults
  const lcdWidth = window.nzxt?.v1?.width || NZXT_DEFAULTS.LCD_WIDTH;
  const lcdHeight = window.nzxt?.v1?.height || NZXT_DEFAULTS.LCD_HEIGHT;
  const lcdShape = window.nzxt?.v1?.shape || NZXT_DEFAULTS.LCD_SHAPE;
  
  return {
    type: isNZXT ? "nzxt-cam" : "browser",
    hasMonitoring: hasMonitoringCallback,
    lcdWidth,
    lcdHeight,
    lcdShape,
  };
}

/**
 * Check if running inside NZXT CAM.
 * 
 * Convenience function for environment type check.
 * 
 * @returns True if running inside NZXT CAM
 */
export function isNZXTCAM(): boolean {
  return detectEnvironment().type === "nzxt-cam";
}

/**
 * Check if real monitoring data is available.
 * 
 * Convenience function for monitoring availability check.
 * 
 * @returns True if real monitoring data is available
 */
export function hasRealMonitoring(): boolean {
  return detectEnvironment().hasMonitoring;
}

/**
 * Get LCD dimensions.
 * 
 * Returns the LCD width and height, using NZXT API values if available,
 * or defaults if not.
 * 
 * @returns Object with lcdWidth and lcdHeight
 */
export function getLCDDimensions(): { width: number; height: number } {
  const env = detectEnvironment();
  return {
    width: env.lcdWidth,
    height: env.lcdHeight,
  };
}

