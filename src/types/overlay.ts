/**
 * Shared overlay types and helpers for Kraken LCD overlays.
 * This file intentionally does not contain any JSX.
 */

import { getMetricDisplayInfo, type MetricDisplayInfo, type MetricUnitType } from '../domain/metrics';

export type OverlayMode = "none" | "single" | "dual" | "triple" | "custom";

export type OverlayMetricKey =
  | "cpuTemp"
  | "cpuLoad"
  | "cpuClock"
  | "liquidTemp"
  | "gpuTemp"
  | "gpuLoad"
  | "gpuClock";

export interface CustomReading {
  id: string; // Unique identifier for the reading
  metric: OverlayMetricKey;
  numberColor: string;
  numberSize: number;
  x: number; // X offset in LCD coordinates
  y: number; // Y offset in LCD coordinates
  order: number; // Display order (for unified sorting with texts)
  labelIndex: number; // Fixed label index based on creation order (0 = 1st, 1 = 2nd, etc.)
}

export interface CustomText {
  id: string; // Unique identifier for the text
  text: string; // Plain text content (max 120 characters, sanitized)
  textColor: string;
  textSize: number; // Minimum 6
  x: number; // X offset in LCD coordinates
  y: number; // Y offset in LCD coordinates
  order: number; // Display order (for unified sorting with readings)
  labelIndex: number; // Fixed label index based on creation order (0 = 1st, 1 = 2nd, etc.)
}

export interface OverlaySettings {
  mode: OverlayMode;
  primaryMetric: OverlayMetricKey;
  secondaryMetric?: OverlayMetricKey; // For dual and triple modes
  tertiaryMetric?: OverlayMetricKey; // For triple mode
  numberColor: string;
  textColor: string;
  // Dual mode specific colors
  primaryNumberColor?: string; // For dual and triple modes
  primaryTextColor?: string; // For dual and triple modes
  secondaryNumberColor?: string; // For dual and triple modes
  secondaryTextColor?: string; // For dual and triple modes
  // Triple mode specific colors
  tertiaryNumberColor?: string; // For triple mode
  tertiaryTextColor?: string; // For triple mode
  numberSize: number;
  textSize: number;
  // Dual mode specific settings
  secondaryNumberSize?: number; // For dual and triple modes
  secondaryTextSize?: number; // For dual and triple modes
  // Triple mode specific settings
  tertiaryNumberSize?: number; // For triple mode
  tertiaryTextSize?: number; // For triple mode
  showDivider?: boolean; // Show divider between metrics (dual and triple modes)
  dividerWidth?: number; // Divider line width (percentage of height)
  dividerThickness?: number; // Divider line thickness (pixels)
  dividerColor?: string; // Divider line color
  gap?: number; // Space between primary and secondary metrics (dual mode)
  gapSecondaryTertiary?: number; // Space between secondary and tertiary metrics (triple mode)
  dividerGap?: number; // Space between primary and divider (dual and triple modes)
  x?: number; // Primary X offset (for primary/divider in dual and triple modes, or general overlay position)
  y?: number; // Primary Y offset (for primary/divider in dual and triple modes, or general overlay position)
  secondaryOffsetX?: number; // X offset for secondary section in dual mode
  secondaryOffsetY?: number; // Y offset for secondary section in dual mode
  dualReadersOffsetX?: number; // X offset for secondary/tertiary section in triple mode (Dual Readers)
  dualReadersOffsetY?: number; // Y offset for secondary/tertiary section in triple mode (Dual Readers)
  // Custom mode specific settings
  customReadings?: CustomReading[]; // Array of custom readings (max 4)
  customTexts?: CustomText[]; // Array of custom texts (max 4)
}

export type OverlayMetrics = {
  cpuTemp: number;
  cpuLoad: number;
  cpuClock: number;
  liquidTemp: number;
  gpuTemp: number;
  gpuLoad: number;
  gpuClock: number;
};

/**
 * Default overlay configuration when none is stored yet.
 * Must stay in sync with ConfigPreview default overlay block.
 */
export const DEFAULT_OVERLAY: OverlaySettings = {
  mode: "none",
  primaryMetric: "cpuTemp",
  secondaryMetric: "gpuTemp", // Default for dual/triple modes
  tertiaryMetric: "liquidTemp", // Default for triple mode
  numberColor: "rgba(255, 255, 255, 1)", // White with full opacity
  textColor: "rgba(255, 255, 255, 1)", // White with full opacity (changed from #cccccc)
  numberSize: 180, // Used for single mode and as base for dual/triple
  textSize: 45, // Used for single mode and as base for dual/triple
  // Dual mode defaults
  primaryNumberColor: "rgba(255, 255, 255, 1)",
  primaryTextColor: "rgba(255, 255, 255, 1)",
  secondaryNumberColor: "rgba(255, 255, 255, 1)",
  secondaryTextColor: "rgba(255, 255, 255, 1)",
  secondaryNumberSize: 120,
  secondaryTextSize: 35,
  // Triple mode defaults - these override numberSize/textSize when mode is triple
  tertiaryNumberColor: "rgba(255, 255, 255, 1)",
  tertiaryTextColor: "rgba(255, 255, 255, 1)",
  tertiaryNumberSize: 80, // Updated default
  tertiaryTextSize: 20, // Updated default
  showDivider: true, // Default to ON for dual and triple modes
  dividerWidth: 60, // Percentage of height
  dividerThickness: 2,
  dividerColor: "rgba(255, 255, 255, 0.3)", // Default divider color
  gap: 36, // Default gap for dual mode (120 * 0.3) - deprecated, use dividerGap
  gapSecondaryTertiary: 20, // Default gap between secondary and tertiary in triple mode
  dividerGap: 27, // Default gap between primary and divider (dual and triple modes) (32 for dual mode, set in mode switch)
  x: 0, // Default X offset (18 for triple mode primary, set in mode switch)
  y: 0, // Default Y offset
  secondaryOffsetX: 0, // Default X offset for secondary in dual mode (50 for dual mode, set in mode switch)
  secondaryOffsetY: 0, // Default Y offset for secondary in dual mode
  dualReadersOffsetX: 0, // Default X offset for secondary/tertiary in triple mode (Dual Readers) (60 for triple mode, set in mode switch)
  dualReadersOffsetY: 0, // Default Y offset for secondary/tertiary in triple mode (Dual Readers)
  // Custom mode defaults
  customReadings: [], // Empty array by default, readings will be added by user
  customTexts: [], // Empty array by default, texts will be added by user
};

// Re-export types from metrics domain for backward compatibility
export type OverlayValueUnitType = MetricUnitType;
export type OverlayValueInfo = MetricDisplayInfo;

/**
 * Derive label + value + unit for a given metric key.
 * 
 * DEPRECATED: Use getMetricDisplayInfo from domain/metrics.ts instead.
 * This function is kept for backward compatibility and delegates to the centralized implementation.
 * 
 * The goal is to keep a stable display model independent of the raw data shape.
 */
export function getOverlayLabelAndValue(
  key: OverlayMetricKey,
  rawValue: number
): OverlayValueInfo {
  // Delegate to centralized metrics domain
  return getMetricDisplayInfo(key, rawValue);
}
