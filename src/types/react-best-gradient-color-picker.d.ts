/**
 * Type declarations for react-best-gradient-color-picker
 * Based on npm package documentation: https://www.npmjs.com/package/react-best-gradient-color-picker
 * 
 * Package v3.0.14 API:
 * - value: string (RGBA format like 'rgba(255,255,255,1)' or HEX)
 * - onChange: (color: string) => void (receives RGBA string or gradient string)
 * - hideAlpha: boolean (hides alpha channel control)
 * - hideGradient: boolean (hides gradient control)
 */

declare module 'react-best-gradient-color-picker' {
  import { ComponentType } from 'react';

  interface GradientColorPickerProps {
    /** Color value in RGBA format (e.g., 'rgba(255,255,255,1)') or HEX */
    value?: string;
    /** Callback when color changes, receives RGBA string or gradient string */
    onChange?: (color: string) => void;
    /** If true, hides alpha channel control */
    hideAlpha?: boolean;
    /** If true, hides gradient control */
    hideGradient?: boolean;
  }

  // Default export is the GradientColorPicker component
  const GradientColorPicker: ComponentType<GradientColorPickerProps>;
  export default GradientColorPicker;
}

