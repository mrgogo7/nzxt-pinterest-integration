/**
 * Shared overlay types and helpers for Kraken LCD overlays.
 * This file intentionally does not contain any JSX.
 */

export type OverlayMode = "none" | "single" | "dual" | "triple";

export type OverlayMetricKey =
  | "cpuTemp"
  | "cpuLoad"
  | "cpuClock"
  | "liquidTemp"
  | "gpuTemp"
  | "gpuLoad"
  | "gpuClock";

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
  dividerGap?: number; // Space between primary and divider in triple mode
  x?: number; // Primary X offset (for primary/divider in triple mode, or general overlay position)
  y?: number; // Primary Y offset (for primary/divider in triple mode, or general overlay position)
  dualReadersOffsetX?: number; // X offset for secondary/tertiary section in triple mode (Dual Readers)
  dualReadersOffsetY?: number; // Y offset for secondary/tertiary section in triple mode (Dual Readers)
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
  gap: 36, // Default gap for dual mode (120 * 0.3)
  gapSecondaryTertiary: 20, // Default gap between secondary and tertiary in triple mode
  dividerGap: 8, // Default gap between primary and divider in triple mode
  x: 0,
  y: 0,
  dualReadersOffsetX: 0, // Default X offset for secondary/tertiary in triple mode (Dual Readers)
  dualReadersOffsetY: 0, // Default Y offset for secondary/tertiary in triple mode (Dual Readers)
};

export type OverlayValueUnitType = "temp" | "percent" | "clock" | "none";

export interface OverlayValueInfo {
  label: string;
  valueNumber: string;
  valueUnit: string;
  valueUnitType: OverlayValueUnitType;
}

/**
 * Derive label + value + unit for a given metric key.
 * The goal is to keep a stable display model independent of the raw data shape.
 */
export function getOverlayLabelAndValue(
  key: OverlayMetricKey,
  rawValue: number
): OverlayValueInfo {
  let label: string;
  let unit = "";
  let unitType: OverlayValueUnitType = "none";

  if (key.startsWith("cpu")) label = "CPU";
  else if (key.startsWith("gpu")) label = "GPU";
  else if (key === "liquidTemp") label = "Liquid";
  else label = key.toUpperCase();

  if (key === "cpuTemp" || key === "gpuTemp" || key === "liquidTemp") {
    unit = "°";
    unitType = "temp";
  } else if (key === "cpuLoad" || key === "gpuLoad") {
    unit = "%";
    unitType = "percent";
  } else if (key === "cpuClock" || key === "gpuClock") {
    unit = "MHz";
    unitType = "clock";
  }

  const rounded = Math.round(rawValue);
  const valueNumber =
    typeof rounded === "number" && !Number.isNaN(rounded)
      ? `${rounded}`
      : "-";

  return {
    label,
    valueNumber,
    valueUnit: unit,
    valueUnitType: unitType,
  };
}
