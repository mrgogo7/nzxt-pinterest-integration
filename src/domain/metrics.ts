/**
 * Metric definitions and metadata.
 * 
 * This file provides a single source of truth for all metric definitions,
 * including labels, units, formatting, and unit types.
 * 
 * To add a new metric:
 * 1. Add an entry to METRIC_DEFINITIONS
 * 2. Add the key to OverlayMetricKey union in types/overlay.ts
 * 3. TypeScript will ensure type safety throughout the codebase
 */

export type MetricUnitType = "temp" | "percent" | "clock" | "none";

export interface MetricDefinition {
  /** Display label (e.g., "CPU", "GPU", "Liquid") */
  label: string;
  /** Unit symbol (e.g., "°", "%", "MHz") */
  unit: string;
  /** Unit type for formatting logic */
  unitType: MetricUnitType;
  /** Format function to convert numeric value to display string */
  format: (value: number) => string;
}

/**
 * Single source of truth for all metric definitions.
 * 
 * This object contains all supported metrics with their metadata.
 * AI contributors: Add new metrics here, then update OverlayMetricKey type.
 */
export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  cpuTemp: {
    label: "CPU",
    unit: "°",
    unitType: "temp",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
  cpuLoad: {
    label: "CPU",
    unit: "%",
    unitType: "percent",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
  cpuClock: {
    label: "CPU",
    unit: "MHz",
    unitType: "clock",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
  liquidTemp: {
    label: "Liquid",
    unit: "°",
    unitType: "temp",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
  gpuTemp: {
    label: "GPU",
    unit: "°",
    unitType: "temp",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
  gpuLoad: {
    label: "GPU",
    unit: "%",
    unitType: "percent",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
  gpuClock: {
    label: "GPU",
    unit: "MHz",
    unitType: "clock",
    format: (value: number) => {
      const rounded = Math.round(value);
      return typeof rounded === "number" && !Number.isNaN(rounded) ? `${rounded}` : "-";
    },
  },
} as const;

/**
 * Type-safe metric key based on definitions.
 */
export type MetricKey = keyof typeof METRIC_DEFINITIONS;

/**
 * Information about a metric value for display purposes.
 */
export interface MetricDisplayInfo {
  /** Metric label (e.g., "CPU", "GPU") */
  label: string;
  /** Formatted numeric value (e.g., "45", "100") */
  valueNumber: string;
  /** Unit symbol (e.g., "°", "%") */
  valueUnit: string;
  /** Unit type for conditional formatting */
  valueUnitType: MetricUnitType;
}

/**
 * Get display information for a metric value.
 * 
 * This function replaces the previous getOverlayLabelAndValue() function
 * and uses the centralized METRIC_DEFINITIONS.
 * 
 * @param key - Metric key (must be valid OverlayMetricKey)
 * @param rawValue - Raw numeric value from monitoring data
 * @returns Display information for the metric
 */
export function getMetricDisplayInfo(key: string, rawValue: number): MetricDisplayInfo {
  const definition = METRIC_DEFINITIONS[key];
  
  if (!definition) {
    // Fallback for unknown metrics
    return {
      label: key.toUpperCase(),
      valueNumber: typeof rawValue === "number" && !Number.isNaN(rawValue) 
        ? Math.round(rawValue).toString() 
        : "-",
      valueUnit: "",
      valueUnitType: "none",
    };
  }

  return {
    label: definition.label,
    valueNumber: definition.format(rawValue),
    valueUnit: definition.unit,
    valueUnitType: definition.unitType,
  };
}

