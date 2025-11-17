/**
 * Overlay mode transition logic and defaults.
 * 
 * This file provides a single source of truth for mode transition defaults.
 * When switching between overlay modes (none, single, dual, triple, custom),
 * this module defines what default values should be applied.
 * 
 * AI contributors: When adding a new mode or modifying mode defaults,
 * update this file to ensure consistent behavior across the application.
 */

import type { OverlaySettings, OverlayMode } from '../types/overlay';
import { DEFAULT_OVERLAY } from '../types/overlay';

/**
 * Mode transition defaults configuration.
 * 
 * Each function receives the current overlay settings and returns
 * the default values that should be applied when switching to that mode.
 * 
 * The current settings are provided so that colors and metrics can be
 * preserved when switching modes (e.g., keep primaryMetric when switching to dual).
 */
export interface ModeTransitionDefaults {
  /** Default values for single mode */
  single: (current: Partial<OverlaySettings>) => Partial<OverlaySettings>;
  /** Default values for dual mode */
  dual: (current: Partial<OverlaySettings>) => Partial<OverlaySettings>;
  /** Default values for triple mode */
  triple: (current: Partial<OverlaySettings>) => Partial<OverlaySettings>;
  /** Default values for custom mode */
  custom: (current: Partial<OverlaySettings>) => Partial<OverlaySettings>;
  /** Default values for none mode (usually empty) */
  none: (current: Partial<OverlaySettings>) => Partial<OverlaySettings>;
}

/**
 * Mode transition defaults configuration.
 * 
 * This object defines all default values that should be applied when
 * switching between overlay modes. Each mode has a function that receives
 * the current settings and returns the new defaults.
 */
export const MODE_TRANSITIONS: ModeTransitionDefaults = {
  none: () => ({}),

  single: (current: Partial<OverlaySettings>) => ({
    numberColor: current.numberColor || current.primaryNumberColor || DEFAULT_OVERLAY.numberColor,
    textColor: current.textColor || current.primaryTextColor || DEFAULT_OVERLAY.textColor,
    numberSize: DEFAULT_OVERLAY.numberSize,
    textSize: DEFAULT_OVERLAY.textSize,
    x: current.x ?? DEFAULT_OVERLAY.x ?? 0,
    y: current.y ?? DEFAULT_OVERLAY.y ?? 0,
  }),

  dual: (current: Partial<OverlaySettings>) => ({
    // Sizes
    numberSize: 120,
    textSize: 35,
    secondaryNumberSize: 120,
    secondaryTextSize: 35,
    
    // Gaps and dividers
    dividerGap: 32,
    showDivider: true,
    dividerWidth: DEFAULT_OVERLAY.dividerWidth ?? 60,
    dividerThickness: DEFAULT_OVERLAY.dividerThickness ?? 2,
    dividerColor: DEFAULT_OVERLAY.dividerColor ?? "rgba(255, 255, 255, 0.3)",
    
    // Positions
    x: 0,
    y: 0,
    secondaryOffsetX: 50,
    secondaryOffsetY: 0,
    
    // Colors - preserve existing colors or use defaults
    primaryNumberColor: current.primaryNumberColor || current.numberColor || DEFAULT_OVERLAY.numberColor,
    primaryTextColor: current.primaryTextColor || current.textColor || DEFAULT_OVERLAY.textColor,
    secondaryNumberColor: current.secondaryNumberColor || current.numberColor || DEFAULT_OVERLAY.numberColor,
    secondaryTextColor: current.secondaryTextColor || current.textColor || DEFAULT_OVERLAY.textColor,
    
    // Metrics - preserve primary, set secondary default
    secondaryMetric: current.secondaryMetric || DEFAULT_OVERLAY.secondaryMetric,
  }),

  triple: (current: Partial<OverlaySettings>) => ({
    // Sizes
    numberSize: 155, // Primary
    textSize: 35,    // Primary
    secondaryNumberSize: 80,
    secondaryTextSize: 20,
    tertiaryNumberSize: 80,
    tertiaryTextSize: 20,
    
    // Gaps and dividers
    gapSecondaryTertiary: 20,
    dividerGap: 27,
    showDivider: true,
    dividerWidth: DEFAULT_OVERLAY.dividerWidth ?? 60,
    dividerThickness: DEFAULT_OVERLAY.dividerThickness ?? 2,
    dividerColor: DEFAULT_OVERLAY.dividerColor ?? "rgba(255, 255, 255, 0.3)",
    
    // Positions
    x: 18,
    y: 0,
    dualReadersOffsetX: 60,
    dualReadersOffsetY: 0,
    
    // Colors - preserve existing colors or use defaults
    primaryNumberColor: current.primaryNumberColor || current.numberColor || DEFAULT_OVERLAY.numberColor,
    primaryTextColor: current.primaryTextColor || current.textColor || DEFAULT_OVERLAY.textColor,
    secondaryNumberColor: current.secondaryNumberColor || current.numberColor || DEFAULT_OVERLAY.numberColor,
    secondaryTextColor: current.secondaryTextColor || current.textColor || DEFAULT_OVERLAY.textColor,
    tertiaryNumberColor: current.tertiaryNumberColor || current.numberColor || DEFAULT_OVERLAY.numberColor,
    tertiaryTextColor: current.tertiaryTextColor || current.textColor || DEFAULT_OVERLAY.textColor,
    
    // Metrics - preserve primary, set secondary/tertiary defaults
    secondaryMetric: current.secondaryMetric || DEFAULT_OVERLAY.secondaryMetric,
    tertiaryMetric: current.tertiaryMetric || DEFAULT_OVERLAY.tertiaryMetric,
  }),

  custom: (current: Partial<OverlaySettings>) => ({
    // Custom mode starts with empty arrays
    customReadings: current.customReadings || [],
    customTexts: current.customTexts || [],
  }),
};

/**
 * Get default values for a mode transition.
 * 
 * This function is the single entry point for mode transition logic.
 * It takes the current mode, target mode, and current settings, then
 * returns the default values that should be applied when switching modes.
 * 
 * @param fromMode - Current overlay mode
 * @param toMode - Target overlay mode
 * @param current - Current overlay settings (partial, may be incomplete)
 * @returns Default values to apply for the target mode
 */
export function getModeTransitionDefaults(
  _fromMode: OverlayMode,
  toMode: OverlayMode,
  current: Partial<OverlaySettings>
): Partial<OverlaySettings> {
  const transition = MODE_TRANSITIONS[toMode];
  
  if (!transition) {
    console.warn(`[getModeTransitionDefaults] Unknown mode: ${toMode}`);
    return {};
  }
  
  return transition(current);
}

/**
 * Validate that all required fields are present for a given mode.
 * 
 * This function can be used to check if overlay settings are complete
 * for a given mode. Useful for validation and debugging.
 * 
 * @param mode - Overlay mode to validate
 * @param settings - Settings to validate
 * @returns True if all required fields are present
 */
export function validateModeSettings(
  mode: OverlayMode,
  settings: Partial<OverlaySettings>
): boolean {
  // Basic validation - all modes need primaryMetric
  if (!settings.primaryMetric) {
    return false;
  }

  // Mode-specific validation
  switch (mode) {
    case "none":
      return true;
    
    case "single":
      return !!(
        settings.numberColor &&
        settings.textColor &&
        typeof settings.numberSize === "number" &&
        typeof settings.textSize === "number"
      );
    
    case "dual":
      return !!(
        settings.primaryMetric &&
        settings.secondaryMetric &&
        typeof settings.numberSize === "number" &&
        typeof settings.secondaryNumberSize === "number"
      );
    
    case "triple":
      return !!(
        settings.primaryMetric &&
        settings.secondaryMetric &&
        settings.tertiaryMetric &&
        typeof settings.numberSize === "number" &&
        typeof settings.secondaryNumberSize === "number" &&
        typeof settings.tertiaryNumberSize === "number"
      );
    
    case "custom":
      return true; // Custom mode can have empty arrays
    
    default:
      return false;
  }
}



